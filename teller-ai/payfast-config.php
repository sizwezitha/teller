<?php

// Read boolean-like environment variables safely.
function env_bool(string $name, bool $default = false): bool
{
    $val = getenv($name);
    if ($val === false) {
        return $default;
    }

    $val = strtolower(trim($val));
    if (in_array($val, ['1', 'true', 'yes', 'on'], true)) {
        return true;
    }

    if (in_array($val, ['0', 'false', 'no', 'off'], true)) {
        return false;
    }

    return $default;
}

// Use environment variables where available; fall back to safe defaults for local/dev.
define('PAYFAST_SANDBOX', env_bool('PAYFAST_SANDBOX', true));
define('PAYFAST_MERCHANT_ID', getenv('PAYFAST_MERCHANT_ID') ?: '10000100');
define('PAYFAST_MERCHANT_KEY', getenv('PAYFAST_MERCHANT_KEY') ?: '46f0cd694581a');
define('PAYFAST_PASSPHRASE', getenv('PAYFAST_PASSPHRASE') ?: '');
define('SITE_URL', rtrim(getenv('SITE_URL') ?: 'https://www.teller.co.za', '/'));

function payfast_process_url()
{
    return PAYFAST_SANDBOX
        ? 'https://sandbox.payfast.co.za/eng/process'
        : 'https://www.payfast.co.za/eng/process';
}

function payfast_validate_url()
{
    return PAYFAST_SANDBOX
        ? 'https://sandbox.payfast.co.za/eng/query/validate'
        : 'https://www.payfast.co.za/eng/query/validate';
}

function generate_payfast_signature($data, $passphrase = '')
{
    $pfOutput = '';

    foreach ($data as $key => $val) {
        if ($key !== 'signature' && $val !== '') {
            $pfOutput .= $key . '=' . urlencode(trim($val)) . '&';
        }
    }

    $getString = substr($pfOutput, 0, -1);

    if (!empty($passphrase)) {
        $getString .= '&passphrase=' . urlencode(trim($passphrase));
    }

    return md5($getString);
}
