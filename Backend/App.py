from flask import Flask, jsonify, request
import json
import os

app = Flask(__name__)
from flask_cors import CORS
CORS(app)

# Path to the Database.json file (adjust if needed based on your directory structure)
DB_FILE = 'Database.json'

# Ensure the Backend directory exists
if not os.path.exists('Backend'):
    os.makedirs('Backend')

# Load the database from file
def load_db():
    if os.path.exists(DB_FILE):
        with open(DB_FILE, 'r') as f:
            db = json.load(f)
            # Initialize ShoppingCarts if missing
            if "ShoppingCarts" not in db:
                db["ShoppingCarts"] = {}
            return db
    else:
        # Initialize with default structure if file doesn't exist
        return {
            "Product": [],
            "CustomerAccounts": [],
            "AdminAccounts": [],
            "ShoppingCarts": {}
        }

# Save the database to file
def save_db(data):
    with open(DB_FILE, 'w') as f:
        json.dump(data, f, indent=4)

@app.route('/database', methods=['GET'])
def get_database():
    db = load_db()
    return jsonify(db)

@app.route('/update', methods=['POST'])
def update_database():
    data = request.json
    if not data:
        return jsonify({"success": false, "message": "No data provided"}), 400

    # Validate basic structure (optional, but helps prevent corruption)
    if "Product" not in data or "CustomerAccounts" not in data or "AdminAccounts" not in data:
        return jsonify({"success": false, "message": "Invalid database structure"}), 400

    # Allow ShoppingCarts to be present or absent
    if "ShoppingCarts" not in data:
        data["ShoppingCarts"] = {}

    save_db(data)
    return jsonify({"success": true})

@app.route('/cart/<account_id>', methods=['GET'])
def get_cart(account_id):
    db = load_db()
    cart = db.get("ShoppingCarts", {}).get(account_id, [])
    return jsonify(cart)

@app.route('/cart/<account_id>', methods=['POST'])
def update_cart(account_id):
    data = request.json
    if not data or "cart" not in data:
        return jsonify({"success": false, "message": "No cart data provided"}), 400

    db = load_db()
    if "ShoppingCarts" not in db:
        db["ShoppingCarts"] = {}
    db["ShoppingCarts"][account_id] = data["cart"]
    save_db(db)
    return jsonify({"success": true})

if __name__ == '__main__':
    app.run(debug=True, port=5000)  # Runs on http://localhost:5000
