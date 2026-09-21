import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
interface DisplayFormDrawerProps {
  onSubmit: () => void
  onClose?: () => void
  isLoading?: boolean
  title?: string
  description?: string
  children: React.ReactNode
  open?: boolean
}

const DisplayFormDrawer = ({
  onSubmit,
  onClose,
  description = "Add a new item",
  isLoading,
  title = "Add New",
  children,
  open = false,
}: DisplayFormDrawerProps) => {
  return (
    <Drawer direction="right" open={open} onClose={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4">{children}</div>
        <DrawerFooter>
          <Button disabled={isLoading} onClick={onSubmit}>
            Submit
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default DisplayFormDrawer
