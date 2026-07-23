const buildIconModules = import.meta.glob<string>('/images/*/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
  query: '?url',
})

const buildIconEntries = Object.entries(buildIconModules)

export function getTacticalSkillIcon(
  tacticalSkillGroupCode?: number,
  tacticalSkillName?: string,
) {
  const directIcon = getDirectTacticalSkillIcon(tacticalSkillGroupCode, tacticalSkillName)

  if (directIcon) {
    return directIcon
  }

  const iconNumber =
    getTacticalSkillIconNumber(tacticalSkillGroupCode) ??
    TACTICAL_SKILL_NAME_TO_ICON_NUMBER[normalizeName(tacticalSkillName)]

  if (iconNumber === undefined) {
    return undefined
  }

  return findIconByDirectoryAndPrefix('/05. Tactical Skills/', iconNumber)
}

export function getTraitIcon(trait?: {
  traitCode?: number
  traitIconCode?: number
  traitName?: string
}) {
  if (!trait) {
    return undefined
  }

  const normalizedTraitName = normalizeName(trait.traitName)
  const traitIcon = TRAIT_ICON_CODE_TO_ICON[trait.traitIconCode ?? -1] ??
    getVerifiedTraitNameIcon(normalizedTraitName) ??
    TRAIT_NAME_TO_ICON[normalizedTraitName]

  if (!traitIcon) {
    return undefined
  }

  return findIconByDirectoryAndPrefix(traitIcon.directory, traitIcon.iconNumber)
}

export function getTraitStyleIcon(traitStyle?: string) {
  const filePath = TRAIT_STYLE_TO_FILE_PATH[normalizeName(traitStyle)]

  if (!filePath) {
    return undefined
  }

  return buildIconEntries.find(([path]) => path.includes(filePath))?.[1]
}

function getTacticalSkillIconNumber(tacticalSkillGroupCode?: number) {
  if (tacticalSkillGroupCode === undefined) {
    return undefined
  }

  return TACTICAL_SKILL_CODE_TO_ICON_NUMBER[tacticalSkillGroupCode]
}

function findIconByDirectoryAndPrefix(directory: string, iconNumber: number) {
  const paddedIconNumber = String(iconNumber).padStart(2, '0')
  const matchingIcon = buildIconEntries.find(([path]) =>
    path.includes(`${directory}${paddedIconNumber}. `),
  )

  return matchingIcon?.[1]
}

function getDirectTacticalSkillIcon(
  tacticalSkillGroupCode?: number,
  tacticalSkillName?: string,
) {
  const fileName =
    TACTICAL_SKILL_CODE_TO_FILE_NAME[tacticalSkillGroupCode ?? -1] ??
    TACTICAL_SKILL_NAME_TO_FILE_NAME[normalizeName(tacticalSkillName)]

  if (!fileName) {
    return undefined
  }

  return buildIconEntries.find(([path]) =>
    path.includes(`/05. Tactical Skills/${fileName}`),
  )?.[1]
}

function normalizeName(value?: string) {
  return value?.toLowerCase().replace(/[^a-z0-9가-힣]/g, '') ?? ''
}

function getVerifiedTraitNameIcon(normalizedTraitName: string) {
  if (!normalizedTraitName) {
    return undefined
  }

  const exactIcon = VERIFIED_TRAIT_NAME_TO_ICON[normalizedTraitName]

  if (exactIcon) {
    return exactIcon
  }

  return Object.entries(VERIFIED_TRAIT_NAME_TO_ICON).find(
    ([verifiedName]) =>
      normalizedTraitName.includes(verifiedName) ||
      verifiedName.includes(normalizedTraitName),
  )?.[1]
}

const TACTICAL_SKILL_CODE_TO_ICON_NUMBER: Record<number, number> = {
  30: 1,
  40: 2,
  50: 3,
  60: 4,
  70: 5,
  80: 6,
  90: 7,
  110: 8,
  120: 9,
  130: 10,
  140: 1,
  150: 12,
  160: 15,
  170: 17,
  190: 16,
  270: 18,
  9999: 9999,
  500120: 1,
  500130: 2,
  500150: 4,
  500160: 5,
  500180: 7,
  500250: 15,
  500260: 17,
  500270: 18,
}

const TACTICAL_SKILL_CODE_TO_FILE_NAME: Record<number, string> = {
  4503000: 'VSkillIcon_4503000.png',
}

const TACTICAL_SKILL_NAME_TO_FILE_NAME: Record<string, string> = {
  롤링썬더: 'VSkillIcon_4503000.png',
  rollingthunder: 'VSkillIcon_4503000.png',
}

const TACTICAL_SKILL_NAME_TO_ICON_NUMBER: Record<string, number> = {
  블링크: 1,
  blink: 1,
  퀘이크: 2,
  quake: 2,
  프로토콜위반: 3,
  protocolviolation: 3,
  붉은폭풍: 4,
  electricshift: 4,
  초월: 5,
  forcefield: 5,
  아티팩트: 6,
  totem: 6,
  무효화: 7,
  nullification: 7,
  강한결속: 8,
  soulstealer: 8,
  스트라이더a13: 9,
  thestrijder: 9,
  진실의칼날: 10,
  bladeoftruth: 10,
  치유의바람: 12,
  healingwind: 12,
  락온트래커: 13,
  lockontracker: 13,
  환상적인펀치: 14,
  fantasticalpunch: 14,
  리펄서미사일: 15,
  repulsormissiles: 15,
  라이트윙: 16,
  wingsoflight: 16,
  플라즈마대시: 17,
  plasmadash: 17,
  쇠약: 18,
  asthenia: 18,
  거짓서약: 9999,
  falseoath: 9999,
}

