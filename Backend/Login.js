document.addEventListener("DOMContentLoaded", () => {
    // Select login/logout button more reliably
    const LoginButton = Array.from(document.querySelectorAll(".btn.btn-primary"))
        .find(btn => btn.textContent.trim() === "LogIn" || btn.textContent.trim() === "LogOut");

    if (!LoginButton) {
        console.error("Login button not found!");
        return;
    }

    const AuthModal = CreateAuthModal();
    document.body.appendChild(AuthModal);

    fetch("http://localhost:5000/database")
        .then((Res) => Res.json())
        .then((Data) => {
            Account.Init(Data);
        })
        .catch((Err) => console.error("Error loading JSON:", Err));

    // Restore from localStorage if available
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
        window.loggedInUser = JSON.parse(storedUser);
        UpdateButtonToLogout(LoginButton);
    } else {
        window.loggedInUser = null;
        UpdateButtonToLogin(LoginButton);
    }

    LoginButton.addEventListener('click', () => {
        if (LoginButton.textContent === 'LogIn') {
            ShowAuthModal();
        } else {
            HandleLogout(LoginButton);
        }
    });
});

// Create Authentication Modal
function CreateAuthModal() {
    const Modal = document.createElement('div');
    Modal.className = 'modal fade';
    Modal.id = 'AuthModal';
    Modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Authentication</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <ul class="nav nav-tabs" id="AuthTabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="LoginTab" data-bs-toggle="tab" data-bs-target="#Login" type="button" role="tab" aria-controls="Login" aria-selected="true">Login</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="SignupTab" data-bs-toggle="tab" data-bs-target="#Signup" type="button" role="tab" aria-controls="Signup" aria-selected="false">Sign Up</button>
                        </li>
                    </ul>
                    <div class="tab-content" id="AuthTabContent">
                        <div class="tab-pane fade show active" id="Login" role="tabpanel" aria-labelledby="LoginTab">
                            <form id="LoginForm" class="mt-3">
                                <div class="mb-3">
                                    <label for="LoginUsername" class="form-label">Username</label>
                                    <input type="text" class="form-control" id="LoginUsername" required>
                                </div>
                                <div class="mb-3">
                                    <label for="LoginPassword" class="form-label">Password</label>
                                    <input type="password" class="form-control" id="LoginPassword" required>
                                </div>
                                <button type="submit" class="btn btn-primary">Login</button>
                            </form>
                        </div>
                        <div class="tab-pane fade" id="Signup" role="tabpanel" aria-labelledby="SignupTab">
                            <form id="SignupForm" class="mt-3">
                                <div class="mb-3">
                                    <label for="AccountType" class="form-label">Account Type</label>
                                    <select class="form-control" id="AccountType" name="AccountType" required>
                                        <option value="customer">Customer</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="SignupUsername" class="form-label">Username</label>
                                    <input type="text" class="form-control" id="SignupUsername" required>
                                </div>
                                <div class="mb-3" id="EmailField">
                                    <label for="SignupEmail" class="form-label">Email</label>
                                    <input type="email" class="form-control" id="SignupEmail" required>
                                </div>
                                <div class="mb-3">
                                    <label for="SignupPassword" class="form-label">Password</label>
                                    <input type="password" class="form-control" id="SignupPassword" required>
                                </div>
                                <div class="mb-3" id="SecretCodeField" style="display: none;">
                                    <label for="SecretCode" class="form-label">Secret Code</label>
                                    <input type="password" class="form-control" id="SecretCode" placeholder="Enter admin secret code">
                                    <small class="form-text text-muted">Required for admin account creation</small>
                                </div>
                                <div id="CustomerFields">
                                    <div class="mb-3">
                                        <label for="DeliveryAddress" class="form-label">Delivery Address</label>
                                        <input type="text" class="form-control" id="DeliveryAddress" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="PaymentMethod" class="form-label">Payment Method</label>
                                        <select class="form-control" id="PaymentMethod" required>
                                            <option value="">Select...</option>
                                            <option value="Credit Card">Credit Card</option>
                                            <option value="PayPal">PayPal</option>
                                            <option value="Bank Transfer">Bank Transfer</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" class="btn btn-primary">Sign Up</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    return Modal;
}

