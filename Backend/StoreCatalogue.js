document.addEventListener("DOMContentLoaded", () => {
    const ProductList = document.getElementById("ProductList");
    const SearchInput = document.querySelector('input[type="text"]');
    const CategorySelect = document.getElementById("Category");
    const PriceSelect = document.getElementById("Price");
    const AvailabilitySelect = document.getElementById("Availability");
    let AllProducts = [];

    window.refreshCatalogue = function() {
        FilterProducts();
    };

    // Fetching each element in the Product section of the database
    // Then displaying it
    fetch("http://localhost:5000/database")
        .then((Res) => {
            console.log('Fetch response status:', Res.status);
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
            // Check if user is admin
            const IsAdmin = window.loggedInUser && window.loggedInUser.type === "Admin";
            
            // Change button text based on user type (keep same color - primary blue)
            const ButtonText = IsAdmin ? "Edit" : "Add to Cart";
            const ButtonClass = "btn btn-primary AddToCartBtn"; // Same color for both
            
            const Card = `
                <div class="col-sm-6 col-md-3 col-lg-3">
                    <div class="card shadow-sm StoreCatalogueCard">
                        <img src="${Product.Image}" class="card-img-top StoreCatalogueImage" alt="${Product.Name}">
                        <div class="card-body">
                            <h5 class="card-title">${Product.Name}</h5>
                            <p class="card-text">${Product.Description}</p>
                            <p><strong>Price: </strong>$${Product.Price}</p>
                            <p><strong>Stock:</strong> ${Product.AvailableStock}</p>
                            <button class="${ButtonClass}" data-product='${JSON.stringify(Product).replace(/'/g, "&apos;")}'>${ButtonText}</button>
                            ${IsAdmin ? `<button class="btn btn-danger DeleteItemBtn mt-2" data-index="${Index}" data-product-name="${Product.Name}">Delete Item</button>` : ""}
                        </div>
                    </div>
                </div>
            `;

            ProductList.insertAdjacentHTML("beforeend", Card);
        });

        // Attach event listeners to the Add To Cart / Edit buttons
        document.querySelectorAll(".AddToCartBtn").forEach((Button) => {
            Button.addEventListener("click", (Event) => {
                const Product = JSON.parse(Event.target.getAttribute("data-product"));
                const IsAdmin = window.loggedInUser && window.loggedInUser.type === "Admin";
                
                if (IsAdmin) {
                    // Admin clicks "Edit" - open edit function
                    EditProduct(Product);
                } else {
                    // Customer clicks "Add to Cart" - add to cart
                    AddToCart(Product); // Calls the function from ShoppingCart.js
                }
            });
        });

        // Attach event listeners to Delete buttons (for admins only)
        document.querySelectorAll(".DeleteItemBtn").forEach((Button) => {
            Button.addEventListener("click", (Event) => {
                const ProductName = Event.target.getAttribute("data-product-name");
                
                // Confirm deletion
                if (confirm(`Are you sure you want to delete ${ProductName}?`)) {
                    // Find product by name instead of index
                    const ProductIndex = Account.Db.Product.findIndex(p => p.Name === ProductName);
                    if (ProductIndex !== -1) {
                        Account.Db.Product.splice(ProductIndex, 1); // Remove from shared DB
                        Account.Persist()
                            .then(() => {
                                alert("Product deleted successfully!");
                                AllProducts = Account.Db.Product; // Refresh local reference
                                FilterProducts(); // Re-apply current filters
                            })
                            .catch((err) => {
                                console.error("Error persisting DB:", err);
                                alert("Failed to delete product");
                            });
                    }
                }
            });
        });
    }

    // Function to handle product editing for admins
    function EditProduct(Product) {
        // Create edit modal or use prompts
        const NewName = prompt(`Edit name for ${Product.Name}:`, Product.Name);
        if (NewName === null) return; // User cancelled
        
        const NewPrice = prompt(`Edit price for ${Product.Name}:`, Product.Price);
        if (NewPrice === null) return;
        
        const NewStock = prompt(`Edit stock for ${Product.Name}:`, Product.AvailableStock);
        if (NewStock === null) return;
        
        const NewDescription = prompt(`Edit description for ${Product.Name}:`, Product.Description);
        if (NewDescription === null) return;
        
        // Validate inputs
        if (isNaN(NewPrice) || isNaN(NewStock)) {
            alert("Price and Stock must be valid numbers!");
            return;
        }
        
        // Find and update the product in database
        const ProductIndex = Account.Db.Product.findIndex(p => p.Name === Product.Name);
        if (ProductIndex !== -1) {
            Account.Db.Product[ProductIndex].Name = NewName;
            Account.Db.Product[ProductIndex].Price = NewPrice;
            Account.Db.Product[ProductIndex].AvailableStock = NewStock;
            Account.Db.Product[ProductIndex].Description = NewDescription;
            
            // Save to backend
            Account.Persist()
                .then(() => {
                    alert("Product updated successfully!");
                    AllProducts = Account.Db.Product;
                    FilterProducts(); // Re-apply current filters
                })
                .catch((err) => {
                    console.error("Error updating product:", err);
                    alert("Failed to update product");
                });
        }
    }

    function FilterProducts() {
        console.log("FilterProducts called");
        
        // Get filter values
        const SearchQuery = SearchInput ? SearchInput.value.toLowerCase() : '';
        const SelectedCategory = CategorySelect ? CategorySelect.value : '';
        const SelectedPriceRange = PriceSelect ? PriceSelect.value : '';
        const SelectedAvailability = AvailabilitySelect ? AvailabilitySelect.value : '';

        console.log("Filters:", { SearchQuery, SelectedCategory, SelectedPriceRange, SelectedAvailability });

        let FilteredProducts = [...AllProducts]; // Create a copy

        // Filter by search query (name or description)
        if (SearchQuery) {
            FilteredProducts = FilteredProducts.filter(Product =>
                Product.Name.toLowerCase().includes(SearchQuery) ||
                Product.Description.toLowerCase().includes(SearchQuery)
            );
        }

        // Filter by category (check for "None" or empty)
        if (SelectedCategory && SelectedCategory !== "None" && SelectedCategory !== "") {
            FilteredProducts = FilteredProducts.filter(Product =>
                Product.Category === SelectedCategory
            );
        }

        // Filter by price range - FIXED TO MATCH HTML OPTIONS
        if (SelectedPriceRange && SelectedPriceRange !== "None" && SelectedPriceRange !== "") {
            FilteredProducts = FilteredProducts.filter(Product => {
                // Parse price - handle both string with $ and plain number
                let Price = parseFloat(Product.Price.toString().replace(/[$,]/g, ''));
                
                console.log(`Product: ${Product.Name}, Price: ${Price}, Filter: ${SelectedPriceRange}`);
                
                switch (SelectedPriceRange) {
                    case "Under50":
                        return Price < 50;
                    case "Under100":
                        return Price < 100;
                    case "Under1000":
                        return Price < 1000;
                    case "Over1000":
                        return Price >= 1000;
                    default:
                        return true;
                }
            });
        }

        // Filter by availability
        if (SelectedAvailability && SelectedAvailability !== "None" && SelectedAvailability !== "") {
            FilteredProducts = FilteredProducts.filter(Product => {
                const Stock = parseInt(Product.AvailableStock);
                
                // Map HTML option values to logic
                switch (SelectedAvailability.toLowerCase()) {
                    case "low":
                        return Stock > 0 && Stock <= 10;
                    case "medium":
                        return Stock > 10 && Stock <= 50;
                    case "high":
                        return Stock > 50;
                    case "in-stock":
                        return Stock > 0;
                    case "out-of-stock":
                        return Stock === 0;
                    default:
                        return true;
                }
            });
        }

        console.log("Filtered products count:", FilteredProducts.length);
        DisplayProducts(FilteredProducts);
    }

    // Event listeners for filters - check if elements exist first
    if (SearchInput) {
        SearchInput.addEventListener("input", FilterProducts);
        console.log("Search input listener attached");
    } else {
        console.warn("Search input not found");
    }

    if (CategorySelect) {
        CategorySelect.addEventListener("change", FilterProducts);
        console.log("Category select listener attached");
    } else {
        console.warn("Category select not found");
    }

    if (PriceSelect) {
        PriceSelect.addEventListener("change", FilterProducts);
        console.log("Price select listener attached");
    } else {
        console.warn("Price select not found");
    }

    if (AvailabilitySelect) {
        AvailabilitySelect.addEventListener("change", FilterProducts);
        console.log("Availability select listener attached");
    } else {
        console.warn("Availability select not found");
    }
});
