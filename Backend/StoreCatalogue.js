/**
 * StoreCatalogue.js
 * 
 * Manages the store's product catalogue.
 * Provides browsing, searching, filtering and synchronization capabilities.
 * 
 * Responsibilities:
 * - Maintain complete list of available products
 * - Search and filter products by category, keyword and price
 * - Retrieve stock status and pricing for listed products
 * - Provide catalogue data to user interfaces
 * - Synchronize catalogue updates with warehouse inventory
 * - Allow administrative updates to add or remove products
 * - Generate product listings and analytical reports
 * 
 * Collaborators: Product, InventoryManager, UserHandler, ReportGenerator
 */

class StoreCatalogue {
    /**
     * Constructor for StoreCatalogue
     * @param {InventoryManager} inventoryManager - Reference to InventoryManager
     */
    constructor(inventoryManager) {
        this.inventoryManager = inventoryManager;
        this.filters = {
            category: null,
            priceMin: 0,
            priceMax: Infinity,
            inStockOnly: false,
            searchKeyword: ""
        };
    }

    /**
     * Get all available products in catalogue
     * @returns {Array} Array of Product objects
     */
    getAllProducts() {
        return this.inventoryManager.getAllProducts();
    }

    /**
     * Get all categories available in catalogue
     * @returns {Array} Array of category names
     */
    getCategories() {
        return this.inventoryManager.getAllCategories();
    }

    /**
     * Search products by keyword (searches in name and description)
     * @param {string} keyword - Search keyword
     * @returns {Array} Array of matching Product objects
     */
    searchByKeyword(keyword) {
        if (!keyword || keyword.trim() === "") {
            return this.getAllProducts();
        }

        const lowerKeyword = keyword.toLowerCase();
        return this.getAllProducts().filter(product => 
            product.name.toLowerCase().includes(lowerKeyword) ||
            product.description.toLowerCase().includes(lowerKeyword)
        );
    }

    /**
     * Filter products by category
     * @param {string} category - Category name
     * @returns {Array} Array of Product objects in category
     */
    filterByCategory(category) {
        if (!category || category === "") {
            return this.getAllProducts();
        }
        return this.inventoryManager.getProductsByCategory(category);
    }

    /**
     * Filter products by price range
     * @param {number} minPrice - Minimum price
     * @param {number} maxPrice - Maximum price
     * @returns {Array} Array of Product objects within price range
     */
    filterByPrice(minPrice, maxPrice) {
        return this.getAllProducts().filter(product =>
            product.price >= minPrice && product.price <= maxPrice
        );
    }

    /**
     * Filter products by availability
     * @param {boolean} inStockOnly - If true, return only in-stock products
     * @returns {Array} Array of filtered Product objects
     */
    filterByAvailability(inStockOnly) {
        if (!inStockOnly) {
            return this.getAllProducts();
        }
        return this.inventoryManager.getProductsInStock();
    }

    /**
     * Apply multiple filters to catalogue
     * @param {Object} filterCriteria - Object with filter properties
     *        filterCriteria.keyword - Search keyword
     *        filterCriteria.category - Category name
     *        filterCriteria.minPrice - Minimum price
     *        filterCriteria.maxPrice - Maximum price
     *        filterCriteria.inStockOnly - Only in-stock products
     * @returns {Array} Array of filtered Product objects
     */
    applyFilters(filterCriteria) {
        let results = this.getAllProducts();

        // Search by keyword
        if (filterCriteria.keyword && filterCriteria.keyword.trim() !== "") {
            results = results.filter(product => {
                const lowerKeyword = filterCriteria.keyword.toLowerCase();
                return product.name.toLowerCase().includes(lowerKeyword) ||
                       product.description.toLowerCase().includes(lowerKeyword);
            });
        }

        // Filter by category
        if (filterCriteria.category && filterCriteria.category !== "") {
            results = results.filter(product => product.category === filterCriteria.category);
        }

        // Filter by price range
        if (filterCriteria.minPrice !== undefined && filterCriteria.maxPrice !== undefined) {
            results = results.filter(product =>
                product.price >= filterCriteria.minPrice && 
                product.price <= filterCriteria.maxPrice
            );
        }

        // Filter by availability
        if (filterCriteria.inStockOnly) {
            results = results.filter(product => product.isInStock());
        }

        return results;
    }

    /**
     * Sort products
     * @param {Array} products - Array of Product objects
     * @param {string} sortBy - Sort criteria: "name", "price", "category", "stock"
     * @param {string} order - Sort order: "asc" or "desc"
     * @returns {Array} Sorted array of Product objects
     */
    sortProducts(products, sortBy = "name", order = "asc") {
        const sorted = [...products];

        sorted.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case "price":
                    aValue = a.price;
                    bValue = b.price;
                    break;
                case "category":
                    aValue = a.category;
                    bValue = b.category;
                    break;
                case "stock":
                    aValue = a.availableStock;
                    bValue = b.availableStock;
                    break;
                case "name":
                default:
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
            }

            if (aValue < bValue) return order === "asc" ? -1 : 1;
            if (aValue > bValue) return order === "asc" ? 1 : -1;
            return 0;
        });

        return sorted;
    }

    /**
     * Get product details by ID
     * @param {number} productID - Product ID
     * @returns {Object|null} Product details or null if not found
     */
    getProductDetails(productID) {
        const product = this.inventoryManager.getProductByID(productID);
        return product ? product.getDetails() : null;
    }

    /**
     * Get featured/recommended products
     * @param {number} count - Number of products to return
     * @returns {Array} Array of recommended Product objects
     */
    getFeaturedProducts(count = 4) {
        return this.getAllProducts().slice(0, count);
    }

    /**
     * Get popular categories with product count
     * @returns {Array} Array of objects with category name and count
     */
    getCategoriesWithCount() {
        const categories = this.getCategories();
        return categories.map(category => ({
            name: category,
            count: this.inventoryManager.getProductsByCategory(category).length
        }));
    }

    /**
     * Get price range statistics
     * @returns {Object} Object with min and max prices
     */
    getPriceRange() {
        const products = this.getAllProducts();
        if (products.length === 0) return { min: 0, max: 0 };

        let min = products[0].price;
        let max = products[0].price;

        products.forEach(product => {
            if (product.price < min) min = product.price;
            if (product.price > max) max = product.price;
        });

        return { min: min.toFixed(2), max: max.toFixed(2) };
    }

    /**
     * Add product to catalogue
     * @param {Product} product - Product object to add
     * @returns {boolean} True if product added successfully
     */
    addProduct(product) {
        return this.inventoryManager.addProduct(product);
    }

    /**
     * Remove product from catalogue
     * @param {number} productID - Product ID to remove
     * @returns {boolean} True if product removed successfully
     */
    removeProduct(productID) {
        return this.inventoryManager.removeProduct(productID);
    }

    /**
     * Get catalogue statistics
     * @returns {Object} Catalogue statistics
     */
    getCatalogueStats() {
        const products = this.getAllProducts();
        const priceRange = this.getPriceRange();

        return {
            totalProducts: products.length,
            totalCategories: this.getCategories().length,
            averagePrice: (products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(2),
            priceRange: priceRange,
            inStockProducts: this.inventoryManager.getProductsInStock().length,
            outOfStockProducts: products.length - this.inventoryManager.getProductsInStock().length
        };
    }
}
