document.addEventListener("DOMContentLoaded", () => {
    const ProductList = document.getElementById("ProductList");
    const SearchInput = document.querySelector('input[type="text"]');
    const CategorySelect = document.getElementById("Category");
    const PriceSelect = document.getElementById("Price");
    const AvailabilitySelect = document.getElementById("Availability");
    let AllProducts = [];

    // Fetching each element in the Product section of the database
    // Then displaying it
    fetch("http://localhost:5000/database")
        .then((Res) => {
        console.log('Fetch response status:', Res.status);  // Should be 200
        return Res.json();
    })
        .then((Data) => {
            console.log('Loaded data:', Data);
            Account.Init(Data);
            AllProducts = Account.Db.Product;
            console.log('AllProducts:', AllProducts);
            DisplayProducts(AllProducts);
        })
        .catch((Err) => console.error("Error loading JSON:", Err));

    function DisplayProducts(Products) {
        ProductList.innerHTML = "";
        
        // If no items are found, display a message to user
        if (Products.length === 0) {
            ProductList.innerHTML = `<h5>No products found.</h5>`;
            return;
        }
        
        // Store item display
        Products.forEach((Product, Index) => {
            const LoggedInUser = JSON.parse(localStorage.getItem('LoggedInUser'));
            const IsAdmin = LoggedInUser && LoggedInUser.type === 'Admin';

            const Card = `
            <div class="col-sm-6 col-md-3 col-lg-3">
                <div class="card shadow-sm StoreCatalogueCard">
                    <img src="${Product.Image}" class="card-img-top StoreCatalogueImage" alt="${Product.Name}">
                    <div class="card-body">
                        <h5 class="card-title">${Product.Name}</h5>
                        <p class="card-text">${Product.Description}</p>
                        <p><strong>Price: </strong>$${Product.Price}</p>
                        <p><strong>Stock:</strong> ${Product.AvailableStock}</p>
                        <button class="btn btn-primary AddToCartBtn" data-product='${JSON.stringify(Product)}'>Add To Cart</button>
                        ${IsAdmin ? `<button class="btn btn-danger DeleteItemBtn" data-index="${Index}">Delete Item</button>` : ""}
                    </div>
                </div>
            </div>
            `;
            ProductList.insertAdjacentHTML("beforeend", Card);
        });

        // Attach event listeners to the "Add To Cart" buttons
        document.querySelectorAll(".AddToCartBtn").forEach((Button) => {
            Button.addEventListener("click", (Event) => {
                const Product = JSON.parse(Event.target.getAttribute("data-product"));
                AddToCart(Product); // Calls the function from ShoppingCart.js
            });
        });

        // Attach event listeners to Delete buttons (for admins)
        document.querySelectorAll(".DeleteItemBtn").forEach((Button) => {
            Button.addEventListener("click", (Event) => {
                const Index = parseInt(Event.target.getAttribute("data-index"));
                Account.Db.Product.splice(Index, 1);  // Remove from shared DB
                Account.Persist().catch(err => console.error('Error persisting DB:', err));  // Persist to server
                AllProducts = Account.Db.Product;  // Refresh local reference
                DisplayProducts(AllProducts); // Refresh display
            });
        });
    }

    // Check for user input in the search bar and change what items are displayed
    function FilterProducts() {
        const SearchInputValue = SearchInput.value.toLowerCase().trim();
        const SelectedCategory = CategorySelect.value;
        const SelectedPrice = PriceSelect.value;
        const SelectedAvailability = AvailabilitySelect.value;

        const FilteredProducts = Account.Db.Product.filter((Product) => {  // Use shared DB
            const PriceValue = parseFloat(Product.Price.replace(/[^0-9.]/g, "")) || 0;
            const StockValue = parseInt(Product.AvailableStock, 10) || 0;

            // Match search term
            const MatchesSearch =
                Product.Name.toLowerCase().includes(SearchInputValue) ||
                Product.Description.toLowerCase().includes(SearchInputValue);

            // Match category
            const MatchesCategory = SelectedCategory === "None" || Product.Category === SelectedCategory;

            // Match price
            let MatchesPrice = true;
            switch (SelectedPrice) {
                case "Free":
                    MatchesPrice = PriceValue === 0;
                    break;
                case "Under50":
                    MatchesPrice = PriceValue <= 50;
                    break;
                case "Under100":
                    MatchesPrice = PriceValue <= 100;
                    break;
                case "Under1000":
                    MatchesPrice = PriceValue <= 1000;
                    break;
                case "Over1000":
                    MatchesPrice = PriceValue > 1000;
                    break;
                default:
                    MatchesPrice = true;
                    break;
            }

            // Match availability
            let MatchesAvailability = true;
            switch (SelectedAvailability) {
                case "Low":
                    MatchesAvailability = StockValue < 30;
                    break;
                case "Medium":
                    MatchesAvailability = StockValue >= 30 && StockValue <= 60;
                    break;
                case "High":
                    MatchesAvailability = StockValue > 60;
                    break;
                default:
                    MatchesAvailability = true;
                    break;
            }

            return MatchesSearch && MatchesCategory && MatchesPrice && MatchesAvailability;
        });

        DisplayProducts(FilteredProducts);
    }

    // Event listeners for search and filter changes
    SearchInput.addEventListener("input", FilterProducts);
    CategorySelect.addEventListener("change", FilterProducts);
    PriceSelect.addEventListener("change", FilterProducts);
    AvailabilitySelect.addEventListener("change", FilterProducts);
});
