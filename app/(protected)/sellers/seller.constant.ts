import {
  SellerStatus,
  SellerVerificationStatus,
  SellerBusinessType,
} from "./seller.type"

export const SELLER_STATUS_OPTIONS: { value: SellerStatus; label: string }[] = [
  { value: SellerStatus.ACTIVE, label: "Active" },
  { value: SellerStatus.INACTIVE, label: "Inactive" },
  { value: SellerStatus.SUSPENDED, label: "Suspended" },
]

export const SELLER_VERIFICATION_OPTIONS: {
  value: SellerVerificationStatus
  label: string
}[] = [
  { value: SellerVerificationStatus.UNVERIFIED, label: "Unverified" },
  { value: SellerVerificationStatus.VERIFIED, label: "Verified" },
  { value: SellerVerificationStatus.REJECTED, label: "Rejected" },
  { value: SellerVerificationStatus.SUSPENDED, label: "Suspended" },
]

export const SELLER_BUSINESS_TYPE_OPTIONS: {
  value: SellerBusinessType
  label: string
}[] = [
  { value: SellerBusinessType.INDIVIDUAL, label: "Individual" },
  { value: SellerBusinessType.RETAILER, label: "Retailer" },
  { value: SellerBusinessType.WHOLESALER, label: "Wholesaler" },
  { value: SellerBusinessType.DISTRIBUTOR, label: "Distributor" },
  { value: SellerBusinessType.ONLINE_STORE, label: "Online Store" },
  { value: SellerBusinessType.OTHER, label: "Other" },
]
