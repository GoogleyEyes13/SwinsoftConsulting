document.addEventListener("DOMContentLoaded", () => {
    const ProductList = document.getElementById("ProductList");
    const SearchInput = document.querySelector('input[type="text"]');
    const CategorySelect = document.getElementById("Category");
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

        const FilteredProducts = AllProducts.filter((Product) => {
            const MatchesSearch =
                Product.Name.toLowerCase().includes(SearchInputAdjust) ||
                Product.Description.toLowerCase().includes(SearchInputAdjust)

            const MatchesCategory = SelectedCategory === "None" || Product.Category === SelectedCategory;

            return MatchesSearch && MatchesCategory;
        });

        DisplayProducts(FilteredProducts);
    }

    SearchInput.addEventListener("input", FilterProducts);
    CategorySelect.addEventListener("change", FilterProducts);
});
