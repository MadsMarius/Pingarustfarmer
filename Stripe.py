import stripe

stripe.api_key = 'sk_test_51LsSPIAYTPX8HVRc1idYdjXl6KSLubwfMX9SeQOx4Yja4Jmsua0P3Ex0PWBPGfTUgA1oREThNUMWVRp7sISszNFn00kWfPMWr5'

session = stripe.checkout.Session.create(
    payment_method_types=['card'],
    line_items=[{
        'price_data': {
            'currency': 'usd',
            'product_data': {
                'name': 'T-shirt',
            },
            'unit_amount': 2000,
        },
        'quantity': 1,
    }],
    mode='payment',
    success_url='https://example.com/success',
    cancel_url='https://example.com/cancel',
)

print(session.id)
