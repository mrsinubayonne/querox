import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Receipt } from "lucide-react";

interface InvoiceFormatSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectFormat: (format: 'a4' | 'restaurant') => void;
}

const InvoiceFormatSelector: React.FC<InvoiceFormatSelectorProps> = ({
  open,
  onOpenChange,
  onSelectFormat,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Format d'impression</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="h-32 flex flex-col gap-2"
            onClick={() => {
              onSelectFormat('a4');
              onOpenChange(false);
            }}
          >
            <FileText className="h-12 w-12" />
            <div className="text-center">
              <div className="font-semibold">Format A4</div>
              <div className="text-xs text-muted-foreground">21 x 29.7 cm</div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="h-32 flex flex-col gap-2"
            onClick={() => {
              onSelectFormat('restaurant');
              onOpenChange(false);
            }}
          >
            <Receipt className="h-12 w-12" />
            <div className="text-center">
              <div className="font-semibold">Format Restaurant</div>
              <div className="text-xs text-muted-foreground">14.8 x 21 cm</div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceFormatSelector;
