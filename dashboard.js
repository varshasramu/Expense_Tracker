// dashboard.js - Simplified Working Version

let currentView = 'quick-add';

// Initialize the dashboard
function initDashboard() {
    console.log('Initializing dashboard...');
    
    // Initialize the app
    initializeApp();
    
    // Set today's date
    document.getElementById('qa-date').value = getCurrentDateString();
    
    // Render categories immediately
    renderCategorySelector();
    renderAllCategoriesList();
    
    // Set current view
    switchView('quick-add');
    
    // Update displays
    updateAllDisplays();
    
    console.log('Dashboard initialized');
}

// Update all displays
function updateAllDisplays() {
    updateTopBarStats();
    updateTodayView();
    updateDashboard();
}

function renderCategorySelector() {
    const container = document.getElementById('quick-category-buttons');
    if (!container) return;
    
    container.innerHTML = '';
    
    categories.forEach((category, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'category-btn';
        button.dataset.categoryId = category.id;
        button.innerHTML = `
            <div class="category-btn-content">
                <div class="category-btn-icon">${category.icon}</div>
                <div class="category-btn-name">${category.name}</div>
            </div>
        `;
        
        // Select first category by default
        if (index === 0) {
            button.classList.add('selected');
            window.selectedCategoryId = category.id; // Store globally
        }
        
        button.onclick = function() {
            // Remove selected from all buttons
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            // Add selected to clicked button
            this.classList.add('selected');
            window.selectedCategoryId = this.dataset.categoryId;
        };
        
        container.appendChild(button);
    });
}

// Save quick expense - SIMPLE VERSION
function saveQuickExpense() {
    const amount = document.getElementById('qa-amount').value;
    const description = document.getElementById('qa-description').value;
    const date = document.getElementById('qa-date').value;
    
    // Get selected category
    const categoryId = window.selectedCategoryId || categories[0].id;
    
    if (!amount || parseFloat(amount) <= 0) {
        showToast('Please enter a valid amount', 'error');
        return;
    }
    
    if (!description.trim()) {
        showToast('Please enter a description', 'error');
        return;
    }
    
    const expenseData = {
        amount: parseFloat(amount),
        description: description.trim(),
        category: categoryId,
        date: date || getCurrentDateString()
    };
    
    if (addExpense(expenseData)) {
        showSaveNotification();
        
        // Clear form
        document.getElementById('qa-amount').value = '';
        document.getElementById('qa-description').value = '';
        
        // Focus on amount for next entry
        setTimeout(() => {
            document.getElementById('qa-amount').focus();
        }, 100);
    }
}

