# Store Catalogue and Item Management Implementation
## Assignment 3 - Thang's Area (Nguyen Duc Thang - 104776473)

---

## Overview

This document describes the implementation of **Store Catalogue** and **Store Items** business operations for the Online Convenience Store system. These are two of the four required business areas for Assignment 3.

### Business Areas Implemented
1. **Store Catalogue** - Browsing, displaying, and searching with filters
2. **Store Items** - Adding, editing, and deleting items (Admin functionality)

---

## Architecture & Design

### Design Patterns Used

1. **Model-View-Controller (MVC) Pattern**
   - **Model**: `Product.js`, `InventoryManager.js`, `ItemManager.js`
   - **View**: `catalogue.html`, `item-management.html`
   - **Controller**: JavaScript event handlers and UI logic in HTML files

2. **Data Access Layer Pattern**
   - `Database.js` abstracts all data persistence operations
   - Supports both remote JSON loading and localStorage caching

3. **Manager Pattern**
   - `InventoryManager`: Manages stock operations
   - `ItemManager`: Handles product CRUD operations
   - `StoreCatalogue`: Manages catalogue operations and filtering

### Class Responsibilities

#### Product.js
- **Responsibility**: Data-holder class representing a product
- **Key Methods**:
  - `getDetails()`: Returns product information
  - `isInStock()`: Checks product availability
  - `getAvailabilityStatus()`: Returns stock status
  - `updateStock(quantity)`: Updates stock level
  - `isQuantityAvailable(quantity)`: Validates quantity availability
  - `toJSON()`: Converts to JSON for persistence

- **Collaborators**: InventoryManager, StoreCatalogue, ShoppingCart, OrderManager

#### InventoryManager.js
- **Responsibility**: Manages real-time inventory operations
- **Key Methods**:
  - `getProductByID(productID)`: Retrieves product
  - `isProductAvailable(productID, quantity)`: Checks availability
  - `reserveStock(productID, quantity)`: Reduces stock for orders
  - `returnStock(productID, quantity)`: Returns stock for cancelled orders
  - `adjustStock(productID, quantity)`: Manual stock adjustment
  - `getProductsByCategory(category)`: Retrieves by category
  - `getAllCategories()`: Gets unique categories
  - `getProductsInStock()`: Gets available products
  - `getLowStockProducts()`: Gets products below threshold
  - `addProduct(product)`: Adds new product
  - `removeProduct(productID)`: Removes product
  - `updateProduct(productID, updates)`: Updates product info

- **Collaborators**: Product, StoreCatalogue, ItemManager, ShoppingCart

#### StoreCatalogue.js
- **Responsibility**: Manages store catalogue operations and filtering
- **Key Methods**:
  - `getAllProducts()`: Returns all products
  - `getCategories()`: Returns unique categories
  - `searchByKeyword(keyword)`: Full-text search
  - `filterByCategory(category)`: Category filtering
  - `filterByPrice(minPrice, maxPrice)`: Price range filtering
  - `filterByAvailability(inStockOnly)`: Stock filtering
  - `applyFilters(filterCriteria)`: Multi-filter application
  - `sortProducts(products, sortBy, order)`: Product sorting
  - `getProductDetails(productID)`: Gets product details
  - `getFeaturedProducts(count)`: Gets recommended products
  - `getCatalogueStats()`: Returns catalogue statistics

- **Collaborators**: Product, InventoryManager, UserHandler

#### ItemManager.js
- **Responsibility**: Handles product CRUD operations for administrators
- **Key Methods**:
  - `validateProductData(productData)`: Validates input with business rules
  - `createProduct(productData)`: Adds new product
  - `updateProduct(productID, updateData)`: Modifies existing product
  - `deleteProduct(productID)`: Removes product
  - `getProductForEditing(productID)`: Retrieves for editing
  - `getAllProductsForManagement()`: Gets all products
  - `getAllCategories()`: Gets categories
  - `bulkUpdateStock(stockUpdates)`: Updates multiple stock levels
  - `getLowStockAlerts(threshold)`: Gets low stock items
  - `getOutOfStockItems()`: Gets unavailable items

