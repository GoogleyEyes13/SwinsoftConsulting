document.addEventListener("DOMContentLoaded", () => {
    const CartButton = Array.from(document.querySelectorAll(".btn.btn-primary"))
        .find(btn => btn.textContent.trim() === "Shopping Cart");

    if (!CartButton) {
        console.error("Shopping Cart button not found!");
        return;
    }

    const CartModal = CreateCartModal();
    document.body.appendChild(CartModal);

    CartButton.addEventListener("click", () => {
        ShowCartModal();
    });
});

// Adding items to cart
function AddToCart(Product) {
    const Cart = JSON.parse(localStorage.getItem("ShoppingCart")) || [];

    const Existing = Cart.find(item => item.Name === Product.Name);
    if (Existing) {
        // Only increase if there's enough stock
        if (Existing.Quantity < parseInt(Product.AvailableStock, 10)) {
            Existing.Quantity += 1;
        }
    } else {
        Cart.push({
            Name: Product.Name,
            Price: parseFloat(Product.Price.replace(/[^0-9.]/g, "")),
            Quantity: 1,
            AvailableStock: parseInt(Product.AvailableStock, 10)
        });
    }

    localStorage.setItem("ShoppingCart", JSON.stringify(Cart));
    RenderCartItems();
}

// Update quantity of items
function UpdateQuantity(Index, NewQty) {
    const Cart = JSON.parse(localStorage.getItem("ShoppingCart")) || [];
    if (NewQty < 1) return;

    // Limit quantity to stock
    const MaxStock = Cart[Index].AvailableStock;
    if (NewQty > MaxStock) {
        Cart[Index].Quantity = MaxStock;
    } else {
        Cart[Index].Quantity = NewQty;
    }

    localStorage.setItem("ShoppingCart", JSON.stringify(Cart));
    RenderCartItems();
}


function CreateCartModal() {
    const Modal = document.createElement("div");
    Modal.className = "modal fade";
    Modal.id = "CartModal";
    Modal.tabIndex = -1;
    Modal.innerHTML = `
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Shopping Cart</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div id="CartItemsContainer" class="container-fluid"></div>
              <hr>
              <h5 class="text-end" id="CartTotal">Total: $0.00</h5>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Continue Shopping</button>
            </div>
          </div>
        </div>
    `;
    return Modal;
}

function ShowCartModal() {
    const ModalElement = document.getElementById("CartModal");
    const Modal = new bootstrap.Modal(ModalElement);
    Modal.show();

    RenderCartItems();
}

// Displaying cart items
function RenderCartItems() {
    const Container = document.getElementById("CartItemsContainer");
    Container.innerHTML = "";

    const Cart = JSON.parse(localStorage.getItem("ShoppingCart")) || [];
    if (Cart.length === 0) {
        Container.innerHTML = `<p class="text-center text-muted">Your cart is empty.</p>`;
        document.getElementById("CartTotal").textContent = "Total: $0.00";
        return;
    }

    let Total = 0;
    Cart.forEach((Item, Index) => {
        const Subtotal = Item.Price * Item.Quantity;
        Total += Subtotal;

        const ItemRow = document.createElement("div");
        ItemRow.className = "row align-items-center mb-3";
        ItemRow.innerHTML = `
            <div class="col-3"><strong>${Item.Name}</strong></div>
            <div class="col-2">$${Item.Price.toFixed(2)}</div>
            <div class="col-3">
                <input type="number" class="form-control form-control-sm" min="1" 
                       max="${Item.AvailableStock}" value="${Item.Quantity}" id="Quantity-${Index}">
            </div>
            <div class="col-2">$${Subtotal.toFixed(2)}</div>
            <div class="col-2">
                <button class="btn btn-danger btn-sm" id="Remove-${Index}">Remove</button>
            </div>
        `;
        Container.appendChild(ItemRow);

        document.getElementById(`Quantity-${Index}`).addEventListener("change", (e) => {
            let NewQty = parseInt(e.target.value);
            if (NewQty > Item.AvailableStock) {
                NewQty = Item.AvailableStock;
            }
            UpdateQuantity(Index, NewQty);
        });

        document.getElementById(`Remove-${Index}`).addEventListener("click", () => {
            RemoveItem(Index);
        });
    });

    document.getElementById("CartTotal").textContent = `Total: $${Total.toFixed(2)}`;
}

// Update quantity of items
function UpdateQuantity(Index, NewQty) {
    const Cart = JSON.parse(localStorage.getItem("ShoppingCart")) || [];
    if (NewQty < 1) return;
    Cart[Index].Quantity = NewQty;
    localStorage.setItem("ShoppingCart", JSON.stringify(Cart));
    RenderCartItems();
}

// Remove item from cart
function RemoveItem(Index) {
    const Cart = JSON.parse(localStorage.getItem("ShoppingCart")) || [];
    Cart.splice(Index, 1);
    localStorage.setItem("ShoppingCart", JSON.stringify(Cart));
    RenderCartItems();
}