// Show save notification
function showSaveNotification() {
    const notification = document.getElementById('save-notification');
    if (!notification) return;
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Update top bar statistics
function updateTopBarStats() {
    const todayTotal = getTodayTotal();
    const monthTotal = getCurrentMonthTotal();
    
    document.getElementById('today-total').textContent = formatCurrency(todayTotal);
    document.getElementById('month-total').textContent = formatCurrency(monthTotal);
    
    // Update date display
    const today = new Date();
    document.getElementById('today-date').textContent = today.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}

// Update today's view
function updateTodayView() {
    const today = getCurrentDateString();
    const todayExpenses = getExpensesForDate(today);
    const todayTotal = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Update summary
    document.getElementById('today-full-total').textContent = formatCurrency(todayTotal);
    document.getElementById('today-full-count').textContent = todayExpenses.length;
    
    // Update categories display
    updateTodayCategoriesDisplay();
    
    // Update expenses list
    updateTodayFullExpensesList(todayExpenses);
}

// Update today's categories display
function updateTodayCategoriesDisplay() {
    const container = document.getElementById('all-categories-display');
    if (!container) return;
    
    const today = getCurrentDateString();
    const todayExpenses = getExpensesForDate(today);
    const categoryTotals = getCategoryTotals(todayExpenses);
    
    container.innerHTML = '';
    
    categories.forEach(category => {
        const amount = categoryTotals[category.id] || 0;
        
        const item = document.createElement('div');
        item.className = 'category-display-item';
        item.style.border = `2px solid ${category.color}20`;
        item.innerHTML = `
            <div class="category-display-icon" style="color: ${category.color}">
                ${category.icon}
            </div>
            <div class="category-display-name">${category.name}</div>
            <div class="category-display-amount">${formatCurrency(amount)}</div>
        `;
        
        container.appendChild(item);
    });
}

// Update today's full expenses list
function updateTodayFullExpensesList(todayExpenses) {
    const container = document.getElementById('today-expenses-full-list');
    if (!container) return;
    
    if (todayExpenses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-sun fa-3x"></i>
                <h3>No expenses today</h3>
                <p>Add your first expense using Quick Add!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    todayExpenses.forEach(expense => {
        const category = getCategoryById(expense.category);
        const time = new Date(expense.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        const expenseElement = document.createElement('div');
        expenseElement.className = 'expense-item';
        expenseElement.innerHTML = `
            <div class="expense-info">
                <div class="expense-icon" style="background: ${category.color}20; color: ${category.color}">
                    ${category.icon}
                </div>
                <div class="expense-details">
                    <h4>${expense.description}</h4>
                    <p>${category.name} • ${time}</p>
                </div>
            </div>
            <div class="expense-amount">${formatCurrency(expense.amount)}</div>
            <div class="expense-actions">
                <button class="action-btn delete" onclick="deleteExpense('${expense.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        container.appendChild(expenseElement);
    });
}

// Render all categories list
function renderAllCategoriesList() {
    const container = document.getElementById('all-categories-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Get expense counts per category
    const categoryCounts = {};
    expenses.forEach(expense => {
        categoryCounts[expense.category] = (categoryCounts[expense.category] || 0) + 1;
    });
    
    categories.forEach(category => {
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

// Update dashboard
function updateDashboard() {
    // Update top bar
    updateTopBarStats();
    
    // Update monthly summary
    const now = new Date();
    const monthExpenses = getExpensesForMonth(now.getFullYear(), now.getMonth());
    const monthTotal = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    document.getElementById('month-summary-total').textContent = formatCurrency(monthTotal);
    document.getElementById('month-total-expenses').textContent = monthExpenses.length;
    
    // Update recent expenses
    updateRecentExpenses();
    
    // Update category breakdown
    updateCategoryBreakdown();
    
    // Update quick stats
    updateDashboardQuickStats();
}

// Update recent expenses
function updateRecentExpenses() {
    const container = document.getElementById('recent-expenses-list');
    if (!container) return;
    
    const recentExpenses = expenses.slice(0, 10);
    
    if (recentExpenses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <p>No expenses yet</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    recentExpenses.forEach(expense => {
        const category = getCategoryById(expense.category);
        const isToday = expense.date === getCurrentDateString();
        const dateDisplay = isToday ? 'Today' : formatShortDate(expense.date);
        
        const expenseElement = document.createElement('div');
        expenseElement.className = 'expense-item';
        expenseElement.innerHTML = `
            <div class="expense-info">
                <div class="expense-icon" style="background: ${category.color}20; color: ${category.color}">
                    ${category.icon}
                </div>
                <div class="expense-details">
                    <h4>${expense.description}</h4>
                    <p>${dateDisplay} • ${category.name}</p>
                </div>
            </div>
            <div class="expense-amount">${formatCurrency(expense.amount)}</div>
        `;
        
        container.appendChild(expenseElement);
    });
}

// Update category breakdown
function updateCategoryBreakdown() {
    const container = document.getElementById('category-breakdown');
    if (!container) return;
    
    const now = new Date();
    const monthExpenses = getExpensesForMonth(now.getFullYear(), now.getMonth());
    const categoryTotals = getCategoryTotals(monthExpenses);
    const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    if (total === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No expenses this month</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    // Sort by amount
    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    
    sorted.forEach(([categoryId, amount]) => {
        const category = getCategoryById(categoryId);
        const percentage = ((amount / total) * 100).toFixed(1);
        
        const item = document.createElement('div');
        item.className = 'category-item';
        item.innerHTML = `
            <div class="category-header">
                <span class="category-icon">${category.icon}</span>
                <span class="category-name">${category.name}</span>
                <span class="category-percentage">${percentage}%</span>
            </div>
            <div class="category-bar">
                <div class="bar-fill" style="width: ${percentage}%; background: ${category.color}"></div>
            </div>
            <div class="category-amount">${formatCurrency(amount)}</div>
        `;
        
        container.appendChild(item);
    });
}

// Update dashboard quick stats
function updateDashboardQuickStats() {
    const todayTotal = getTodayTotal();
    document.getElementById('dashboard-today-total').textContent = formatCurrency(todayTotal);
    
    // Week total (last 7 days)
    let weekTotal = 0;
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        weekTotal += getTotalForDate(date.toISOString().split('T')[0]);
        // Add to dashboard.js after line 400
function updateMonthlyView() {
    const container = document.getElementById('months-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const currentYear = new Date().getFullYear();
    
    monthNames.forEach((month, index) => {
        const expenses = getExpensesForMonth(currentYear, index);
        const total = expenses.reduce((sum, e) => sum + e.amount, 0);
        
        const card = document.createElement('div');
        card.className = 'month-card';
        card.innerHTML = `
            <div class="month-name">${month}</div>
            <div class="month-total">${formatCurrency(total)}</div>
            <div class="month-expenses">${expenses.length} expenses</div>
        `;
        
        container.appendChild(card);
    });
}

function updateCalendarView() {
    const container = document.getElementById('calendar-days');
    if (!container) return;
    
    container.innerHTML = '';
    
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    // Get first day and days in month
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Empty cells for start
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        container.appendChild(empty);
    }
    
    // Create day cells
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const total = getTotalForDate(dateStr);
        
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.innerHTML = `
            <div class="day-number">${day}</div>
            <div class="day-amount ${getSpendingClass(total)}">${formatCurrency(total)}</div>
        `;
        
        container.appendChild(dayEl);
    }
}

function getSpendingClass(amount) {
    if (amount === 0) return 'no-spending';
    if (amount <= 20) return 'low';
    if (amount <= 50) return 'medium';
    return 'high';
}
        // Add to dashboard.js after line 400
function updateMonthlyView() {
    const container = document.getElementById('months-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const currentYear = new Date().getFullYear();
    
    monthNames.forEach((month, index) => {
        const expenses = getExpensesForMonth(currentYear, index);
        const total = expenses.reduce((sum, e) => sum + e.amount, 0);
        
        const card = document.createElement('div');
        card.className = 'month-card';
        card.innerHTML = `
            <div class="month-name">${month}</div>
            <div class="month-total">${formatCurrency(total)}</div>
            <div class="month-expenses">${expenses.length} expenses</div>
        `;
        
        container.appendChild(card);
    });
}

function updateCalendarView() {
    const container = document.getElementById('calendar-days');
    if (!container) return;
    
    container.innerHTML = '';
    
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    // Get first day and days in month
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Empty cells for start
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        container.appendChild(empty);
    }
    
    // Create day cells
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const total = getTotalForDate(dateStr);
        
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.innerHTML = `
            <div class="day-number">${day}</div>
            <div class="day-amount ${getSpendingClass(total)}">${formatCurrency(total)}</div>
        `;
        
        container.appendChild(dayEl);
    }
}

function getSpendingClass(amount) {
    if (amount === 0) return 'no-spending';
    if (amount <= 20) return 'low';
    if (amount <= 50) return 'medium';
    return 'high';
}
    }
    document.getElementById('dashboard-week-total').textContent = formatCurrency(weekTotal);
}

function switchView(viewName) {
    // ... (same as before until the update section)
    
    // Update specific view
    if (viewName === 'today') updateTodayView();
    if (viewName === 'monthly') {
        if (typeof initMonthly === 'function') initMonthly();
    }
    if (viewName === 'calendar') {
        if (typeof initCalendar === 'function') initCalendar();
    }
    if (viewName === 'categories') renderAllCategoriesList();
    if (viewName === 'dashboard') updateDashboard();
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
        initDashboard();
    }, 500);
});
// Add these new functions to your dashboard.js

// Monthly View Variables
let currentYear = new Date().getFullYear();
let isMonthlyChartView = false;

// Update monthly view
function updateMonthlyView() {
    console.log('Updating monthly view for year:', currentYear);
    
    // Update year display
    document.getElementById('current-year-display').textContent = currentYear;
    
    // Update year overview
    updateYearOverview();
    
    // Update all months grid
    updateMonthsGrid();
    
    // Update current month details
    updateCurrentMonthDetails();
    
    // Update year selector for chart
    updateYearSelector();
    
    // Update chart if in chart view
    if (isMonthlyChartView) {
        updateMonthlyChart();
    }
}

// Update year overview
function updateYearOverview() {
    const yearExpenses = getExpensesForYear(currentYear);
    const yearTotal = yearExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const monthlyAverage = yearExpenses.length > 0 ? yearTotal / 12 : 0;
    
    document.getElementById('year-total-summary').textContent = formatCurrency(yearTotal);
    document.getElementById('year-expenses-count').textContent = yearExpenses.length;
    document.getElementById('year-monthly-average').textContent = formatCurrency(monthlyAverage);
}

// Update all months grid
function updateMonthsGrid() {
    const container = document.getElementById('months-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYearNow = currentDate.getFullYear();
    
    // Get previous year data for comparison
    const prevYearExpenses = getExpensesForYear(currentYear - 1);
    const prevYearMonthlyTotals = new Array(12).fill(0);
    prevYearExpenses.forEach(expense => {
        const month = new Date(expense.date).getMonth();
        prevYearMonthlyTotals[month] += expense.amount;
    });
    
    // Create month cards
    monthNames.forEach((monthName, index) => {
        const monthExpenses = getExpensesForMonth(currentYear, index);
        const monthTotal = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        // Calculate trend compared to previous year
        const prevYearTotal = prevYearMonthlyTotals[index] || 0;
        let trend = 'neutral';
        let trendText = '';
        
        if (prevYearTotal > 0 && monthTotal > 0) {
            const trendPercent = ((monthTotal - prevYearTotal) / prevYearTotal * 100).toFixed(1);
            if (trendPercent > 10) {
                trend = 'up';
                trendText = `↑ ${Math.abs(trendPercent)}%`;
            } else if (trendPercent < -10) {
                trend = 'down';
                trendText = `↓ ${Math.abs(trendPercent)}%`;
            }
        }
        
        const monthCard = document.createElement('div');
        monthCard.className = 'month-card';
        if (currentYear === currentYearNow && index === currentMonth) {
            monthCard.classList.add('current');
        }
        monthCard.style.setProperty('--index', index);
        
        monthCard.innerHTML = `
            <div class="month-name">${monthName.substring(0, 3)}</div>
            <div class="month-total">${formatCurrency(monthTotal)}</div>
            <div class="month-expenses">${monthExpenses.length} expenses</div>
            ${trendText ? `<div class="month-trend trend-${trend}">${trendText}</div>` : ''}
        `;
        
        // Add click event to view month details
        monthCard.addEventListener('click', function() {
            viewMonthDetails(currentYear, index);
        });
        
        container.appendChild(monthCard);
    });
}

// View month details
function viewMonthDetails(year, month) {
    // Switch to monthly detailed view (you can implement this)
    showToast(`Viewing ${getMonthName(month)} ${year} details`, 'info');
    
    // You can implement a detailed modal or switch to a detailed view
    // For now, just show the month's expenses in Today's view style
    const monthExpenses = getExpensesForMonth(year, month);
    if (monthExpenses.length > 0) {
        showMonthExpensesModal(year, month, monthExpenses);
    } else {
        showToast(`No expenses in ${getMonthName(month)} ${year}`, 'info');
    }
}

// Show month expenses modal
function showMonthExpensesModal(year, month, expenses) {
    const monthName = getMonthName(month);
    const monthTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3><i class="fas fa-calendar-alt"></i> ${monthName} ${year} Details</h3>
            <div class="modal-summary">
                <div class="modal-stat">
                    <span class="stat-label">Month Total</span>
                    <span class="stat-value">${formatCurrency(monthTotal)}</span>
                </div>
                <div class="modal-stat">
                    <span class="stat-label">Total Expenses</span>
                    <span class="stat-value">${expenses.length}</span>
                </div>
            </div>
            <div class="modal-expenses-list">
                ${expenses.map(expense => {
                    const category = getCategoryById(expense.category);
                    return `
                        <div class="expense-item">
                            <div class="expense-icon" style="background: ${category.color}20; color: ${category.color}">
                                ${category.icon}
                            </div>
                            <div class="expense-details">
                                <h4>${expense.description}</h4>
                                <p>${formatShortDate(expense.date)} • ${category.name}</p>
                            </div>
                            <div class="expense-amount">${formatCurrency(expense.amount)}</div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="closeModal()">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add modal styles if not already added
    if (!document.querySelector('#modal-styles')) {
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            .modal-content {
                background: white;
                border-radius: 20px;
                padding: 30px;
                max-width: 800px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            }
            .modal-summary {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
                margin: 20px 0;
            }
            .modal-stat {
                padding: 20px;
                background: var(--light);
                border-radius: 15px;
                text-align: center;
            }
            .modal-expenses-list {
                max-height: 400px;
                overflow-y: auto;
                margin: 20px 0;
            }
            .modal-actions {
                display: flex;
                justify-content: flex-end;
                margin-top: 20px;
            }
        `;
        document.head.appendChild(style);
    }
}

// Update current month details
function updateCurrentMonthDetails() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYearNow = currentDate.getFullYear();
    
    const monthExpenses = getExpensesForMonth(currentYearNow, currentMonth);
    const monthTotal = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate days with expenses
    const daysWithExpenses = new Set();
    monthExpenses.forEach(expense => {
        const day = new Date(expense.date).getDate();
        daysWithExpenses.add(day);
    });
    
    // Calculate daily average
    const daysInMonth = new Date(currentYearNow, currentMonth + 1, 0).getDate();
    const daysPassed = Math.min(currentDate.getDate(), daysInMonth);
    const dailyAverage = daysPassed > 0 ? monthTotal / daysPassed : 0;
    
    // Update current month stats
    document.getElementById('current-month-total').textContent = formatCurrency(monthTotal);
    document.getElementById('current-month-count').textContent = monthExpenses.length;
    document.getElementById('current-month-daily-avg').textContent = formatCurrency(dailyAverage);
    document.getElementById('current-month-days').textContent = daysWithExpenses.size;
    
    // Update current month categories
    updateCurrentMonthCategories(monthExpenses);
}

// Update current month categories
function updateCurrentMonthCategories(monthExpenses) {
    const container = document.getElementById('current-month-categories');
    if (!container) return;
    
    const categoryTotals = getCategoryTotals(monthExpenses);
    const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    container.innerHTML = '';
    
    // Sort by amount descending
    const sortedCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1]);
    
    sortedCategories.forEach(([categoryId, amount]) => {
        const category = getCategoryById(categoryId);
        const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
        
        const item = document.createElement('div');
        item.className = 'category-breakdown-item';
        item.style.borderLeftColor = category.color;
        item.innerHTML = `
            <div class="category-name">
                ${category.icon} ${category.name}
                <small style="color: #666; margin-left: 5px;">${percentage}%</small>
            </div>
            <div class="category-amount">${formatCurrency(amount)}</div>
        `;
        
        container.appendChild(item);
    });
}

// Change year in monthly view
function changeYear(change) {
    currentYear += change;
    updateMonthlyView();
}

// Go to current year
function goToCurrentYear() {
    currentYear = new Date().getFullYear();
    updateMonthlyView();
}

// Toggle between grid and chart view
function toggleMonthlyView() {
    const gridView = document.getElementById('months-grid-view');
    const chartView = document.getElementById('monthly-chart-view');
    const toggleBtn = document.getElementById('toggle-view-btn');
    
    isMonthlyChartView = !isMonthlyChartView;
    
    if (isMonthlyChartView) {
        gridView.style.display = 'none';
        chartView.style.display = 'block';
        toggleBtn.innerHTML = '<i class="fas fa-th-large"></i> Switch to Grid View';
        updateMonthlyChart();
    } else {
        gridView.style.display = 'block';
        chartView.style.display = 'none';
        toggleBtn.innerHTML = '<i class="fas fa-chart-bar"></i> Switch to Chart View';
    }
}

// Update year selector for chart
function updateYearSelector() {
    const select = document.getElementById('chart-year-select');
    if (!select) return;
    
    select.innerHTML = '';
    
    const currentYearNow = new Date().getFullYear();
    
    // Add last 5 years
    for (let i = 4; i >= 0; i--) {
        const year = currentYearNow - i;
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) {
            option.selected = true;
        }
        select.appendChild(option);
    }
}

// Update monthly chart
function updateMonthlyChart() {
    const select = document.getElementById('chart-year-select');
    const year = select ? parseInt(select.value) : currentYear;
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const monthlyTotals = new Array(12).fill(0);
    const yearExpenses = getExpensesForYear(year);
    
    yearExpenses.forEach(expense => {
        const month = new Date(expense.date).getMonth();
        monthlyTotals[month] += expense.amount;
    });
    
    const ctx = document.getElementById('monthlyExpensesChart');
    if (!ctx) return;
    
    // Destroy previous chart if exists
    if (window.monthlyExpensesChartInstance) {
        window.monthlyExpensesChartInstance.destroy();
    }
    
    window.monthlyExpensesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthNames,
            datasets: [{
                label: 'Monthly Spending',
                data: monthlyTotals,
                backgroundColor: monthlyTotals.map(total => {
                    if (total === 0) return '#e9ecef';
                    if (total <= 500) return '#4cc9f0';
                    if (total <= 1000) return '#f8961e';
                    return '#f72585';
                }),
                borderColor: monthlyTotals.map(total => {
                    if (total === 0) return '#dee2e6';
                    if (total <= 500) return '#06AED5';
                    if (total <= 1000) return '#EE6C4D';
                    return '#C2185B';
                }),
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${monthNames[context.dataIndex]}: ${formatCurrency(context.raw)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

// Enhanced Calendar Functions
function updateCalendar() {
    const container = document.getElementById('calendar-grid');
    if (!container) return;
    
    // Update month display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('calendar-month').textContent = 
        `${monthNames[currentCalendarMonth]} ${currentCalendarYear}`;
    
    // Get month expenses
    const monthExpenses = getExpensesForMonth(currentCalendarYear, currentCalendarMonth);
    const monthTotal = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const daysInMonth = new Date(currentCalendarYear, currentCalendarMonth + 1, 0).getDate();
    
    // Update calendar stats
    document.getElementById('calendar-month-total').textContent = formatCurrency(monthTotal);
    
    // Calculate spending days
    const spendingDays = getDaysWithExpenses(currentCalendarYear, currentCalendarMonth);
    document.getElementById('calendar-spending-days').textContent = spendingDays;
    
    // Calculate daily average
    const daysPassed = Math.min(new Date().getDate(), daysInMonth);
    const dailyAverage = daysPassed > 0 ? monthTotal / daysPassed : 0;
    document.getElementById('calendar-daily-average').textContent = formatCurrency(dailyAverage);
    
    // Calculate highest day
    let highestDay = 0;
    for (let day = 1; day <= daysInMonth; day++) {
        const dateString = `${currentCalendarYear}-${String(currentCalendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayTotal = getTotalForDate(dateString);
        if (dayTotal > highestDay) {
            highestDay = dayTotal;
        }
    }
    document.getElementById('calendar-highest-day').textContent = formatCurrency(highestDay);
    
    // Clear container
    container.innerHTML = '';
    
    // Get first day of month
    const firstDay = new Date(currentCalendarYear, currentCalendarMonth, 1);
    const startingDay = firstDay.getDay();
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < startingDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        container.appendChild(emptyDay);
    }
    
    // Today's date for highlighting
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === currentCalendarYear && 
                          today.getMonth() === currentCalendarMonth;
    
    // Create cells for each day of month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateString = `${currentCalendarYear}-${String(currentCalendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayExpenses = getExpensesForDate(dateString);
        const dayTotal = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const isToday = isCurrentMonth && day === today.getDate();
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.dataset.date = dateString;
        dayElement.dataset.total = dayTotal;
        
        if (isToday) {
            dayElement.classList.add('today');
        }
        
        // Add class based on spending
        if (dayTotal > 0) {
            if (dayTotal <= 20) {
                dayElement.classList.add('low-spending-bg');
            } else if (dayTotal <= 50) {
                dayElement.classList.add('medium-spending-bg');
            } else {
                dayElement.classList.add('high-spending-bg');
            }
        } else {
            dayElement.classList.add('no-spending-bg');
        }
        
        dayElement.innerHTML = `
            <div class="day-number">${day}</div>
            ${dayTotal > 0 ? `<div class="day-total">${formatCurrency(dayTotal)}</div>` : 
              '<div class="day-total">$0.00</div>'}
        `;
        
        // Add click event
        dayElement.addEventListener('click', function() {
            const date = this.dataset.date;
            const total = this.dataset.total;
            showDayDetails(date, parseFloat(total), dayExpenses);
        });
        
        // Add hover effect
        dayElement.addEventListener('mouseenter', function() {
            if (dayTotal > 0) {
                this.style.transform = 'scale(1.1)';
                this.style.zIndex = '3';
                this.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
            }
        });
        
        dayElement.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.zIndex = '';
            this.style.boxShadow = '';
        });
        
        container.appendChild(dayElement);
    }
    
    // Update calendar insights
    updateCalendarInsights(monthExpenses, monthTotal, daysInMonth);
}

// Show day details
function showDayDetails(dateString, total, expenses) {
    const date = new Date(dateString);
    const dateFormatted = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3><i class="fas fa-calendar-day"></i> ${dateFormatted}</h3>
            <div class="modal-summary">
                <div class="modal-stat">
                    <span class="stat-label">Day Total</span>
                    <span class="stat-value">${formatCurrency(total)}</span>
                </div>
                <div class="modal-stat">
                    <span class="stat-label">Expenses</span>
                    <span class="stat-value">${expenses.length}</span>
                </div>
                ${expenses.length > 0 ? `
                <div class="modal-stat">
                    <span class="stat-label">Average per Expense</span>
                    <span class="stat-value">${formatCurrency(total / expenses.length)}</span>
                </div>` : ''}
            </div>
            ${expenses.length > 0 ? `
            <div class="modal-expenses-list">
                ${expenses.map(expense => {
                    const category = getCategoryById(expense.category);
                    const time = new Date(expense.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                    return `
                        <div class="expense-item">
                            <div class="expense-icon" style="background: ${category.color}20; color: ${category.color}">
                                ${category.icon}
                            </div>
                            <div class="expense-details">
                                <h4>${expense.description}</h4>
                                <p>${category.name} • ${time}</p>
                                ${expense.note ? `<small><i>${expense.note}</i></small>` : ''}
                            </div>
                            <div class="expense-amount">${formatCurrency(expense.amount)}</div>
                        </div>
                    `;
                }).join('')}
            </div>` : 
            `<div class="empty-state">
                <i class="fas fa-calendar fa-3x"></i>
                <h3>No expenses on this day</h3>
                <p>This was a no-spend day!</p>
            </div>`}
            <div class="modal-actions">
                <button class="btn-secondary" onclick="closeModal()">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Update calendar insights
function updateCalendarInsights(monthExpenses, monthTotal, daysInMonth) {
    const container = document.getElementById('calendar-insights');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (monthExpenses.length === 0) {
        container.innerHTML = `
            <div class="insight-card">
                <h4><i class="fas fa-lightbulb"></i> No Expenses Yet</h4>
                <p>Start tracking your expenses to see insights here!</p>
            </div>
        `;
        return;
    }
    
    // Calculate insights
    const categoryTotals = getCategoryTotals(monthExpenses);
    const topCategory = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])[0];
    
    // Highest spending day
    let highestDay = 0;
    let highestDayDate = '';
    for (let day = 1; day <= daysInMonth; day++) {
        const dateString = `${currentCalendarYear}-${String(currentCalendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayTotal = getTotalForDate(dateString);
        if (dayTotal > highestDay) {
            highestDay = dayTotal;
            highestDayDate = new Date(dateString).getDate();
        }
    }
    
    // Most active day (most expenses)
    const dayExpenseCounts = {};
    monthExpenses.forEach(expense => {
        const day = new Date(expense.date).getDate();
        dayExpenseCounts[day] = (dayExpenseCounts[day] || 0) + 1;
    });
    
    const mostActiveDay = Object.entries(dayExpenseCounts)
        .sort((a, b) => b[1] - a[1])[0];
    
    // Create insight cards
    const insights = [
        {
            icon: 'fas fa-trophy',
            title: 'Top Category',
            description: 'Your highest spending category this month',
            value: topCategory ? `${getCategoryName(topCategory[0])} (${formatCurrency(topCategory[1])})` : 'None'
        },
        {
            icon: 'fas fa-crown',
            title: 'Highest Day',
            description: 'Day with the most spending',
            value: highestDay > 0 ? `Day ${highestDayDate}: ${formatCurrency(highestDay)}` : 'None'
        },
        {
            icon: 'fas fa-bullseye',
            title: 'Most Active Day',
            description: 'Day with most number of expenses',
            value: mostActiveDay ? `Day ${mostActiveDay[0]}: ${mostActiveDay[1]} expenses` : 'None'
        },
        {
            icon: 'fas fa-chart-line',
            title: 'Daily Average',
            description: 'Average spending per day',
            value: formatCurrency(monthTotal / daysInMonth)
        }
    ];
    
    insights.forEach(insight => {
        const card = document.createElement('div');
        card.className = 'insight-card';
        card.innerHTML = `
            <h4><i class="${insight.icon}"></i> ${insight.title}</h4>
            <p>${insight.description}</p>
            <div class="insight-value">${insight.value}</div>
        `;
        container.appendChild(card);
    });
}

// Helper function to get month name
function getMonthName(monthIndex) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[monthIndex];
}

// Add these functions to your existing switchView function
// In your existing switchView function, add:
if (viewName === 'monthly') {
    updateMonthlyView();
}
if (viewName === 'calendar') {
    updateCalendar();
}