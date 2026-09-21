export enum ContactStatus {
  NEW = "NEW",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  ARCHIVED = "ARCHIVED",
}

export interface IContact {
  _id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  status: ContactStatus
  is_read: boolean
  admin_notes?: string
  createdAt: string
  updatedAt: string
}
