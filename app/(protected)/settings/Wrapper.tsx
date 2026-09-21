"use client"

import React, { useEffect, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import {
  Loader2,
  Save,
  Globe,
  Shield,
  Mail,
  Share2,
  Megaphone,
  Search,
  CheckCircle2,
  LayoutTemplate,
} from "lucide-react"
import {
  useGetSettingsQuery,
  useBulkUpdateSettingsMutation,
} from "./settings.api"
import {
  WebSettingsType,
  WebSettingSchema,
  WebSettingFormValues,
} from "./settings.type"
import { SocialLinksEditor } from "./SocialLinksEditor"
import { AnnouncementManager } from "./AnnouncementManager"
import { SEOPreview } from "./SEOPreview"
import { FooterColumnsEditor } from "./FooterColumnsEditor"
import { withAuth } from "@/components/hoc"
import { Permissions } from "@/config/permissions"
import { PermissionWrapper } from "@/components/common/Permission"
import PageHeader from "./PageHeader"

const TABS = [
  { id: WebSettingsType.GENERAL, icon: Globe, label: "General" },
  { id: WebSettingsType.SEO, icon: Search, label: "SEO" },
  { id: WebSettingsType.SOCIAL, icon: Share2, label: "Social" },
  { id: WebSettingsType.ANNOUNCEMENT, icon: Megaphone, label: "Announcements" },
  { id: WebSettingsType.FOOTER, icon: LayoutTemplate, label: "Footer" },
  { id: WebSettingsType.EMAIL, icon: Mail, label: "Email" },
  { id: WebSettingsType.SECURITY, icon: Shield, label: "Security" },
] as const

const formatLabel = (value: string) =>
  value
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

const SettingsWrapper = () => {
  const { data: settingsData } = useGetSettingsQuery()
  const [bulkUpdate, { isLoading: isUpdating }] =
    useBulkUpdateSettingsMutation()
  const [activeTab, setActiveTab] = useState<WebSettingsType>(
    WebSettingsType.GENERAL
  )

  const { control, reset, watch, setValue } = useForm<WebSettingFormValues>({
    resolver: zodResolver(WebSettingSchema),
    defaultValues: {
      settings: [],
    },
  })

  const { fields } = useFieldArray({
    control,
    name: "settings",
  })

  useEffect(() => {
    if (settingsData?.data) {
      reset({ settings: settingsData.data })
    }
  }, [settingsData, reset])

  const onSaveSection = async (type: WebSettingsType) => {
    const allSettings = watch("settings")
    const sectionSettings = allSettings
      .filter((s) => s.type === type)
      .map(({ key, value, type: settingType }) => ({
        key,
        value,
        type: settingType,
      }))

    try {
      await bulkUpdate({ settings: sectionSettings }).unwrap()
      toast.success(`${type} settings synchronized`, {
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      })
    } catch (err: unknown) {
      const errorMessage =
        typeof err === "object" &&
        err !== null &&
        "data" in err &&
        typeof (err as { data?: { message?: unknown } }).data?.message ===
          "string"
          ? (err as { data?: { message?: string } }).data?.message
          : "Sync failed"
      toast.error(errorMessage)
    }
  }

  const renderSettingField = (key: string, index: number) => {
    const setting = fields[index]
    const value = watch(`settings.${index}.value`)

    if (key.includes("logo") || key === "favicon") {
      return (
        <div
          key={setting.id}
          className="space-y-2 rounded-xl border bg-background p-4"
        >
          <Label>{formatLabel(key)} URL</Label>
          <Input
            value={value || ""}
            placeholder="https://example.com/image.png"
            className="h-9 rounded-md bg-background"
            onChange={(e) =>
              setValue(`settings.${index}.value`, e.target.value)
            }
          />
        </div>
      )
    }

    if (key === "social_links") {
      return (
        <div key={setting.id} className="xl:col-span-2">
          <SocialLinksEditor
            value={value}
            onChange={(v) => setValue(`settings.${index}.value`, v)}
          />
        </div>
      )
    }

    if (key === "announcement_bar") {
      const popupIndex = fields.findIndex((f) => f.key === "popup_announcement")
      const popupValue = watch(`settings.${popupIndex}.value`)

      return (
        <div key={setting.id} className="max-w-2xl xl:col-span-2">
          <AnnouncementManager
            barValue={value}
            onBarChange={(v) => setValue(`settings.${index}.value`, v)}
            popupValue={popupValue}
            onPopupChange={(v) => setValue(`settings.${popupIndex}.value`, v)}
          />
        </div>
      )
    }

    if (key === "popup_announcement") return null

    if (key === "meta_title") {
      const descIndex = fields.findIndex((f) => f.key === "meta_description")
      const kwIndex = fields.findIndex((f) => f.key === "meta_keywords")
      const domainIndex = fields.findIndex((f) => f.key === "domain")

      return (
        <div key={setting.id} className="max-w-2xl xl:col-span-2">
          <SEOPreview
            title={value}
            description={watch(`settings.${descIndex}.value`)}
            keywords={watch(`settings.${kwIndex}.value`)}
            domain={watch(`settings.${domainIndex}.value`)}
            onTitleChange={(v) => setValue(`settings.${index}.value`, v)}
            onDescriptionChange={(v) =>
              setValue(`settings.${descIndex}.value`, v)
            }
            onKeywordsChange={(v) => setValue(`settings.${kwIndex}.value`, v)}
          />
        </div>
      )
    }

    if (key === "meta_description" || key === "meta_keywords") return null

    if (key === "footer_columns") {
      return (
        <div key={setting.id} className="xl:col-span-2">
          <FooterColumnsEditor
            value={value}
            onChange={(v) => setValue(`settings.${index}.value`, v)}
          />
        </div>
      )
    }

    if (typeof value === "boolean") {
      return (
        <div key={setting.id} className="rounded-xl border bg-background p-4">
          <div className="flex items-center justify-between gap-3">
            <Label>{formatLabel(key)}</Label>
            <Switch
              checked={value}
              onCheckedChange={(v) => setValue(`settings.${index}.value`, v)}
            />
          </div>
        </div>
      )
    }

    if (typeof value === "object" && value !== null) {
      return (
        <div
          key={setting.id}
          className="space-y-3 rounded-xl border bg-background p-4"
        >
          <Label>{formatLabel(key)}</Label>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {Object.entries(value).map(([nestedKey, nestedValue]) => (
              <div key={nestedKey} className="space-y-1.5">
                <Label>{formatLabel(nestedKey)}</Label>
                <Input
                  value={nestedValue as string}
                  className="h-9 rounded-md bg-background"
                  onChange={(e) => {
                    const newVal = { ...value, [nestedKey]: e.target.value }
                    setValue(`settings.${index}.value`, newVal)
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div
        key={setting.id}
        className="space-y-2 rounded-xl border bg-background p-4"
      >
        <Label>{formatLabel(key)}</Label>
        <Input
          value={value}
          className="h-9 rounded-md bg-background"
          onChange={(e) => setValue(`settings.${index}.value`, e.target.value)}
        />
      </div>
    )
  }

  return (
    <>
      <PageHeader />
      <div className="flex h-full flex-1 flex-col bg-muted px-6 py-4">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as WebSettingsType)}
          className="flex flex-1 flex-col gap-0"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 bg-muted pb-3">
            <TabsList variant="whiteLg">
              {TABS.map((tab) => {
                const Icon = tab.icon
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="h-8 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
                  >
                    <Icon className="mr-1 h-3.5 w-3.5" />
                    {tab.label}
                  </TabsTrigger>
                )
              })}
            </TabsList>
            <PermissionWrapper permissions={[Permissions.SETTING_WRITE]}>
              <Button
                onClick={() => onSaveSection(activeTab)}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </PermissionWrapper>
          </div>

          {TABS.map((tab) => (
            <TabsContent
              key={tab.id}
              value={tab.id}
              className="mt-1 flex-1 p-0"
            >
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {fields.map((field, index) => {
                  if (field.type !== tab.id) return null
                  return renderSettingField(field.key, index)
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  )
}

export default withAuth(SettingsWrapper, {
  requiredPermissions: [Permissions.SETTING_READ],
})
