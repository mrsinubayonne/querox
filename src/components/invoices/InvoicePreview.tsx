import React from 'react';
import { Card } from '@/components/ui/card';
import {
  InvoiceDisplayOptions,
  DEFAULT_DISPLAY_OPTIONS,
  DEFAULT_STYLE_OPTIONS,
  formatInvoiceDate,
} from '@/types/invoiceDisplayOptions';

interface InvoicePreviewProps {
  settings: {
    invoice_title?: string;
    company_name?: string;
    company_address?: string;
    company_phone?: string;
    company_email?: string;
    tax_id?: string;
    nif_number?: string;
    rccm_number?: string;
    other_registration?: string;
    payment_terms?: string;
    footer_note?: string;
    logo_url?: string;
    primary_color?: string;
  };
  displayOptions?: InvoiceDisplayOptions;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ settings, displayOptions }) => {
  const opts = { ...DEFAULT_DISPLAY_OPTIONS, ...displayOptions };
  const style = { ...DEFAULT_STYLE_OPTIONS, ...(opts.style || {}) };

  const accent = style.accent_color || settings.primary_color || '#3B82F6';
  const text = style.text_color || '#000000';

  const titleText = style.uppercase_title
    ? (settings.invoice_title || 'FACTURE').toUpperCase()
    : (settings.invoice_title || 'FACTURE');

  return (
    <Card
      className="p-8 bg-white shadow-lg max-w-4xl mx-auto"
      style={{
        color: text,
        fontSize: `${style.font_size_body}px`,
      }}
    >
      {/* En-tête */}
      <div
        className="flex justify-between items-start pb-6 border-b-2"
        style={{ borderColor: accent, marginBottom: style.section_spacing, gap: 16 }}
      >
        <div style={{ textAlign: style.company_align, flex: 1 }}>
          {opts.show_logo && settings.logo_url && (
            <img src={settings.logo_url} alt="Logo" className="h-12 mb-2 inline-block" />
          )}
          <h1
            style={{
              fontSize: `${style.font_size_company}px`,
              fontWeight: style.company_bold ? 700 : 400,
              marginBottom: 4,
            }}
          >
            {settings.company_name || 'Nom de l\'entreprise'}
          </h1>
          {opts.show_company_address && settings.company_address && (
            <p className="whitespace-pre-line" style={{ fontSize: `${style.font_size_small}px` }}>
              {settings.company_address}
            </p>
          )}
          {opts.show_company_phone && settings.company_phone && (
            <p style={{ fontSize: `${style.font_size_small}px`, marginTop: 4 }}>Tél: {settings.company_phone}</p>
          )}
          {opts.show_company_email && settings.company_email && (
            <p style={{ fontSize: `${style.font_size_small}px` }}>{settings.company_email}</p>
          )}
          {opts.show_tax_id && settings.tax_id && (
            <p style={{ fontSize: `${style.font_size_small}px` }}>SIRET/TVA: {settings.tax_id}</p>
          )}
          {opts.show_nif && settings.nif_number && (
            <p style={{ fontSize: `${style.font_size_small}px` }}>NIU: {settings.nif_number}</p>
          )}
          {opts.show_rccm && settings.rccm_number && (
            <p style={{ fontSize: `${style.font_size_small}px` }}>RCCM: {settings.rccm_number}</p>
          )}
          {opts.show_other_registration && settings.other_registration && (
            <p style={{ fontSize: `${style.font_size_small}px` }}>{settings.other_registration}</p>
          )}
        </div>
        <div style={{ textAlign: style.header_align, flex: 1 }}>
          <h2
            style={{
              fontSize: `${style.font_size_title}px`,
              fontWeight: style.title_bold ? 700 : 400,
              fontStyle: style.title_italic ? 'italic' : 'normal',
              marginBottom: 4,
            }}
          >
            {titleText}
          </h2>
          {opts.show_invoice_number && (
            <p style={{ fontSize: `${style.font_size_body}px`, fontWeight: 600 }}>INV-202501-0001</p>
          )}
          {opts.show_date && (
            <p style={{ fontSize: `${style.font_size_small}px`, marginTop: 4 }}>
              Date: {formatInvoiceDate(new Date(), style.date_format)}
            </p>
          )}
          {opts.show_table_number && (
            <p style={{ fontSize: `${style.font_size_small}px`, marginTop: 4 }}>Table: 5</p>
          )}
        </div>
      </div>

      {/* Informations client */}
      {opts.show_customer_info && (
        <div style={{ marginBottom: style.section_spacing }}>
          <h3 style={{ fontSize: `${style.font_size_body}px`, fontWeight: 600, marginBottom: 4 }}>Facturé à:</h3>
          <p style={{ fontSize: `${style.font_size_body}px` }}>Client Exemple</p>
          <p style={{ fontSize: `${style.font_size_small}px` }}>client@exemple.com</p>
          <p style={{ fontSize: `${style.font_size_small}px` }}>+33 6 12 34 56 78</p>
        </div>
      )}

      {opts.show_served_by && (
        <p style={{ fontSize: `${style.font_size_small}px`, marginBottom: style.section_spacing }}>
          Servi par: Jean Dupont
        </p>
      )}

      {/* Tableau */}
      <div style={{ marginBottom: style.section_spacing }}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th
                className="border border-gray-300 px-3 py-2 text-left"
                style={{ fontSize: `${style.font_size_small}px`, fontWeight: 600 }}
              >
                Description
              </th>
              <th
                className="border border-gray-300 px-3 py-2 text-right"
                style={{ fontSize: `${style.font_size_small}px`, fontWeight: 600 }}
              >
                Montant
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-3 py-2" style={{ fontSize: `${style.font_size_body}px` }}>
                <p style={{ fontWeight: 500 }}>Services et produits</p>
                <p style={{ fontSize: `${style.font_size_small}px` }}>Exemple de description</p>
              </td>
              <td
                className="border border-gray-300 px-3 py-2 text-right"
                style={{ fontSize: `${style.font_size_body}px`, fontWeight: 600 }}
              >
                15,000 XAF
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div
        className="flex mb-2"
        style={{
          justifyContent: style.total_align === 'right' ? 'flex-end' : style.total_align === 'center' ? 'center' : 'flex-start',
          marginBottom: style.section_spacing,
        }}
      >
        <div className="min-w-[200px]">
          <div className="flex justify-between py-2 border-t-2" style={{ borderColor: accent }}>
            <span style={{ fontSize: `${style.font_size_total}px`, fontWeight: 600 }}>TOTAL:</span>
            <span style={{ fontSize: `${style.font_size_total}px`, fontWeight: style.total_bold ? 900 : 600 }}>
              15,000 XAF
            </span>
          </div>
        </div>
      </div>

      {/* Informations de paiement */}
      <div className="p-3 bg-gray-50 rounded" style={{ marginBottom: style.section_spacing }}>
        <h3 style={{ fontSize: `${style.font_size_body}px`, fontWeight: 600, marginBottom: 8 }}>
          Informations de paiement
        </h3>
        <div className="grid grid-cols-2 gap-3" style={{ fontSize: `${style.font_size_small}px` }}>
          <div>
            <p>Statut:</p>
            <p style={{ fontWeight: 600 }}>EN ATTENTE</p>
          </div>
          <div>
            <p>Date d'échéance:</p>
            <p style={{ fontWeight: 600 }}>
              {formatInvoiceDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), style.date_format)}
            </p>
          </div>
        </div>
      </div>

      {/* Conditions */}
      <div className="border-t-2 pt-4" style={{ borderColor: accent, marginTop: style.section_spacing }}>
        {opts.show_payment_terms && (
          <>
            <h3 style={{ fontSize: `${style.font_size_small}px`, fontWeight: 600, marginBottom: 4 }}>
              Conditions de paiement:
            </h3>
            <p
              className="whitespace-pre-line mb-3"
              style={{ fontSize: `${style.font_size_small}px` }}
            >
              {settings.payment_terms || 'Paiement à effectuer sous 30 jours à compter de la date de facturation.'}
            </p>
          </>
        )}
        {opts.show_footer_note && settings.footer_note && (
          <p className="whitespace-pre-line mb-3" style={{ fontSize: `${style.font_size_small}px` }}>
            {settings.footer_note}
          </p>
        )}
        {opts.show_querox_branding && (
          <p className="text-center mt-4" style={{ fontSize: `${style.font_size_small}px` }}>
            Généré par QUEROX.me
          </p>
        )}
      </div>
    </Card>
  );
};

export default InvoicePreview;
