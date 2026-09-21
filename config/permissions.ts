export enum PermissionResource {
  USER = "user",
  MEDIA = "media",
  DASHBOARD = "dashboard",
  SETTING = "setting",
  POST_CATEGORY = "post-category",
  NEWSLETTER = "newsletter",
  POST = "post",
  CONTACT = "contact",
  BRAND = "brand",
  PHONE = "phone",
  PHONE_CATEGORY = "phone-category",
  BUDGET_PHONE = "budget-phone",
  COMPARISON = "comparison",

  PHONE_COMMENT = "phone-comment",
  AUTHOR = "author",
  POST_COMMENT = "post-comment",
  SELLER_PLAN = "seller-plan",
  SELLER = "seller",
  SELLER_SUBSCRIPTION = "seller-subscription",
  SELLER_OFFER = "seller-offer",
  PAYMENT_RECORD = "payment-record",
  MONITORING = "monitoring",
}

export enum PermissionAction {
  READ = "read",
  CREATE = "create",
  WRITE = "write",
  UPDATE = "update",
  DELETE = "delete",
  MODERATE = "moderate",
}

export enum PermissionScope {
  ANY = "any",
  OWN = "own",
}

export const Permissions = {
  // USER
  USER_READ: `${PermissionResource.USER}:${PermissionAction.READ}:${PermissionScope.ANY}`,
  USER_CREATE: `${PermissionResource.USER}:${PermissionAction.CREATE}:${PermissionScope.ANY}`,
  USER_UPDATE: `${PermissionResource.USER}:${PermissionAction.UPDATE}:${PermissionScope.ANY}`,
  USER_DELETE: `${PermissionResource.USER}:${PermissionAction.DELETE}:${PermissionScope.ANY}`,

  // MEDIA
  MEDIA_READ: `${PermissionResource.MEDIA}:${PermissionAction.READ}:${PermissionScope.ANY}`,
  MEDIA_CREATE: `${PermissionResource.MEDIA}:${PermissionAction.CREATE}:${PermissionScope.ANY}`,
  MEDIA_UPDATE: `${PermissionResource.MEDIA}:${PermissionAction.UPDATE}:${PermissionScope.ANY}`,
  MEDIA_DELETE: `${PermissionResource.MEDIA}:${PermissionAction.DELETE}:${PermissionScope.ANY}`,

  // DASHBOARD
  DASHBOARD_READ: `${PermissionResource.DASHBOARD}:${PermissionAction.READ}:${PermissionScope.ANY}`,

  // SETTING
  SETTING_READ: `${PermissionResource.SETTING}:${PermissionAction.READ}:${PermissionScope.ANY}`,
  SETTING_WRITE: `${PermissionResource.SETTING}:${PermissionAction.WRITE}:${PermissionScope.ANY}`,
  SETTING_DELETE: `${PermissionResource.SETTING}:${PermissionAction.DELETE}:${PermissionScope.ANY}`,

  // POST CATEGORY
  POST_CATEGORY_READ: `${PermissionResource.POST_CATEGORY}:${PermissionAction.READ}:${PermissionScope.ANY}`,
  POST_CATEGORY_CREATE: `${PermissionResource.POST_CATEGORY}:${PermissionAction.CREATE}:${PermissionScope.ANY}`,
  POST_CATEGORY_UPDATE: `${PermissionResource.POST_CATEGORY}:${PermissionAction.UPDATE}:${PermissionScope.ANY}`,
  POST_CATEGORY_DELETE: `${PermissionResource.POST_CATEGORY}:${PermissionAction.DELETE}:${PermissionScope.ANY}`,

  // NEWSLETTER
  NEWSLETTER_READ: `${PermissionResource.NEWSLETTER}:${PermissionAction.READ}:${PermissionScope.ANY}`,
  NEWSLETTER_DELETE: `${PermissionResource.NEWSLETTER}:${PermissionAction.DELETE}:${PermissionScope.ANY}`,

  // POST
  POST_READ: `${PermissionResource.POST}:${PermissionAction.READ}:${PermissionScope.ANY}`,
  POST_CREATE: `${PermissionResource.POST}:${PermissionAction.CREATE}:${PermissionScope.ANY}`,
  POST_UPDATE: `${PermissionResource.POST}:${PermissionAction.UPDATE}:${PermissionScope.ANY}`,
  POST_DELETE: `${PermissionResource.POST}:${PermissionAction.DELETE}:${PermissionScope.ANY}`,

  // CONTACT
  CONTACT_READ: `${PermissionResource.CONTACT}:${PermissionAction.READ}:${PermissionScope.ANY}`,
  CONTACT_UPDATE: `${PermissionResource.CONTACT}:${PermissionAction.UPDATE}:${PermissionScope.ANY}`,
  CONTACT_DELETE: `${PermissionResource.CONTACT}:${PermissionAction.DELETE}:${PermissionScope.ANY}`,

  // BRAND
  BRAND_READ: `${PermissionResource.BRAND}:${PermissionAction.READ}:${PermissionScope.ANY}`,
  BRAND_CREATE: `${PermissionResource.BRAND}:${PermissionAction.CREATE}:${PermissionScope.ANY}`,
  BRAND_UPDATE: `${PermissionResource.BRAND}:${PermissionAction.UPDATE}:${PermissionScope.ANY}`,
  BRAND_DELETE: `${PermissionResource.BRAND}:${PermissionAction.DELETE}:${PermissionScope.ANY}`,

  // PHONE
  PHONE_READ: `${PermissionResource.PHONE}:${PermissionAction.READ}:${PermissionScope.ANY}`,
  PHONE_CREATE: `${PermissionResource.PHONE}:${PermissionAction.CREATE}:${PermissionScope.ANY}`,
  PHONE_UPDATE: `${PermissionResource.PHONE}:${PermissionAction.UPDATE}:${PermissionScope.ANY}`,
  PHONE_DELETE: `${PermissionResource.PHONE}:${PermissionAction.DELETE}:${PermissionScope.ANY}`,

  // PHONE CATEGORY
  PHONE_CATEGORY_READ: `${PermissionResource.PHONE_CATEGORY}:${PermissionAction.READ}:${PermissionScope.ANY}`,
  PHONE_CATEGORY_CREATE: `${PermissionResource.PHONE_CATEGORY}:${PermissionAction.CREATE}:${PermissionScope.ANY}`,
  PHONE_CATEGORY_UPDATE: `${PermissionResource.PHONE_CATEGORY}:${PermissionAction.UPDATE}:${PermissionScope.ANY}`,
  PHONE_CATEGORY_DELETE: `${PermissionResource.PHONE_CATEGORY}:${PermissionAction.DELETE}:${PermissionScope.ANY}`,

  // BUDGET PHONE
  BUDGET_PHONE_READ: `${PermissionResource.BUDGET_PHONE}:${PermissionAction.READ}:${PermissionScope.ANY}`,
  BUDGET_PHONE_CREATE: `${PermissionResource.BUDGET_PHONE}:${PermissionAction.CREATE}:${PermissionScope.ANY}`,
  BUDGET_PHONE_UPDATE: `${PermissionResource.BUDGET_PHONE}:${PermissionAction.UPDATE}:${PermissionScope.ANY}`,
  BUDGET_PHONE_DELETE: `${PermissionResource.BUDGET_PHONE}:${PermissionAction.DELETE}:${PermissionScope.ANY}`,

  // COMPARISON
  COMPARISON_READ: `${PermissionResource.COMPARISON}:${PermissionAction.READ}:${PermissionScope.ANY}`,
  COMPARISON_CREATE: `${PermissionResource.COMPARISON}:${PermissionAction.CREATE}:${PermissionScope.ANY}`,
  COMPARISON_UPDATE: `${PermissionResource.COMPARISON}:${PermissionAction.UPDATE}:${PermissionScope.ANY}`,
  COMPARISON_DELETE: `${PermissionResource.COMPARISON}:${PermissionAction.DELETE}:${PermissionScope.ANY}`,

  // PHONE COMMENT
  PHONE_COMMENT_READ: `${PermissionResource.PHONE_COMMENT}:${PermissionAction.READ}:${PermissionScope.ANY}`,
  PHONE_COMMENT_CREATE: `${PermissionResource.PHONE_COMMENT}:${PermissionAction.CREATE}:${PermissionScope.ANY}`,
  PHONE_COMMENT_UPDATE: `${PermissionResource.PHONE_COMMENT}:${PermissionAction.UPDATE}:${PermissionScope.ANY}`,
  PHONE_COMMENT_DELETE: `${PermissionResource.PHONE_COMMENT}:${PermissionAction.DELETE}:${PermissionScope.ANY}`,
  PHONE_COMMENT_MODERATE: `${PermissionResource.PHONE_COMMENT}:${PermissionAction.MODERATE}:${PermissionScope.ANY}`,

  // AUTHOR
  AUTHOR_READ: `${PermissionResource.AUTHOR}:${PermissionAction.READ}:${PermissionScope.ANY}`,
  AUTHOR_CREATE: `${PermissionResource.AUTHOR}:${PermissionAction.CREATE}:${PermissionScope.ANY}`,
  AUTHOR_UPDATE: `${PermissionResource.AUTHOR}:${PermissionAction.UPDATE}:${PermissionScope.ANY}`,
  AUTHOR_DELETE: `${PermissionResource.AUTHOR}:${PermissionAction.DELETE}:${PermissionScope.ANY}`,

  // POST COMMENT
  POST_COMMENT_READ: `${PermissionResource.POST_COMMENT}:${PermissionAction.READ}:${PermissionScope.ANY}`,
  POST_COMMENT_CREATE: `${PermissionResource.POST_COMMENT}:${PermissionAction.CREATE}:${PermissionScope.ANY}`,
  POST_COMMENT_UPDATE: `${PermissionResource.POST_COMMENT}:${PermissionAction.UPDATE}:${PermissionScope.ANY}`,
  POST_COMMENT_DELETE: `${PermissionResource.POST_COMMENT}:${PermissionAction.DELETE}:${PermissionScope.ANY}`,
  POST_COMMENT_MODERATE: `${PermissionResource.POST_COMMENT}:${PermissionAction.MODERATE}:${PermissionScope.ANY}`,

  // SELLER PLAN
  SELLER_PLAN_READ: `${PermissionResource.SELLER_PLAN}:${PermissionAction.READ}:${PermissionScope.ANY}`,
  SELLER_PLAN_CREATE: `${PermissionResource.SELLER_PLAN}:${PermissionAction.CREATE}:${PermissionScope.ANY}`,
  SELLER_PLAN_UPDATE: `${PermissionResource.SELLER_PLAN}:${PermissionAction.UPDATE}:${PermissionScope.ANY}`,
  SELLER_PLAN_DELETE: `${PermissionResource.SELLER_PLAN}:${PermissionAction.DELETE}:${PermissionScope.ANY}`,

  // SELLER
  SELLER_READ: `${PermissionResource.SELLER}:${PermissionAction.READ}:${PermissionScope.ANY}`,
  SELLER_CREATE: `${PermissionResource.SELLER}:${PermissionAction.CREATE}:${PermissionScope.ANY}`,
  SELLER_UPDATE: `${PermissionResource.SELLER}:${PermissionAction.UPDATE}:${PermissionScope.ANY}`,
  SELLER_DELETE: `${PermissionResource.SELLER}:${PermissionAction.DELETE}:${PermissionScope.ANY}`,
  SELLER_MODERATE: `${PermissionResource.SELLER}:${PermissionAction.MODERATE}:${PermissionScope.ANY}`,

  // SELLER SUBSCRIPTION
  SELLER_SUBSCRIPTION_READ: `${PermissionResource.SELLER_SUBSCRIPTION}:${PermissionAction.READ}:${PermissionScope.ANY}`,
  SELLER_SUBSCRIPTION_CREATE: `${PermissionResource.SELLER_SUBSCRIPTION}:${PermissionAction.CREATE}:${PermissionScope.ANY}`,
  SELLER_SUBSCRIPTION_UPDATE: `${PermissionResource.SELLER_SUBSCRIPTION}:${PermissionAction.UPDATE}:${PermissionScope.ANY}`,
  SELLER_SUBSCRIPTION_DELETE: `${PermissionResource.SELLER_SUBSCRIPTION}:${PermissionAction.DELETE}:${PermissionScope.ANY}`,

  // SELLER OFFER
  SELLER_OFFER_READ: `${PermissionResource.SELLER_OFFER}:${PermissionAction.READ}:${PermissionScope.ANY}`,
  SELLER_OFFER_MODERATE: `${PermissionResource.SELLER_OFFER}:${PermissionAction.MODERATE}:${PermissionScope.ANY}`,
  SELLER_OFFER_DELETE: `${PermissionResource.SELLER_OFFER}:${PermissionAction.DELETE}:${PermissionScope.ANY}`,

  // PAYMENT RECORD
  PAYMENT_RECORD_READ: `${PermissionResource.PAYMENT_RECORD}:${PermissionAction.READ}:${PermissionScope.ANY}`,
  PAYMENT_RECORD_CREATE: `${PermissionResource.PAYMENT_RECORD}:${PermissionAction.CREATE}:${PermissionScope.ANY}`,
  PAYMENT_RECORD_UPDATE: `${PermissionResource.PAYMENT_RECORD}:${PermissionAction.UPDATE}:${PermissionScope.ANY}`,
  PAYMENT_RECORD_DELETE: `${PermissionResource.PAYMENT_RECORD}:${PermissionAction.DELETE}:${PermissionScope.ANY}`,

  // MONITORING
  MONITORING_READ: `${PermissionResource.MONITORING}:${PermissionAction.READ}:${PermissionScope.ANY}`,
  MONITORING_OVERVIEW: `${PermissionResource.MONITORING}:${PermissionAction.READ}:${PermissionScope.ANY}`,
  MONITORING_LOGS: `${PermissionResource.MONITORING}:${PermissionAction.READ}:${PermissionScope.ANY}`,
  MONITORING_ERRORS: `${PermissionResource.MONITORING}:${PermissionAction.READ}:${PermissionScope.ANY}`,
  MONITORING_SECURITY: `${PermissionResource.MONITORING}:${PermissionAction.READ}:${PermissionScope.ANY}`,
  MONITORING_AUDIT: `${PermissionResource.MONITORING}:${PermissionAction.READ}:${PermissionScope.ANY}`,
  MONITORING_REQUESTS: `${PermissionResource.MONITORING}:${PermissionAction.READ}:${PermissionScope.ANY}`,
  MONITORING_HEALTH: `${PermissionResource.MONITORING}:${PermissionAction.READ}:${PermissionScope.ANY}`,
} as const
