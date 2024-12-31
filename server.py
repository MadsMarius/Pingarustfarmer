from flask import Flask, jsonify, request
import stripe
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.DEBUG)  # Legg til logging

stripe.api_key = 'sk_test_51LsSPIAYTPX8HVRc1idYdjXl6KSLubwfMX9SeQOx4Yja4Jmsua0P3Ex0PWBPGfTUgA1oREThNUMWVRp7sISszNFn00kWfPMWr5'

@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        data = request.json
        app.logger.debug(f"Received data: {data}")  # Log mottatt data
        
        items = data.get('items', [])
        discount_amount = data.get('discountAmount', 0)

        app.logger.debug(f"Processing items: {items}")  # Log items

        line_items = [{
            'price_data': {
                'currency': item['currency'],
                'product_data': {
                    'name': item['name'],
                },
                'unit_amount': int(item['amount']),  # Sørg for at amount er integer
            },
            'quantity': item['quantity'],
        } for item in items]

        app.logger.debug(f"Created line items: {line_items}")  # Log line items

        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url='http://localhost:5000/success',
            cancel_url='http://localhost:5000/cancel'
        )

        return jsonify({'id': session.id})

    except Exception as e:
        app.logger.error(f"Error creating checkout session: {str(e)}")  # Log error
        return jsonify({'error': str(e)}), 500

@app.route('/success')
def success():
    return 'Payment successful!'

@app.route('/cancel')
def cancel():
    return 'Payment cancelled.'

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'POST')
    return response

if __name__ == '__main__':
    app.run(port=5000, debug=True)