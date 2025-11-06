// OrderManager.js - Generates and downloads order.txt from shopping cart with user account data

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

function DownloadOrderFile() {
    const OrderText = GenerateOrderText();
    
    if (!OrderText) {
        return; // Cart was empty
    }
    
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

// Optional: Function to preview order before downloading
function PreviewOrder() {
    const OrderText = GenerateOrderText();
    
    if (!OrderText) {
        return;
    }
    
    // Display in a modal or alert
    alert(OrderText);
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
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    // Wait a bit for the cart modal to be created
    setTimeout(() => {
        AddDownloadButtonToCart();
    }, 500);
});
