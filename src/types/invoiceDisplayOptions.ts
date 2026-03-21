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
};
