"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useCreateNotificationMutation } from "@/hooks/notificationApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { NotificationType, NotificationTarget } from "@/store/global.type"

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  message: z.string().min(1, "Message is required").max(1000),
  type: z.string(),
  target: z.string(),
})

type FormData = z.infer<typeof formSchema>

export function SendNotificationDialog({
  children,
}: {
  children?: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [createNotification, { isLoading }] = useCreateNotificationMutation()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: NotificationType.INFO,
      target: NotificationTarget.ALL,
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      await createNotification({
        title: data.title,
        message: data.message,
        type: data.type as NotificationType,
        target: data.target as NotificationTarget,
      }).unwrap()
      toast.success("Notification sent successfully")
      reset()
      setIsOpen(false)
    } catch {
      toast.error("Failed to send notification")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || <Button size="sm">Send Notification</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Notification</DialogTitle>
          <DialogDescription>
            Create and send a notification to users.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              {...register("title")}
              placeholder="Notification title"
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea
              {...register("message")}
              placeholder="Notification message"
              rows={3}
              aria-invalid={!!errors.message}
            />
            {errors.message && (
              <p className="text-xs text-destructive">
                {errors.message.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                defaultValue={NotificationType.INFO}
                onValueChange={(value) => setValue("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NotificationType.INFO}>Info</SelectItem>
                  <SelectItem value={NotificationType.SUCCESS}>
                    Success
                  </SelectItem>
                  <SelectItem value={NotificationType.WARNING}>
                    Warning
                  </SelectItem>
                  <SelectItem value={NotificationType.ERROR}>Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Target</label>
              <Select
                defaultValue={NotificationTarget.ALL}
                onValueChange={(value) => setValue("target", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NotificationTarget.ALL}>
                    All Users
                  </SelectItem>
                  <SelectItem value={NotificationTarget.USERS}>
                    Specific Users
                  </SelectItem>
                  <SelectItem value={NotificationTarget.ROLES}>
                    By Role
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter showCloseButton>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Notification"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