const TRAIT_ICON_CODE_TO_ICON: Record<number, { directory: string; iconNumber: number }> = {
  7000201: { directory: '/01. Havoc/', iconNumber: 1 },
  7000401: { directory: '/01. Havoc/', iconNumber: 2 },
  7000601: { directory: '/01. Havoc/', iconNumber: 3 },
  7000701: { directory: '/01. Havoc/', iconNumber: 4 },
  7000501: { directory: '/02. Chaos/', iconNumber: 3 },
  7100101: { directory: '/03. Fortification/', iconNumber: 1 },
  7100201: { directory: '/03. Fortification/', iconNumber: 2 },
  7100401: { directory: '/03. Fortification/', iconNumber: 3 },
  7100501: { directory: '/03. Fortification/', iconNumber: 4 },
  7200101: { directory: '/04. Support/', iconNumber: 1 },
  7200201: { directory: '/04. Support/', iconNumber: 2 },
  7200301: { directory: '/04. Support/', iconNumber: 3 },
  7200501: { directory: '/04. Support/', iconNumber: 4 },
  7300101: { directory: '/02. Chaos/', iconNumber: 1 },
  7300201: { directory: '/02. Chaos/', iconNumber: 2 },
  7300301: { directory: '/02. Chaos/', iconNumber: 4 },
}

const TRAIT_NAME_TO_ICON: Record<string, { directory: string; iconNumber: number }> = {
  취약: { directory: '/01. Havoc/', iconNumber: 1 },
  frailtyinfliction: { directory: '/01. Havoc/', iconNumber: 1 },
  흡혈마: { directory: '/01. Havoc/', iconNumber: 2 },
  vampiricbloodline: { directory: '/01. Havoc/', iconNumber: 2 },
  아드레날린: { directory: '/01. Havoc/', iconNumber: 3 },
  adrenaline: { directory: '/01. Havoc/', iconNumber: 3 },
  엑셀러레이터: { directory: '/01. Havoc/', iconNumber: 4 },
  accelerator: { directory: '/01. Havoc/', iconNumber: 4 },
  벽력: { directory: '/02. Chaos/', iconNumber: 3 },
  redsprite: { directory: '/02. Chaos/', iconNumber: 3 },
  금강: { directory: '/03. Fortification/', iconNumber: 1 },
  diamondshard: { directory: '/03. Fortification/', iconNumber: 1 },
  불괴: { directory: '/03. Fortification/', iconNumber: 2 },
  ironclad: { directory: '/03. Fortification/', iconNumber: 2 },
  빛의수호: { directory: '/03. Fortification/', iconNumber: 3 },
  heavykneepads: { directory: '/03. Fortification/', iconNumber: 3 },
  응징: { directory: '/03. Fortification/', iconNumber: 4 },
  bitterretribution: { directory: '/03. Fortification/', iconNumber: 4 },
  초재생: { directory: '/04. Support/', iconNumber: 1 },
  healingfactor: { directory: '/04. Support/', iconNumber: 1 },
  증폭드론: { directory: '/04. Support/', iconNumber: 2 },
  amplificationdrone: { directory: '/04. Support/', iconNumber: 2 },
  치유드론: { directory: '/04. Support/', iconNumber: 3 },
  healingdrone: { directory: '/04. Support/', iconNumber: 3 },
  헌신: { directory: '/04. Support/', iconNumber: 4 },
  sentinel: { directory: '/04. Support/', iconNumber: 4 },
  스텔라차지: { directory: '/02. Chaos/', iconNumber: 1 },
  stellarcharge: { directory: '/02. Chaos/', iconNumber: 1 },
  도깨비불: { directory: '/02. Chaos/', iconNumber: 2 },
  ghostlight: { directory: '/02. Chaos/', iconNumber: 2 },
  와류: { directory: '/02. Chaos/', iconNumber: 4 },
  siphonmaelstrom: { directory: '/02. Chaos/', iconNumber: 4 },
}

const VERIFIED_TRAIT_NAME_TO_ICON: Record<string, { directory: string; iconNumber: number }> = {
  도깨비불: { directory: '/02. Chaos/', iconNumber: 2 },
  벽력: { directory: '/02. Chaos/', iconNumber: 3 },
  헌신: { directory: '/04. Support/', iconNumber: 4 },
  초재생: { directory: '/04. Support/', iconNumber: 1 },
  빛의수호: { directory: '/03. Fortification/', iconNumber: 3 },
}

const TRAIT_STYLE_TO_FILE_PATH: Record<string, string> = {
  파괴: '/01. Havoc/Havoc2.png',
  havoc: '/01. Havoc/Havoc2.png',
  저항: '/03. Fortification/Fortification1.png',
  fortification: '/03. Fortification/Fortification1.png',
  resistance: '/03. Fortification/Fortification1.png',
  resist: '/03. Fortification/Fortification1.png',
  지원: '/04. Support/Support1.png',
  support: '/04. Support/Support1.png',
  혼돈: '/02. Chaos/TraitSkillIcon_Chaos02.png',
  chaos: '/02. Chaos/TraitSkillIcon_Chaos02.png',
}
