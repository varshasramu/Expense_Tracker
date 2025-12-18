// category.js - COMPLETE CATEGORY MANAGEMENT

// ===== GLOBAL CATEGORY STATE =====
let selectedCategoryId = null;

// ===== INITIALIZE CATEGORIES =====
function initCategories() {
    console.log('🔄 Initializing categories...');
    
    // Make sure categories exist
    if (!window.categories || window.categories.length === 0) {
        console.error('❌ No categories found! Loading default categories...');
        loadDefaultCategories();
    }
    
    console.log('✅ Categories loaded:', window.categories.length);
    
    // Setup category selection
    setupCategorySelection();
    
    // Update categories view
    updateCategoriesView();
}

// ===== CATEGORY SELECTION FOR QUICK ADD =====
function setupCategorySelection() {
    console.log('Setting up category selection...');
    
    const container = document.getElementById('quick-category-buttons');
    if (!container) {
        console.error('❌ Category container not found!');
        return;
    }
    
    // Clear container
    container.innerHTML = '';
    
    // Create category buttons
    window.categories.forEach((category, index) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category-selector-item';
        categoryDiv.dataset.categoryId = category.id;
        categoryDiv.innerHTML = `
            <div class="category-icon">${category.icon}</div>
            <div class="category-name">${category.name}</div>
        `;
        
        // Add click event
        categoryDiv.addEventListener('click', function() {
            selectCategory(this.dataset.categoryId);
        });
        
        // Select first category by default
        if (index === 0 && !selectedCategoryId) {
            categoryDiv.classList.add('selected');
            selectedCategoryId = category.id;
        }
        
        // If this category is selected
        if (category.id === selectedCategoryId) {
            categoryDiv.classList.add('selected');
        }
        
        container.appendChild(categoryDiv);
    });
    
    console.log('✅ Category selection setup complete');
}

// ===== SELECT CATEGORY FUNCTION =====
function selectCategory(categoryId) {
    console.log('Selecting category:', categoryId);
    
    // Update selected category ID
    selectedCategoryId = categoryId;
    
    // Remove selected class from all
    document.querySelectorAll('.category-selector-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Add selected class to clicked category
    const selectedElement = document.querySelector(`.category-selector-item[data-category-id="${categoryId}"]`);
    if (selectedElement) {
        selectedElement.classList.add('selected');
    }
    
    console.log('✅ Category selected:', categoryId);
}

// ===== GET SELECTED CATEGORY =====
function getSelectedCategory() {
    if (!selectedCategoryId && window.categories && window.categories.length > 0) {
        selectedCategoryId = window.categories[0].id;
    }
    return selectedCategoryId;
}

// ===== CATEGORIES VIEW =====
function updateCategoriesView() {
    const container = document.getElementById('all-categories-list');
    if (!container || !window.categories) return;
    
    // Count expenses per category
    const categoryCounts = {};
    if (window.expenses) {
        window.expenses.forEach(expense => {
            categoryCounts[expense.category] = (categoryCounts[expense.category] || 0) + 1;
        });
    }
    
    container.innerHTML = '';
    
    window.categories.forEach(category => {
        const count = categoryCounts[category.id] || 0;
        
        const item = document.createElement('div');
        item.className = 'category-list-item';
        item.style.borderLeftColor = category.color;
        item.innerHTML = `
            <div class="category-list-color" style="background: ${category.color}"></div>
            <div class="category-list-name">
                ${category.icon} ${category.name}
            </div>
            <div class="category-list-count">${count}</div>
        `;
        
        container.appendChild(item);
    });
    
    console.log('✅ Categories view updated');
}

// ===== ADD CUSTOM CATEGORY =====
function addCustomCategory() {
    const nameInput = document.getElementById('new-category-name');
    const colorInput = document.getElementById('new-category-color');
    
    if (!nameInput || !nameInput.value.trim()) {
        alert('Please enter a category name');
        return;
    }
    
    const newCategory = {
        id: 'custom-' + Date.now(),
        name: nameInput.value.trim(),
        color: colorInput.value,
        icon: '📦',
        budget: 0
    };
    
    // Add to categories
    window.categories.push(newCategory);
    
    // Save to localStorage
    if (typeof saveToLocalStorage === 'function') {
        saveToLocalStorage();
    }
    
    // Clear input
    nameInput.value = '';
    
    // Update category selection
    setupCategorySelection();
    
    // Update categories view
    updateCategoriesView();
    
    alert('✅ Category added successfully!');
}

// ===== LOAD DEFAULT CATEGORIES =====
function loadDefaultCategories() {
    const defaultCategories = [
        { id: 'food', name: 'Food & Dining', color: '#FF6B6B', icon: '🍔', budget: 0 },
        { id: 'transport', name: 'Transportation', color: '#4ECDC4', icon: '🚗', budget: 0 },
        { id: 'shopping', name: 'Shopping', color: '#FFD166', icon: '🛍️', budget: 0 },
        { id: 'entertainment', name: 'Entertainment', color: '#06D6A0', icon: '🎬', budget: 0 },
        { id: 'bills', name: 'Bills & Utilities', color: '#118AB2', icon: '💡', budget: 0 },
        { id: 'health', name: 'Health & Wellness', color: '#EF476F', icon: '🏥', budget: 0 },
        { id: 'education', name: 'Education', color: '#7209B7', icon: '📚', budget: 0 },
        { id: 'groceries', name: 'Groceries', color: '#FF9E6D', icon: '🛒', budget: 0 },
        { id: 'travel', name: 'Travel', color: '#8338EC', icon: '✈️', budget: 0 },
        { id: 'other', name: 'Other', color: '#8B8C89', icon: '📦', budget: 0 }
    ];
    
    window.categories = defaultCategories;
    console.log('✅ Default categories loaded');
}

// ===== GET CATEGORY BY ID =====
function getCategoryById(categoryId) {
    if (!window.categories || window.categories.length === 0) {
        return { id: 'other', name: 'Other', color: '#8B8C89', icon: '📦' };
    }
    
    const category = window.categories.find(c => c.id === categoryId);
    return category || window.categories.find(c => c.id === 'other') || 
           { id: 'other', name: 'Other', color: '#8B8C89', icon: '📦' };
}

// ===== GLOBAL EXPORTS =====
window.initCategories = initCategories;
window.setupCategorySelection = setupCategorySelection;
window.selectCategory = selectCategory;
window.getSelectedCategory = getSelectedCategory;
window.updateCategoriesView = updateCategoriesView;
window.addCustomCategory = addCustomCategory;
window.getCategoryById = getCategoryById;