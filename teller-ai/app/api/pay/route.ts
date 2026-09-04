import { NextResponse } from "next/server";
import crypto from "crypto";

function envBool(val?: string) {
  if (!val) return true; // default sandbox on for local
  const v = val.toLowerCase().trim();
  return ["1", "true", "yes", "on"].includes(v);
}

function payfastProcessUrl(sandbox: boolean) {
  return sandbox
    ? "https://sandbox.payfast.co.za/eng/process"
    : "https://www.payfast.co.za/eng/process";
}

function generatePayfastSignature(data: Record<string, any>, passphrase = "") {
  let pfOutput = "";

  Object.keys(data).forEach((key) => {
    const val = data[key];
    if (key !== "signature" && val !== "") {
      pfOutput += `${key}=${encodeURIComponent(String(val))}&`;
    }
  });

  const getString = pfOutput.slice(0, -1);

  const finalString = passphrase ? `${getString}&passphrase=${encodeURIComponent(passphrase)}` : getString;

  return crypto.createHash("md5").update(finalString).digest("hex");
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const plan = (url.searchParams.get("plan") || "").toLowerCase();

    const products: Record<string, { name: string; amount: number }> = {
      pro: { name: "Teller Pro", amount: 470.0 },
      business: { name: "Teller Business", amount: 160.0 },
    };

    if (!products[plan]) {
      return NextResponse.json({ error: "Invalid payment plan selected." }, { status: 400 });
    }

    const product = products[plan];

    const orderId = `${plan.toUpperCase()}-${Date.now()}`;

    const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || "10000100";
    const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || "46f0cd694581a";
    const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE || "";
    const PAYFAST_SANDBOX = envBool(process.env.PAYFAST_SANDBOX);
    const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || process.env.SITE_URL || "https://www.teller.co.za").replace(/\/+$/, "");

    const data: Record<string, any> = {
      merchant_id: PAYFAST_MERCHANT_ID,
      merchant_key: PAYFAST_MERCHANT_KEY,
      return_url: `${SITE_URL}/payment-success.php`,
      cancel_url: `${SITE_URL}/payment-cancelled.php`,
      notify_url: `${SITE_URL}/payfast-notify.php`,
      m_payment_id: orderId,
      amount: product.amount.toFixed(2),
      item_name: product.name,
      custom_str1: plan,
    };

    data.signature = generatePayfastSignature(data, PAYFAST_PASSPHRASE);

    const action = payfastProcessUrl(PAYFAST_SANDBOX);

    const inputs = Object.keys(data)
      .map((k) => `<input type="hidden" name="${escapeHtml(k)}" value="${escapeHtml(String(data[k]))}">`)
      .join("\n");

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Redirecting to PayFast</title>
  </head>
  <body>
    <h2>Redirecting to PayFast...</h2>
    <p>Please wait while we send you to the secure payment page.</p>
    <form id="payfastForm" action="${action}" method="post">
      ${inputs}
      <button type="submit">Continue to Payment</button>
    </form>
    <script>document.getElementById('payfastForm').submit();</script>
  </body>
</html>`;

    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  } catch (err) {
    console.error("Pay route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>\"']/g, function (c) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    } as Record<string,string>)[c];
  });
}
