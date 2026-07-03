import { requestJson } from '@/shared/api/http-client'
import { apiEndpoints } from '@/shared/api/endpoints'
import { asArray, asNumber, asString, isRecord, unwrapApiData } from '@/shared/lib/object'

export type SkinMetadata = {
  characterNum?: number
  skinCode: number
  skinName: string
  skinVariant?: number
}

let skinMetadataRequest: Promise<SkinMetadata[]> | undefined

export function loadSkinMetadata() {
  skinMetadataRequest ??= requestJson<unknown>(apiEndpoints.skinMetadata)
    .then((response) => {
      const data = unwrapApiData(response)
      const skins = isRecord(data) ? asArray(data.skins) : []

      return skins
        .filter(isRecord)
        .map((skin) => ({
          characterNum: asNumber(skin.characterNum ?? skin.character_num, 0) || undefined,
          skinCode: asNumber(skin.skinCode ?? skin.skin_code),
          skinName: asString(skin.skinName ?? skin.skin_name ?? skin.name),
          skinVariant: asNumber(skin.skinVariant ?? skin.skin_variant, 0) || undefined,
        }))
        .filter((skin) => skin.skinCode > 0)
    })
    .catch((error: unknown) => {
      skinMetadataRequest = undefined
      throw error
    })

  return skinMetadataRequest
}
