<?php
require_once 'payfast-config.php';

$pfData = $_POST;

if (empty($pfData)) {
    http_response_code(400);
    exit('No PayFast data received.');
}

$receivedSignature = $pfData['signature'] ?? '';

unset($pfData['signature']);

$calculatedSignature = generate_payfast_signature($pfData, PAYFAST_PASSPHRASE);

if ($receivedSignature !== $calculatedSignature) {
    http_response_code(400);
    exit('Invalid signature.');
}

// Build PayFast validation string
$pfParamString = '';

foreach ($_POST as $key => $val) {
    if ($key !== 'signature') {
        $pfParamString .= $key . '=' . urlencode(stripslashes($val)) . '&';
    }
}

$pfParamString = substr($pfParamString, 0, -1);

// Validate with PayFast
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, payfast_validate_url());
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, false);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $pfParamString);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$response = curl_exec($ch);
$curlError = curl_error($ch);

curl_close($ch);

if ($curlError) {
    http_response_code(500);
    exit('PayFast validation error: ' . $curlError);
}

if (trim($response) !== 'VALID') {
    http_response_code(400);
    exit('PayFast payment validation failed.');
}

// Payment details
$paymentStatus = $_POST['payment_status'] ?? '';
$orderId = $_POST['m_payment_id'] ?? '';
$amountGross = $_POST['amount_gross'] ?? '';
$payfastPaymentId = $_POST['pf_payment_id'] ?? '';
$plan = $_POST['custom_str1'] ?? '';

// Server-side price check
$validPlans = [
    'pro' => 470.00,
    'business' => 160.00
];

if (!isset($validPlans[$plan])) {
    http_response_code(400);
    exit('Invalid plan.');
}

$expectedAmount = number_format($validPlans[$plan], 2, '.', '');
$paidAmount = number_format((float)$amountGross, 2, '.', '');

if ($expectedAmount !== $paidAmount) {
    http_response_code(400);
    exit('Incorrect payment amount.');
}

if ($paymentStatus === 'COMPLETE') {
    /*
        Payment confirmed.

        TODO:
        Connect this part to your database/user system:
        1. Find the user/order.
        2. Activate Pro or Business.
        3. Save PayFast transaction ID.
        4. Send confirmation email.
    */

    $logMessage = date('Y-m-d H:i:s') .
        " | PAID | Order: {$orderId} | Plan: {$plan} | Amount: {$paidAmount} | PayFast ID: {$payfastPaymentId}" .
        PHP_EOL;

    file_put_contents('payfast-payments.log', $logMessage, FILE_APPEND);
}

http_response_code(200);
echo 'OK';
