import React, { forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';

export interface KitchenTicketItem {
  name: string;
  quantity: number;
  notes?: string;
  selectedOptions?: { group: string; values: string[] }[];
}

export interface KitchenTicketPrintProps {
  outletName?: string;
  tableNumber?: string;
  customerName?: string;
  orderType?: string;
  items: KitchenTicketItem[];
  reference?: string;
  servedBy?: string;
}

export interface KitchenTicketPrintRef {
  print: () => void;
}

const KitchenTicketPrint = forwardRef<KitchenTicketPrintRef, KitchenTicketPrintProps>(
  ({ outletName, tableNumber, customerName, orderType, items, reference, servedBy }, ref) => {
    useImperativeHandle(ref, () => ({
      print: () => {
        setTimeout(() => window.print(), 100);
      },
    }));

    const date = new Date().toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return createPortal(
      <div id="kitchen-ticket-portal" className="kitchen-ticket-container">
        <style>{`
          @media print {
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              width: 80mm !important;
              max-width: 80mm !important;
            }
            body * { visibility: hidden !important; }
            #kitchen-ticket-portal,
            #kitchen-ticket-portal * { visibility: visible !important; }
            #kitchen-ticket-portal {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 80mm !important;
              background: white !important;
              z-index: 99999 !important;
            }
            .kitchen-ticket-container {
              padding: 2mm !important;
              width: 76mm !important;
              font-family: 'Arial', sans-serif !important;
              font-size: 13pt !important;
              font-weight: 700 !important;
              color: #000 !important;
              line-height: 1.35 !important;
            }
            @page {
              size: 80mm auto;
              margin: 0;
            }
            .kt-title { font-size: 16pt !important; text-align: center; margin: 0 0 4px 0; letter-spacing: 1px; }
            .kt-sub { font-size: 11pt !important; text-align: center; margin: 0; }
            .kt-divider { border-top: 2px dashed #000; margin: 6px 0; }
            .kt-meta { font-size: 11pt !important; margin: 2px 0; }
            .kt-item { margin: 4px 0; padding-bottom: 4px; border-bottom: 1px dotted #999; }
            .kt-item-name { font-size: 14pt !important; font-weight: 800 !important; }
            .kt-item-qty { font-size: 16pt !important; font-weight: 900 !important; }
            .kt-options { font-size: 11pt !important; padding-left: 8px; }
            .kt-notes { font-size: 11pt !important; font-style: italic; padding-left: 8px; }
            .kt-footer { text-align: center; font-size: 10pt !important; margin-top: 8px; }
          }
          @media screen {
            #kitchen-ticket-portal {
              position: fixed !important;
              left: -99999px !important;
              top: -99999px !important;
            }
          }
        `}</style>

        <h1 className="kt-title">BON DE CUISINE</h1>
        {outletName && <p className="kt-sub">{outletName}</p>}
        <div className="kt-divider" />
        <div className="kt-meta">{date}</div>
        {reference && <div className="kt-meta">Réf: {reference}</div>}
        {tableNumber && <div className="kt-meta">Table: <strong>{tableNumber}</strong></div>}
        {orderType && <div className="kt-meta">Type: {orderType}</div>}
        {customerName && <div className="kt-meta">Client: {customerName}</div>}
        {servedBy && <div className="kt-meta">Serveur: {servedBy}</div>}
        <div className="kt-divider" />

        {items.map((item, idx) => (
          <div key={idx} className="kt-item">
            <div>
              <span className="kt-item-qty">{item.quantity}x</span>{' '}
              <span className="kt-item-name">{item.name}</span>
            </div>
            {item.selectedOptions && item.selectedOptions.length > 0 && (
              <div className="kt-options">
                {item.selectedOptions.map((opt, i) => (
                  <div key={i}>→ {opt.group}: {opt.values.join(', ')}</div>
                ))}
              </div>
            )}
            {item.notes && <div className="kt-notes">★ {item.notes}</div>}
          </div>
        ))}

        <div className="kt-divider" />
        <div className="kt-footer">--- Bonne préparation ---</div>
      </div>,
      document.body
    );
  }
);

KitchenTicketPrint.displayName = 'KitchenTicketPrint';

export default KitchenTicketPrint;
