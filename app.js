// app.js - MAIN APPLICATION CONTROLLER (COMPLETE VERSION)

// ===== GLOBAL STATE =====
let currentView = 'quick-add';
let monthlyYear = new Date().getFullYear();
let appInitialized = false;

// ===== MAIN INITIALIZATION =====
function initApp() {
    console.log('🚀 SmartSpend Initializing...');
    
    if (appInitialized) {
        console.log('App already initialized');
        return;
    }
    
    // 1. FIRST: Initialize data system (MOST IMPORTANT)
    if (typeof initializeApp === 'function') {
        console.log('Initializing data system...');
        initializeApp();
        
        // Wait for data to load
        setTimeout(checkDataAndInitialize, 100);
    } else {
        console.error('initializeApp function not found!');
        alert('Critical error: Data system not found. Please refresh the page.');
    }
}

function checkDataAndInitialize() {
    console.log('Checking if data is loaded...');
    
    // Check if categories and expenses are available
    if (window.categories && window.categories.length > 0) {
        console.log('✅ Data loaded successfully:', {
            categories: window.categories.length,
            expenses: window.expenses ? window.expenses.length : 0
        });
        
        setupUI();
        appInitialized = true;
    } else {
        console.log('Data not loaded yet, retrying...');
        
        // Try to load default categories if none exist
        if (!window.categories || window.categories.length === 0) {
            console.log('Loading default categories...');
            loadDefaultCategories();
        }
        
        // Try again in 100ms
        setTimeout(checkDataAndInitialize, 100);
    }
}

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
    
    // Save to localStorage
    if (typeof saveToLocalStorage === 'function') {
        saveToLocalStorage();
    }
    
    console.log('✅ Default categories loaded');
}

function setupUI() {
    console.log('Setting up UI...');
    
    // 1. Set today's date in the date picker
    const dateField = document.getElementById('qa-date');
    if (dateField) {
        const today = new Date();
        const dateString = today.toISOString().split('T')[0];
        dateField.value = dateString;
        console.log('Date field set to:', dateString);
    }
    
    // 2. Initialize category system IMMEDIATELY
    if (typeof initCategorySystem === 'function') {
        console.log('Initializing category system...');
        initCategorySystem();
    } else {
        console.error('initCategorySystem function not found!');
        // Try to setup categories manually
        setupCategoriesManually();
    }
    
    // 3. Update top bar stats
    updateTopBar();
    
    // 4. Set default view
    switchView('quick-add');
    
    // 5. Initialize reports if needed
    if (typeof initReports === 'function') {
        initReports();
    }
    
    // 6. Show success message
    console.log('✅ App setup complete!');
    
    // Update any visible views
    updateVisibleView();
}

function setupCategoriesManually() {
    console.log('Setting up categories manually...');
    
    const container = document.getElementById('quick-category-buttons');
    if (!container || !window.categories) {
        console.log('Container or categories not available');
        return;
    }
    
    container.innerHTML = '';
    
    window.categories.forEach((category, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'category-btn';
        button.dataset.categoryId = category.id;
        
        button.innerHTML = `
            <div class="category-btn-content">
                <div class="category-btn-icon" style="color: ${category.color}">${category.icon}</div>
                <div class="category-btn-name">${category.name}</div>
            </div>
        `;
        
        button.onclick = function() {
            // Remove selected from all
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            // Add selected to clicked
            this.classList.add('selected');
            window.selectedCategoryId = this.dataset.categoryId;
        };
        
        // Select first by default
        if (index === 0) {
            button.classList.add('selected');
            window.selectedCategoryId = category.id;
        }
        
        container.appendChild(button);
    });
    
    console.log('Categories setup manually');
}

function updateVisibleView() {
    if (currentView === 'today') {
        updateTodayView();
    } else if (currentView === 'monthly') {
        updateMonthlyView();
    } else if (currentView === 'categories') {
        updateCategoriesView();
    } else if (currentView === 'reports') {
        if (typeof updateReport === 'function') {
            updateReport();
        }
    }
}

