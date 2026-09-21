export interface DashboardCounts {
  phones: number
  brands: number
  posts: number
  authors: number
  contacts: number
  unread_contacts: number
  newsletter_subscribers: number
  phone_comments: number
  post_comments: number
  pending_phone_comments: number
  pending_post_comments: number
  budget_phones: number
  comparisons: number
  phone_categories: number
  phone_variants: number
  phones_this_month: number
  posts_this_month: number
  contacts_this_month: number
}

export interface DashboardTrendPoint {
  date: string
  phones: number
  posts: number
  contacts: number
  subscribers: number
}

export interface DashboardRecentPhone {
  id: string
  title: string
  model: string
  brand: string
  price: number | null
  status: string
  createdAt: string
}

export interface DashboardRecentContact {
  id: string
  name: string
  email: string
  subject: string | null
  status: string
  is_read: boolean
  createdAt: string
}

export interface DashboardUnapprovedComment {
  id: string
  type: "phone" | "post"
  content: string
  author: string
  target: {
    id: string
    title: string
  }
  status: string
  createdAt: string
}

export interface DashboardOverview {
  counts: DashboardCounts
  trend: DashboardTrendPoint[]
  recentPhones: DashboardRecentPhone[]
  recentContacts: DashboardRecentContact[]
  pendingComments: DashboardUnapprovedComment[]
}
