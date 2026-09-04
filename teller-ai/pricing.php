<!DOCTYPE html>
<html>
<head>
    <title>Teller Pricing</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            padding: 40px;
        }

        .pricing-wrapper {
            display: flex;
            gap: 20px;
            max-width: 800px;
            margin: auto;
        }

        .plan {
            background: white;
            padding: 30px;
            border-radius: 10px;
            width: 50%;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            text-align: center;
        }

        .price {
            font-size: 32px;
            font-weight: bold;
            margin: 20px 0;
        }

        .button {
            display: inline-block;
            background: #00a884;
            color: white;
            padding: 14px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
        }

        .button:hover {
            background: #008f70;
        }

        @media (max-width: 700px) {
            .pricing-wrapper {
                flex-direction: column;
            }

            .plan {
                width: auto;
            }
        }
    </style>
</head>
<body>

<h1 style="text-align:center;">Choose Your Teller Plan</h1>

<div class="pricing-wrapper">

    <div class="plan">
        <h2>Pro</h2>
        <div class="price">R470</div>
        <p>Pro package for Teller.</p>
        <a class="button" href="pay.php?plan=pro">Pay for Pro</a>
    </div>

    <div class="plan">
        <h2>Business</h2>
        <div class="price">R160</div>
        <p>Business package for Teller.</p>
        <a class="button" href="pay.php?plan=business">Pay for Business</a>
    </div>

</div>

</body>
</html>