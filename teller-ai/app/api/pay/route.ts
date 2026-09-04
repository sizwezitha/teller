import { NextResponse } from "next/server";

import { generatePayfastSignature } from "@/lib/payfast";

const PAYFAST_URL =
  process.env.PAYFAST_URL || "https://www.payfast.co.za/eng/process";

const planConfig = {
  pro: {
    amount: "470.00",
    item_name: "Teller AI Pro",
    description: "Teller AI Pro subscription",
    m_payment_id: "teller-pro",
  },
  business: {
    amount: "160.00",
    item_name: "Teller AI Business",
    description: "Teller AI Business subscription",
    m_payment_id: "teller-business",
  },
} as const;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const plan = body?.plan;
    const userEmail = body?.userEmail || body?.email || null;
    const selectedPlan = planConfig[plan as keyof typeof planConfig];

    if (!selectedPlan) {
      return NextResponse.json(
        { error: "Invalid plan selected." },
        { status: 400 }
      );
    }

    const merchantId = process.env.PAYFAST_MERCHANT_ID;
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
    const passphrase = process.env.PAYFAST_PASSPHRASE;

    if (!merchantId || !merchantKey) {
      return NextResponse.json(
        { error: "Payfast merchant configuration is missing." },
        { status: 500 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const notifyUrl = `${baseUrl}/api/pay/notify`;
    const returnUrl = `${baseUrl}/pricing?success=true`;
    const cancelUrl = `${baseUrl}/pricing?canceled=true`;
    const paymentId = `${selectedPlan.m_payment_id}-${Date.now()}`;

    const signature = generatePayfastSignature({
      merchant_id: merchantId,
      merchant_key: merchantKey,
      amount: selectedPlan.amount,
      item_name: selectedPlan.item_name,
      m_payment_id: paymentId,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,
      passphrase,
    });

    const url = new URL(PAYFAST_URL);
    url.searchParams.set("merchant_id", merchantId);
    url.searchParams.set("merchant_key", merchantKey);
    url.searchParams.set("amount", selectedPlan.amount);
    url.searchParams.set("item_name", selectedPlan.item_name);
    url.searchParams.set("item_description", selectedPlan.description);
    url.searchParams.set("m_payment_id", paymentId);
    url.searchParams.set("return_url", returnUrl);
    url.searchParams.set("cancel_url", cancelUrl);
    url.searchParams.set("notify_url", notifyUrl);
    url.searchParams.set("email_confirmation", "1");
    url.searchParams.set("custom_str1", plan);
    if (userEmail) {
      url.searchParams.set("email_address", userEmail);
      url.searchParams.set("custom_str2", userEmail);
    }
    url.searchParams.set("signature", signature);

    return NextResponse.json({ url: url.toString() });
  } catch (error) {
    console.error("Payfast checkout error:", error);

    return NextResponse.json(
      { error: "Could not create Payfast checkout session." },
      { status: 500 }
    );
  }
}
