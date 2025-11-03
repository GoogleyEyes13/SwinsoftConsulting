/**
 * InventoryManager.js
 * 
 * Manages all inventory-related operations.
 * Maintains real-time stock levels and prevents overselling.
 * 
 * Responsibilities:
 * - Maintain real-time stock levels for all products
 * - Check product availability for customer requests
 * - Update stock levels based on sales and returns
 * - Process stock adjustments
 * - Provide inventory reports and analytics
 * 
 * Collaborators: Product, StoreCatalogue, ShoppingCart, OrderManager, ReportGenerator
 */

class InventoryManager {
    /**
     * Constructor for InventoryManager
     * Initializes with products from the database
     * @param {Array} products - Array of Product objects
     */
    constructor(products = []) {
        this.products = new Map();
        // Initialize products map with ProductID as key
        products.forEach(product => {
            this.products.set(product.productID, product);
        });
    }

    /**
     * Get product by ID
     * @param {number} productID - Product ID to retrieve
     * @returns {Product|null} Product object or null if not found
     */
    getProductByID(productID) {
        return this.products.get(productID) || null;
    }

    /**
     * Check if product is available with specified quantity
     * @param {number} productID - Product ID
     * @param {number} quantity - Quantity required
     * @returns {boolean} True if product is available in specified quantity
     */
    isProductAvailable(productID, quantity) {
        const product = this.getProductByID(productID);
        if (!product) return false;
        return product.isQuantityAvailable(quantity);
    }

    /**
     * Reserve inventory for an order (reduce stock)
     * @param {number} productID - Product ID
     * @param {number} quantity - Quantity to reserve
     * @returns {boolean} True if reservation successful
     */
    reserveStock(productID, quantity) {
        const product = this.getProductByID(productID);
        if (!product) return false;
        
        if (product.isQuantityAvailable(quantity)) {
            return product.updateStock(-quantity);
        }
        return false;
    }

    /**
     * Return stock (e.g., for cancelled orders or returns)
     * @param {number} productID - Product ID
     * @param {number} quantity - Quantity to return
     * @returns {boolean} True if return successful
     */
    returnStock(productID, quantity) {
        const product = this.getProductByID(productID);
        if (!product) return false;
        return product.updateStock(quantity);
    }

    /**
     * Adjust stock manually (for restocking or corrections)
     * @param {number} productID - Product ID
     * @param {number} quantity - Quantity to adjust (positive or negative)
     * @returns {boolean} True if adjustment successful
     */
    adjustStock(productID, quantity) {
        const product = this.getProductByID(productID);
        if (!product) return false;
        return product.updateStock(quantity);
    }

    /**
     * Get all products
     * @returns {Array} Array of all Product objects
     */
    getAllProducts() {
        return Array.from(this.products.values());
    }

    /**
     * Get product stock level
     * @param {number} productID - Product ID
     * @returns {number|null} Stock level or null if product not found
     */
    getStockLevel(productID) {
        const product = this.getProductByID(productID);
        return product ? product.availableStock : null;
    }

    /**
     * Get products by category
     * @param {string} category - Category name
     * @returns {Array} Array of Product objects in category
     */
    getProductsByCategory(category) {
        return this.getAllProducts().filter(product => product.category === category);
    }

    /**
     * Get all available categories
     * @returns {Array} Array of unique category names
     */
    getAllCategories() {
        const categories = new Set();
        this.products.forEach(product => {
            categories.add(product.category);
        });
        return Array.from(categories);
    }

    /**
     * Get products in stock (stock > 0)
     * @returns {Array} Array of Product objects with available stock
     */
    getProductsInStock() {
        return this.getAllProducts().filter(product => product.isInStock());
    }

    /**
     * Get low stock products (stock <= 10)
     * @returns {Array} Array of Product objects with low stock
     */
    getLowStockProducts() {
        return this.getAllProducts().filter(product => product.availableStock <= 10 && product.availableStock > 0);
    }

    /**
     * Add a new product to inventory
     * @param {Product} product - Product object to add
     * @returns {boolean} True if product added successfully
     */
    addProduct(product) {
        if (this.products.has(product.productID)) {
            return false; // Product already exists
        }
        this.products.set(product.productID, product);
        return true;
    }

    /**
     * Remove product from inventory
     * @param {number} productID - Product ID to remove
     * @returns {boolean} True if product removed successfully
     */
    removeProduct(productID) {
        return this.products.delete(productID);
    }

    /**
     * Update product information
     * @param {number} productID - Product ID
     * @param {Object} updates - Object with properties to update
     * @returns {boolean} True if update successful
     */
    updateProduct(productID, updates) {
        const product = this.getProductByID(productID);
        if (!product) return false;

        // Update allowed fields
        if (updates.name !== undefined) product.name = updates.name;
        if (updates.description !== undefined) product.description = updates.description;
        if (updates.price !== undefined) product.price = updates.price;
        if (updates.category !== undefined) product.category = updates.category;
        if (updates.supplier !== undefined) product.supplier = updates.supplier;
        if (updates.image !== undefined) product.image = updates.image;
        // Note: availableStock should be updated through reserveStock/returnStock/adjustStock

        return true;
    }

    /**
     * Get inventory report (for analytics)
     * @returns {Object} Inventory statistics
     */
    getInventoryReport() {
        const products = this.getAllProducts();
        let totalValue = 0;
        let totalItems = 0;
        let outOfStock = 0;

        products.forEach(product => {
            totalValue += product.price * product.availableStock;
            totalItems += product.availableStock;
            if (!product.isInStock()) outOfStock++;
        });

        return {
            totalProducts: products.length,
            totalItems: totalItems,
            outOfStockCount: outOfStock,
            totalInventoryValue: totalValue.toFixed(2),
            categories: this.getAllCategories().length
        };
    }

    /**
     * Get all products as JSON for storage
     * @returns {Array} Array of JSON representations of all products
     */
    getAllProductsAsJSON() {
        return this.getAllProducts().map(product => product.toJSON());
    }
}
