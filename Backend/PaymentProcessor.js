// PaymentProcessor.js - Handles payment collection before order download
let currentPaymentData = null;

function GetUserData() {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
        return JSON.parse(storedUser);
    }
    if (window.loggedInUser) {
        return window.loggedInUser;
    }
    return null;
}

function CreatePaymentModal() {
    const Modal = document.createElement('div');
    Modal.id = 'PaymentModal';
    Modal.className = 'modal fade';
    Modal.setAttribute('tabindex', '-1');
    Modal.setAttribute('aria-labelledby', 'paymentModalLabel');
    Modal.setAttribute('aria-hidden', 'true');
    
    Modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="paymentModalLabel">Complete Payment</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div id="payment-summary" class="mb-3">
                        <!-- Cart summary will be inserted here -->
                    </div>
                    
                    <div id="payment-method-display" class="alert alert-info mb-3">
                        <!-- Payment method will be shown here -->
                    </div>
                    
                    <form id="payment-form">
                        <div id="payment-fields">
                            <!-- Dynamic payment fields will be inserted here -->
                        </div>
                    </form>
                    
                    <div id="payment-error" class="alert alert-danger mt-3" style="display: none;"></div>
                    <div id="payment-success" class="alert alert-success mt-3" style="display: none;"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" id="process-payment-btn" class="btn btn-primary">Process Payment</button>
                </div>
            </div>
        </div>
    `;
    
    return Modal;
}

function GetCartTotal() {
    const Cart = JSON.parse(localStorage.getItem("ShoppingCart")) || [];
    return Cart.reduce((total, item) => total + (item.Price * item.Quantity), 0);
}

function GetCartItemCount() {
    const Cart = JSON.parse(localStorage.getItem("ShoppingCart")) || [];
    return Cart.reduce((count, item) => count + item.Quantity, 0);
}

function RenderPaymentFields(paymentMethod) {
    const PaymentFieldsContainer = document.getElementById('payment-fields');
    
    if (!paymentMethod) {
        PaymentFieldsContainer.innerHTML = `
            <div class="alert alert-warning">
                <strong>No payment method selected!</strong><br>
                Please update your account settings to add a payment method.
            </div>
        `;
        return;
    }
    
    let fieldsHTML = '';
    const method = paymentMethod.toLowerCase();
    
    if (method.includes('credit') || method.includes('debit') || method === 'card') {
        fieldsHTML = `
            <div class="mb-3">
                <label for="card-number" class="form-label">Card Number</label>
                <input type="text" class="form-control" id="card-number" 
                       placeholder="1234 5678 9012 3456" maxlength="19" required>
            </div>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="card-expiry" class="form-label">Expiry Date</label>
                    <input type="text" class="form-control" id="card-expiry" 
                           placeholder="MM/YY" maxlength="5" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label for="card-cvv" class="form-label">CVV</label>
                    <input type="text" class="form-control" id="card-cvv" 
                           placeholder="123" maxlength="4" required>
                </div>
            </div>
            <div class="mb-3">
                <label for="card-name" class="form-label">Cardholder Name</label>
                <input type="text" class="form-control" id="card-name" 
                       placeholder="JOHN SMITH" required>
            </div>
        `;
    } else if (method.includes('paypal')) {
        fieldsHTML = `
            <div class="mb-3">
                <label for="paypal-email" class="form-label">PayPal Email</label>
                <input type="email" class="form-control" id="paypal-email" 
                       placeholder="your-email@example.com" required>
            </div>
            <div class="mb-3">
                <label for="paypal-password" class="form-label">PayPal Password</label>
                <input type="password" class="form-control" id="paypal-password" 
                       placeholder="Enter PayPal password" required>
            </div>
        `;
    } else if (method.includes('bank') || method.includes('transfer')) {
        fieldsHTML = `
            <div class="mb-3">
                <label for="bank-name" class="form-label">Bank Name</label>
                <input type="text" class="form-control" id="bank-name" 
                       placeholder="e.g., Commonwealth Bank" required>
            </div>
            <div class="mb-3">
                <label for="account-number" class="form-label">Account Number</label>
                <input type="text" class="form-control" id="account-number" 
                       placeholder="123456789" required>
            </div>
            <div class="mb-3">
                <label for="bsb-number" class="form-label">BSB Number</label>
                <input type="text" class="form-control" id="bsb-number" 
                       placeholder="123-456" maxlength="7" required>
            </div>
            <div class="mb-3">
                <label for="account-name" class="form-label">Account Name</label>
                <input type="text" class="form-control" id="account-name" 
                       placeholder="John Smith" required>
            </div>
        `;
    } else {
        fieldsHTML = `
            <div class="alert alert-warning">
                <strong>Unsupported payment method: ${paymentMethod}</strong><br>
                Please use one of the following methods:
                <ul class="mb-0 mt-2">
                    <li>Credit Card</li>
                    <li>PayPal</li>
                    <li>Bank Transfer</li>
                </ul>
                Update your payment method in account settings.
            </div>
        `;
    }
    
    PaymentFieldsContainer.innerHTML = fieldsHTML;
    

    AddInputFormatting();
}

function AddInputFormatting() {

    const CardNumberInput = document.getElementById('card-number');
    if (CardNumberInput) {
        CardNumberInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '');
            value = value.replace(/\D/g, '');
            value = value.replace(/(\d{4})/g, '$1 ').trim();
            e.target.value = value;
        });
    }
    

    const ExpiryInput = document.getElementById('card-expiry');
    if (ExpiryInput) {
        ExpiryInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });
    }
    
    const CVVInput = document.getElementById('card-cvv');
    if (CVVInput) {
        CVVInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
    

    const BSBInput = document.getElementById('bsb-number');
    if (BSBInput) {
        BSBInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 3) {
                value = value.slice(0, 3) + '-' + value.slice(3, 6);
            }
            e.target.value = value;
        });
    }
}

function ShowPaymentModal() {
    const UserData = GetUserData();
    const Cart = JSON.parse(localStorage.getItem("ShoppingCart")) || [];
    
    if (Cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    
    if (!UserData || UserData.type !== 'Customer') {
        alert("Please log in as a customer to checkout.");
        return;
    }
    
    const PaymentMethod = UserData.PaymentMethod;
    const Total = GetCartTotal();
    const ItemCount = GetCartItemCount();
    
    // Update payment summary
    const SummaryDiv = document.getElementById('payment-summary');
    SummaryDiv.innerHTML = `
        <h6>Order Summary</h6>
        <p><strong>Total Items:</strong> ${ItemCount}</p>
        <p><strong>Total Amount:</strong> $${Total.toFixed(2)}</p>
    `;
    
    // Update payment method display
    const MethodDiv = document.getElementById('payment-method-display');
    MethodDiv.innerHTML = `
        <strong>Payment Method:</strong> ${PaymentMethod || 'Not set'}
    `;
    
    // Render appropriate payment fields
    RenderPaymentFields(PaymentMethod);
    
    // Show modal
    const ModalElement = document.getElementById('PaymentModal');
    const Modal = new bootstrap.Modal(ModalElement);
    Modal.show();
}

function CollectPaymentData() {
    const UserData = GetUserData();
    const PaymentMethod = UserData?.PaymentMethod?.toLowerCase() || '';
    
    let paymentData = {
        method: UserData?.PaymentMethod || 'Unknown',
        timestamp: new Date().toISOString(),
        amount: GetCartTotal()
    };
    
    if (PaymentMethod.includes('credit') || PaymentMethod.includes('debit') || PaymentMethod === 'card') {
        paymentData.cardNumber = document.getElementById('card-number')?.value || '';
        paymentData.cardExpiry = document.getElementById('card-expiry')?.value || '';
        paymentData.cardCVV = document.getElementById('card-cvv')?.value || '';
        paymentData.cardholderName = document.getElementById('card-name')?.value || '';
    } else if (PaymentMethod.includes('paypal')) {
        paymentData.paypalEmail = document.getElementById('paypal-email')?.value || '';
        paymentData.paypalPassword = '********'; // Don't store actual password
    } else if (PaymentMethod.includes('bank') || PaymentMethod.includes('transfer')) {
        paymentData.bankName = document.getElementById('bank-name')?.value || '';
        paymentData.accountNumber = document.getElementById('account-number')?.value || '';
        paymentData.bsbNumber = document.getElementById('bsb-number')?.value || '';
        paymentData.accountName = document.getElementById('account-name')?.value || '';
    }
    
    return paymentData;
}

function ValidatePaymentData() {
    const Form = document.getElementById('payment-form');
    const Inputs = Form.querySelectorAll('input[required]');
    
    for (let input of Inputs) {
        if (!input.value.trim()) {
            ShowPaymentError(`Please fill in: ${input.previousElementSibling.textContent}`);
            input.focus();
            return false;
        }
    }
    
    // Additional validation for card numbers
    const CardNumber = document.getElementById('card-number');
    if (CardNumber) {
        const cleaned = CardNumber.value.replace(/\s/g, '');
        if (cleaned.length < 13 || cleaned.length > 19) {
            ShowPaymentError('Invalid card number length');
            return false;
        }
    }
    
    // Expiry date validation
    const Expiry = document.getElementById('card-expiry');
    if (Expiry) {
        const [month, year] = Expiry.value.split('/');
        if (!month || !year || parseInt(month) > 12 || parseInt(month) < 1) {
            ShowPaymentError('Invalid expiry date');
            return false;
        }
    }
    
    // Email validation for PayPal
    const PayPalEmail = document.getElementById('paypal-email');
    if (PayPalEmail) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(PayPalEmail.value)) {
            ShowPaymentError('Invalid email address');
            return false;
        }
    }
    
    return true;
}

function ShowPaymentError(message) {
    const ErrorDiv = document.getElementById('payment-error');
    ErrorDiv.textContent = message;
    ErrorDiv.style.display = 'block';
    
    setTimeout(() => {
        ErrorDiv.style.display = 'none';
    }, 5000);
}

function ShowPaymentSuccess() {
    const SuccessDiv = document.getElementById('payment-success');
    SuccessDiv.textContent = 'Payment processed successfully! Generating order...';
    SuccessDiv.style.display = 'block';
}

function ProcessPayment() {
    // Clear previous messages
    document.getElementById('payment-error').style.display = 'none';
    document.getElementById('payment-success').style.display = 'none';
    
    // Validate payment data
    if (!ValidatePaymentData()) {
        return;
    }
    
    // Collect payment data
    currentPaymentData = CollectPaymentData();
    
    // Show processing message
    const ProcessBtn = document.getElementById('process-payment-btn');
    const OriginalText = ProcessBtn.textContent;
    ProcessBtn.disabled = true;
    ProcessBtn.textContent = 'Processing...';
    
    // Simulate payment processing
    setTimeout(() => {
        // Payment successful
        ShowPaymentSuccess();
        
        // Wait a moment, then download order and close modal
        setTimeout(() => {
            // Download order (from OrderManager.js)
            if (typeof DownloadOrderFile === 'function') {
                DownloadOrderFile();
            }
            
            // Close modal
            const ModalElement = document.getElementById('PaymentModal');
            const Modal = bootstrap.Modal.getInstance(ModalElement);
            Modal.hide();
            
            // Reset button
            ProcessBtn.disabled = false;
            ProcessBtn.textContent = OriginalText;
            
            // Clear payment data
            currentPaymentData = null;
            
        }, 1500);
    }, 1500);
}

// Initialize payment processor
document.addEventListener("DOMContentLoaded", () => {
    // Create and append payment modal
    const PaymentModal = CreatePaymentModal();
    document.body.appendChild(PaymentModal);
    
    // Add event listener to process payment button
    document.getElementById('process-payment-btn').addEventListener('click', ProcessPayment);
    
    // Replace the download button functionality with payment modal
    setTimeout(() => {
        const DownloadBtn = document.getElementById('DownloadOrderBtn');
        if (DownloadBtn) {
            const NewDownloadBtn = DownloadBtn.cloneNode(true);
            DownloadBtn.parentNode.replaceChild(NewDownloadBtn, DownloadBtn);
            
            NewDownloadBtn.textContent = 'Checkout';
            NewDownloadBtn.addEventListener('click', ShowPaymentModal);
        }
    }, 600);
});

// Export function for external access
function GetLastPaymentData() {
    return currentPaymentData;
}
