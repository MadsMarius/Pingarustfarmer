from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__)

# CORS setup
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://127.0.0.1:5501'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

# Database setup
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Slett eksisterende database
def reset_database():
    try:
        if os.path.exists('instance/users.db'):
            os.remove('instance/users.db')
            print("Eksisterende database slettet")
    except Exception as e:
        print(f"Error deleting database: {e}")

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)

@app.route('/login', methods=['OPTIONS'])
def handle_login_options():
    return '', 204

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password, password):
            return jsonify({
                'message': 'Login successful',
                'token': 'dummy_token',
                'email': user.email,
                'is_admin': user.is_admin
            }), 200
        else:
            return jsonify({'error': 'Invalid email or password'}), 401

    except Exception as e:
        print('Login error:', str(e))
        return jsonify({'error': 'Server error during login'}), 500

def create_admin():
    try:
        admin = User.query.filter_by(email='admin@rustshop.com').first()
        if not admin:
            admin_password = 'admin123'
            hashed_password = generate_password_hash(admin_password)
            admin = User(
                email='admin@rustshop.com',
                password=hashed_password,
                is_admin=True
            )
            db.session.add(admin)
            db.session.commit()
            print('Admin user created successfully')
        else:
            print('Admin user already exists')
    except Exception as e:
        print('Error creating admin:', str(e))
        db.session.rollback()

if __name__ == '__main__':
    reset_database()  # Slett gammel database
    with app.app_context():
        db.create_all()    # Opprett ny database med riktig skjema
        create_admin()     # Opprett admin-bruker
    app.run(debug=True) 