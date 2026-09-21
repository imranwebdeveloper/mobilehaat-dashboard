"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeftIcon,
  BatteryIcon,
  CameraIcon,
  CpuIcon,
  GlobeIcon,
  HardDriveIcon,
  LayersIcon,
  MaximizeIcon,
  PencilIcon,
  SmartphoneIcon,
} from "lucide-react"

import { useGetPhoneByIdQuery } from "../phones.api"
import { withAuth } from "@/components/hoc"
import { Permissions } from "@/config/permissions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import StatusBadge from "@/components/common/StatusBadge"
import Permission from "@/components/common/Permission"
import Image from "next/image"

const SpecItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ComponentType<{ className?: string }>
  label: string
  value?: string | number | null
}) => (
  <div className="flex flex-col border-b border-muted pb-3 last:border-0 last:pb-0">
    <div className="mb-1 flex items-center gap-2 text-muted-foreground">
      {Icon ? <Icon className="h-4 w-4" /> : null}
      <span className="text-xs font-semibold tracking-wider uppercase">
        {label}
      </span>
    </div>
    <span className="text-sm font-medium">{value || "N/A"}</span>
  </div>
)

const formatCameraSpecs = (camera: {
  mp?: number
  aperture?: string
  sensor_size?: string
  pixel_size?: string
  zoom?: number
  focal_length?: string
}) =>
  [
    typeof camera.mp === "number" ? `${camera.mp} MP` : null,
    camera.aperture || null,
    camera.sensor_size ? `Sensor ${camera.sensor_size}` : null,
    camera.pixel_size ? `Pixel ${camera.pixel_size}` : null,
    camera.zoom ? `${camera.zoom}x Zoom` : null,
    camera.focal_length || null,
  ]
    .filter(Boolean)
    .join(" | ")

