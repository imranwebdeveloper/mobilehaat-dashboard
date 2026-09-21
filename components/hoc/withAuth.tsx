"use client"

// import { useSession } from "next-auth/react"
// import { useRouter } from "next/navigation"
import { ComponentType } from "react"
import { ShieldX } from "lucide-react"
import { usePermission } from "@/hooks/usePermission"

interface WithAuthOptions {
  requiredPermissions?: string[]
  requireAll?: boolean
  fallback?: React.ReactNode
  permissionDenied?: React.ReactNode
}

export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const {
    requiredPermissions = [],
    requireAll = false,
    permissionDenied,
  } = options

  function WithAuthComponent(props: P) {
    // const { data: session, status } = useSession()
    const { hasPermission, hasAnyPermission } = usePermission()
    // const router = useRouter()

    // Show loader while session is loading
    // if (status === "loading") {
    //   return (
    //     fallback || (
    //       <div className="flex h-screen items-center justify-center">
    //         <Loader2 className="h-8 w-8 animate-spin" />
    //       </div>
    //     )
    //   )
    // }

    // // If user is not logged in
    // if (!session?.user) {
    //   router.push("/login")
    //   return null
    // }

    // Check permissions
    const allowed = requireAll
      ? requiredPermissions.every((p) => hasPermission(p))
      : hasAnyPermission(requiredPermissions)

    if (!allowed) {
      return (
        permissionDenied || (
          <div className="flex h-screen flex-col items-center justify-center gap-4">
            <ShieldX className="h-16 w-16 text-destructive" />
            <h2 className="text-2xl font-semibold">Access Denied</h2>
            <p className="text-muted-foreground">
              You don&apos;t have permission to access this page.
            </p>
          </div>
        )
      )
    }

    // Render the wrapped component
    return <WrappedComponent {...props} />
  }

  WithAuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`

  return WithAuthComponent
}

export default withAuth
