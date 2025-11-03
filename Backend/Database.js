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
     * @param {Array} products - Array of Product objects
     * @returns {Object} Save result {success: boolean, message: string}
     */
    async saveProducts(products) {
        try {
            // Convert products to JSON format
            this.data.Product = products.map(product => product.toJSON());
            
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
     * Initialize the system with data
     * Prioritizes localStorage (user changes) over Database.json (default data)
     * @returns {Promise<Object>} Initialization result
     */
    async initialize() {
        try {
            // FIRST: Check if user has modified data in localStorage
            // If localStorage has data, it means user has made changes (add/edit/delete)
            const cachedData = this.loadFromLocalStorage('store_database');
            if (cachedData) {
                this.data = cachedData;
                console.log("Loaded from localStorage (user changes) - Total products:", this.data.Product.length);
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