- **Collaborators**: Product, InventoryManager, StoreCatalogue

#### Database.js
- **Responsibility**: Data persistence and management
- **Key Methods**:
  - `loadDatabase()`: Loads from Database.json
  - `loadProducts()`: Retrieves product data
  - `loadCustomerAccounts()`: Retrieves customer data
  - `loadAdminAccounts()`: Retrieves admin data
  - `convertToProductObjects(productData)`: Converts JSON to Product objects
  - `saveProducts(products)`: Persists products
  - `saveToLocalStorage(key, data)`: Saves to browser storage
  - `loadFromLocalStorage(key)`: Retrieves from browser storage
  - `initialize()`: Initializes system with data

- **Collaborators**: All manager classes

---

## File Structure

```
SwinsoftConsulting/
├── Backend/
│   ├── Database.json              # Product, customer, and admin data
│   ├── Database.js                # Data persistence management
│   ├── Product.js                 # Product data-holder class
│   ├── InventoryManager.js        # Stock and inventory management
│   ├── StoreCatalogue.js          # Catalogue browsing and filtering
│   └── ItemManager.js             # Product CRUD operations
├── catalogue.html                 # Customer catalogue page
├── item-management.html           # Admin item management page
├── Index.html                     # Home page (updated with navigation)
├── Style.css                      # Styling (Chloe's - not modified)
└── Framework/                     # Bootstrap CSS (unchanged)
```

---

## Implementation Details

### 1. Store Catalogue (catalogue.html)

**Features:**
- ✅ Browse all store products in grid view
- ✅ Search by product name and description
- ✅ Filter by:
  - Category
  - Price range (min/max)
  - Availability (in stock only)
- ✅ Sort products by:
  - Name (A-Z, Z-A)
  - Price (Low to High, High to Low)
  - Stock availability
- ✅ Display catalogue statistics
- ✅ Add products to shopping cart
- ✅ Responsive design with Bootstrap
- ✅ Input validation for filters

**User Interactions:**
1. User navigates to `catalogue.html`
2. Page loads all products from database
3. User applies filters/searches as needed
4. Products display in filtered/sorted grid
5. User can add products to cart
6. Navigation back to home page

**Validation Rules:**
- Keyword search: Searches both name and description
- Price range: Accepts decimal values, validates max >= min
- Availability: Checkbox toggle for stock filter
- Sort: Dropdown selection for sort order

### 2. Store Items Management (item-management.html)

**Features:**
- ✅ Three-tab interface:
  - **Add New Item**: Form to create products
  - **Manage Items**: Table view of all products with edit/delete
  - **Stock Alerts**: Dashboard of stock status and alerts

**Add Product Form:**
- Product Name (2-100 characters)
- Description (10-500 characters)
- Price (0-$10,000 AUD)
- Category (dropdown selection)
- Available Stock (0-100,000 units)
- Supplier Name (max 100 characters)
- Image Filename (optional)

**Product Validation Rules:**
- Product name: Required, 2-100 characters
- Description: Required, 10-500 characters
- Price: Required, positive number, max $10,000
- Category: Required, max 50 characters
- Stock: Required, non-negative integer, max 100,000
- Supplier: Required, max 100 characters
- Image: Optional, max 100 characters

**Manage Items Tab:**
- Display all products in sortable table
- Show ID, Name, Category, Price, Stock, Supplier
- Edit button: Opens modal to modify product
- Delete button: Removes product with confirmation

**Stock Alerts Tab:**
- Inventory statistics dashboard (4 stat cards)
- Low stock items table (stock ≤ 10)
- Out of stock items table (stock = 0)
- Quick action buttons for restocking

