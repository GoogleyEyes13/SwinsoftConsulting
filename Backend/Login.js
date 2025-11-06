document.addEventListener("DOMContentLoaded", () => {
    const LoginButton = document.querySelector('.btn.btn-primary[style="float: right;"]');
    const AuthModal = CreateAuthModal();
    document.body.appendChild(AuthModal);

    fetch("Backend/Database.json")
        .then((Res) => Res.json())
        .then((Data) => {
            Account.Init(Data);
        })
        .catch((Err) => console.error("Error loading JSON:", Err));

    // Local storage checks to bluff
    const LoggedInUser = localStorage.getItem('LoggedInUser');
    if (LoggedInUser) {
        UpdateButtonToLogout(LoginButton);
    } else {
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

//the fun begins
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

//the horror begins
function ShowAuthModal() {
  const ModalElement = document.getElementById('AuthModal');
  if (!ModalElement) {
    console.error('AuthModal not found in DOM');
    return;
  }
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

function HandleLoginSubmit(Event) {
    Event.preventDefault();
    const Username = document.getElementById('LoginUsername').value.trim();
    const Password = document.getElementById('LoginPassword').value.trim();

    const Result = Account.Login(Username, Password);
    if (Result.success) {
        localStorage.setItem('LoggedInUser', JSON.stringify(Result.user));
        UpdateButtonToLogout(document.querySelector('.btn.btn-primary[style="float: right;"]'));
        const ModalInstance = bootstrap.Modal.getInstance(document.getElementById('AuthModal'));
        if (ModalInstance) {
            ModalInstance.hide();
        }
    }
}

function HandleSignupSubmit(Event) {
  Event.preventDefault();

  const Username = document.getElementById('SignupUsername').value.trim();
  const Email = document.getElementById('SignupEmail').value.trim();
  const Password = document.getElementById('SignupPassword').value.trim();
  const DeliveryAddress = document.getElementById('DeliveryAddress').value.trim();
  const PaymentMethod = document.getElementById('PaymentMethod').value;

  if (!Username || !Email || !Password || !DeliveryAddress || !PaymentMethod) {
    return;
  }

  // Auto Login
  const Result = Account.CreateCustomer(Username, Email, Password, DeliveryAddress, PaymentMethod);

  if (Result.success) {
    const loginResult = Account.Login(Username, Password);
    if (loginResult.success) {
      localStorage.setItem('LoggedInUser', JSON.stringify(loginResult.user));

      //TEMPORARY SOLUTION
      //WILL CHANGE TO SOMETHING ELSE WHEN HOSTING SHENANIGANS IS SORTED
      const Db = Account.GetDatabase();
      const Json = JSON.stringify(Db, null, 4);
      const blob = new Blob([Json], { type: 'application/json' });
      const Url = URL.createObjectURL(blob);
      const A = document.createElement('a');
      A.href = Url;
      A.download = 'Database.json';
      document.body.appendChild(A);
      A.click();
      document.body.removeChild(A);
      URL.revokeObjectURL(Url);

      UpdateButtonToLogout(document.querySelector('.btn.btn-primary[style="float: right;"]'));

      const ModalInstance = bootstrap.Modal.getInstance(document.getElementById('AuthModal'));
      if (ModalInstance) {
        ModalInstance.hide();
      }


      document.getElementById('SignupForm').reset();
    }
    }
  }

function HandleLogout(Button) {
    localStorage.removeItem('LoggedInUser');
    UpdateButtonToLogin(Button);
}

function UpdateButtonToLogin(Button) {
    Button.textContent = 'LogIn';
}

function UpdateButtonToLogout(Button) {
    Button.textContent = 'LogOut';
}

