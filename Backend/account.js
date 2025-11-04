// account.js
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.json');

class Account {
  constructor(username, email, password, admin = false) {
    this.AccountID = Account.generateID();
    this.Username = username;
    this.Email = email;
    this.Password = password;
    this.Admin = admin;
  }

  static generateID() {
    return 'ACC-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  }

  static readDatabase() {
    if (!fs.existsSync(DB_PATH)) {
      throw new Error(`❌ Database file not found at ${DB_PATH}`);
    }
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

    if (!data.CustomerAccounts) data.CustomerAccounts = [];
    if (!data.AdminAccounts) data.AdminAccounts = [];

    return data;
  }

  static writeDatabase(db) {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 4));
  }


  save() {
    throw new Error('save() must be implemented by subclass');
  }

  static getAll() {
    throw new Error('getAll() must be implemented by subclass');
  }

  static getByID(accountID) {
    throw new Error('getByID() must be implemented by subclass');
  }
}

// Customer Class
class Customer extends Account {
  constructor(username, email, password, deliveryAddress, paymentMethod) {
    super(username, email, password, false);
    this.DeliveryAddress = deliveryAddress;
    this.PaymentMethod = paymentMethod;
  }

  save() {
    const db = Account.readDatabase();

    db.CustomerAccounts.push({
      AccountID: this.AccountID,
      Username: this.Username,
      Email: this.Email,
      Password: this.Password,
      DeliveryAddress: this.DeliveryAddress,
      PaymentMethod: this.PaymentMethod
    });

    Account.writeDatabase(db);
    console.log(`Customer "${this.Username}" saved successfully.`);
  }

  static getAll() {
    const db = Account.readDatabase();
    return db.CustomerAccounts;
  }

  static getByID(accountID) {
    const db = Account.readDatabase();
    const account = db.CustomerAccounts.find(acc => acc.AccountID === accountID);
    if (!account) {
      console.log(`No customer found with AccountID: ${accountID}`);
      return null;
    }
    return account;
  }
}

// ============================
// Admin Class
// ============================
class Admin extends Account {
  constructor(username, password) {
    super(username, null, password, true);
  }

  save() {
    const db = Account.readDatabase();

    db.AdminAccounts.push({
      AccountID: this.AccountID,
      Username: this.Username,
      Password: this.Password
    });

    Account.writeDatabase(db);
    console.log(`Admin "${this.Username}" saved successfully.`);
  }

  static getAll() {
    const db = Account.readDatabase();
    return db.AdminAccounts;
  }

  static getByID(accountID) {
    const db = Account.readDatabase();
    const account = db.AdminAccounts.find(acc => acc.AccountID === accountID);
    if (!account) {
      console.log(`No admin found with AccountID: ${accountID}`);
      return null;
    }
    return account;
  }
}

// PAst here is test code
// Example Usage

// Add new Customer
const customer1 = new Customer(
  'Customer3',
  'customer3@example.com',
  'pass789',
  '55 Queen St, Brisbane',
  'PayPal'
);
customer1.save();

const admin1 = new Admin('Admin3', 'adminpass3');
admin1.save();

console.log('\nAll Customers:', Customer.getAll());
console.log('\nAll Admins:', Admin.getAll());

const sampleCustomerID = Customer.getAll()[0].AccountID;
console.log(`\nLookup Customer by ID (${sampleCustomerID}):`, Customer.getByID(sampleCustomerID));