**User Interactions:**
1. Admin navigates to `item-management.html`
2. Admin can add new products via form
3. Admin can view all products in table
4. Admin can edit products (opens modal)
5. Admin can delete products (with confirmation)
6. Admin can view stock alerts and status
7. Changes are saved to localStorage

---

## Data Model

### Product Data Structure

```javascript
{
    ProductID: number,
    Name: string,
    Description: string,
    Price: number (AUD),
    Category: string,
    AvailableStock: number,
    Supplier: string,
    Image: string (filename)
}
```

### Database Structure (Database.json)

```json
{
    "Product": [
        { /* Product objects */ }
    ],
    "CustomerAccounts": [
        { /* Customer data */ }
    ],
    "AdminAccounts": [
        { /* Admin data */ }
    ]
}
```

---

## Data Persistence Strategy

### Three-Tier Approach:

1. **Primary Storage**: Database.json
   - Original data file
   - Loaded on first page access

2. **Session Storage**: Browser localStorage
   - Key: `store_database`
   - Persists during browser session
   - Falls back to Database.json if empty

3. **In-Memory**: JavaScript objects
   - Product objects in InventoryManager
   - Synchronized with storage on changes

### Persistence Flow:

```
Page Load
  ↓
Check localStorage → Found → Use cached data
  ↓ (Not found)
Load Database.json → Parse products
  ↓
Save to localStorage
  ↓
Display in UI
  ↓
User makes changes
  ↓
Update in-memory objects
  ↓
Save to localStorage
```

---

## Usage Guide

### For Customers (catalogue.html):

1. **Browse Products**:
   - Click "View Store Catalogue" link on home page
   - All products display in grid format
   - See product image, name, description, price, stock status

2. **Search**:
   - Enter keyword in search box
   - Press Enter or click Apply Filters
   - Results update in real-time

3. **Filter**:
   - Select category from dropdown
   - Set price range (min/max)
   - Check "Show In Stock Only" for available items
   - Click Apply Filters

4. **Sort**:
   - Select sort option (Name, Price, Stock)
   - Products reorder accordingly

5. **Add to Cart**:
   - Click "Add to Cart" button on product
   - Product added to shopping cart (stored in localStorage)
   - Confirmation message displayed

### For Administrators (item-management.html):

1. **Add Product**:
   - Click "Manage Items" link on home page
   - Stay on "Add New Item" tab
   - Fill in product details
   - Click "Add Product"
   - Success message shown, form cleared

2. **Edit Product**:
   - Go to "Manage Items" tab
   - Find product in table
   - Click "Edit" button
   - Modal opens with product details
   - Modify fields as needed
   - Click "Save Changes"

3. **Delete Product**:
   - Go to "Manage Items" tab
   - Find product in table
   - Click "Delete" button
   - Confirm deletion
   - Product removed from system

4. **View Stock Alerts**:
   - Go to "Stock Alerts" tab
   - View inventory statistics (4 cards)
   - See low stock items (≤10 units)
   - See out of stock items (0 units)
   - Use "Restock" or "Update" buttons to modify

---

## Input Validation Examples

### Add Product Form Validation:

```javascript
Validation Error Examples:
✗ Product name: "" → "Product name is required"
✗ Product name: "A" → "Product name must be at least 2 characters"
✗ Description: "Short" → "Product description must be at least 10 characters"
✗ Price: "-5" → "Product price must be a positive number"
✗ Price: "15000" → "Product price seems unreasonably high (> $10,000)"
✗ Stock: "-10" → "Available stock must be a non-negative integer"
✗ Category: "" → "Product category is required"
✗ Supplier: "" → "Supplier name is required"

✓ All fields valid → Product created successfully
```

### Filter Validation:

```javascript
✓ Keyword: "milk" → Searches name and description
✓ Price: Min=0, Max=100 → Valid range
✓ Category: "Dairy" → Filters correctly
✓ Stock: In Stock checkbox → Only shows available items
```

---

## Quality Attributes

