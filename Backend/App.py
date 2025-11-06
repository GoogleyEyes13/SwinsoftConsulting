from flask import Flask, jsonify, request
import json
import os

app = Flask(__name__)
from flask_cors import CORS
CORS(app)

# Path to the Database.json file
DB_FILE = 'Database.json'

# Ensure the Backend directory exists
if not os.path.exists('Backend'):
    os.makedirs('Backend')

# Load the database from file
def load_db():
    if os.path.exists(DB_FILE):
        with open(DB_FILE, 'r') as f:
            db = json.load(f)
        # Initialize missing collections
        if "ShoppingCarts" not in db:
            db["ShoppingCarts"] = {}
        if "Orders" not in db:
            db["Orders"] = []
        return db
    else:
        # Initialize with default structure if file doesn't exist
        return {
            "Product": [],
            "CustomerAccounts": [],
            "AdminAccounts": [],
            "ShoppingCarts": {},
            "Orders": []
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
        return jsonify({"success": False, "message": "No data provided"}), 400
    
    # Validate basic structure (optional, but helps prevent corruption)
    if "Product" not in data or "CustomerAccounts" not in data or "AdminAccounts" not in data:
        return jsonify({"success": False, "message": "Invalid database structure"}), 400
    
    # Allow ShoppingCarts and Orders to be present or absent
    if "ShoppingCarts" not in data:
        data["ShoppingCarts"] = {}
    if "Orders" not in data:
        data["Orders"] = []
    
    save_db(data)
    return jsonify({"success": True})

@app.route('/orders', methods=['GET'])
def get_orders():
    """Get all orders"""
    db = load_db()
    return jsonify(db.get("Orders", []))

@app.route('/orders/<order_id>', methods=['GET'])
def get_order(order_id):
    """Get a specific order by ID"""
    db = load_db()
    orders = db.get("Orders", [])
    order = next((o for o in orders if o.get("OrderID") == order_id), None)
    
    if order:
        return jsonify(order)
    else:
        return jsonify({"success": False, "message": "Order not found"}), 404

@app.route('/orders', methods=['POST'])
def add_order():
    """Add a new order"""
    data = request.json
    if not data:
        return jsonify({"success": False, "message": "No order data provided"}), 400
    
    db = load_db()
    if "Orders" not in db:
        db["Orders"] = []
    
    db["Orders"].append(data)
    save_db(db)
    
    return jsonify({"success": True, "order": data})

@app.route('/cart/<account_id>', methods=['GET'])
def get_cart(account_id):
    db = load_db()
    cart = db.get("ShoppingCarts", {}).get(account_id, [])
    return jsonify(cart)

@app.route('/cart/<account_id>', methods=['POST'])
def update_cart(account_id):
    data = request.json
    if not data or "cart" not in data:
        return jsonify({"success": False, "message": "No cart data provided"}), 400
    
    db = load_db()
    if "ShoppingCarts" not in db:
        db["ShoppingCarts"] = {}
    
    db["ShoppingCarts"][account_id] = data["cart"]
    save_db(db)
    
    return jsonify({"success": True})

if __name__ == '__main__':
    app.run(debug=True, port=5000)  # Runs on http://localhost:5000