// ===== QUICK ADD FUNCTIONS =====
function saveQuickExpense() {
    console.log('Attempting to save expense...');
    
    // Get form values
    const amountInput = document.getElementById('qa-amount');
    const descriptionInput = document.getElementById('qa-description');
    const dateInput = document.getElementById('qa-date');
    
    if (!amountInput || !descriptionInput) {
        console.error('Form inputs not found');
        showError('Form error. Please refresh the page.');
        return;
    }
    
    const amount = parseFloat(amountInput.value);
    const description = descriptionInput.value.trim();
    const date = dateInput ? dateInput.value : getCurrentDateString();
    
    // Validate
    if (isNaN(amount) || amount <= 0) {
        showError('Please enter a valid amount greater than 0');
        amountInput.focus();
        return;
    }
    
    if (!description) {
        showError('Please enter a description');
        descriptionInput.focus();
        return;
    }
    
    // Get category - handle multiple ways
    let categoryId = 'other';
    
    // Try to get from selectedCategoryId global
    if (window.selectedCategoryId) {
        categoryId = window.selectedCategoryId;
    }
    // Try to get from selected button
    else {
        const selectedBtn = document.querySelector('.category-btn.selected');
        if (selectedBtn && selectedBtn.dataset.categoryId) {
            categoryId = selectedBtn.dataset.categoryId;
        }
        // Fallback to first category
        else if (window.categories && window.categories.length > 0) {
            categoryId = window.categories[0].id;
        }
    }
    
    console.log('Saving with category:', categoryId);
    
    // Create expense object
    const expenseData = {
        amount: amount,
        description: description,
        category: categoryId,
        date: date,
        note: '',
        createdAt: new Date().toISOString()
    };
    
    // Save expense
    if (typeof addExpense === 'function') {
        const success = addExpense(expenseData);
        
        if (success) {
            // Clear form
            amountInput.value = '';
            descriptionInput.value = '';
            
            // Show success
            showSuccess('Expense saved successfully!');
            
            // Focus on amount
            setTimeout(() => {
                amountInput.focus();
            }, 100);
            
            // Update views
            updateTopBar();
            if (currentView === 'today') updateTodayView();
            if (currentView === 'monthly') updateMonthlyView();
            if (currentView === 'categories') updateCategoriesView();
            if (currentView === 'reports' && typeof updateReport === 'function') {
                updateReport();
            }
            
        } else {
            showError('Failed to save expense');
        }
    } else {
        console.error('addExpense function not available');
        showError('System error. Please refresh the page.');
    }
}

function clearQuickAddForm() {
    const amountInput = document.getElementById('qa-amount');
    const descriptionInput = document.getElementById('qa-description');
    
    if (amountInput) amountInput.value = '';
    if (descriptionInput) descriptionInput.value = '';
    
    // Set date to today
    const dateInput = document.getElementById('qa-date');
    if (dateInput) {
        const today = new Date();
        dateInput.value = today.toISOString().split('T')[0];
    }
    
    // Focus on amount
    if (amountInput) {
        amountInput.focus();
    }
}

// ===== VIEW MANAGEMENT =====
function switchView(viewName) {
    console.log('Switching to view:', viewName);
    
    // Update current view
    currentView = viewName;
    
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected view
    const viewElement = document.getElementById(viewName + '-view');
    if (viewElement) {
        viewElement.classList.add('active');
        
        // Update nav
        const navItem = document.querySelector(`.nav-item[href="#${viewName}"]`);
        if (navItem) navItem.classList.add('active');
        
        // Load view data
        loadViewData(viewName);
    }
}

function loadViewData(viewName) {
    console.log('Loading data for view:', viewName);
    
    switch(viewName) {
        case 'quick-add':
            // Ensure categories are loaded
            if (!document.querySelector('.category-btn.selected')) {
                setupCategoriesManually();
            }
            break;
        case 'today':
            updateTodayView();
            break;
        case 'monthly':
            updateMonthlyView();
            break;
        case 'reports':
            if (typeof updateReport === 'function') {
                updateReport();
            }
            break;
        case 'categories':
            updateCategoriesView();
            break;
    }
}