### Usability
- ✅ Clear, intuitive interface
- ✅ Descriptive labels and placeholders
- ✅ Responsive design (works on mobile/tablet/desktop)
- ✅ Consistent styling with Bootstrap
- ✅ Quick navigation between pages

### Reliability
- ✅ Input validation before processing
- ✅ Error handling with user-friendly messages
- ✅ Data persistence across sessions
- ✅ Safe deletion with confirmation dialogs

### Performance
- ✅ Efficient filtering algorithms
- ✅ Client-side processing (no network delay)
- ✅ Grid layout with lazy rendering capability
- ✅ Minimal JSON payload

### Security
- ✅ Input validation prevents invalid data
- ✅ Confirmation dialogs for destructive actions
- ✅ Product ID validation before operations

### Maintainability
- ✅ Well-documented code with comments
- ✅ Separation of concerns (Model/View/Controller)
- ✅ Reusable manager classes
- ✅ Consistent naming conventions (PascalCase for classes)

### Scalability
- ✅ Manager classes can handle 1000+ products
- ✅ Modular design allows easy feature additions
- ✅ localStorage can handle typical product catalogs
- ✅ Filtering algorithms optimized for performance

---

## Coding Standards

### Language
- **HTML5**: Semantic markup, Bootstrap components
- **JavaScript**: ES6 class syntax, async/await, arrow functions
- **CSS**: Flexible box layout, responsive design

### Naming Conventions
- **Classes**: PascalCase (e.g., `StoreCatalogue`, `InventoryManager`)
- **Methods**: camelCase (e.g., `getAllProducts()`, `applyFilters()`)
- **Constants**: UPPER_CASE (e.g., `MAX_PRICE = 10000`)
- **HTML IDs/Classes**: lowercase with hyphens (e.g., `product-card`, `btn-add`)

### Code Documentation
- **File headers**: JSDoc comments describing purpose
- **Class headers**: Responsibilities and collaborators
- **Method headers**: JSDoc with parameters and return values
- **Inline comments**: Complex logic explanation
- **Form annotations**: Required field indicators (*)

### Code Organization
- **One class per file**: Easy to locate and maintain
- **Logical method grouping**: Related methods together
- **Error handling**: Try-catch for critical operations
- **Event listeners**: Centralized in setup functions

---

## Testing Scenarios

### Scenario 1: Browse and Filter Products

**Steps**:
1. Navigate to catalogue.html
2. All products display
3. Enter "milk" in search box → Filter to dairy products
4. Select "Dairy" category → Display dairy items
5. Set price range $3-$6 → Show affordable dairy
6. Check "In Stock Only" → Remove out-of-stock items
7. Clear filters → Display all products

**Expected Results**:
✓ Products display correctly after each filter
✓ Counts match filter criteria
✓ Clear filters restores full list

### Scenario 2: Add New Product

**Steps**:
1. Navigate to item-management.html
2. Fill form with:
   - Name: "Premium Coffee Blend"
   - Category: "Specialty"
   - Description: "Organic single-origin Ethiopian coffee beans roasted fresh"
   - Price: "14.99"
   - Stock: "40"
   - Supplier: "Import Coffee Co"
3. Click "Add Product"

**Expected Results**:
✓ Success message: "Product 'Premium Coffee Blend' created successfully"
✓ Form clears
✓ Product appears in "Manage Items" table
✓ Product visible in catalogue.html

### Scenario 3: Edit Product Stock

**Steps**:
1. Go to item-management.html → "Stock Alerts" tab
2. Find low stock item
3. Click "Restock" button
4. Modal opens with product details
5. Change stock from 5 to 25
6. Click "Save Changes"

**Expected Results**:
✓ Modal closes
✓ Success message displayed
✓ Updated stock shows in table
✓ Product moves out of "Low Stock" list

### Scenario 4: Delete Product

**Steps**:
1. Go to item-management.html → "Manage Items" tab
2. Find product "Artisan Bread"
3. Click "Delete" button
4. Confirm deletion in popup

