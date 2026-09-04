import crypto from "node:crypto";

export type PayfastSignatureFields = {
  merchant_id?: string | number;
  merchant_key?: string | number;
  amount?: string | number;
  item_name?: string | number;
  m_payment_id?: string | number;
  return_url?: string | number;
  cancel_url?: string | number;
  notify_url?: string | number;
  passphrase?: string | number;
};

export function generatePayfastSignature(
  fields: PayfastSignatureFields
): string {
  const orderedFields = [
    "merchant_id",
    "merchant_key",
    "amount",
    "item_name",
    "m_payment_id",
    "return_url",
    "cancel_url",
    "notify_url",
  ] as const;

  const signatureData = orderedFields
    .map((field) => String(fields[field] ?? ""))
    .join("|");

  const passphrase = fields.passphrase ? String(fields.passphrase) : "";
  const payload = passphrase ? `${signatureData}|${passphrase}` : signatureData;

  return crypto.createHash("md5").update(payload).digest("hex").toUpperCase();
}
