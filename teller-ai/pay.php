<?php
require_once 'payfast-config.php';

// Define your paid products here.
// Never trust prices from the URL.
$products = [
    'pro' => [
        'name' => 'Teller Pro',
        'amount' => 470.00
    ],
    'business' => [
        'name' => 'Teller Business',
        'amount' => 160.00
    ]
];

$plan = $_GET['plan'] ?? '';

if (!isset($products[$plan])) {
    die('Invalid payment plan selected.');
}

$product = $products[$plan];

// Unique payment/order ID
$orderId = strtoupper($plan) . '-' . time();

$data = [
    'merchant_id' => PAYFAST_MERCHANT_ID,
    'merchant_key' => PAYFAST_MERCHANT_KEY,

    'return_url' => SITE_URL . '/payment-success.php',
    'cancel_url' => SITE_URL . '/payment-cancelled.php',
    'notify_url' => SITE_URL . '/payfast-notify.php',

    'm_payment_id' => $orderId,
    'amount' => number_format($product['amount'], 2, '.', ''),
    'item_name' => $product['name'],

    'custom_str1' => $plan
];

$data['signature'] = generate_payfast_signature($data, PAYFAST_PASSPHRASE);
?>

<!DOCTYPE html>
<html>
<head>
    <title>Redirecting to PayFast</title>
</head>
<body>

<h2>Redirecting to PayFast...</h2>
<p>Please wait while we send you to the secure payment page.</p>

<form id="payfastForm" action="<?php echo payfast_process_url(); ?>" method="post">
    <?php foreach ($data as $name => $value): ?>
        <input
            type="hidden"
            name="<?php echo htmlspecialchars($name); ?>"
            value="<?php echo htmlspecialchars($value); ?>"
        >
    <?php endforeach; ?>

    <button type="submit">Continue to Payment</button>
</form>

<script>
    document.getElementById('payfastForm').submit();
</script>

</body>
</html>
