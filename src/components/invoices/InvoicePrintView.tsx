import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Invoice } from '@/hooks/useInvoices';
import PrintableInvoice from './PrintableInvoice';

interface InvoicePrintViewProps {
  invoice: Invoice;
  servedBy?: string;
  format?: 'a4' | 'restaurant';
  onAfterPrint?: () => void;
}

const InvoicePrintView: React.FC<InvoicePrintViewProps> = ({ 
  invoice, 
  servedBy, 
  format = 'restaurant',
  onAfterPrint 
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const printTriggered = useRef(false);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Facture_${invoice.invoice_number}`,
    onAfterPrint: () => {
      printTriggered.current = false;
      if (onAfterPrint) {
        onAfterPrint();
      }
    },
    pageStyle: `
      @page {
        size: ${format === 'a4' ? 'A4' : 'A5'} portrait;
        margin: 5mm;
      }
      @media print {
        html, body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body * {
          visibility: hidden;
        }
        .printable-invoice-content, .printable-invoice-content * {
          visibility: visible !important;
        }
        .printable-invoice-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
      }
    `
  });

  const handleReady = useCallback(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady && !printTriggered.current) {
      printTriggered.current = true;
      // Petit délai pour s'assurer que le DOM est rendu
      const timer = setTimeout(() => {
        handlePrint();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isReady, handlePrint]);

  return (
    <div style={{ 
      position: 'fixed', 
      left: '-9999px', 
      top: '-9999px',
      width: format === 'a4' ? '210mm' : '148mm'
    }}>
      <PrintableInvoice
        ref={componentRef}
        invoice={invoice}
        servedBy={servedBy}
        format={format}
        onReady={handleReady}
      />
    </div>
  );
};

export default InvoicePrintView;
