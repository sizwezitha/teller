import { NextResponse } from "next/server";

import { generatePayfastSignature } from "@/lib/payfast";

export async function POST(req: Request) {
  try {
    const payload = await req.formData();
    const fields: Record<string, string> = {};

    for (const [key, value] of payload.entries()) {
      if (typeof value === "string") {
        fields[key] = value;
      }
    }

    const expectedSignature = generatePayfastSignature({
      merchant_id: fields.merchant_id,
      merchant_key: fields.merchant_key,
      amount: fields.amount_gross ?? fields.amount,
      item_name: fields.item_name,
      m_payment_id: fields.m_payment_id,
      return_url: fields.return_url,
      cancel_url: fields.cancel_url,
      notify_url: fields.notify_url,
      passphrase: process.env.PAYFAST_PASSPHRASE,
    });

    if (
      fields.signature &&
      String(fields.signature).toUpperCase() !== expectedSignature
    ) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    return NextResponse.json({ ok: true, status: fields.payment_status || "OK" });
  } catch (error) {
    console.error("Payfast notify error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
