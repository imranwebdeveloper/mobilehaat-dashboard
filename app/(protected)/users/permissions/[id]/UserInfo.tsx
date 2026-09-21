"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, MapPin, User, Calendar, ShieldCheck } from "lucide-react"
import React from "react"
import { IUser } from "../../users.type"
import StatusBadge from "@/components/common/StatusBadge"

interface InfoItemProps {
  icon?: React.ComponentType<{ className?: string }>
  label: string
  value: React.ReactNode
}

const InfoItem: React.FC<InfoItemProps> = ({ icon: Icon, label, value }) => (
  <div className="flex flex-col gap-1.5">
    <span className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </span>
    <div className="text-sm font-medium text-foreground">{value || "—"}</div>
  </div>
)

const UserInfo = ({
  user,
  showFullDetails = false,
}: {
  user?: IUser
  showFullDetails?: boolean
}) => {
  if (!user) return null

  return (
    <Card className="shadow-none">
      <CardContent className="relative shadow-none">
        {/* Header */}
        <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          {/* Avatar & Name */}
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
            <Avatar className="h-32 w-32 rounded-2xl border-4 border-background shadow-2xl">
              {user.avatar?.url ? (
                <AvatarImage
                  src={user.avatar.url}
                  alt={user.full_name}
                  className="object-cover"
                />
              ) : (
                <AvatarFallback className="rounded-2xl bg-primary text-3xl font-bold text-primary-foreground">
                  {user.first_name?.[0]}
                  {user.last_name?.[0]}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="space-y-1">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                {user.full_name}
              </h2>
              <div className="flex flex-wrap gap-2">
                {user.roles?.map((role) => (
                  <Badge
                    key={role._id}
                    variant="secondary"
                    className="rounded-md font-medium"
                  >
                    {role.name}
                  </Badge>
                ))}
                <StatusBadge is_active={user.is_active} />
              </div>
            </div>
          </div>
        </div>
        {showFullDetails && (
          <>
            <Separator className="my-6" />

            {/* Info Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Contact */}
              <div className="space-y-6">
                <h3 className="flex items-center gap-2 text-sm font-bold text-foreground/70">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <InfoItem
                    icon={Mail}
                    label="Email Address"
                    value={user.email}
                  />
                  <InfoItem
                    icon={Phone}
                    label="Phone Number"
                    value={user.phone_number}
                  />
                  <InfoItem
                    icon={MapPin}
                    label="Location"
                    value={`${user.address || ""}, ${user.country || ""}`}
                  />
                </div>
              </div>

              {/* Account Details */}
              <div className="space-y-6">
                <h3 className="flex items-center gap-2 text-sm font-bold text-foreground/70">
                  Account Details
                </h3>
                <div className="space-y-4">
                  <InfoItem icon={User} label="Gender" value={user.gender} />
                  <InfoItem
                    icon={ShieldCheck}
                    label="Security"
                    value={
                      <div className="flex gap-2">
                        {user.is_verified && (
                          <Badge variant="outline" className="py-0 text-[10px]">
                            Verified
                          </Badge>
                        )}
                        {user.two_factor_enabled && (
                          <Badge variant="outline" className="py-0 text-[10px]">
                            2FA
                          </Badge>
                        )}
                      </div>
                    }
                  />
                </div>
              </div>

              {/* Activity */}
              <div className="space-y-6">
                <h3 className="flex items-center gap-2 text-sm font-bold text-foreground/70">
                  Activity
                </h3>
                <div className="space-y-4">
                  <InfoItem
                    icon={Calendar}
                    label="Member Since"
                    value={new Date(user.createdAt).toLocaleDateString(
                      undefined,
                      {
                        dateStyle: "long",
                      }
                    )}
                  />
                  <InfoItem
                    icon={Calendar}
                    label="Last Updated"
                    value={new Date(user.updatedAt).toLocaleDateString(
                      undefined,
                      {
                        dateStyle: "long",
                      }
                    )}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default UserInfo
