import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface CustomAvatarProps {
  src?: string
  alt?: string
  className?: string
  name?: string
}

const CustomAvatar = ({ src, alt, className, name }: CustomAvatarProps) => {
  // Generate initials from name if provided
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "NA" // default fallback

  return (
    <Avatar className={`h-10 w-10 ${className || ""}`}>
      {src ? (
        <AvatarImage src={src} alt={alt || name || "Avatar"} />
      ) : (
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      )}
    </Avatar>
  )
}

export default CustomAvatar
