// OrderManager.js - Generates and downloads order.txt from shopping cart with user account data
// Also saves order details to database.json
// Admins can view all orders from the database

function GetUserData() {
    // Try to get logged-in user from localStorage
    const storedUser = localStorage.getItem('loggedInUser');
    
    if (storedUser) {
        return JSON.parse(storedUser);
    }
    
    // Fallback: check window.loggedInUser
    if (window.loggedInUser) {
        return window.loggedInUser;
    }
    
    return null;
}

function GenerateOrderObject() {
    const Cart = JSON.parse(localStorage.getItem("ShoppingCart")) || [];
    const UserData = GetUserData();
    const Now = new Date();
    
    // Generate unique order ID
    const OrderID = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    // Calculate totals
    const Total = Cart.reduce((sum, item) => sum + (item.Price * item.Quantity), 0);
    const TotalItems = Cart.reduce((sum, item) => sum + item.Quantity, 0);
    
    // Build order object for database
    const OrderObject = {
        OrderID: OrderID,
        Timestamp: Now.toISOString(),
        Date: Now.toLocaleDateString('en-AU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        Time: Now.toLocaleTimeString('en-AU'),
        CustomerInfo: {
            AccountID: UserData?.AccountID || 'Guest',
            Username: UserData?.Username || 'Guest',
            Email: UserData?.Email || 'N/A',
            DeliveryAddress: UserData?.DeliveryAddress || 'Not provided',
            PaymentMethod: UserData?.PaymentMethod || 'Not provided'
        },
        Items: Cart.map(item => ({
            Name: item.Name,
            Price: item.Price,
            Quantity: item.Quantity,
            Subtotal: item.Price * item.Quantity
        })),
        TotalItems: TotalItems,
        TotalAmount: Total,
        Status: 'Completed'
    };
    
    return OrderObject;
}

function GenerateOrderText() {
    const Cart = JSON.parse(localStorage.getItem("ShoppingCart")) || [];
    
    if (Cart.length === 0) {
        alert("Your cart is empty. Add items before generating an order.");
        return null;
    }

    // Get current date and time
    const Now = new Date();
    const OrderDate = Now.toLocaleDateString('en-AU', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const OrderTime = Now.toLocaleTimeString('en-AU');
    
    // Generate unique order ID
    const OrderID = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    // Get user data
    const UserData = GetUserData();
    
    // Build the order text
    let OrderText = "";
    OrderText += "═══════════════════════════════════════════════════════\n";
    OrderText += "                    SWINSOFT ORDER RECEIPT              \n";
    OrderText += "═══════════════════════════════════════════════════════\n\n";
    
    OrderText += `Order ID: ${OrderID}\n`;
    OrderText += `Date: ${OrderDate}\n`;
    OrderText += `Time: ${OrderTime}\n\n`;
    
    // Add customer information section
    OrderText += "───────────────────────────────────────────────────────\n";
    OrderText += "CUSTOMER INFORMATION\n";
    OrderText += "───────────────────────────────────────────────────────\n\n";
    
    if (UserData && UserData.type === 'Customer') {
        OrderText += `Account ID: ${UserData.AccountID || 'N/A'}\n`;
        OrderText += `Username: ${UserData.Username || 'N/A'}\n`;
        OrderText += `Email: ${UserData.Email || 'N/A'}\n`;
        OrderText += `Delivery Address: ${UserData.DeliveryAddress || 'Not provided'}\n`;
        OrderText += `Payment Method: ${UserData.PaymentMethod || 'Not provided'}\n\n`;
    } else if (UserData && UserData.type === 'Admin') {
        OrderText += `Admin Account: ${UserData.Username || 'N/A'}\n`;
        OrderText += `Note: Admin accounts do not have delivery or payment information.\n\n`;
    } else {
        OrderText += "Guest Checkout (No account information available)\n";
        OrderText += "Please log in to save your delivery and payment details.\n\n";
    }
    
    OrderText += "───────────────────────────────────────────────────────\n";
    OrderText += "ORDER ITEMS\n";
    OrderText += "───────────────────────────────────────────────────────\n\n";
    
    let Total = 0;
    
    Cart.forEach((Item, Index) => {
        const Subtotal = Item.Price * Item.Quantity;
        Total += Subtotal;
        
        OrderText += `${Index + 1}. ${Item.Name}\n`;
        OrderText += `   Price: $${Item.Price.toFixed(2)}\n`;
        OrderText += `   Quantity: ${Item.Quantity}\n`;
        OrderText += `   Subtotal: $${Subtotal.toFixed(2)}\n\n`;
    });
    
    OrderText += "───────────────────────────────────────────────────────\n";
    OrderText += `TOTAL ITEMS: ${Cart.reduce((sum, item) => sum + item.Quantity, 0)}\n`;
    OrderText += `TOTAL AMOUNT: $${Total.toFixed(2)}\n`;
    OrderText += "───────────────────────────────────────────────────────\n\n";
    
    // Add shipping information if available
    if (UserData && UserData.type === 'Customer' && UserData.DeliveryAddress) {
        OrderText += "SHIPPING INFORMATION\n";
        OrderText += `Ship to: ${UserData.DeliveryAddress}\n`;
        OrderText += `Payment via: ${UserData.PaymentMethod || 'Not specified'}\n\n`;
    }
    
    OrderText += "Thank you for shopping with Swinsoft!\n";
    
    if (!UserData || UserData.type !== 'Customer') {
        OrderText += "\nTip: Create an account to save your delivery address and\n";
        OrderText += "payment information for faster checkout next time!\n";
    }
    
    OrderText += "═══════════════════════════════════════════════════════\n";
    
    return OrderText;
}

async function SaveOrderToDatabase() {
    const OrderObject = GenerateOrderObject();
    
    try {
        // Fetch current database
        const dbResponse = await fetch('http://localhost:5000/database');
        const database = await dbResponse.json();
        
        // Initialize Orders array if it doesn't exist
        if (!database.Orders) {
            database.Orders = [];
        }
        
        // Add new order to Orders array
        database.Orders.push(OrderObject);
        
        // Save updated database
        const updateResponse = await fetch('http://localhost:5000/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(database)
        });
        
        const result = await updateResponse.json();
        
        if (result.success) {
            console.log('Order saved to database successfully!', OrderObject);
            return true;
        } else {
            console.error('Failed to save order to database:', result.message);
            return false;
        }
    } catch (error) {
        console.error('Error saving order to database:', error);
        return false;
    }
}

function DownloadOrderFile() {
    const OrderText = GenerateOrderText();
    
    if (!OrderText) {
        return; // Cart was empty
    }
    
    // Save order to database first
    SaveOrderToDatabase().then(success => {
        if (success) {
            console.log('Order successfully saved to database');
        } else {
            console.warn('Order could not be saved to database, but download will continue');
        }
    });
    
    // Create a Blob from the text
    const Blob = new window.Blob([OrderText], { type: 'text/plain' });
    
    // Create a download link
    const Link = document.createElement('a');
    Link.href = URL.createObjectURL(Blob);
    
    // Generate filename with timestamp
    const Timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    Link.download = `order_${Timestamp}.txt`;
    
    // Trigger download
    document.body.appendChild(Link);
    Link.click();
    
    // Cleanup
    document.body.removeChild(Link);
    URL.revokeObjectURL(Link.href);
    
    console.log("Order file downloaded successfully!");
}

// ADMIN FUNCTIONALITY: View All Orders
function CreateOrdersViewModal() {
    const Modal = document.createElement('div');
    Modal.id = 'OrdersViewModal';
    Modal.className = 'modal fade';
    Modal.setAttribute('tabindex', '-1');
    Modal.setAttribute('aria-labelledby', 'ordersViewModalLabel');
    Modal.setAttribute('aria-hidden', 'true');
    
    Modal.innerHTML = `
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="ordersViewModalLabel">All Customer Orders</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div id="orders-filter" class="mb-3">
                        <input type="text" id="order-search" class="form-control" placeholder="Search by Order ID, Customer, or Email...">
                    </div>
                    <div id="orders-list">
                        <p class="text-center">Loading orders...</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    `;
    
    return Modal;
}

async function LoadAllOrders() {
    try {
        const response = await fetch('http://localhost:5000/database');
        const database = await response.json();
        
        const orders = database.Orders || [];
        
        if (orders.length === 0) {
            document.getElementById('orders-list').innerHTML = `
                <div class="alert alert-info text-center">
                    No orders found in the database.
                </div>
            `;
            return;
        }
        
        // Sort orders by timestamp (newest first)
        orders.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
        
        DisplayOrders(orders);
        
        // Add search functionality
        const searchInput = document.getElementById('order-search');
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase();
            const filteredOrders = orders.filter(order => 
                order.OrderID.toLowerCase().includes(query) ||
                order.CustomerInfo.Username.toLowerCase().includes(query) ||
                order.CustomerInfo.Email.toLowerCase().includes(query)
            );
            DisplayOrders(filteredOrders);
        });
        
    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('orders-list').innerHTML = `
            <div class="alert alert-danger text-center">
                Failed to load orders. Please try again.
            </div>
        `;
    }
}