// ===== TODAY VIEW =====
function updateTodayView() {
    try {
        const today = getCurrentDateString();
        const expenses = getExpensesForDate(today);
        const total = expenses.reduce((sum, e) => sum + e.amount, 0);
        
        // Update stats
        document.getElementById('today-full-total').textContent = formatCurrency(total);
        document.getElementById('today-full-count').textContent = expenses.length;
        
        // Calculate categories count
        const categories = new Set();
        expenses.forEach(expense => {
            categories.add(expense.category);
        });
        document.getElementById('today-categories-count').textContent = categories.size;
        
        // Update date display
        const todayDate = new Date();
        const dateDisplay = document.getElementById('today-date-display');
        if (dateDisplay) {
            dateDisplay.textContent = todayDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        
        // Update list
        const container = document.getElementById('today-expenses-full-list');
        if (!container) return;
        
        if (expenses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-sun fa-3x"></i>
                    <h3>No expenses today</h3>
                    <p>Add your first expense using Quick Add!</p>
                </div>
            `;
        } else {
            container.innerHTML = '';
            expenses.forEach(expense => {
                const category = getCategoryById(expense.category);
                const time = expense.createdAt ? 
                    new Date(expense.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
                    '';
                
                const item = document.createElement('div');
                item.className = 'expense-item';
                item.innerHTML = `
                    <div class="expense-info">
                        <div class="expense-icon" style="background: ${category.color}20; color: ${category.color}">
                            ${category.icon}
                        </div>
                        <div class="expense-details">
                            <h4>${expense.description}</h4>
                            <p>${category.name} ${time ? '• ' + time : ''}</p>
                        </div>
                    </div>
                    <div class="expense-amount">${formatCurrency(expense.amount)}</div>
                    <div class="expense-actions">
                        <button class="action-btn delete" onclick="deleteExpense('${expense.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                container.appendChild(item);
            });
        }
    } catch (error) {
        console.error('Error in updateTodayView:', error);
        const container = document.getElementById('today-expenses-full-list');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle fa-3x"></i>
                    <h3>Error loading expenses</h3>
                    <p>Please refresh the page</p>
                </div>
            `;
        }
    }
}

// ===== MONTHLY VIEW =====
function updateMonthlyView() {
    try {
        // Update year display
        document.getElementById('monthly-year').textContent = monthlyYear;
        
        // Update summary
        updateYearSummary();
        
        // Update grid
        updateMonthlyGrid();
    } catch (error) {
        console.error('Error in updateMonthlyView:', error);
    }
}

function updateMonthlyGrid() {
    const container = document.getElementById('months-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    
    monthNames.forEach((month, index) => {
        const expenses = getExpensesForMonth(monthlyYear, index);
        const total = expenses.reduce((sum, e) => sum + e.amount, 0);
        const isCurrent = monthlyYear === today.getFullYear() && index === today.getMonth();
        
        const card = document.createElement('div');
        card.className = 'month-card';
        if (isCurrent) card.classList.add('current-month');
        
        card.innerHTML = `
            <div class="month-name">${month}</div>
            <div class="month-total">${formatCurrency(total)}</div>
            <div class="month-expenses">${expenses.length} expenses</div>
        `;
        
        // Add click event to view month details
        card.addEventListener('click', function() {
            viewMonthDetails(monthlyYear, index, month);
        });
        
        container.appendChild(card);
    });
}

function updateYearSummary() {
    try {
        const expenses = getExpensesForYear(monthlyYear);
        const total = expenses.reduce((sum, e) => sum + e.amount, 0);
        document.getElementById('year-total-amount').textContent = formatCurrency(total);
    } catch (error) {
        console.error('Error updating year summary:', error);
        document.getElementById('year-total-amount').textContent = '$0.00';
    }
}

function prevMonthlyYear() {
    monthlyYear--;
    updateMonthlyView();
}

function nextMonthlyYear() {
    monthlyYear++;
    updateMonthlyView();
}

function viewMonthDetails(year, monthIndex, monthName) {
    const expenses = getExpensesForMonth(year, monthIndex);
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Create a simple alert for now
    let message = `${monthName} ${year}\n`;
    message += `Total: ${formatCurrency(total)}\n`;
    message += `Expenses: ${expenses.length}\n\n`;
    
    if (expenses.length > 0) {
        message += 'Recent expenses:\n';
        expenses.slice(0, 5).forEach(expense => {
            const category = getCategoryById(expense.category);
            message += `• ${expense.description}: ${formatCurrency(expense.amount)} (${category.name})\n`;
        });
        
        if (expenses.length > 5) {
            message += `... and ${expenses.length - 5} more`;
        }
    } else {
        message += 'No expenses this month';
    }
    
    alert(message);
}

// ===== CATEGORIES VIEW =====
function updateCategoriesView() {
    const container = document.getElementById('all-categories-list');
    if (!container || !window.categories) {
        console.log('Categories list container not found');
        return;
    }
    
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
}

function addCustomCategory() {
    const nameInput = document.getElementById('new-category-name');
    const colorInput = document.getElementById('new-category-color');
    
    if (!nameInput || !nameInput.value.trim()) {
        alert('Please enter a category name');
        return;
    }
    
    const categoryName = nameInput.value.trim();
    
    // Check if category already exists
    if (window.categories && window.categories.some(cat => cat.name.toLowerCase() === categoryName.toLowerCase())) {
        alert('Category with this name already exists!');
        return;
    }
    
    // Create new category object
    const newCategory = {
        id: 'custom-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        name: categoryName,
        color: colorInput?.value || '#4361ee',
        icon: '📦',
        budget: 0
    };
    
    // Add to categories array
    if (window.categories) {
        window.categories.push(newCategory);
    } else {
        window.categories = [newCategory];
    }
    
    // Save to localStorage
    if (typeof saveToLocalStorage === 'function') {
        saveToLocalStorage();
    }
    
    // Clear input
    nameInput.value = '';
    
    // Update UI
    if (typeof setupCategorySelection === 'function') {
        setupCategorySelection();
    } else {
        setupCategoriesManually();
    }
    
    updateCategoriesView();
    
    // Show success message
    if (typeof showToast === 'function') {
        showToast('✅ Category "' + categoryName + '" added successfully!', 'success');
    } else {
        alert('✅ Category "' + categoryName + '" added successfully!');
    }
    
    console.log('New category added:', newCategory);
}

// ===== TOP BAR FUNCTIONS =====
function updateTopBar() {
    try {
        const todayTotal = getTodayTotal();
        const monthTotal = getCurrentMonthTotal();
        const today = new Date();
        
        // Update stats
        document.getElementById('today-total').textContent = formatCurrency(todayTotal);
        document.getElementById('month-total').textContent = formatCurrency(monthTotal);
        
        // Update date display
        const dateOptions = { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        };
        document.getElementById('today-date').textContent = today.toLocaleDateString('en-US', dateOptions);
        
        // Update greeting based on time
        const hour = today.getHours();
        let greeting = 'Good ';
        if (hour < 12) greeting += 'Morning';
        else if (hour < 17) greeting += 'Afternoon';
        else greeting += 'Evening';
        
        document.getElementById('greeting').textContent = greeting + '! Ready to track your expenses?';
    } catch (error) {
        console.error('Error updating top bar:', error);
    }
}

// ===== EXPORT FUNCTIONS =====
function toggleExportMenu() {
    const menu = document.getElementById('export-menu');
    if (menu) {
        menu.classList.toggle('show');
        
        // Close menu when clicking outside
        if (menu.classList.contains('show')) {
            setTimeout(() => {
                document.addEventListener('click', closeExportMenu);
            }, 10);
        }
    }
}

function closeExportMenu(e) {
    const menu = document.getElementById('export-menu');
    const exportBtn = document.querySelector('.btn-logout');
    
    if (menu && exportBtn && 
        !menu.contains(e.target) && 
        !exportBtn.contains(e.target)) {
        menu.classList.remove('show');
        document.removeEventListener('click', closeExportMenu);
    }
}

// For backward compatibility
function exportData() {
    exportJSON();
}

function exportJSON() {
    if (!window.expenses || !window.categories) {
        showError('No data to export yet');
        return;
    }
    
    const data = {
        expenses: window.expenses,
        categories: window.categories,
        exportedAt: new Date().toISOString(),
        version: '1.0'
    };
    
    try {
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const dataUrl = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `smartspend-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        setTimeout(() => URL.revokeObjectURL(dataUrl), 100);
        
        showSuccess('Data exported successfully as JSON!');
        
        // Close menu
        toggleExportMenu();
    } catch (error) {
        console.error('Export error:', error);
        showError('Error exporting data: ' + error.message);
    }
}

