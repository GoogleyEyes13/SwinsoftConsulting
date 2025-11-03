document.addEventListener("DOMContentLoaded", () => {
    const listEl = document.getElementById("ProductList");

    // Fetching each element in the Product section of the database
    // Then displaying it
    fetch("Backend/Database.json")
        .then((res) => res.json())
        .then((data) => {
        data.Product.forEach((post) => {
            listEl.insertAdjacentHTML("beforeend", `<p>${post.Name}</p>`);
        });
        })
        .catch((err) => console.error("Error loading JSON:", err));
});
