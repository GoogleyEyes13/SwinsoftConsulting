/**
 * Database.js
 * 
 * Manages data persistence and database operations.
 * Handles loading and saving data from/to Database.json file.
 * 
 * Responsibilities:
 * - Load data from database file
 * - Save data to database file
 * - Initialize system with data
 * - Manage database operations
 */

class DatabaseManager {
    /**
     * Constructor for DatabaseManager
     */
    constructor() {
        this.databaseUrl = "Backend/Database.json";
        this.data = null;
    }

    /**
     * Load all data from database.json
     * @returns {Promise<Object>} Promise with database data
     */
    async loadDatabase() {
        try {
            // Add cache-busting parameter to ensure fresh data is always loaded
            const timestamp = new Date().getTime();
            const dbUrl = `Backend/Database.json?t=${timestamp}`;
            
            const response = await fetch(dbUrl);
            if (!response.ok) {
                throw new Error(`Failed to load database: ${response.statusText}`);
            }
            this.data = await response.json();
            return this.data;
        } catch (error) {
            console.error("Error loading database:", error);
            throw error;
        }
    }

    /**
     * Load products from database
     * @returns {Promise<Array>} Promise with array of product data
     */
    async loadProducts() {
        if (!this.data) {
            await this.loadDatabase();
        }
        return this.data.Product || [];
    }

    /**
     * Load customer accounts from database
     * @returns {Promise<Array>} Promise with array of customer data
     */
    async loadCustomerAccounts() {
        if (!this.data) {
            await this.loadDatabase();
        }
        return this.data.CustomerAccounts || [];
    }

    /**
     * Load admin accounts from database
     * @returns {Promise<Array>} Promise with array of admin data
     */
    async loadAdminAccounts() {
        if (!this.data) {
            await this.loadDatabase();
        }
        return this.data.AdminAccounts || [];
    }

    /**
     * Convert raw product data to Product objects
     * @param {Array} productData - Raw product data from database
     * @returns {Array} Array of Product objects
     */
    convertToProductObjects(productData) {
        return productData.map(data => new Product(
            data.ProductID,
            data.Name,
            data.Description,
            data.Price,
            data.Category,
            data.Type || "Consumable",
            data.AvailableStock,
            data.Supplier,
            data.Image || ""
        ));
    }

    /**
     * Save products back to database
     * NOTE: This simulates saving by updating the in-memory data.
     * In a real scenario, you would need a backend API to persist changes.
     * @param {Array} products - Array of Product objects or raw product data
     * @returns {Object} Save result {success: boolean, message: string}
     */
    async saveProducts(products) {
        try {
            // Convert products to JSON format
            // Handle both Product objects (with toJSON method) and raw objects
            this.data.Product = products.map(product => {
                if (typeof product.toJSON === 'function') {
                    return product.toJSON();
                } else if (product.ProductID !== undefined) {
                    // Already a raw object, ensure all required fields exist
                    return {
                        ProductID: product.ProductID,
                        Name: product.Name || product.name,
                        Description: product.Description || product.description,
                        Price: product.Price || product.price,
                        Category: product.Category || product.category,
                        Type: product.Type || product.type || 'Consumable',
                        AvailableStock: product.AvailableStock || product.availableStock,
                        Supplier: product.Supplier || product.supplier,
                        Image: product.Image || product.image || ''
                    };
                }
                return product;
            });
            
            // In a real application, this would send data to a server
            // For now, we'll store in localStorage as a demonstration
            this.saveToLocalStorage('store_database', this.data);
            
            console.log("Products saved to local storage");
            return {
                success: true,
                message: "Products saved successfully"
            };
        } catch (error) {
            console.error("Error saving products:", error);
            return {
                success: false,
                message: `Error saving products: ${error.message}`
            };
        }
    }

    /**
     * Save data to browser's localStorage
     * @param {string} key - Storage key
     * @param {Object} data - Data to store
     */
    saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error("Error saving to localStorage:", error);
        }
    }

    /**
     * Load data from browser's localStorage
     * @param {string} key - Storage key
     * @returns {Object|null} Stored data or null if not found
     */
    loadFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error("Error loading from localStorage:", error);
            return null;
        }
    }

    /**
     * Clear localStorage data
     * @param {string} key - Storage key to clear (optional)
     */
    clearLocalStorage(key = null) {
        try {
            if (key) {
                localStorage.removeItem(key);
            } else {
                localStorage.clear();
            }
        } catch (error) {
            console.error("Error clearing localStorage:", error);
        }
    }

    /**
     * Validate product data integrity
     * @param {Object} product - Product object to validate
     * @returns {boolean} True if product data is valid
     */
    isValidProduct(product) {
        return product &&
            product.ProductID !== undefined &&
            product.Name &&
            product.Price !== undefined &&
            typeof product.AvailableStock === 'number' &&
            product.Supplier;
    }

    /**
     * Initialize the system with data
     * Prioritizes localStorage (user changes) over Database.json (default data)
     * @returns {Promise<Object>} Initialization result
     */
    async initialize() {
        try {
            // FIRST: Check if user has modified data in localStorage
            // If localStorage has data, it means user has made changes (add/edit/delete)
            const cachedData = this.loadFromLocalStorage('store_database');
            if (cachedData && cachedData.Product && cachedData.Product.length > 0) {
                // Validate the cached data
                const allValid = cachedData.Product.every(p => this.isValidProduct(p));
                if (allValid) {
                    this.data = cachedData;
                    console.log("Loaded from localStorage (user changes) - Total products:", this.data.Product.length);
                } else {
                    // Corrupted data detected, clear and reload from Database.json
                    console.warn("Corrupted data detected in localStorage, reloading from Database.json");
                    localStorage.removeItem('store_database');
                    await this.loadDatabase();
                    this.saveToLocalStorage('store_database', this.data);
                }
            } else {
                // SECOND: Load fresh from Database.json only if no cached changes
                await this.loadDatabase();
                this.saveToLocalStorage('store_database', this.data);
                console.log("Loaded fresh from Database.json - Total products:", this.data.Product.length);
            }

            const products = this.convertToProductObjects(this.data.Product || []);
            return {
                success: true,
                products: products,
                customers: this.data.CustomerAccounts || [],
                admins: this.data.AdminAccounts || []
            };
        } catch (error) {
            console.error("Error during initialization:", error);
            return {
                success: false,
                message: error.message,
                products: [],
                customers: [],
                admins: []
            };
        }
    }

    /**
     * Get current data
     * @returns {Object} Current database data
     */
    getCurrentData() {
        return this.data;
    }
}

// Create global database manager instance
const dbManager = new DatabaseManager();