function exportTodayPDF() {
    try {
        const today = getCurrentDateString();
        const expenses = getExpensesForDate(today);
        
        if (expenses.length === 0) {
            showError('No expenses today to export');
            return;
        }
        
        // Create PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add header
        doc.setFontSize(20);
        doc.setTextColor(67, 97, 238); // Primary color
        doc.text('SmartSpend - Daily Expense Report', 105, 20, { align: 'center' });
        
        // Add date
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        const formattedDate = new Date(today).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        doc.text(`Date: ${formattedDate}`, 105, 30, { align: 'center' });
        
        // Summary section
        doc.setFontSize(14);
        doc.setTextColor(67, 97, 238);
        doc.text('Summary', 20, 45);
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        
        const total = expenses.reduce((sum, e) => sum + e.amount, 0);
        const categories = new Set(expenses.map(e => e.category));
        
        doc.text(`Total Expenses: ${expenses.length}`, 20, 55);
        doc.text(`Total Amount: ${formatCurrency(total)}`, 20, 62);
        doc.text(`Categories Used: ${categories.size}`, 20, 69);
        
        // Draw separator
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 75, 190, 75);
        
        // Expenses table
        doc.setFontSize(14);
        doc.setTextColor(67, 97, 238);
        doc.text('Expense Details', 20, 85);
        
        // Prepare table data
        const tableData = expenses.map(expense => {
            const category = getCategoryById(expense.category);
            const time = expense.createdAt ? 
                new Date(expense.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
                '-';
            
            return [
                expense.description,
                category.name,
                time,
                formatCurrency(expense.amount)
            ];
        });
        
        // Add total row
        tableData.push(['', '', 'TOTAL:', formatCurrency(total)]);
        
        // Create table
        doc.autoTable({
            startY: 90,
            head: [['Description', 'Category', 'Time', 'Amount']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [67, 97, 238],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { cellWidth: 60 },
                1: { cellWidth: 40 },
                2: { cellWidth: 30 },
                3: { cellWidth: 40, halign: 'right' }
            },
            styles: {
                fontSize: 10,
                cellPadding: 3
            },
            margin: { left: 20, right: 20 }
        });
        
        // Category breakdown
        const finalY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.setTextColor(67, 97, 238);
        doc.text('Category Breakdown', 20, finalY);
        
        // Calculate category totals
        const categoryTotals = {};
        expenses.forEach(expense => {
            categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
        });
        
        // Sort by amount descending
        const sortedCategories = Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1]);
        
        let yPos = finalY + 10;
        sortedCategories.forEach(([categoryId, amount], index) => {
            if (yPos > 280) {
                doc.addPage();
                yPos = 20;
            }
            
            const category = getCategoryById(categoryId);
            const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
            
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text(`${category.icon} ${category.name} (${percentage}%)`, 25, yPos);
            
            doc.text(formatCurrency(amount), 180, yPos, { align: 'right' });
            
            // Add progress bar
            const barWidth = 130;
            const fillWidth = (amount / total) * barWidth;
            doc.setDrawColor(230, 230, 230);
            doc.rect(25, yPos + 2, barWidth, 3);
            doc.setFillColor(category.color);
            doc.rect(25, yPos + 2, fillWidth, 3, 'F');
            
            yPos += 12;
        });
        
        // Add footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
            doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 290, { align: 'center' });
        }
        
        // Save PDF
        const fileName = `SmartSpend-Daily-Report-${today}.pdf`;
        doc.save(fileName);
        
        showSuccess(`Today's report exported as PDF: ${fileName}`);
        
        // Close menu
        toggleExportMenu();
        
    } catch (error) {
        console.error('PDF export error:', error);
        showError('Error generating PDF. Please try again.');
    }
}

