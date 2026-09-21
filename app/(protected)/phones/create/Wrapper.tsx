"use client"
import { useState } from "react"
import PhoneForm from "../Form"
import AiGeneratePanel from "../ai/AiGeneratePanel"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { withAuth } from "@/components/hoc"
import { Permissions } from "@/config/permissions"
import { PhoneFormDraft } from "../ai/ai.types"
import { PenLine, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const Wrapper = () => {
  const [activeTab, setActiveTab] = useState("manual")
  const [draft, setDraft] = useState<PhoneFormDraft | null>(null)

  const handleFillForm = (nextDraft: PhoneFormDraft) => {
    setDraft(nextDraft)
    setActiveTab("manual")
  }

  return (
    <div className="flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b bg-background px-6 py-3">
          <TabsList variant="whiteLg" className="w-full sm:w-fit">
            <TabsTrigger
              value="manual"
              className="h-8 flex-1 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:flex-none"
            >
              <PenLine />
              Manual Entry
            </TabsTrigger>
            <TabsTrigger
              value="ai"
              className="h-8 flex-1 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:flex-none"
            >
              <Sparkles />
              AI Generate
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent
          value="manual"
          forceMount
          className={cn(activeTab !== "manual" && "hidden")}
        >
          <PhoneForm draft={draft} onDraftConsumed={() => setDraft(null)} />
        </TabsContent>
        <TabsContent
          value="ai"
          forceMount
          className={cn(activeTab !== "ai" && "hidden")}
        >
          <AiGeneratePanel onFillForm={handleFillForm} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default withAuth(Wrapper, {
  requiredPermissions: [Permissions.PHONE_CREATE],
})
