/**
 * Product.js
 * 
 * Represents a Product in the Online Convenience Store.
 * This is a data-holder class that encapsulates product information.
 * 
 * Responsibilities:
 * - Store product identifiers, names, descriptions and prices
 * - Provide price and availability details on request
 * - Report and update product stock levels
 * - Serve as a data source for cart and order processing
 * 
 * Collaborators: StoreCatalogue, InventoryManager, ShoppingCart, OrderManager
 */

class Product {
    /**
     * Constructor for Product
     * @param {number} productID - Unique product identifier
     * @param {string} name - Product name
     * @param {string} description - Product description
     * @param {number} price - Product price (AUD)
     * @param {string} category - Product category
     * @param {string} type - Product type (Consumable, Perishable, etc.)
     * @param {number} availableStock - Current stock level
     * @param {string} supplier - Supplier name
     * @param {string} image - Image filename
     */
    constructor(productID, name, description, price, category, type, availableStock, supplier, image) {
        this.productID = productID;
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.type = type;
        this.availableStock = availableStock;
        this.supplier = supplier;
        this.image = image;
    }

    /**
     * Get product details
     * @returns {Object} Product data object
     */
    getDetails() {
        return {
            productID: this.productID,
            name: this.name,
            description: this.description,
            price: this.price,
            category: this.category,
            type: this.type,
            availableStock: this.availableStock,
            supplier: this.supplier,
            image: this.image
        };
    }

    /**
     * Check if product is in stock
     * @returns {boolean} True if stock > 0
     */
    isInStock() {
        return this.availableStock > 0;
    }

    /**
     * Get availability status as string
     * @returns {string} "In Stock" or "Out of Stock"
     */
    getAvailabilityStatus() {
        return this.isInStock() ? "In Stock" : "Out of Stock";
    }

    /**
     * Update stock quantity
     * @param {number} quantity - Quantity to add (positive) or remove (negative)
     * @returns {boolean} True if update successful
     */
    updateStock(quantity) {
        if (this.availableStock + quantity >= 0) {
            this.availableStock += quantity;
            return true;
        }
        return false;
    }

    /**
     * Check if quantity is available
     * @param {number} quantity - Quantity to check
     * @returns {boolean} True if quantity is available
     */
    isQuantityAvailable(quantity) {
        return this.availableStock >= quantity;
    }

    /**
     * Convert to JSON format for storage
     * @returns {Object} JSON representation of product
     */
    toJSON() {
        return {
            ProductID: this.productID,
            Name: this.name,
            Description: this.description,
            Price: this.price,
            Category: this.category,
            Type: this.type,
            AvailableStock: this.availableStock,
            Supplier: this.supplier,
            Image: this.image
        };
    }
}