function exportMonthPDF() {
    try {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
        
        const expenses = getExpensesForMonth(year, month);
        
        if (expenses.length === 0) {
            showError(`No expenses in ${monthNames[month]} to export`);
            return;
        }
        
        // Create PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add header
        doc.setFontSize(20);
        doc.setTextColor(67, 97, 238);
        doc.text('SmartSpend - Monthly Expense Report', 105, 20, { align: 'center' });
        
        // Add month
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Month: ${monthNames[month]} ${year}`, 105, 30, { align: 'center' });
        
        // Summary section
        doc.setFontSize(14);
        doc.setTextColor(67, 97, 238);
        doc.text('Monthly Summary', 20, 45);
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        
        const total = expenses.reduce((sum, e) => sum + e.amount, 0);
        const categories = new Set(expenses.map(e => e.category));
        const daysWithExpenses = new Set(expenses.map(e => new Date(e.date).getDate())).size;
        const dailyAverage = total / daysWithExpenses;
        
        doc.text(`Total Expenses: ${expenses.length}`, 20, 55);
        doc.text(`Total Amount: ${formatCurrency(total)}`, 20, 62);
        doc.text(`Categories Used: ${categories.size}`, 20, 69);
        doc.text(`Days with Expenses: ${daysWithExpenses}`, 20, 76);
        doc.text(`Daily Average: ${formatCurrency(dailyAverage)}`, 20, 83);
        
        // Draw separator
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 90, 190, 90);
        
        // Category breakdown chart
        doc.setFontSize(14);
        doc.setTextColor(67, 97, 238);
        doc.text('Category Breakdown', 20, 100);
        
        // Calculate category totals
        const categoryTotals = {};
        expenses.forEach(expense => {
            categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
        });
        
        // Sort by amount descending
        const sortedCategories = Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1]);
        
        // Create table for categories
        const categoryData = sortedCategories.map(([categoryId, amount]) => {
            const category = getCategoryById(categoryId);
            const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
            return [category.icon + ' ' + category.name, `${percentage}%`, formatCurrency(amount)];
        });
        
        doc.autoTable({
            startY: 105,
            head: [['Category', 'Percentage', 'Amount']],
            body: categoryData,
            theme: 'grid',
            headStyles: {
                fillColor: [67, 97, 238],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { cellWidth: 70 },
                1: { cellWidth: 40, halign: 'center' },
                2: { cellWidth: 50, halign: 'right' }
            },
            styles: {
                fontSize: 10,
                cellPadding: 3
            },
            margin: { left: 20, right: 20 }
        });
        
        // Add daily spending chart on new page
        doc.addPage();
        doc.setFontSize(14);
        doc.setTextColor(67, 97, 238);
        doc.text('Daily Spending Pattern', 20, 20);
        
        // Calculate daily totals
        const dailyTotals = {};
        expenses.forEach(expense => {
            const day = new Date(expense.date).getDate();
            dailyTotals[day] = (dailyTotals[day] || 0) + expense.amount;
        });
        
        // Prepare daily data
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dailyData = [];
        
        for (let day = 1; day <= daysInMonth; day++) {
            const amount = dailyTotals[day] || 0;
            dailyData.push([
                `Day ${day}`,
                formatCurrency(amount),
                amount > 0 ? '✓' : '-'
            ]);
        }
        
        doc.autoTable({
            startY: 30,
            head: [['Day', 'Amount Spent', 'Had Expense']],
            body: dailyData,
            theme: 'grid',
            headStyles: {
                fillColor: [67, 97, 238],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 60, halign: 'right' },
                2: { cellWidth: 40, halign: 'center' }
            },
            styles: {
                fontSize: 9,
                cellPadding: 3
            },
            margin: { left: 20, right: 20 }
        });
        
        // Add insights
        const finalY = doc.lastAutoTable.finalY + 20;
        doc.setFontSize(14);
        doc.setTextColor(67, 97, 238);
        doc.text('Monthly Insights', 20, finalY);
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        
        // Find highest spending day
        let highestDay = 0;
        let highestAmount = 0;
        Object.entries(dailyTotals).forEach(([day, amount]) => {
            if (amount > highestAmount) {
                highestAmount = amount;
                highestDay = day;
            }
        });
        
        // Find most frequent category
        const categoryCounts = {};
        expenses.forEach(expense => {
            categoryCounts[expense.category] = (categoryCounts[expense.category] || 0) + 1;
        });
        
        let mostFrequentCategory = '';
        let maxCount = 0;
        Object.entries(categoryCounts).forEach(([categoryId, count]) => {
            if (count > maxCount) {
                maxCount = count;
                mostFrequentCategory = getCategoryById(categoryId).name;
            }
        });
        
        doc.text(`• Highest spending day: Day ${highestDay} (${formatCurrency(highestAmount)})`, 25, finalY + 10);
        doc.text(`• Most frequent category: ${mostFrequentCategory} (${maxCount} times)`, 25, finalY + 18);
        doc.text(`• No-spend days: ${daysInMonth - daysWithExpenses}`, 25, finalY + 26);
        
        // Add footer to all pages
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
            doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 290, { align: 'center' });
        }
        
        // Save PDF
        const fileName = `SmartSpend-Monthly-Report-${monthNames[month]}-${year}.pdf`;
        doc.save(fileName);
        
        showSuccess(`Monthly report exported as PDF: ${fileName}`);
        
        // Close menu
        toggleExportMenu();
        
    } catch (error) {
        console.error('Monthly PDF export error:', error);
        showError('Error generating monthly PDF. Please try again.');
    }
}

// ===== UTILITY FUNCTIONS =====
function showSuccess(message) {
    if (typeof showToast === 'function') {
        showToast(message, 'success');
    } else {
        alert('✅ ' + message);
    }
}

function showError(message) {
    if (typeof showToast === 'function') {
        showToast(message, 'error');
    } else {
        alert('❌ ' + message);
    }
}

function formatShortDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    } catch (e) {
        return dateString;
    }
}

// ===== GLOBAL EXPORTS =====
// Make all functions available globally
window.initApp = initApp;
window.switchView = switchView;
window.switchViewMobile = switchViewMobile; // Add this
window.toggleMobileMenu = toggleMobileMenu; // Add this
window.closeMobileMenu = closeMobileMenu; // Add this
window.saveQuickExpense = saveQuickExpense;
window.clearQuickAddForm = clearQuickAddForm;
window.prevMonthlyYear = prevMonthlyYear;
window.nextMonthlyYear = nextMonthlyYear;
window.updateTodayView = updateTodayView;
window.updateMonthlyView = updateMonthlyView;
window.exportData = exportData; // For backward compatibility
window.exportTodayPDF = exportTodayPDF;
window.exportMonthPDF = exportMonthPDF;
window.toggleExportMenu = toggleExportMenu;
window.updateTopBar = updateTopBar;
window.viewMonthDetails = viewMonthDetails;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    
    // Hide loading screen after 1 second
    setTimeout(() => {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
        
        // Initialize app
        if (typeof initApp === 'function') {
            initApp();
        }
    }, 1000);
});

// Also initialize if page is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => {
        if (typeof initApp === 'function') {
            initApp();
        }
    }, 500);
}
// ===== MOBILE FUNCTIONS =====

function toggleMobileMenu() {
    const overlay = document.getElementById('mobile-menu-overlay');
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    
    if (overlay) {
        overlay.classList.toggle('show');
        
        // Change hamburger to X when menu is open
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('i');
            if (overlay.classList.contains('show')) {
                icon.className = 'fas fa-times';
                toggleBtn.style.transform = 'rotate(90deg)';
            } else {
                icon.className = 'fas fa-bars';
                toggleBtn.style.transform = 'rotate(0deg)';
            }
        }
        
        // Prevent body scrolling when menu is open
        document.body.style.overflow = overlay.classList.contains('show') ? 'hidden' : '';
    }
}

function closeMobileMenu() {
    const overlay = document.getElementById('mobile-menu-overlay');
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    
    if (overlay) {
        overlay.classList.remove('show');
        document.body.style.overflow = '';
        
        // Reset hamburger icon
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('i');
            icon.className = 'fas fa-bars';
            toggleBtn.style.transform = 'rotate(0deg)';
        }
    }
}

function switchViewMobile(viewName) {
    // Switch view
    switchView(viewName);
    
    // Close mobile menu
    closeMobileMenu();
    
    // Update mobile nav items
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeItem = document.querySelector(`.mobile-nav-item[href="#${viewName}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

function setupMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // Close menu when clicking outside on mobile
    const overlay = document.getElementById('mobile-menu-overlay');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeMobileMenu();
            }
        });
    }
    
    // Update mobile nav items based on current view
    updateMobileNav();
}

