document.addEventListener("DOMContentLoaded", () => {
    const ProductList = document.getElementById("ProductList");

    // Fetching each element in the Product section of the database
    // Then displaying it
    fetch("Backend/Database.json")
        .then((res) => res.json())
        .then((data) => {
        data.Product.forEach((Product) => {
            const card = `
            <div class="col-sm-6 col-md-3 col-lg-3">
                <div class="card shadow-sm">
                <img src="${Product.Image}" class="card-img-top StoreCatalogueImage" alt="${Product.Name}">
                <div class="card-body">
                    <h5 class="card-title">${Product.Name}</h5>
                    <p class="card-text">${Product.Description}</p>
                    <p><strong>Price:</strong> ${Product.Price}</p>
                    <p><strong>Stock:</strong> ${Product.AvailableStock}</p>
                </div>
                </div>
            </div>
            `;
            ProductList.insertAdjacentHTML("beforeend", card);
        });
        })
        .catch((err) => console.error("Error loading JSON:", err));
});
