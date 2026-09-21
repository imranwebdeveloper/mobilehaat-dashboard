export enum PhoneStatus {
  DRAFT = "DRAFT", // Being drafted, not live
  PUBLISHED = "PUBLISHED", // Live on site
  ARCHIVED = "ARCHIVED", // Deprecated/old models
  CANCELLED = "CANCELLED", // Announced but cancelled
}

export enum CameraType {
  WIDE = "Wide",
  ULTRA_WIDE = "Ultra Wide",
  TELEPHOTO = "Telephoto",
  PERISCOPE = "Periscope",
  MACRO = "Macro",
  AUXILIARY = "Auxiliary",
  DEPTH = "Depth",
  UNKNOWN = "UNKNOWN",
}

export enum CameraPosition {
  REAR = "rear",
  FRONT = "front",
}

export enum CameraSetup {
  SINGLE = "single",
  DUAL = "dual",
  TRIPLE = "triple",
  QUAD = "quad",
  PENTA = "penta",
}

export enum PhoneType {
  SMARTPHONE = "smartphone",
  FEATURE_PHONE = "feature_phone",
  RUGGED_PHONE = "rugged_phone",
  TABLET = "tablet",
}

export enum PhoneCategory {
  BIG_BATTERY = "Big Battery Phone",
  CAMERA = "Camera Phone",
  PHONE_5G = "5G Phone",
  GAMING = "Gaming Phone",
  PERFORMANCE = "Performance Phone",
  BUDGET = "Budget Phone",
  FLAGSHIP = "Flagship Phone",
  LARGE_DISPLAY = "Large Display Phone",
  ENTRY_LEVEL = "Entry-Level Phone",
  BALANCED = "Balanced Phone",
}

export enum BDStatus {
  UPCOMING = "UPCOMING",
  AVAILABLE = "AVAILABLE",
  NOT_RELEASED = "NOT_RELEASED",
  NA = "N/A",
  UNKNOWN = "UNKNOWN",
  DISCONTINUED = "DISCONTINUED",
}

export const SENSOR_TYPES = [
  "Accelerometer",
  "Gyroscope",
  "Proximity",
  "Compass",
  "Barometer",
  "Fingerprint",
  "Face ID",
  "IR Blaster",
  "Heart Rate",
  "SpO2",
] as const

export const SPECIAL_FEATURES = [
  "Water resistant",
  "Dust resistant",
  "Wireless charging",
  "Reverse wireless charging",
  "Ultra Wideband (UWB)",
  "Satellite connectivity",
  "Stylus support",
] as const
