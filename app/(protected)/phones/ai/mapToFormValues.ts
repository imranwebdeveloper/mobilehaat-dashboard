import { PhoneFormValues } from "../phones.dto"
import {
  PhoneStatus,
  PhoneType,
  PhoneCategory,
  BDStatus,
  CameraType,
} from "../phones.constant"
import {
  AiStructure,
  AiEditorial,
  AiKeyValue,
  AiCameraSystem,
} from "./ai.types"

const toOptionalNumber = (value?: number | null) =>
  typeof value === "number" && !Number.isNaN(value) ? value : undefined

const mapOthers = (others?: AiKeyValue[]) =>
  (others || []).map((item) => ({
    name: item.name,
    value: item.value,
    value_type: item.value_type || "text",
    group: item.group,
  }))

const resolveCameraType = (type?: string | null): CameraType => {
  const valid = Object.values(CameraType)
  return valid.find((value) => value === type) || CameraType.UNKNOWN
}

const mapCameraSystem = (system?: AiCameraSystem | null) => ({
  cameras: (system?.cameras || []).map((camera) => ({
    type: resolveCameraType(camera.type),
    mp: toOptionalNumber(camera.mp),
    aperture: camera.aperture || undefined,
    sensor_size: camera.sensor_size || undefined,
    pixel_size: camera.pixel_size || undefined,
    focal_length: camera.focal_length || undefined,
    zoom: toOptionalNumber(camera.zoom),
    features: camera.features || [],
  })),
  features: system?.features || [],
  videos: system?.videos || [],
  others: mapOthers(system?.others),
})

const resolvePhoneType = (phoneType?: string[]): PhoneType[] => {
  const valid = Object.values(PhoneType)
  const types = (phoneType || [])
    .map((type) => valid.find((value) => value === type))
    .filter((type): type is PhoneType => Boolean(type))
  return types.length > 0 ? types : [PhoneType.SMARTPHONE]
}

const resolveBdStatus = (status?: string | null): BDStatus => {
  const valid = Object.values(BDStatus)
  return valid.find((value) => value === status) || BDStatus.NA
}

export const mapAiToFormValues = (
  structure: AiStructure,
  editorial?: AiEditorial | null
): PhoneFormValues => ({
  title: structure.title || "",
  brand: "",
  model: structure.model || "",
  slug: structure.slug || "",
  phone_type: resolvePhoneType(structure.phone_type),
  announced: structure.announced || "",
  released: structure.released || "",
  bd_status: resolveBdStatus(structure.bd_status),
  approximate_price_bd: toOptionalNumber(structure.approximate_price_bd),
  expert_rating: toOptionalNumber(structure.expert_rating),
  variants: (structure.variants || []).map((variant) => ({
    ram: Number(variant.ram) || 0,
    storage: Number(variant.storage) || 0,
    official_price: toOptionalNumber(variant.official_price),
    unofficial_price: toOptionalNumber(variant.unofficial_price),
    currency: variant.currency || "BDT",
  })),
  os: {
    name: structure.os?.name || "",
    custom_ui: structure.os?.custom_ui || "",
    others: mapOthers(structure.os?.others),
  },
  platform: {
    chipset: structure.platform?.chipset || "",
    gpu: structure.platform?.gpu || "",
    cpu: structure.platform?.cpu || "",
    fabrication: structure.platform?.fabrication || "",
    ram_type: structure.platform?.ram_type || "",
    others: mapOthers(structure.platform?.others),
  },
  memory: structure.memory
    ? {
        card_slot: structure.memory.card_slot || "",
        internal: structure.memory.internal || "",
        storage_type: structure.memory.storage_type || "",
        others: mapOthers(structure.memory.others),
      }
    : undefined,
  display: {
    type: structure.display?.type || "",
    size: structure.display?.size || "",
    resolution: structure.display?.resolution || "",
    protection: structure.display?.protection || "",
    refresh_rate: toOptionalNumber(structure.display?.refresh_rate),
    aspect_ratio: structure.display?.aspect_ratio || "",
    brightness: structure.display?.brightness || "",
    bezel: structure.display?.bezel || "",
    body_ratio: structure.display?.body_ratio || "",
    others: mapOthers(structure.display?.others),
  },
  front_camera: mapCameraSystem(structure.front_camera),
  back_camera: mapCameraSystem(structure.back_camera),
  battery: {
    type: structure.battery?.type || "",
    capacity: Number(structure.battery?.capacity) || 0,
    others: mapOthers(structure.battery?.others),
  },
  network: structure.network
    ? {
        sim_slot: structure.network.sim_slot || "",
        sim_type: structure.network.sim_type || "",
        technology: structure.network.technology || [],
        speed: structure.network.speed || "",
        others: mapOthers(structure.network.others),
      }
    : undefined,
  connectivity: structure.connectivity
    ? {
        wifi: structure.connectivity.wifi || "",
        bluetooth: structure.connectivity.bluetooth || "",
        positioning: structure.connectivity.positioning || "",
        usb: structure.connectivity.usb || "",
        radio: Boolean(structure.connectivity.radio),
        nfc: Boolean(structure.connectivity.nfc),
        others: mapOthers(structure.connectivity.others),
      }
    : undefined,
  body: structure.body
    ? {
        dimensions: structure.body.dimensions || "",
        weight_g: toOptionalNumber(structure.body.weight_g),
        build: structure.body.build || "",
        colors: structure.body.colors || [],
        certifications: structure.body.certifications || [],
        others: mapOthers(structure.body.others),
      }
    : undefined,
  sound: structure.sound
    ? {
        loudspeaker: Boolean(structure.sound.loudspeaker),
        jack_3_5mm: Boolean(structure.sound.jack_3_5mm),
        features: structure.sound.features || [],
        others: mapOthers(structure.sound.others),
      }
    : undefined,
  features: structure.features
    ? {
        fingerprint: structure.features.fingerprint || "",
        sensors: structure.features.sensors || [],
        special: structure.features.special || [],
        others: mapOthers(structure.features.others),
      }
    : undefined,
  pros: editorial?.pros || [],
  cons: editorial?.cons || [],
  types: (editorial?.types || []).filter((type): type is PhoneCategory =>
    Object.values(PhoneCategory).includes(type as PhoneCategory)
  ),
  sources: structure.sources || [],
  meta_title: editorial?.meta_title || "",
  meta_description: editorial?.meta_description || "",
  meta_keywords: editorial?.meta_keywords || "",
  thumbnail: "",
  images: [],
  categories: [],
  status: PhoneStatus.DRAFT,
  schema_version: 1,
})
