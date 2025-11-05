// account.js
//const fs = require('fs');
//const path = require('path');
//this isn't that type of Javascript
//const DB_PATH = path.join(__dirname, 'database.json');

class Account {
  static Db = null;

  static Init(Database) {
    Account.Db = Database;
    if (!Account.Db.CustomerAccounts) Account.Db.CustomerAccounts = [];
    if (!Account.Db.AdminAccounts) Account.Db.AdminAccounts = [];
  }

  static GetDatabase() {
    if (!Account.Db) {
      throw new Error('Database not initialized.');
    }
    return Account.Db;
  }

  constructor(Username, Email, Password, Admin = false) {
    this.AccountID = Account.GenerateID();
    this.Username = Username;
    this.Email = Email;
    this.Password = Password;
    this.Admin = Admin;
  }

  static GenerateID() {
    return 'ACC-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  }

  static Login(Username, Password) {
    const Db = Account.GetDatabase();

    // Customer checks
    const Customer = Db.CustomerAccounts.find(Acc => Acc.Username === Username && Acc.Password === Password);
    if (Customer) {
      return { success: true, user: { type: 'Customer', ...Customer } };
    }

    // Admin checks
    const AdminAcc = Db.AdminAccounts.find(Acc => Acc.Username === Username && Acc.Password === Password);
    if (AdminAcc) {
      return { success: true, user: { type: 'Admin', ...AdminAcc } };
    }

    return { success: false, message: 'Invalid username or password.' };
  }

  // Customer Creation
  static CreateCustomer(Username, Email, Password, DeliveryAddress, PaymentMethod) {
    const Db = Account.GetDatabase();

    // Username/Mail checker
    const ExistingCustomer = Db.CustomerAccounts.find(Acc => Acc.Username === Username || Acc.Email === Email);
    const ExistingAdmin = Db.AdminAccounts.find(Acc => Acc.Username === Username);
    if (ExistingCustomer || ExistingAdmin) {
      return { success: false, message: 'Username or email already exists.' };
    }

    const NewCustomer = new Customer(Username, Email, Password, DeliveryAddress, PaymentMethod);
    NewCustomer.Save();
    return { success: true };
  }

  // riddle answer
  static CreateAdmin(Username, Password, SecretCode) {
    if (SecretCode !== 'river' && SecretCode !== 'Lebron') {
      return { success: false, message: '*INCORRECT LOUD BUZZER*.' };
    }

    const Db = Account.GetDatabase();

    // Username Checker
    const ExistingAdmin = Db.AdminAccounts.find(Acc => Acc.Username === Username);
    const ExistingCustomer = Db.CustomerAccounts.find(Acc => Acc.Username === Username);
    if (ExistingAdmin || ExistingCustomer) {
      return { success: false, message: 'Username already exists.' };
    }

    const NewAdmin = new Admin(Username, Password);
    NewAdmin.Save();
    return { success: true };
  }
}

// Customer Class
class Customer extends Account {
  constructor(Username, Email, Password, DeliveryAddress, PaymentMethod) {
    super(Username, Email, Password, false);
    this.DeliveryAddress = DeliveryAddress;
    this.PaymentMethod = PaymentMethod;
  }

  Save() {
    const Db = Account.GetDatabase();
    Db.CustomerAccounts.push({
      AccountID: this.AccountID,
      Username: this.Username,
      Email: this.Email,
      Password: this.Password,
      DeliveryAddress: this.DeliveryAddress,
      PaymentMethod: this.PaymentMethod
    });
    console.log(`Customer "${this.Username}" saved successfully.`);
  }

  static GetAll() {
    const Db = Account.GetDatabase();
    return Db.CustomerAccounts;
  }

  static GetByID(AccountID) {
    const Db = Account.GetDatabase();
    const Account = Db.CustomerAccounts.find(Acc => Acc.AccountID === AccountID);
    if (!Account) {
      console.log(`No customer found with AccountID: ${AccountID}`);
      return null;
    }
    return Account;
  }
}

// ============================
// Admin Class
// ============================
class Admin extends Account {
  constructor(Username, Password) {
    super(Username, null, Password, true);
  }

  Save() {
    const Db = Account.GetDatabase();
    Db.AdminAccounts.push({
      AccountID: this.AccountID,
      Username: this.Username,
      Password: this.Password
    });
    console.log(`Admin "${this.Username}" saved successfully.`);
  }

  static GetAll() {
    const Db = Account.GetDatabase();
    return Db.AdminAccounts;
  }

  static GetByID(AccountID) {
    const Db = Account.GetDatabase();
    const Account = Db.AdminAccounts.find(Acc => Acc.AccountID === AccountID);
    if (!Account) {
      console.log(`No admin found with AccountID: ${AccountID}`);
      return null;
    }
    return Account;
  }
}

//tester is good but can't be kept due to not being used.
//"I'm sorry young one"
// Add new Customer
//const customer1 = new Customer(
// 'Customer3',
//  'customer3@example.com',
//  'pass789',
//  '55 Queen St, Brisbane',s
//  'PayPal'
//);
//customer1.save();

//const admin1 = new Admin('Admin3', 'adminpass3');
//admin1.save();

//console.log('\nAll Customers:', Customer.getAll());
//console.log('\nAll Admins:', Admin.getAll());

//const sampleCustomerID = Customer.getAll()[0].AccountID;
//console.log(`\nLookup Customer by ID (${sampleCustomerID}):`, Customer.getByID(sampleCustomerID));
