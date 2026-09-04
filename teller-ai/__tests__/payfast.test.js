import crypto from "node:crypto";
import test from "node:test";
import assert from "node:assert/strict";

import { generatePayfastSignature } from "../lib/payfast.ts";

test("generatePayfastSignature builds the expected Payfast MD5 hash", () => {
  const passphrase = "testpassphrase";
  const signature = generatePayfastSignature({
    amount: "470.00",
    cancel_url: "https://example.com/pricing?canceled=true",
    item_name: "Teller AI Pro",
    merchant_id: "10000100",
    merchant_key: "46f0cd694581a",
    m_payment_id: "teller-pro-123",
    notify_url: "https://example.com/api/pay/notify",
    return_url: "https://example.com/pricing?success=true",
    passphrase,
  });

  const expected = crypto
    .createHash("md5")
    .update(
      "10000100|46f0cd694581a|470.00|Teller AI Pro|teller-pro-123|https://example.com/pricing?success=true|https://example.com/pricing?canceled=true|https://example.com/api/pay/notify|testpassphrase"
    )
    .digest("hex")
    .toUpperCase();

  assert.equal(signature, expected);
});