const Wrapper = () => {
  const params = useParams()
  const router = useRouter()
  const itemId = params.id as string
  const { data, isLoading } = useGetPhoneByIdQuery(itemId)

  if (isLoading) {
    return <div className="p-8 text-center">Loading phone details...</div>
  }

  if (!data?.data) {
    return (
      <div className="p-8 text-center text-destructive">Phone not found</div>
    )
  }

  const phone = data.data

  return (
    <div className="flex flex-col gap-6 p-6 pb-24">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/phones")}
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to List
        </Button>

        <Permission permission={Permissions.PHONE_UPDATE}>
          <Link href={`/phones/${itemId}/edit`}>
            <Button size="sm">
              <PencilIcon className="mr-2 h-4 w-4" /> Edit Specifications
            </Button>
          </Link>
        </Permission>

        <Permission permission={Permissions.PHONE_READ}>
          <Link href={`/phones/${itemId}/price-history`}>
            <Button size="sm" variant="outline">
              Price History
            </Button>
          </Link>
        </Permission>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Card className="overflow-hidden">
            <div className="border-b bg-primary/5 p-6">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    {phone.title}
                  </h1>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusBadge status={phone.status} />
                    <Badge variant="secondary" className="font-bold">
                      {phone.brand?.name}
                    </Badge>
                    <Badge variant="outline">{phone.model}</Badge>
                    <Badge variant="outline" className="bg-background">
                      {phone.bd_status}
                    </Badge>
                  </div>
                </div>

                <div className="text-right">
                  <span className="block text-sm text-muted-foreground">
                    Approx. BD Price
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    BDT {phone.approximate_price_bd?.toLocaleString() || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  <div className="group relative aspect-[4/5] overflow-hidden rounded-xl border bg-muted">
                    {phone.thumbnail ? (
                      <Image
                        src={phone.thumbnail.url}
                        alt={phone.title}
                        className="h-full w-full object-contain p-4 transition-transform group-hover:scale-105"
                        width={400}
                        height={500}
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
                        <SmartphoneIcon className="mb-2 h-12 w-12 opacity-20" />
                        <span>No image available</span>
                      </div>
                    )}
                  </div>

                  {phone.images?.length ? (
                    <div className="grid grid-cols-4 gap-2">
                      {phone.images.slice(0, 4).map((img, index) => (
                        <div
                          key={img._id || index}
                          className="aspect-square overflow-hidden rounded-md border bg-muted"
                        >
                          <Image
                            src={img.url}
                            alt={`${phone.title} gallery ${index + 1}`}
                            className="h-full w-full object-cover"
                            width={200}
                            height={200}
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="space-y-6">
                  <h3 className="flex items-center gap-2 border-b pb-2 text-lg font-bold">
                    <LayersIcon className="h-5 w-5 text-primary" /> Key
                    Specifications
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    <SpecItem
                      icon={SmartphoneIcon}
                      label="Display"
                      value={`${phone.display.type}, ${phone.display.size}`}
                    />
                    <SpecItem
                      label="Resolution"
                      value={phone.display.resolution}
                    />
                    <SpecItem
                      icon={CpuIcon}
                      label="Chipset"
                      value={phone.platform.chipset}
                    />
                    <SpecItem label="Operating System" value={phone.os.name} />
                    <SpecItem
                      icon={BatteryIcon}
                      label="Battery"
                      value={phone.battery.capacity}
                    />
                    <SpecItem
                      icon={HardDriveIcon}
                      label="Memory"
                      value={phone.memory?.internal}
                    />
                    <SpecItem
                      icon={MaximizeIcon}
                      label="Body"
                      value={phone.body?.dimensions}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-md flex items-center gap-2">
                  <CameraIcon className="h-4 w-4" /> Cameras
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {phone.front_camera?.cameras?.length ||
                phone.back_camera?.cameras?.length ? (
                  <>
                    {phone.back_camera?.cameras?.map((camera, idx) => (
                      <div
                        key={`back-${camera.type}-${idx}`}
                        className="rounded-lg border border-muted bg-muted/50 p-3"
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase"
                          >
                            Back
                          </Badge>
                          <span className="text-xs font-bold text-primary uppercase">
                            {String(camera.type)}
                          </span>
                        </div>
                        <p className="mb-1 text-sm font-medium">
                          {formatCameraSpecs(camera) || "No camera specs"}
                        </p>
                        <p className="text-sm">
                          {phone.back_camera?.videos?.[idx] ||
                            "No video details"}
                        </p>
                        {phone.back_camera?.features?.length ? (
                          <p className="mt-2 text-xs text-muted-foreground">
                            {phone.back_camera.features.join(", ")}
                          </p>
                        ) : null}
                      </div>
                    ))}
                    {phone.front_camera?.cameras?.map((camera, idx) => (
                      <div
                        key={`front-${camera.type}-${idx}`}
                        className="rounded-lg border border-muted bg-muted/50 p-3"
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase"
                          >
                            Front
                          </Badge>
                          <span className="text-xs font-bold text-primary uppercase">
                            {String(camera.type)}
                          </span>
                        </div>
                        <p className="mb-1 text-sm font-medium">
                          {formatCameraSpecs(camera) || "No camera specs"}
                        </p>
                        <p className="text-sm">
                          {phone.front_camera?.videos?.[idx] ||
                            "No video details"}
                        </p>
                        {phone.front_camera?.features?.length ? (
                          <p className="mt-2 text-xs text-muted-foreground">
                            {phone.front_camera.features.join(", ")}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No camera data added
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-md flex items-center gap-2">
                  <GlobeIcon className="h-4 w-4" /> Network & Connectivity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <SpecItem
                  label="Technology"
                  value={phone.network?.technology?.join(", ")}
                />
                <SpecItem label="WiFi" value={phone.connectivity?.wifi} />
                <SpecItem label="USB" value={phone.connectivity?.usb} />
                <div className="mt-4 flex flex-wrap gap-2">
                  {phone.connectivity?.nfc ? (
                    <Badge className="border-green-200 bg-green-100 text-green-700 hover:bg-green-100">
                      NFC
                    </Badge>
                  ) : null}
                  {phone.connectivity?.radio ? (
                    <Badge className="border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-100">
                      Radio
                    </Badge>
                  ) : null}
                  {phone.sound?.loudspeaker ? (
                    <Badge className="border-purple-200 bg-purple-100 text-purple-700 hover:bg-purple-100">
                      Loudspeaker
                    </Badge>
                  ) : null}
                  {phone.sound?.jack_3_5mm ? (
                    <Badge className="border-orange-200 bg-orange-100 text-orange-700 hover:bg-orange-100">
                      3.5mm Jack
                    </Badge>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-md">Pricing Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {phone.variants.map((variant, index) => (
                <div
                  key={`${variant.ram}-${variant.storage}-${index}`}
                  className="rounded-xl border border-muted/50 bg-muted/30 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-lg font-bold">
                      {variant.ram}GB / {variant.storage}GB
                    </span>
                    <Badge>{variant.currency}</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Official</span>
                      <span className="font-bold">
                        BDT {variant.official_price?.toLocaleString() || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Unofficial</span>
                      <span className="font-medium text-muted-foreground">
                        BDT{" "}
                        {variant.unofficial_price?.toLocaleString() || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-md text-primary-foreground/80">
                Expert Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-8 text-center">
              <div className="mb-2 text-5xl font-black">
                {phone.expert_rating?.toFixed(1) || "0.0"}
              </div>
              <div className="text-sm font-medium italic opacity-70">
                Overall score based on specifications and market value
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-md">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="mb-3 flex items-center gap-2 text-xs font-black text-green-600 uppercase">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-600" />{" "}
                  Highlights
                </h4>
                <ul className="space-y-2">
                  {phone.pros?.length ? (
                    phone.pros.map((pro, index) => (
                      <li
                        key={`${pro}-${index}`}
                        className="flex gap-2 text-sm"
                      >
                        <span className="font-bold text-green-600">+</span>
                        <span>{pro}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-center text-xs italic opacity-50">
                      No highlights added
                    </li>
                  )}
                </ul>
              </div>

              <div className="border-t border-muted pt-4">
                <h4 className="mb-3 flex items-center gap-2 text-xs font-black text-red-600 uppercase">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-600" />{" "}
                  Drawbacks
                </h4>
                <ul className="space-y-2">
                  {phone.cons?.length ? (
                    phone.cons.map((con, index) => (
                      <li
                        key={`${con}-${index}`}
                        className="flex gap-2 text-sm"
                      >
                        <span className="font-bold text-red-600">-</span>
                        <span>{con}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-center text-xs italic opacity-50">
                      No drawbacks added
                    </li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default withAuth(Wrapper, {
  requiredPermissions: [Permissions.PHONE_READ],
})
