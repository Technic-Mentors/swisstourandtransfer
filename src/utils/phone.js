/** Convert entered phone formats to digits suitable for WhatsApp's wa.me links. */
export function normalizeWhatsAppNumber(value) {
  let digits = String(value ?? '').replace(/\D/g, '');
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('0')) return `41${digits.slice(1)}`;
  return digits;
}
