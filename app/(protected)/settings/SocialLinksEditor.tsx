"use client"

import React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Github,
  MessageCircle,
  Send,
  Phone as Whatsapp,
  Music2,
} from "lucide-react"

interface SocialLinksEditorProps {
  value: Record<string, string>
  onChange: (value: Record<string, string>) => void
}

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  facebook: <Facebook size={16} className="text-blue-500" />,
  twitter: <Twitter size={16} className="text-sky-500" />,
  instagram: <Instagram size={16} className="text-pink-500" />,
  youtube: <Youtube size={16} className="text-red-500" />,
  linkedin: <Linkedin size={16} className="text-blue-600" />,
  github: <Github size={16} />,
  discord: <MessageCircle size={16} className="text-indigo-500" />,
  telegram: <Send size={16} className="text-cyan-500" />,
  whatsapp: <Whatsapp size={16} className="text-emerald-500" />,
  tiktok: <Music2 size={16} />,
}

export const SocialLinksEditor = ({
  value,
  onChange,
}: SocialLinksEditorProps) => {
  const handleUpdate = (key: string, val: string) => {
    onChange({ ...value, [key]: val })
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Label>Social Profiles</Label>

      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
        {Object.entries(SOCIAL_ICONS).map(([key, icon]) => (
          <div
            key={key}
            className="flex items-center gap-2.5 rounded-lg border bg-background p-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
              {icon}
            </div>
            <Input
              value={value?.[key] || ""}
              placeholder={`https://${key}.com/your-handle`}
              className="h-9 rounded-md"
              onChange={(e) => handleUpdate(key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