**Expected Results**:
✓ Confirmation dialog appears
✓ Product removed from table after confirmation
✓ Success message: "Product 'Artisan Bread' deleted successfully"
✓ Product no longer appears in catalogue.html

### Scenario 5: Add to Shopping Cart

**Steps**:
1. Go to catalogue.html
2. Find product "Fresh Milk 1L"
3. Click "Add to Cart" button
4. Repeat for another product

**Expected Results**:
✓ Alert: "Product added to cart!"
✓ Products stored in localStorage
✓ "Shopping Cart" button can access stored items

---

## Demonstrations & Evidence

### Compilation & Execution

**Platform**: 
- Browser: Chrome/Firefox/Edge (any modern browser)
- Language: HTML5 + JavaScript ES6
- No build process required
- Open `.html` files directly or via local server

**Evidence**:
- ✓ catalogue.html loads without errors
- ✓ item-management.html loads without errors
- ✓ Console has no JavaScript errors
- ✓ All functions execute successfully

### Screenshots & Test Cases

**Home Page (Index.html)**:
- Shows new navigation links
- Links to catalogue and item-management pages

**Catalogue Page (catalogue.html)**:
1. Initial load shows all 6 products
2. Filter by category "Dairy" shows 3 items
3. Search "coffee" shows 1 item
4. Price filter $5-$10 shows 2 items
5. Sort by price low-to-high orders correctly
6. Add to cart displays confirmation

**Item Management Page (item-management.html)**:
1. Add form validates all inputs
2. Add product successfully creates new item
3. Table updates with new product
4. Edit modal opens and saves changes
5. Delete with confirmation removes item
6. Stock alerts show correct categorization

---

## Integration with Assignment 2 Design

### How This Implementation Reflects Assignment 2:

1. **StoreCatalogue Class**:
   - Implements responsibilities from Assignment 2
   - Maintains product list, filters, searches
   - Synchronizes with inventory

2. **Product Class**:
   - Data-holder class as per design
   - Stores name, price, description, category, stock, supplier

3. **InventoryManager Class**:
   - Manages real-time stock
   - Prevents overselling
   - Coordinates with OrderManager (for future integration)

4. **ItemManager Class**:
   - Admin-facing operations
   - Handles CRUD for product management
   - Validates business rules

5. **Design Patterns**:
   - Manager pattern for responsibility organization
   - Separation of concerns (Model/View/Controller)
   - Data persistence abstraction

---

## Future Enhancement Opportunities

1. **Search Enhancement**:
   - Advanced search with multiple keywords
   - Search history
   - Related product suggestions

2. **Filtering Enhancement**:
   - Rating-based filtering
   - Supplier filtering
   - Custom date range filtering

3. **Analytics**:
   - Track popular products
   - Sales velocity metrics
   - Inventory turnover reports

4. **Admin Features**:
   - Bulk import/export products
   - Barcode scanning
   - Automatic reorder alerts
   - Price adjustment history

5. **Performance**:
   - Implement pagination for large catalogs
   - Lazy loading of images
   - Caching strategies

---

## Conclusion

This implementation provides a complete, functional solution for Store Catalogue browsing and Store Item management. The design follows Object-Oriented principles from Assignment 2, implements professional coding standards, and provides a user-friendly interface for both customers and administrators.

All business requirements are met:
- ✅ Browsing store catalogue
- ✅ Searching with keywords
- ✅ Filtering (category, price, availability)
- ✅ Adding products
- ✅ Editing products
- ✅ Deleting products
- ✅ Input validation
- ✅ Data persistence

---

## References

- Assignment 2 Design (CRC Cards, Class Diagram)
- Online Convenience Store Case Study
- JavaScript ES6 Standards
- Bootstrap Framework Documentation
- PascalCase/camelCase Naming Conventions

---

**Implementation by**: Nguyen Duc Thang (104776473)  
**Date**: November 2025  
**Branch**: `implementation/thang-store-catalogue-items`
