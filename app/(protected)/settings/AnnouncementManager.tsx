"use client"

import React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, Bell, LayoutPanelTop } from "lucide-react"

interface AnnouncementItem {
  text: string
  enabled: boolean
  link: string
  link_text: string
}

interface PopupAnnouncement {
  title: string
  message: string
  enabled: boolean
  image: string
  button_text: string
  button_link: string
  show_after_days: number
}

interface AnnouncementManagerProps {
  barValue: AnnouncementItem[]
  onBarChange: (value: AnnouncementItem[]) => void
  popupValue: PopupAnnouncement
  onPopupChange: (value: PopupAnnouncement) => void
}

export const AnnouncementManager = ({
  barValue,
  onBarChange,
  popupValue,
  onPopupChange,
}: AnnouncementManagerProps) => {
  const addBarItem = () => {
    onBarChange([
      ...barValue,
      { text: "", enabled: true, link: "", link_text: "" },
    ])
  }

  const removeBarItem = (index: number) => {
    onBarChange(barValue.filter((_, i) => i !== index))
  }

  const updateBarItem = (index: number, updates: Partial<AnnouncementItem>) => {
    onBarChange(
      barValue.map((item, i) => (i === index ? { ...item, ...updates } : item))
    )
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutPanelTop size={14} />
            <Label>Announcement Bar</Label>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addBarItem}
            className="h-8 rounded-md px-3 text-xs"
          >
            <Plus className="mr-1 h-3 w-3" /> Add Message
          </Button>
        </div>

        <div className="space-y-2.5">
          {barValue.map((item, index) => (
            <div
              key={`${item.link}-${index}`}
              className="space-y-2 rounded-lg border bg-background p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Message #{index + 1}
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">
                      Enabled
                    </span>
                    <Switch
                      checked={item.enabled}
                      onCheckedChange={(v) =>
                        updateBarItem(index, { enabled: v })
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBarItem(index)}
                    className="h-7 w-7 rounded-md text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <Input
                  value={item.text}
                  placeholder="Message text"
                  onChange={(e) =>
                    updateBarItem(index, { text: e.target.value })
                  }
                  className="h-9 rounded-md"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={item.link}
                    placeholder="/offers"
                    onChange={(e) =>
                      updateBarItem(index, { link: e.target.value })
                    }
                    className="h-9 rounded-md"
                  />
                  <Input
                    value={item.link_text}
                    placeholder="View"
                    onChange={(e) =>
                      updateBarItem(index, { link_text: e.target.value })
                    }
                    className="h-9 rounded-md"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-lg border bg-background p-3">
        <div className="flex items-center gap-2">
          <Bell size={14} />
          <Label>Popup Announcement</Label>
        </div>

        <div className="flex items-center justify-between pb-2">
          <span className="text-sm text-muted-foreground">Enable popup</span>
          <Switch
            checked={popupValue.enabled}
            onCheckedChange={(v) =>
              onPopupChange({ ...popupValue, enabled: v })
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <Input
            value={popupValue.title}
            placeholder="Popup title"
            onChange={(e) =>
              onPopupChange({ ...popupValue, title: e.target.value })
            }
            className="h-9 rounded-md"
          />
          <Input
            value={popupValue.message}
            placeholder="Popup message"
            onChange={(e) =>
              onPopupChange({ ...popupValue, message: e.target.value })
            }
            className="h-9 rounded-md"
          />
          <Input
            value={popupValue.button_text}
            placeholder="Button text"
            onChange={(e) =>
              onPopupChange({ ...popupValue, button_text: e.target.value })
            }
            className="h-9 rounded-md"
          />
          <Input
            value={popupValue.button_link}
            placeholder="Button link"
            onChange={(e) =>
              onPopupChange({ ...popupValue, button_link: e.target.value })
            }
            className="h-9 rounded-md"
          />
          <div className="space-y-1 md:col-span-2">
            <Label>Show after days</Label>
            <Input
              type="number"
              min={0}
              value={popupValue.show_after_days}
              onChange={(e) =>
                onPopupChange({
                  ...popupValue,
                  show_after_days: Number.isNaN(
                    Number.parseInt(e.target.value, 10)
                  )
                    ? 0
                    : Number.parseInt(e.target.value, 10),
                })
              }
              className="h-9 rounded-md"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
