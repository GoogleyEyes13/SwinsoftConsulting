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
                                    <label for="SignupUsername" class="form-label">Username</label>
                                    <input type="text" class="form-control" id="SignupUsername" required>
                                </div>
                                <div class="mb-3">
                                    <label for="SignupEmail" class="form-label">Email</label>
                                    <input type="email" class="form-control" id="SignupEmail" required>
                                </div>
                                <div class="mb-3">
                                    <label for="SignupPassword" class="form-label">Password</label>
                                    <input type="password" class="form-control" id="SignupPassword" required>
                                </div>
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
    const Username = document.getElementById('SignupUsername').value.trim();
    const Email = document.getElementById('SignupEmail').value.trim();
    const Password = document.getElementById('SignupPassword').value.trim();
    const DeliveryAddress = document.getElementById('DeliveryAddress').value.trim();
    const PaymentMethod = document.getElementById('PaymentMethod').value;

    if (!Username || !Email || !Password || !DeliveryAddress || !PaymentMethod) {
        alert('Please fill in all fields.');
        return;
    }

    const Result = Account.CreateCustomer(Username, Email, Password, DeliveryAddress, PaymentMethod);
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
            alert(`Account created successfully! Welcome, ${loginResult.user.Username}!`);

            // AUTO REFRESH THE PAGE
            window.location.reload();
        }
    } else {
        alert('Failed to create account. Username or email may already exist.');
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