function updateMobileNav() {
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeItem = document.querySelector(`.mobile-nav-item[href="#${currentView}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

// Add touch event for better mobile interaction
function setupTouchEvents() {
    // Add touch feedback to buttons
    document.querySelectorAll('button, .category-btn, .action-btn').forEach(btn => {
        btn.addEventListener('touchstart', function() {
            this.style.opacity = '0.8';
        });
        
        btn.addEventListener('touchend', function() {
            this.style.opacity = '1';
        });
        
        btn.addEventListener('touchcancel', function() {
            this.style.opacity = '1';
        });
    });
    
    // Prevent zoom on double-tap
    document.addEventListener('dblclick', function(e) {
        e.preventDefault();
    }, { passive: false });
    
    // Better scrolling for mobile
    document.querySelectorAll('.expenses-list, .today-expenses-full-list').forEach(container => {
        container.style.webkitOverflowScrolling = 'touch';
    });
}

// Update existing switchView to also update mobile nav
function switchView(viewName) {
    console.log('Switching to view:', viewName);
    
    // Prevent switching to categories view
    if (viewName === 'categories') {
        console.log('Categories view is disabled');
        return;
    }
    
    // Update current view
    currentView = viewName;
    
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Update mobile nav items
    updateMobileNav();
    
    // Show selected view
    const viewElement = document.getElementById(viewName + '-view');
    if (viewElement) {
        viewElement.classList.add('active');
        
        // Update nav (skip categories)
        if (viewName !== 'categories') {
            const navItem = document.querySelector(`.nav-item[href="#${viewName}"]`);
            if (navItem) navItem.classList.add('active');
        }
        
        // Load view data
        loadViewData(viewName);
        
        // Scroll to top on mobile when switching views
        if (window.innerWidth <= 600) {
            window.scrollTo(0, 0);
            document.querySelector('.main-content').scrollTop = 0;
        }
    }
}

// Update the setupUI function to include mobile setup
function setupUI() {
    console.log('Setting up UI...');
    
    // 1. Set today's date in the date picker
    const dateField = document.getElementById('qa-date');
    if (dateField) {
        const today = new Date();
        const dateString = today.toISOString().split('T')[0];
        dateField.value = dateString;
        console.log('Date field set to:', dateString);
    }
    
    // 2. Initialize category system IMMEDIATELY
    if (typeof initCategorySystem === 'function') {
        console.log('Initializing category system...');
        initCategorySystem();
    } else {
        console.error('initCategorySystem function not found!');
        // Try to setup categories manually
        setupCategoriesManually();
    }
    
    // 3. Update top bar stats
    updateTopBar();
    
    // 4. Set default view
    switchView('quick-add');
    
    // 5. Initialize reports if needed
    if (typeof initReports === 'function') {
        initReports();
    }
    
    // 6. Setup mobile features
    setupMobileMenu();
    setupTouchEvents();
    
    // 7. Show success message
    console.log('✅ App setup complete!');
    
    // Update any visible views
    updateVisibleView();
}

// Add viewport meta tag dynamically for better mobile control
function setupViewport() {
    // Check if viewport meta tag exists
    let viewport = document.querySelector('meta[name="viewport"]');
    
    if (!viewport) {
        viewport = document.createElement('meta');
        viewport.name = 'viewport';
        document.head.appendChild(viewport);
    }
    
    // Set viewport for mobile optimization
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
    
    // Detect if device is iOS and adjust viewport
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover';
    }
}

// Update initialization to include mobile setup
function initApp() {
    console.log('🚀 SmartSpend Initializing...');
    
    if (appInitialized) {
        console.log('App already initialized');
        return;
    }
    
    // Setup viewport for mobile
    setupViewport();
    
    // 1. FIRST: Initialize data system (MOST IMPORTANT)
    if (typeof initializeApp === 'function') {
        console.log('Initializing data system...');
        initializeApp();
        
        // Wait for data to load
        setTimeout(checkDataAndInitialize, 100);
    } else {
        console.error('initializeApp function not found!');
        alert('Critical error: Data system not found. Please refresh the page.');
    }
}