// data.js - COMPLETE DATA MANAGEMENT

// Initialize data
let expenses = [];
let categories = [];

// Default categories
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

// Initialize app
function initializeApp() {
    loadFromLocalStorage();
    setupDefaultCategories();
    console.log('App initialized with', categories.length, 'categories and', expenses.length, 'expenses');
}

// Load from localStorage
function loadFromLocalStorage() {
    try {
        const savedExpenses = localStorage.getItem('smartspend_expenses');
        const savedCategories = localStorage.getItem('smartspend_categories');
        
        expenses = savedExpenses ? JSON.parse(savedExpenses) : [];
        categories = savedCategories ? JSON.parse(savedCategories) : [];
        
        console.log('Loaded:', expenses.length, 'expenses,', categories.length, 'categories');
    } catch (error) {
        console.error('Error loading:', error);
        expenses = [];
        categories = [];
    }
}

// Save to localStorage
function saveToLocalStorage() {
    localStorage.setItem('smartspend_expenses', JSON.stringify(expenses));
    localStorage.setItem('smartspend_categories', JSON.stringify(categories));
}

// Setup default categories
function setupDefaultCategories() {
    if (categories.length === 0) {
        categories = [...defaultCategories];
        saveToLocalStorage();
        console.log('Default categories set');
    }
}

// Add expense
function addExpense(expenseData) {
    const amount = parseFloat(expenseData.amount);
    
    if (isNaN(amount) || amount <= 0) {
        showToast('Enter valid amount', 'error');
        return false;
    }
    
    const expense = {
        id: Date.now().toString(),
        amount: amount,
        description: expenseData.description.trim(),
        category: expenseData.category || 'other',
        date: expenseData.date || getCurrentDateString(),
        note: expenseData.note || '',
        createdAt: new Date().toISOString()
    };
    
    expenses.unshift(expense);
    saveToLocalStorage();
    showToast('Expense saved!', 'success');
    
    // Update displays
    if (typeof updateAllDisplays === 'function') {
        updateAllDisplays();
    }
    
    return true;
}

// Get expenses for date
function getExpensesForDate(dateString) {
    return expenses.filter(e => e.date === dateString);
}

// Get expenses for month
function getExpensesForMonth(year, month) {
    return expenses.filter(expense => {
        const d = new Date(expense.date);
        return d.getFullYear() === year && d.getMonth() === month;
    });
}

// Get expenses for year
function getExpensesForYear(year) {
    return expenses.filter(expense => {
        const d = new Date(expense.date);
        return d.getFullYear() === year;
    });
}

// Get total for date
function getTotalForDate(dateString) {
    return getExpensesForDate(dateString).reduce((sum, e) => sum + e.amount, 0);
}

// Get today total
function getTodayTotal() {
    return getTotalForDate(getCurrentDateString());
}

// Get month total
function getCurrentMonthTotal() {
    const now = new Date();
    return getExpensesForMonth(now.getFullYear(), now.getMonth())
        .reduce((sum, e) => sum + e.amount, 0);
}

// Get year total
function getYearTotal(year) {
    return getExpensesForYear(year).reduce((sum, e) => sum + e.amount, 0);
}

// Get category totals
function getCategoryTotals(expensesList) {
    const totals = {};
    expensesList.forEach(e => {
        totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return totals;
}

// Get category by ID
function getCategoryById(categoryId) {
    return categories.find(c => c.id === categoryId) || categories.find(c => c.id === 'other') || 
           { id: 'other', name: 'Other', color: '#8B8C89', icon: '📦' };
}

// Get category name
function getCategoryName(categoryId) {
    const cat = getCategoryById(categoryId);
    return cat ? cat.name : 'Other';
}

// Get category color
function getCategoryColor(categoryId) {
    const cat = getCategoryById(categoryId);
    return cat ? cat.color : '#8B8C89';
}

// Delete expense
function deleteExpense(id) {
    if (confirm('Delete this expense?')) {
        expenses = expenses.filter(e => e.id !== id);
        saveToLocalStorage();
        showToast('Expense deleted', 'success');
        
        if (typeof updateAllDisplays === 'function') {
            updateAllDisplays();
        }
    }
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount || 0);
}

// Get current date string
function getCurrentDateString() {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}

// Show toast
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) {
        console.log('Toast:', message);
        return;
    }
    
    toast.textContent = message;
    toast.className = 'toast ' + type;
    
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Get all expenses
function getAllExpenses() {
    return expenses;
}

// Get all categories
function getAllCategories() {
    return categories;
}

// Add category
function addCategory(category) {
    categories.push(category);
    saveToLocalStorage();
    return true;
}

// Update category
function updateCategory(categoryId, updates) {
    const index = categories.findIndex(c => c.id === categoryId);
    if (index !== -1) {
        categories[index] = { ...categories[index], ...updates };
        saveToLocalStorage();
        return true;
    }
    return false;
}

// Delete category
function deleteCategory(categoryId) {
    categories = categories.filter(c => c.id !== categoryId);
    saveToLocalStorage();
    return true;
}

// Get expenses count by category
function getExpensesCountByCategory(categoryId) {
    return expenses.filter(e => e.category === categoryId).length;
}

// Get monthly totals
function getMonthlyTotals(year) {
    const monthlyTotals = new Array(12).fill(0);
    const yearExpenses = getExpensesForYear(year);
    
    yearExpenses.forEach(expense => {
        const month = new Date(expense.date).getMonth();
        monthlyTotals[month] += expense.amount;
    });
    
    return monthlyTotals;
}

// Get daily totals for month
function getDailyTotals(year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dailyTotals = new Array(daysInMonth).fill(0);
    const monthExpenses = getExpensesForMonth(year, month);
    
    monthExpenses.forEach(expense => {
        const day = new Date(expense.date).getDate();
        if (day >= 1 && day <= daysInMonth) {
            dailyTotals[day - 1] += expense.amount;
        }
    });
    
    return dailyTotals;
}

// Make functions global
window.initializeApp = initializeApp;
window.addExpense = addExpense;
window.getExpensesForDate = getExpensesForDate;
window.getExpensesForMonth = getExpensesForMonth;
window.getExpensesForYear = getExpensesForYear;
window.getTotalForDate = getTotalForDate;
window.getTodayTotal = getTodayTotal;
window.getCurrentMonthTotal = getCurrentMonthTotal;
window.getYearTotal = getYearTotal;
window.getCategoryTotals = getCategoryTotals;
window.getCategoryById = getCategoryById;
window.getCategoryName = getCategoryName;
window.getCategoryColor = getCategoryColor;
window.deleteExpense = deleteExpense;
window.formatCurrency = formatCurrency;
window.getCurrentDateString = getCurrentDateString;
window.showToast = showToast;
window.getAllExpenses = getAllExpenses;
window.getAllCategories = getAllCategories;
window.addCategory = addCategory;
window.updateCategory = updateCategory;
window.deleteCategory = deleteCategory;
window.getExpensesCountByCategory = getExpensesCountByCategory;
window.getMonthlyTotals = getMonthlyTotals;
window.getDailyTotals = getDailyTotals;
window.expenses = expenses;
window.categories = categories;
window.saveToLocalStorage = saveToLocalStorage;