function DisplayOrders(orders) {
    const ordersListDiv = document.getElementById('orders-list');
    
    if (orders.length === 0) {
        ordersListDiv.innerHTML = `
            <div class="alert alert-warning text-center">
                No orders match your search.
            </div>
        `;
        return;
    }
    
    let ordersHTML = '';
    
    orders.forEach(order => {
        const itemsList = order.Items.map(item => 
            `<li>${item.Name} - Qty: ${item.Quantity} - $${item.Subtotal.toFixed(2)}</li>`
        ).join('');
        
        ordersHTML += `
            <div class="card mb-3">
                <div class="card-header bg-primary text-white">
                    <div class="row">
                        <div class="col-md-6">
                            <strong>Order ID:</strong> ${order.OrderID}
                        </div>
                        <div class="col-md-6 text-end">
                            <strong>Date:</strong> ${order.Date}
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Customer Information</h6>
                            <p>
                                <strong>Name:</strong> ${order.CustomerInfo.Username}<br>
                                <strong>Email:</strong> ${order.CustomerInfo.Email}<br>
                                <strong>Account ID:</strong> ${order.CustomerInfo.AccountID}<br>
                                <strong>Delivery Address:</strong> ${order.CustomerInfo.DeliveryAddress}<br>
                                <strong>Payment Method:</strong> ${order.CustomerInfo.PaymentMethod}
                            </p>
                        </div>
                        <div class="col-md-6">
                            <h6>Order Details</h6>
                            <p>
                                <strong>Time:</strong> ${order.Time}<br>
                                <strong>Total Items:</strong> ${order.TotalItems}<br>
                                <strong>Total Amount:</strong> $${order.TotalAmount.toFixed(2)}<br>
                                <strong>Status:</strong> <span class="badge bg-success">${order.Status}</span>
                            </p>
                        </div>
                    </div>
                    <hr>
                    <h6>Items Ordered</h6>
                    <ul>
                        ${itemsList}
                    </ul>
                    <div class="text-end">
                        <button class="btn btn-sm btn-info download-order-btn" data-order-id="${order.OrderID}">
                            Download Order Receipt
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    ordersListDiv.innerHTML = ordersHTML;
    
    // Add download functionality for individual orders
    document.querySelectorAll('.download-order-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const orderID = e.target.getAttribute('data-order-id');
            const order = orders.find(o => o.OrderID === orderID);
            if (order) {
                DownloadIndividualOrder(order);
            }
        });
    });
}

function DownloadIndividualOrder(order) {
    let orderText = "";
    orderText += "═══════════════════════════════════════════════════════\n";
    orderText += "                    SWINSOFT ORDER RECEIPT              \n";
    orderText += "═══════════════════════════════════════════════════════\n\n";
    
    orderText += `Order ID: ${order.OrderID}\n`;
    orderText += `Date: ${order.Date}\n`;
    orderText += `Time: ${order.Time}\n\n`;
    
    orderText += "───────────────────────────────────────────────────────\n";
    orderText += "CUSTOMER INFORMATION\n";
    orderText += "───────────────────────────────────────────────────────\n\n";
    orderText += `Account ID: ${order.CustomerInfo.AccountID}\n`;
    orderText += `Username: ${order.CustomerInfo.Username}\n`;
    orderText += `Email: ${order.CustomerInfo.Email}\n`;
    orderText += `Delivery Address: ${order.CustomerInfo.DeliveryAddress}\n`;
    orderText += `Payment Method: ${order.CustomerInfo.PaymentMethod}\n\n`;
    
    orderText += "───────────────────────────────────────────────────────\n";
    orderText += "ORDER ITEMS\n";
    orderText += "───────────────────────────────────────────────────────\n\n";
    
    order.Items.forEach((item, index) => {
        orderText += `${index + 1}. ${item.Name}\n`;
        orderText += `   Price: $${item.Price.toFixed(2)}\n`;
        orderText += `   Quantity: ${item.Quantity}\n`;
        orderText += `   Subtotal: $${item.Subtotal.toFixed(2)}\n\n`;
    });
    
    orderText += "───────────────────────────────────────────────────────\n";
    orderText += `TOTAL ITEMS: ${order.TotalItems}\n`;
    orderText += `TOTAL AMOUNT: $${order.TotalAmount.toFixed(2)}\n`;
    orderText += "───────────────────────────────────────────────────────\n\n";
    orderText += "Thank you for shopping with Swinsoft!\n";
    orderText += "═══════════════════════════════════════════════════════\n";
    
    // Download
    const blob = new Blob([orderText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${order.OrderID}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

function ShowOrdersViewModal() {
    const UserData = GetUserData();
    
    // Check if user is admin
    if (!UserData || UserData.type !== 'Admin') {
        alert('Only administrators can view all orders.');
        return;
    }
    
    const ModalElement = document.getElementById('OrdersViewModal');
    const Modal = new bootstrap.Modal(ModalElement);
    Modal.show();
    
    // Load orders when modal opens
    LoadAllOrders();
}

// Optional: Add download button to cart modal
function AddDownloadButtonToCart() {
    const CartModal = document.getElementById("CartModal");
    
    if (!CartModal) {
        console.error("Cart modal not found!");
        return;
    }
    
    // Find the modal footer or create one
    let ModalFooter = CartModal.querySelector(".modal-footer");
    
    if (!ModalFooter) {
        const ModalContent = CartModal.querySelector(".modal-content");
        ModalFooter = document.createElement("div");
        ModalFooter.className = "modal-footer";
        ModalContent.appendChild(ModalFooter);
    }
    
    // Check if button already exists
    if (!document.getElementById("DownloadOrderBtn")) {
        const DownloadBtn = document.createElement("button");
        DownloadBtn.id = "DownloadOrderBtn";
        DownloadBtn.className = "btn btn-success";
        DownloadBtn.textContent = "Download Order";
        DownloadBtn.onclick = DownloadOrderFile;
        
        // Insert before the close button if it exists
        const CloseBtn = ModalFooter.querySelector('[data-bs-dismiss="modal"]');
        if (CloseBtn) {
            ModalFooter.insertBefore(DownloadBtn, CloseBtn);
        } else {
            ModalFooter.appendChild(DownloadBtn);
        }
    }
    
    // Add "View All Orders" button for admins
    const UserData = GetUserData();
    if (UserData && UserData.type === 'Admin') {
        if (!document.getElementById("ViewAllOrdersBtn")) {
            const ViewOrdersBtn = document.createElement("button");
            ViewOrdersBtn.id = "ViewAllOrdersBtn";
            ViewOrdersBtn.className = "btn btn-info";
            ViewOrdersBtn.textContent = "View All Orders";
            ViewOrdersBtn.onclick = ShowOrdersViewModal;
            
            const CloseBtn = ModalFooter.querySelector('[data-bs-dismiss="modal"]');
            if (CloseBtn) {
                ModalFooter.insertBefore(ViewOrdersBtn, CloseBtn);
            } else {
                ModalFooter.appendChild(ViewOrdersBtn);
            }
        }
    }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    // Create orders view modal
    const OrdersModal = CreateOrdersViewModal();
    document.body.appendChild(OrdersModal);
    
    // Wait a bit for the cart modal to be created
    setTimeout(() => {
        AddDownloadButtonToCart();
    }, 500);
});
