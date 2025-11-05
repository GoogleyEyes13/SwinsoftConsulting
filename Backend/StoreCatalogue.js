document.addEventListener("DOMContentLoaded", () => {
    const ProductList = document.getElementById("ProductList");
    const SearchInput = document.querySelector('input[type="text"]');
    const CategorySelect = document.getElementById("Category");
    const PriceSelect = document.getElementById("Price");
    const AvailabilitySelect = document.getElementById("Availability");
    let AllProducts = [];

    // Fetching each element in the Product section of the database
    // Then displaying it
    fetch("Backend/Database.json")
        .then((res) => res.json())
        .then((data) => {
            AllProducts = data.Product; 
            DisplayProducts(AllProducts); 
        })
        .catch((err) => console.error("Error loading JSON:", err));

    function DisplayProducts(Products) {
        ProductList.innerHTML = "";

        // If no items are found, display a message to user
        if (Products.length === 0) {
            ProductList.innerHTML = `<h5>No products found.</h5>`;
            return;
        }

        // Store item display
        Products.forEach((Product) => {
            const card = `
            <div class="col-sm-6 col-md-3 col-lg-3">
                <div class="card shadow-sm StoreCatalogueCard">
                    <img src="${Product.Image}" class="card-img-top StoreCatalogueImage" alt="${Product.Name}">
                    <div class="card-body">
                        <h5 class="card-title">${Product.Name}</h5>
                        <p class="card-text">${Product.Description}</p>
                        <p><strong>Price: </strong>$${Product.Price}</p>
                        <p><strong>Stock:</strong> ${Product.AvailableStock}</p>
                    </div>
                </div>
            </div>
            `;
            ProductList.insertAdjacentHTML("beforeend", card);
        });
    }

    // Check for user input in the search bar and change what items are displayed
    function FilterProducts() {
        const SearchInputAdjust = SearchInput.value.toLowerCase().trim();
        const SelectedCategory = CategorySelect.value;
        const SelectedPrice = PriceSelect.value;
        const SelectedAvailability = AvailabilitySelect.value;

        const FilteredProducts = AllProducts.filter((Product) => {
            const PriceValue = parseFloat(Product.Price.replace(/[^0-9.]/g, "")) || 0;
            const StockValue = parseInt(Product.AvailableStock, 10) || 0;

            const MatchesSearch =
                Product.Name.toLowerCase().includes(SearchInputAdjust) ||
                Product.Description.toLowerCase().includes(SearchInputAdjust)

            const MatchesCategory = SelectedCategory === "None" || Product.Category === SelectedCategory;

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
            
            let MatchesAvailability = true;
            switch (SelectedAvailability) {
                case "Low":
                    MatchesAvailability = StockValue < 30;
                    break;
                case "Medium":
                    MatchesAvailability = StockValue < 60 && StockValue > 29;
                    break;
                case "High":
                    MatchesAvailability = StockValue > 59;
                    break;
                default:
                    MatchesAvailability = true;
                    break;
            }

            return MatchesSearch && MatchesCategory && MatchesPrice && MatchesAvailability;
        });

        DisplayProducts(FilteredProducts);
    }

    SearchInput.addEventListener("input", FilterProducts);
    CategorySelect.addEventListener("change", FilterProducts);
    PriceSelect.addEventListener("change", FilterProducts);
    AvailabilitySelect.addEventListener("change", FilterProducts);
});
