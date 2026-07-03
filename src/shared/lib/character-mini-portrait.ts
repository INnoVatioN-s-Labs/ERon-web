import { getFanKitCharacterCode } from '@/shared/config/fankit-character-map'

const portraitModules = import.meta.glob<string>('/images/**/*[Mm]ini*.{png,jpg,jpeg,webp}', {
  import: 'default',
  query: '?url',
})

export async function loadCharacterMiniPortrait(
  characterNumber?: number,
  characterName?: string,
  skin?: {
    skinCode?: number
    skinName?: string
    skinVariant?: number
  },
) {
  const resolvedCharacterNumber = getFanKitCharacterCode(characterName) ?? characterNumber

  if (!resolvedCharacterNumber) {
    return undefined
  }

  const characterPathPattern = new RegExp(`/${String(resolvedCharacterNumber).padStart(3, '0')}\\. [^/]+/`)
  const candidates = Object.entries(portraitModules)
    .filter(
      ([path]) =>
        (characterPathPattern.test(path) ||
          isCharacterRewardPortraitPath(path, resolvedCharacterNumber)) &&
        isMiniPortraitPath(path),
    )
    .sort(([left], [right]) => comparePortraitPath(left, right))
  const skinNamePortrait = findSkinNamePortrait(skin?.skinName, candidates)
  const defaultPortrait = candidates.find(([path]) => path.includes('/02. Default/'))
  const shouldUseVariantFallback = canUseVariantFallback(
    resolvedCharacterNumber,
    skin,
    Boolean(skinNamePortrait),
  )
  const selectedSkinPortrait =
    shouldUseVariantFallback ? findSkinVariantPortrait(skin, candidates) : undefined
  const portraitLoader = skin?.skinCode
    ? skinNamePortrait?.[1] ?? selectedSkinPortrait?.[1] ?? defaultPortrait?.[1] ?? candidates[0]?.[1]
    : selectedSkinPortrait?.[1] ?? skinNamePortrait?.[1] ?? defaultPortrait?.[1] ?? candidates[0]?.[1]

  return portraitLoader?.()
}

function findSkinNamePortrait(
  skinName: string | undefined,
  characterCandidates: [string, () => Promise<string>][],
) {
  const normalizedSkinName = normalizeSkinName(skinName)

  if (!normalizedSkinName || normalizedSkinName === 'default') {
    return undefined
  }

  const matchingPortrait = ([path]: [string, () => Promise<string>]) =>
    path
      .split('/')
      .some((segment) => normalizeAssetName(segment).includes(normalizedSkinName))

  return characterCandidates.find(matchingPortrait)
}

function findSkinVariantPortrait(
  skin: { skinCode?: number; skinVariant?: number } | undefined,
  characterCandidates: [string, () => Promise<string>][],
) {
  const variants = getSkinVariantCandidates(skin)

  if (variants.length === 0) {
    return undefined
  }

  return characterCandidates.find(([path]) => {
    const variant = getMiniVariant(path)

    return variant !== undefined && variants.includes(variant)
  })
}

function canUseVariantFallback(
  characterNumber: number,
  skin: { skinCode?: number; skinName?: string; skinVariant?: number } | undefined,
  hasSkinNamePortrait: boolean,
) {
  if (!skin) {
    return true
  }

  if (hasSkinNamePortrait) {
    return true
  }

  if (characterNumber === 45) {
    const skinOrder = getSkinOrder(skin.skinCode)

    return skinOrder !== undefined && MAI_MINI_VARIANTS.has(skinOrder)
  }

  return true
}

function getSkinVariantCandidates(
  skin: { skinCode?: number; skinVariant?: number } | undefined,
) {
  const variants: number[] = []
  const addVariant = (variant: number | undefined) => {
    if (variant === undefined || variant < 0 || variants.includes(variant)) {
      return
    }

    variants.push(variant)
  }

  const skinOrder = getSkinOrder(skin?.skinCode)

  if (skinOrder !== undefined) {
    addVariant(skinOrder)

    return variants
  }

  if (skin?.skinVariant !== undefined) {
    addVariant(skin.skinVariant)
  }

  return variants
}

function getSkinOrder(skinCode?: number) {
  if (!skinCode) {
    return undefined
  }

  return skinCode >= 1_000 ? skinCode % 1_000 : skinCode
}

function normalizeAssetName(value?: string) {
  return value?.toLowerCase().replace(/[^a-z0-9]/g, '') ?? ''
}

function normalizeSkinName(value?: string) {
  const compactName = value?.toLowerCase().replace(/[\s._()[\]{}'"-]/g, '') ?? ''
  const normalizedName = normalizeAssetName(value)

  if (compactName && SKIN_NAME_ALIASES[compactName]) {
    return SKIN_NAME_ALIASES[compactName]
  }

  return SKIN_NAME_ALIASES[normalizedName] ?? normalizedName
}

const SKIN_NAME_ALIASES: Record<string, string> = {
  경찰아야: 'ondutyaya',
  한여름축제아야: 'midsummerfestivalaya',
  하우스키퍼아야: 'housekeepercorpaya',
  하우스키퍼corp아야: 'housekeepercorpaya',
  전학생마이: 'transferstudentmai',
  트로피컬런웨이마이: 'tropicalrunwaymai',
  팝스타마이: 'popstarmai',
  패셔니스타바니마이: 'fashionistabunnymai',
  아라모드바니마이: 'fashionistabunnymai',
  알라모드바니마이: 'fashionistabunnymai',
  alamodebunnymai: 'fashionistabunnymai',
  사관후보생마이: 'cadet',
  cadetmai: 'cadet',
  소방기동대에스텔: 'specopsestelle',
  교내소방부에스텔: 'firedrillestelle',
  베스텔: 'bestelle',
  드릴스페셜리스트에스텔: 'drillspecialistestelle',
}

const MAI_MINI_VARIANTS = new Set([1, 2, 3, 5])

function getMiniVariant(path: string) {
  const variant = path.match(/_([0-9]+)\.(?:png|jpe?g|webp)$/i)?.[1]

  return variant === undefined ? undefined : Number(variant)
}

function isMiniPortraitPath(path: string) {
  const fileName = path.split('/').at(-1)
  const normalizedFileName = normalizeAssetName(fileName)

  return (
    normalizedFileName.includes('mini') &&
    !normalizedFileName.includes('halfmini') &&
    !normalizedFileName.includes('fullmini')
  )
}

function isCharacterRewardPortraitPath(path: string, characterNumber: number) {
  const aliases = CHARACTER_ASSET_NAME_ALIASES[characterNumber]

  if (!aliases || !path.includes('/9995. ')) {
    return false
  }

  const normalizedPath = normalizeAssetName(path)

  return aliases.some((alias) => normalizedPath.includes(alias))
}

const CHARACTER_ASSET_NAME_ALIASES: Record<number, string[]> = {
  2: ['aya'],
  45: ['mai'],
}

function comparePortraitPath(left: string, right: string) {
  return getPortraitPathScore(right) - getPortraitPathScore(left) || left.localeCompare(right)
}

function getPortraitPathScore(path: string) {
  const packNumber = path.match(/\/CharactER(?: ([0-9]+))?\//)?.[1]

  return packNumber === undefined ? 100 : Number(packNumber)
}
