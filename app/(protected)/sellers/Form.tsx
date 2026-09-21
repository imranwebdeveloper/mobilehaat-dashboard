"use client"

import { Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import FormFieldWrapper from "@/components/ui/FormFieldWrapper"
import { useSellerForm } from "./useSellerForm"
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  SELLER_BUSINESS_TYPE_OPTIONS,
  SELLER_STATUS_OPTIONS,
  SELLER_VERIFICATION_OPTIONS,
} from "./seller.constant"
import AsyncUserSelect from "@/components/common/select/AsyncUserSelect"
import GeoRefSelect from "@/components/common/select/GeoRefSelect"
import { useGeoAddressFields } from "@/hooks/useGeoAddressFields"
import FullWidthLoading from "@/components/common/loading/FullWidthLoading"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/ui/file-upload"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function SellerForm() {
  const {
    form,
    onSubmit,
    isLoading,
    isEdit,
    handleCancel,
    isFetching,
    logoMedia,
    setLogoMedia,
    coverMedia,
    setCoverMedia,
  } = useSellerForm()

  const {
    divisionId,
    districtId,
    onDivisionChange,
    onDistrictChange,
    onUpazilaChange,
  } = useGeoAddressFields({ form })

  if (isFetching) {
    return <FullWidthLoading />
  }

  return (
    <div className="w-full p-6 pb-24">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FieldSet>
          <FieldLegend>Basic Information</FieldLegend>
          <FieldGroup className="grid gap-3">
            {!isEdit && (
              <FormFieldWrapper
                label="User"
                required
                error={form.formState.errors.user_id?.message}
              >
                <Controller
                  control={form.control}
                  name="user_id"
                  render={({ field }) => (
                    <AsyncUserSelect
                      placeholder="Search user by name or email"
                      onChange={(value) => field.onChange(value)}
                      onSelectUser={(user) => {
                        if (user?.email) {
                          form.setValue("email", user.email)
                        }
                      }}
                    />
                  )}
                />
              </FormFieldWrapper>
            )}

            <FormFieldWrapper
              label="Store Name"
              required
              error={form.formState.errors.store_name?.message}
            >
              <Controller
                control={form.control}
                name="store_name"
                render={({ field }) => (
                  <Input {...field} placeholder="e.g. Gadget House" />
                )}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Owner Name"
              required
              error={form.formState.errors.owner_name?.message}
            >
              <Controller
                control={form.control}
                name="owner_name"
                render={({ field }) => (
                  <Input {...field} placeholder="Owner / contact person" />
                )}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Description"
              error={form.formState.errors.description?.message}
            >
              <Controller
                control={form.control}
                name="description"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Short description about the store"
                  />
                )}
              />
            </FormFieldWrapper>
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend>Contact Information</FieldLegend>
          <FieldGroup className="grid gap-3">
            <div className="grid gap-3 md:grid-cols-2">
              <FormFieldWrapper
                label="Phone"
                required
                error={form.formState.errors.phone?.message}
              >
                <Controller
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <Input {...field} placeholder="+8801XXXXXXXXX" />
                  )}
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Alternate Phone"
                error={form.formState.errors.alternate_phone?.message}
              >
                <Controller
                  control={form.control}
                  name="alternate_phone"
                  render={({ field }) => (
                    <Input {...field} placeholder="Optional" />
                  )}
                />
              </FormFieldWrapper>
            </div>

            <FormFieldWrapper
              label="Email"
              required
              error={form.formState.errors.email?.message}
            >
              <Controller
                control={form.control}
                name="email"
                render={({ field }) => (
                  <Input
                    type="email"
                    {...field}
                    placeholder="example@mail.com"
                  />
                )}
              />
            </FormFieldWrapper>

            <FormFieldWrapper
              label="Business Type"
              error={form.formState.errors.business_type?.message}
            >
              <Controller
                control={form.control}
                name="business_type"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type">
                        {SELLER_BUSINESS_TYPE_OPTIONS.find(
                          (o) => o.value === field.value
                        )?.label ?? null}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {SELLER_BUSINESS_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormFieldWrapper>
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend>Address</FieldLegend>
          <FieldGroup className="grid gap-3">
            <FormFieldWrapper
              label="Address Line"
              required
              error={form.formState.errors.address?.address_line?.message}
            >
              <Controller
                control={form.control}
                name="address.address_line"
                render={({ field }) => (
                  <Input {...field} placeholder="Shop 12, Road 5" />
                )}
              />
            </FormFieldWrapper>

            <div className="grid gap-3 md:grid-cols-2">
              <FormFieldWrapper
                label="Division"
                required
                error={form.formState.errors.address?.division_id?.message}
              >
                <Controller
                  control={form.control}
                  name="address.division_id"
                  render={({ field }) => (
                    <GeoRefSelect
                      kind="division"
                      placeholder="Select division"
                      value={field.value}
                      onChange={onDivisionChange}
                    />
                  )}
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="District"
                required
                error={form.formState.errors.address?.district_id?.message}
              >
                <Controller
                  control={form.control}
                  name="address.district_id"
                  render={({ field }) => (
                    <GeoRefSelect
                      kind="district"
                      parentId={divisionId}
                      placeholder="Select district"
                      value={field.value}
                      disabled={!divisionId}
                      onChange={onDistrictChange}
                    />
                  )}
                />
              </FormFieldWrapper>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <FormFieldWrapper
                label="Upazila / Thana"
                error={form.formState.errors.address?.upazila_id?.message}
              >
                <Controller
                  control={form.control}
                  name="address.upazila_id"
                  render={({ field }) => (
                    <GeoRefSelect
                      kind="upazila"
                      parentId={districtId}
                      placeholder="Select upazila / thana"
                      value={field.value}
                      disabled={!districtId}
                      onChange={onUpazilaChange}
                    />
                  )}
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Landmark"
                error={form.formState.errors.address?.landmark?.message}
              >
                <Controller
                  control={form.control}
                  name="address.landmark"
                  render={({ field }) => (
                    <Input {...field} placeholder="e.g. Bashundhara City" />
                  )}
                />
              </FormFieldWrapper>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <FormFieldWrapper
                label="Latitude"
                error={form.formState.errors.address?.latitude?.message}
              >
                <Controller
                  control={form.control}
                  name="address.latitude"
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      step="any"
                      inputMode="decimal"
                      placeholder="e.g. 23.8103"
                    />
                  )}
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Longitude"
                error={form.formState.errors.address?.longitude?.message}
              >
                <Controller
                  control={form.control}
                  name="address.longitude"
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      step="any"
                      inputMode="decimal"
                      placeholder="e.g. 90.4125"
                    />
                  )}
                />
              </FormFieldWrapper>
            </div>
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend>Social & Online Presence</FieldLegend>
          <FieldGroup className="grid gap-3">
            <div className="grid gap-3 md:grid-cols-2">
              <FormFieldWrapper
                label="Website"
                error={form.formState.errors.social?.website?.message}
              >
                <Controller
                  control={form.control}
                  name="social.website"
                  render={({ field }) => (
                    <Input {...field} placeholder="https://..." />
                  )}
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Facebook"
                error={form.formState.errors.social?.facebook?.message}
              >
                <Controller
                  control={form.control}
                  name="social.facebook"
                  render={({ field }) => (
                    <Input {...field} placeholder="FB page URL" />
                  )}
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Instagram"
                error={form.formState.errors.social?.instagram?.message}
              >
                <Controller
                  control={form.control}
                  name="social.instagram"
                  render={({ field }) => (
                    <Input {...field} placeholder="Instagram URL" />
                  )}
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="YouTube"
                error={form.formState.errors.social?.youtube?.message}
              >
                <Controller
                  control={form.control}
                  name="social.youtube"
                  render={({ field }) => (
                    <Input {...field} placeholder="YouTube URL" />
                  )}
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="WhatsApp"
                error={form.formState.errors.social?.whatsapp?.message}
              >
                <Controller
                  control={form.control}
                  name="social.whatsapp"
                  render={({ field }) => (
                    <Input {...field} placeholder="+8801XXXXXXXXX" />
                  )}
                />
              </FormFieldWrapper>
            </div>
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend>Branding</FieldLegend>
          <FieldGroup className="grid gap-3">
            <div className="grid gap-3 md:grid-cols-2">
              <FormFieldWrapper
                label="Logo"
                error={form.formState.errors.branding?.logo?.message}
              >
                <Controller
                  control={form.control}
                  name="branding.logo"
                  render={({ field }) => (
                    <FileUpload
                      value={field.value}
                      onChange={field.onChange}
                      purpose="SELLER_LOGO"
                      existingUrl={logoMedia}
                      label="Upload logo"
                      description="PNG, JPG, or WebP"
                    />
                  )}
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Cover Image"
                error={form.formState.errors.branding?.cover_image?.message}
              >
                <Controller
                  control={form.control}
                  name="branding.cover_image"
                  render={({ field }) => (
                    <FileUpload
                      value={field.value}
                      onChange={field.onChange}
                      purpose="SELLER_COVER"
                      existingUrl={coverMedia}
                      label="Upload cover image"
                      description="PNG, JPG, or WebP"
                    />
                  )}
                />
              </FormFieldWrapper>
            </div>
          </FieldGroup>
        </FieldSet>

        {!isEdit && (
          <FieldSet>
            <FieldLegend>Status & Verification</FieldLegend>
            <FieldGroup className="grid gap-3">
              <div className="grid gap-3 md:grid-cols-2">
                <FormFieldWrapper
                  label="Status"
                  error={form.formState.errors.status?.message}
                >
                  <Controller
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => field.onChange(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status">
                            {SELLER_STATUS_OPTIONS.find(
                              (o) => o.value === field.value
                            )?.label ?? null}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {SELLER_STATUS_OPTIONS.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  label="Verification Status"
                  error={form.formState.errors.verification_status?.message}
                >
                  <Controller
                    control={form.control}
                    name="verification_status"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => field.onChange(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select verification">
                            {SELLER_VERIFICATION_OPTIONS.find(
                              (o) => o.value === field.value
                            )?.label ?? null}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {SELLER_VERIFICATION_OPTIONS.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormFieldWrapper>
              </div>
            </FieldGroup>
          </FieldSet>
        )}

        <FieldSet>
          <FieldLegend>Store Settings</FieldLegend>
          <FieldGroup className="grid gap-3">
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                control={form.control}
                name="settings.is_store_active"
                render={({ field }) => (
                  <label className="flex items-center justify-between gap-2 rounded-md border p-3">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">
                        Store Active
                      </Label>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      size="sm"
                    />
                  </label>
                )}
              />

              <Controller
                control={form.control}
                name="settings.email_notifications"
                render={({ field }) => (
                  <label className="flex items-center justify-between gap-2 rounded-md border p-3">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">
                        Email Notifications
                      </Label>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      size="sm"
                    />
                  </label>
                )}
              />

              <Controller
                control={form.control}
                name="settings.subscription_notifications"
                render={({ field }) => (
                  <label className="flex items-center justify-between gap-2 rounded-md border p-3">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">
                        Subscription Notifications
                      </Label>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      size="sm"
                    />
                  </label>
                )}
              />

              <Controller
                control={form.control}
                name="settings.offer_notifications"
                render={({ field }) => (
                  <label className="flex items-center justify-between gap-2 rounded-md border p-3">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">
                        Offer Notifications
                      </Label>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      size="sm"
                    />
                  </label>
                )}
              />

              <Controller
                control={form.control}
                name="settings.show_phone"
                render={({ field }) => (
                  <label className="flex items-center justify-between gap-2 rounded-md border p-3">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">
                        Show Phone Number
                      </Label>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      size="sm"
                    />
                  </label>
                )}
              />

              <Controller
                control={form.control}
                name="settings.show_email"
                render={({ field }) => (
                  <label className="flex items-center justify-between gap-2 rounded-md border p-3">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">
                        Show Email Address
                      </Label>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      size="sm"
                    />
                  </label>
                )}
              />

              <Controller
                control={form.control}
                name="settings.show_whatsapp"
                render={({ field }) => (
                  <label className="flex items-center justify-between gap-2 rounded-md border p-3">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">
                        Show WhatsApp
                      </Label>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      size="sm"
                    />
                  </label>
                )}
              />

              <Controller
                control={form.control}
                name="settings.show_address"
                render={({ field }) => (
                  <label className="flex items-center justify-between gap-2 rounded-md border p-3">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">
                        Show Address
                      </Label>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      size="sm"
                    />
                  </label>
                )}
              />

              <Controller
                control={form.control}
                name="settings.show_location"
                render={({ field }) => (
                  <label className="flex items-center justify-between gap-2 rounded-md border p-3">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">
                        Show Location
                      </Label>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      size="sm"
                    />
                  </label>
                )}
              />

              <Controller
                control={form.control}
                name="settings.show_website"
                render={({ field }) => (
                  <label className="flex items-center justify-between gap-2 rounded-md border p-3">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">
                        Show Website
                      </Label>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      size="sm"
                    />
                  </label>
                )}
              />

              <Controller
                control={form.control}
                name="settings.show_facebook"
                render={({ field }) => (
                  <label className="flex items-center justify-between gap-2 rounded-md border p-3">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">
                        Show Facebook
                      </Label>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      size="sm"
                    />
                  </label>
                )}
              />

              <Controller
                control={form.control}
                name="settings.show_instagram"
                render={({ field }) => (
                  <label className="flex items-center justify-between gap-2 rounded-md border p-3">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">
                        Show Instagram
                      </Label>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      size="sm"
                    />
                  </label>
                )}
              />

              <Controller
                control={form.control}
                name="settings.show_youtube"
                render={({ field }) => (
                  <label className="flex items-center justify-between gap-2 rounded-md border p-3">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">
                        Show YouTube
                      </Label>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      size="sm"
                    />
                  </label>
                )}
              />

              <Controller
                control={form.control}
                name="settings.show_out_of_stock"
                render={({ field }) => (
                  <label className="flex items-center justify-between gap-2 rounded-md border p-3">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">
                        Show Out of Stock
                      </Label>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      size="sm"
                    />
                  </label>
                )}
              />
            </div>
          </FieldGroup>
        </FieldSet>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
            type="button"
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : isEdit
                ? "Update Seller"
                : "Create Seller"}
          </Button>
        </div>
      </form>
    </div>
  )
}
