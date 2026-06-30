export type DateFormat = 'DD-MM-YY' | 'DD-MM-YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'long-fr';
export type AlignOption = 'left' | 'center' | 'right';

export interface InvoiceStyleOptions {
  font_size_title: number;       // px - "FACTURE"
  font_size_company: number;     // px - company name
  font_size_body: number;        // px - main text
  font_size_small: number;       // px - meta info
  font_size_total: number;       // px - total amount
  date_format: DateFormat;
  text_color: string;            // hex
  accent_color: string;          // hex - lines, headings
  section_spacing: number;       // px - vertical gap between sections
  header_align: AlignOption;
  company_align: AlignOption;
  total_align: AlignOption;
  title_bold: boolean;
  title_italic: boolean;
  company_bold: boolean;
  total_bold: boolean;
  uppercase_title: boolean;
}

export const DEFAULT_STYLE_OPTIONS: InvoiceStyleOptions = {
  font_size_title: 24,
  font_size_company: 22,
  font_size_body: 14,
  font_size_small: 12,
  font_size_total: 18,
  date_format: 'DD-MM-YY',
  text_color: '#000000',
  accent_color: '#3B82F6',
  section_spacing: 24,
  header_align: 'left',
  company_align: 'left',
  total_align: 'right',
  title_bold: true,
  title_italic: false,
  company_bold: true,
  total_bold: true,
  uppercase_title: true,
};

export interface InvoiceDisplayOptions {
  show_logo: boolean;
  show_table_number: boolean;
  show_company_address: boolean;
  show_company_phone: boolean;
  show_company_email: boolean;
  show_tax_id: boolean;
  show_rccm: boolean;
  show_nif: boolean;
  show_other_registration: boolean;
  show_payment_terms: boolean;
  show_footer_note: boolean;
  show_served_by: boolean;
  show_customer_info: boolean;
  show_date: boolean;
  show_invoice_number: boolean;
  show_querox_branding: boolean;
  style?: InvoiceStyleOptions;
}

export const DEFAULT_DISPLAY_OPTIONS: InvoiceDisplayOptions = {
  show_logo: true,
  show_table_number: true,
  show_company_address: true,
  show_company_phone: true,
  show_company_email: true,
  show_tax_id: true,
  show_rccm: true,
  show_nif: true,
  show_other_registration: true,
  show_payment_terms: true,
  show_footer_note: true,
  show_served_by: true,
  show_customer_info: true,
  show_date: true,
  show_invoice_number: true,
  show_querox_branding: true,
  style: DEFAULT_STYLE_OPTIONS,
};

/**
 * Format a date string according to the user's chosen date format.
 * Official format DD-MM-YY by default.
 */
export function formatInvoiceDate(
  dateInput: string | Date | null | undefined,
  format: DateFormat = 'DD-MM-YY'
): string {
  if (!dateInput) return '-';

  let d: Date | null = null;
  if (typeof dateInput === 'string') {
    // Pure date (YYYY-MM-DD) → parse as LOCAL date to avoid UTC "next day" drift
    const isoDateOnly = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoDateOnly) {
      d = new Date(+isoDateOnly[1], +isoDateOnly[2] - 1, +isoDateOnly[3]);
    } else {
      const dmy = dateInput.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
      if (dmy) {
        let y = parseInt(dmy[3]);
        if (y < 100) y += 2000;
        d = new Date(y, parseInt(dmy[2]) - 1, parseInt(dmy[1]));
      } else {
        d = new Date(dateInput);
      }
    }
  } else {
    d = dateInput;
  }
  if (!d || isNaN(d.getTime())) return '-';

  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = String(d.getFullYear());
  const yy = yyyy.slice(-2);

  switch (format) {
    case 'DD-MM-YY':
      return `${dd}-${mm}-${yy}`;
    case 'DD-MM-YYYY':
      return `${dd}-${mm}-${yyyy}`;
    case 'DD/MM/YYYY':
      return `${dd}/${mm}/${yyyy}`;
    case 'YYYY-MM-DD':
      return `${yyyy}-${mm}-${dd}`;
    case 'long-fr':
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    default:
      return `${dd}-${mm}-${yy}`;
  }
}