// Show Authentication Modal
function ShowAuthModal() {
    const ModalElement = document.getElementById('AuthModal');
    if (!ModalElement) return console.error('AuthModal not found in DOM');
    const Modal = new bootstrap.Modal(ModalElement);
    Modal.show();

    const LoginForm = document.getElementById('LoginForm');
    const SignupForm = document.getElementById('SignupForm');

    if (LoginForm) {
        const NewLoginForm = LoginForm.cloneNode(true);
        LoginForm.parentNode.replaceChild(NewLoginForm, LoginForm);
        NewLoginForm.addEventListener('submit', HandleLoginSubmit);
    }

    if (SignupForm) {
        const NewSignupForm = SignupForm.cloneNode(true);
        SignupForm.parentNode.replaceChild(NewSignupForm, SignupForm);
        NewSignupForm.addEventListener('submit', HandleSignupSubmit);
        
        // Add event listener for account type dropdown
        const AccountTypeSelect = document.getElementById('AccountType');
        const SecretCodeField = document.getElementById('SecretCodeField');
        const CustomerFields = document.getElementById('CustomerFields');
        const EmailField = document.getElementById('EmailField');
        const DeliveryAddress = document.getElementById('DeliveryAddress');
        const PaymentMethod = document.getElementById('PaymentMethod');
        const SecretCode = document.getElementById('SecretCode');
        const SignupEmail = document.getElementById('SignupEmail');
        
        AccountTypeSelect.addEventListener('change', () => {
            if (AccountTypeSelect.value === 'customer') {
                SecretCodeField.style.display = 'none';
                CustomerFields.style.display = 'block';
                EmailField.style.display = 'block';
                SecretCode.required = false;
                SignupEmail.required = true;
                DeliveryAddress.required = true;
                PaymentMethod.required = true;
            } else if (AccountTypeSelect.value === 'admin') {
                SecretCodeField.style.display = 'block';
                CustomerFields.style.display = 'none';
                EmailField.style.display = 'none';
                SecretCode.required = true;
                SignupEmail.required = false;
                DeliveryAddress.required = false;
                PaymentMethod.required = false;
            }
        });
    }
}

// Handle Login Form Submission
function HandleLoginSubmit(Event) {
    Event.preventDefault();
    const Username = document.getElementById('LoginUsername').value.trim();
    const Password = document.getElementById('LoginPassword').value.trim();

    const Result = Account.Login(Username, Password);
    if (Result.success) {
        // Save user data to localStorage
        localStorage.setItem('loggedInUser', JSON.stringify(Result.user));
        window.loggedInUser = Result.user;
        
        // Update button
        const LoginButton = Array.from(document.querySelectorAll(".btn.btn-primary"))
            .find(btn => btn.textContent.trim() === "LogIn" || btn.textContent.trim() === "LogOut");
        if (LoginButton) {
            UpdateButtonToLogout(LoginButton);
        }
        
        // Close modal
        const ModalInstance = bootstrap.Modal.getInstance(document.getElementById('AuthModal'));
        if (ModalInstance) ModalInstance.hide();


        // AUTO REFRESH THE PAGE
        window.location.reload();
    } else {
        alert('Invalid username or password.');
    }
}

// Handle Signup Form Submission
function HandleSignupSubmit(Event) {
    Event.preventDefault();
    
    const AccountType = document.getElementById('AccountType').value;
    const Username = document.getElementById('SignupUsername').value.trim();
    const Password = document.getElementById('SignupPassword').value.trim();
    
    if (!Username || !Password) {
        alert('Please fill in username and password.');
        return;
    }
    
    let Result;
    
    if (AccountType === 'admin') {
        const SecretCode = document.getElementById('SecretCode').value.trim();
        
        if (!SecretCode) {
            alert('Please enter the admin secret code.');
            return;
        }
        
        // Create admin account - Account.CreateAdmin handles secret code validation
        Result = Account.CreateAdmin(Username, Password, SecretCode);
        
        if (!Result.success) {
            alert(Result.message || 'Invalid secret code. Admin account creation denied.');
            return;
        }
        
    } else {
        // Create customer account
        const Email = document.getElementById('SignupEmail').value.trim();
        const DeliveryAddress = document.getElementById('DeliveryAddress').value.trim();
        const PaymentMethod = document.getElementById('PaymentMethod').value;
        
        if (!Email || !DeliveryAddress || !PaymentMethod) {
            alert('Please fill in all customer fields.');
            return;
        }
        
        Result = Account.CreateCustomer(Username, Email, Password, DeliveryAddress, PaymentMethod);
        
        if (!Result.success) {
            alert(Result.message || 'Failed to create account. Username or email may already exist.');
            return;
        }
    }
    
    if (Result.success) {
        // Automatically log in after successful signup
        const loginResult = Account.Login(Username, Password);
        if (loginResult.success) {
            // Save user data to localStorage
            localStorage.setItem('loggedInUser', JSON.stringify(loginResult.user));
            window.loggedInUser = loginResult.user;

            // Close modal
            const ModalInstance = bootstrap.Modal.getInstance(document.getElementById('AuthModal'));
            if (ModalInstance) ModalInstance.hide();

            // Reset form
            document.getElementById('SignupForm').reset();

            // Show success message
            const accountTypeMsg = AccountType === 'admin' ? 'Admin' : 'Customer';
            alert(`${accountTypeMsg} account created successfully! Welcome, ${loginResult.user.Username}!`);

            // AUTO REFRESH THE PAGE
            window.location.reload();
        }
    }
}

// Handle Logout
function HandleLogout(Button) {
    // Clear user data
    localStorage.removeItem('loggedInUser');
    window.loggedInUser = null;
    
    // Update button
    UpdateButtonToLogin(Button);
    

    // AUTO REFRESH THE PAGE
    window.location.reload();
}

// Update Button to Login State
function UpdateButtonToLogin(Button) {
    if (Button) {
        Button.textContent = 'LogIn';
        Button.classList.remove('btn-primary');
        Button.classList.add('btn-primary');
    }
}

// Update Button to Logout State
function UpdateButtonToLogout(Button) {
    if (Button) {
        Button.textContent = 'LogOut';
        Button.classList.remove('btn-primary');
        Button.classList.add('btn-primary');
    }
}