import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import useIsMobile from "@/hooks/useIsMobile";

export default function ResponsiveDialog({ open, onOpenChange, title, description, children, footer }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92vh]">
          <div className="border-b border-border px-4 pb-3 pt-1">
            <DrawerTitle className="font-heading text-lg font-semibold">{title}</DrawerTitle>
            {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
          </div>
          <div className="overflow-y-auto px-4 py-4">{children}</div>
          {footer ? <div className="border-t border-border px-4 py-3">{footer}</div> : null}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle className="font-heading text-lg font-semibold">{title}</DialogTitle>
          {description ? <DialogDescription className="text-xs">{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="max-h-[65vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <div className="border-t border-border px-5 py-3">{footer}</div> : null}
      </DialogContent>
    </Dialog>
  );
}
