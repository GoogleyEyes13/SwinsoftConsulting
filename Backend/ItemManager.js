/**
 * ItemManager.js
 * 
 * Manages item operations for administrators.
 * Handles Create, Read, Update, Delete (CRUD) operations for products.
 * 
 * Responsibilities:
 * - Create new products and add them to inventory
 * - Read product details
 * - Update existing product information
 * - Delete products from inventory
 * - Validate product data
 * - Maintain data persistence
 * 
 * Collaborators: Product, InventoryManager, StoreCatalogue
 */

class ItemManager {
    /**
     * Constructor for ItemManager
     * @param {InventoryManager} inventoryManager - Reference to InventoryManager
     * @param {StoreCatalogue} storeCatalogue - Reference to StoreCatalogue
     */
    constructor(inventoryManager, storeCatalogue) {
        this.inventoryManager = inventoryManager;
        this.storeCatalogue = storeCatalogue;
        this.lastProductID = this.getMaxProductID();
    }

    /**
     * Get the maximum product ID currently in use
     * @returns {number} Maximum product ID
     */
    getMaxProductID() {
        const products = this.inventoryManager.getAllProducts();
        if (products.length === 0) return 0;
        return Math.max(...products.map(p => p.productID));
    }

    /**
     * Validate product data before creation/update
     * @param {Object} productData - Product data to validate
     * @returns {Object} Validation result {valid: boolean, errors: Array}
     */
    validateProductData(productData) {
        const errors = [];

        // Validate name
        if (!productData.name || productData.name.trim() === "") {
            errors.push("Product name is required");
        } else if (productData.name.length < 2) {
            errors.push("Product name must be at least 2 characters");
        } else if (productData.name.length > 100) {
            errors.push("Product name must not exceed 100 characters");
        }

        // Validate description
        if (!productData.description || productData.description.trim() === "") {
            errors.push("Product description is required");
        } else if (productData.description.length < 10) {
            errors.push("Product description must be at least 10 characters");
        } else if (productData.description.length > 500) {
            errors.push("Product description must not exceed 500 characters");
        }

        // Validate price
        if (productData.price === undefined || productData.price === null) {
            errors.push("Product price is required");
        } else {
            const price = parseFloat(productData.price);
            if (isNaN(price) || price < 0) {
                errors.push("Product price must be a positive number");
            } else if (price > 10000) {
                errors.push("Product price seems unreasonably high (> $10,000)");
            }
        }

        // Validate category
        if (!productData.category || productData.category.trim() === "") {
            errors.push("Product category is required");
        } else if (productData.category.length > 50) {
            errors.push("Product category must not exceed 50 characters");
        }

        // Validate type
        if (!productData.type || productData.type.trim() === "") {
            errors.push("Product type is required");
        } else if (productData.type.length > 50) {
            errors.push("Product type must not exceed 50 characters");
        }

        // Validate stock
        if (productData.availableStock === undefined || productData.availableStock === null) {
            errors.push("Available stock is required");
        } else {
            const stock = parseInt(productData.availableStock);
            if (isNaN(stock) || stock < 0) {
                errors.push("Available stock must be a non-negative integer");
            } else if (stock > 100000) {
                errors.push("Available stock seems unreasonably high (> 100,000)");
            }
        }

        // Validate supplier
        if (!productData.supplier || productData.supplier.trim() === "") {
            errors.push("Supplier name is required");
        } else if (productData.supplier.length > 100) {
            errors.push("Supplier name must not exceed 100 characters");
        }

        // Validate image (optional)
        if (productData.image && productData.image.length > 100) {
            errors.push("Image filename must not exceed 100 characters");
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Create a new product
     * @param {Object} productData - Product information object
     *        productData.name - Product name
     *        productData.description - Product description
     *        productData.price - Product price (number)
     *        productData.category - Product category
     *        productData.availableStock - Initial stock quantity
     *        productData.supplier - Supplier name
     *        productData.image - Image filename (optional)
     * @returns {Object} Result {success: boolean, message: string, productID: number}
     */
    createProduct(productData) {
        // Validate data
        const validation = this.validateProductData(productData);
        if (!validation.valid) {
            return {
                success: false,
                message: "Validation failed: " + validation.errors.join("; "),
                errors: validation.errors
            };
        }

        try {
            // Generate new product ID
            this.lastProductID++;
            const newProductID = this.lastProductID;

            // Create new product
            const newProduct = new Product(
                newProductID,
                productData.name.trim(),
                productData.description.trim(),
                parseFloat(productData.price),
                productData.category.trim(),
                productData.type.trim(),
                parseInt(productData.availableStock),
                productData.supplier.trim(),
                productData.image ? productData.image.trim() : ""
            );

            // Add to inventory
            if (this.inventoryManager.addProduct(newProduct)) {
                // PERSIST TO LOCALSTORAGE after adding
                dbManager.saveProducts(this.inventoryManager.getAllProducts());
                return {
                    success: true,
                    message: `Product "${newProduct.name}" created successfully with ID ${newProductID}`,
                    productID: newProductID
                };
            } else {
                return {
                    success: false,
                    message: "Failed to add product to inventory"
                };
            }
        } catch (error) {
            return {
                success: false,
                message: `Error creating product: ${error.message}`
            };
        }
    }

    /**
     * Update an existing product
     * @param {number} productID - Product ID to update
     * @param {Object} updateData - Fields to update
     * @returns {Object} Result {success: boolean, message: string}
     */
    updateProduct(productID, updateData) {
        const product = this.inventoryManager.getProductByID(productID);
        if (!product) {
            return {
                success: false,
                message: `Product with ID ${productID} not found`
            };
        }

        // Create validation data with current values as defaults
        const productData = {
            name: updateData.name !== undefined ? updateData.name : product.name,
            description: updateData.description !== undefined ? updateData.description : product.description,
            price: updateData.price !== undefined ? updateData.price : product.price,
            category: updateData.category !== undefined ? updateData.category : product.category,
            type: updateData.type !== undefined ? updateData.type : product.type,
            availableStock: updateData.availableStock !== undefined ? updateData.availableStock : product.availableStock,
            supplier: updateData.supplier !== undefined ? updateData.supplier : product.supplier,
            image: updateData.image !== undefined ? updateData.image : product.image
        };

        // Validate data
        const validation = this.validateProductData(productData);
        if (!validation.valid) {
            return {
                success: false,
                message: "Validation failed: " + validation.errors.join("; "),
                errors: validation.errors
            };
        }

        try {
            // Update product
            const updates = {};
            if (updateData.name !== undefined) updates.name = updateData.name.trim();
            if (updateData.description !== undefined) updates.description = updateData.description.trim();
            if (updateData.price !== undefined) updates.price = parseFloat(updateData.price);
            if (updateData.category !== undefined) updates.category = updateData.category.trim();
            if (updateData.type !== undefined) updates.type = updateData.type.trim();
            if (updateData.supplier !== undefined) updates.supplier = updateData.supplier.trim();
            if (updateData.image !== undefined) updates.image = updateData.image.trim();

            if (this.inventoryManager.updateProduct(productID, updates)) {
                // Handle stock updates separately if needed
                if (updateData.availableStock !== undefined) {
                    const currentStock = product.availableStock;
                    const newStock = parseInt(updateData.availableStock);
                    const difference = newStock - currentStock;
                    this.inventoryManager.adjustStock(productID, difference);
                }

                // PERSIST TO LOCALSTORAGE after updating
                dbManager.saveProducts(this.inventoryManager.getAllProducts());
                return {
                    success: true,
                    message: `Product "${product.name}" updated successfully`
                };
            } else {
                return {
                    success: false,
                    message: "Failed to update product"
                };
            }
        } catch (error) {
            return {
                success: false,
                message: `Error updating product: ${error.message}`
            };
        }
    }

    /**
     * Delete a product
     * @param {number} productID - Product ID to delete
     * @returns {Object} Result {success: boolean, message: string}
     */
    deleteProduct(productID) {
        const product = this.inventoryManager.getProductByID(productID);
        if (!product) {
            return {
                success: false,
                message: `Product with ID ${productID} not found`
            };
        }

        const productName = product.name;

        try {
            if (this.inventoryManager.removeProduct(productID)) {
                // PERSIST TO LOCALSTORAGE after deleting
                dbManager.saveProducts(this.inventoryManager.getAllProducts());
                return {
                    success: true,
                    message: `Product "${productName}" deleted successfully`
                };
            } else {
                return {
                    success: false,
                    message: "Failed to delete product"
                };
            }
        } catch (error) {
            return {
                success: false,
                message: `Error deleting product: ${error.message}`
            };
        }
    }

    /**
     * Get product details for editing
     * @param {number} productID - Product ID
     * @returns {Object|null} Product data or null if not found
     */
    getProductForEditing(productID) {
        const product = this.inventoryManager.getProductByID(productID);
        if (!product) return null;

        return {
            productID: product.productID,
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            type: product.type,
            availableStock: product.availableStock,
            supplier: product.supplier,
            image: product.image
        };
    }

    /**
     * Get all products for management view
     * @returns {Array} Array of all products
     */
    getAllProductsForManagement() {
        return this.inventoryManager.getAllProducts();
    }

    /**
     * Get all categories for dropdown selection
     * @returns {Array} Array of category names
     */
    getAllCategories() {
        return this.inventoryManager.getAllCategories();
    }

    /**
     * Get all product types for dropdown selection
     * @returns {Array} Array of product type names
     */
    getAllTypes() {
        return this.inventoryManager.getAllTypes();
    }

    /**
     * Add a new category (or just get existing ones)
     * @param {string} category - Category name
     * @returns {Array} Updated list of all categories
     */
    getCategories() {
        return this.getAllCategories();
    }

    /**
     * Perform bulk stock update
     * @param {Object} stockUpdates - Object with productID as key and quantity change as value
     * @returns {Object} Result with success and updated items
     */
    bulkUpdateStock(stockUpdates) {
        const results = [];

        for (const [productID, quantity] of Object.entries(stockUpdates)) {
            const result = this.inventoryManager.adjustStock(parseInt(productID), quantity);
            const product = this.inventoryManager.getProductByID(parseInt(productID));
            results.push({
                productID: parseInt(productID),
                productName: product ? product.name : "Unknown",
                success: result
            });
        }

        return {
            success: results.every(r => r.success),
            updated: results
        };
    }

    /**
     * Get low stock alert items
     * @param {number} threshold - Stock level threshold
     * @returns {Array} Products below threshold
     */
    getLowStockAlerts(threshold = 10) {
        return this.inventoryManager.getAllProducts().filter(product => 
            product.availableStock <= threshold && product.availableStock > 0
        );
    }

    /**
     * Get out of stock items
     * @returns {Array} Products with zero stock
     */
    getOutOfStockItems() {
        return this.inventoryManager.getAllProducts().filter(product => 
            product.availableStock === 0
        );
    }
}
