"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { toast } from "sonner"

// 1️⃣ Zod schema for form validation
const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

// 2️⃣ TypeScript type inferred from Zod schema
type SigninFormValues = z.infer<typeof signinSchema>

export function SigninForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: SigninFormValues) => {
    try {
      const res = await signIn("credentials", { ...data, redirect: false })
      if (res?.error) {
        toast.error("Invalid email or password")
        setError("password", { message: "Invalid email or password" })
      }
      if (res?.ok) {
        toast.success("Login successful")
        window.location.reload()
      }
    } catch {
      toast.error("Invalid email or password")
      setError("password", { message: "Invalid email or password" })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="p-0">
          <form
            className="space-y-6 p-6 md:p-8"
            onSubmit={handleSubmit(onSubmit)}
          >
            <FieldGroup>
              {/* Header */}
              <div className="flex flex-col items-center gap-2 text-center">
                <img src="/logo.png" alt="MobileHaat" className="h-12 w-auto" />
                <h1 className="text-2xl font-bold">Welcome Back</h1>
                <p className="text-muted-foreground">Login to your account</p>
              </div>

              {/* Email Field */}
              <Field>
                <FieldLabel htmlFor="email" required>
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                  className={cn(errors.email && "border-destructive")}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </Field>

              {/* Password Field */}
              <Field>
                <FieldLabel htmlFor="password" required>
                  Password
                </FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="***********"
                  {...register("password")}
                  className={cn(errors.password && "border-destructive")}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </Field>

              {/* Submit Button */}
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
