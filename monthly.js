// monthly.js - Enhanced Monthly View Features

let currentYear = new Date().getFullYear();
let isChartView = false;

// Update monthly view
function updateMonthlyView() {
    console.log('Updating monthly view for', currentYear);
    
    // Update year display
    const yearDisplay = document.getElementById('current-year-display');
    if (yearDisplay) yearDisplay.textContent = currentYear;
    
    // Update all components
    updateYearSummary();
    updateMonthsGrid();
    updateCurrentMonthDetails();
    
    // Update chart if needed
    if (isChartView) {
        updateMonthlyChart();
    }
}

// Update year summary
function updateYearSummary() {
    const yearExpenses = getExpensesForYear(currentYear);
    const total = yearExpenses.reduce((sum, e) => sum + e.amount, 0);
    const avg = total / 12;
    
    const elements = {
        'year-total-summary': formatCurrency(total),
        'year-expenses-count': yearExpenses.length,
        'year-monthly-average': formatCurrency(avg)
    };
    
    Object.keys(elements).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = elements[id];
    });
}

// Update months grid
function updateMonthsGrid() {
    const container = document.getElementById('months-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYearNow = now.getFullYear();
    
    monthNames.forEach((month, index) => {
        const monthExpenses = getExpensesForMonth(currentYear, index);
        const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
        const isCurrent = currentYear === currentYearNow && index === currentMonth;
        
        const card = document.createElement('div');
        card.className = 'month-card' + (isCurrent ? ' current' : '');
        card.style.animationDelay = (index * 0.1) + 's';
        
        // Get trend indicator
        const prevYearExpenses = getExpensesForMonth(currentYear - 1, index);
        const prevTotal = prevYearExpenses.reduce((sum, e) => sum + e.amount, 0);
        let trend = '';
        
        if (prevTotal > 0 && total > prevTotal) {
            const percent = ((total - prevTotal) / prevTotal * 100).toFixed(0);
            trend = `<span class="trend-up">↑${percent}%</span>`;
        } else if (prevTotal > 0 && total < prevTotal) {
            const percent = ((prevTotal - total) / prevTotal * 100).toFixed(0);
            trend = `<span class="trend-down">↓${percent}%</span>`;
        }
        
        card.innerHTML = `
            <div class="month-name">${month}</div>
            <div class="month-total">${formatCurrency(total)}</div>
            <div class="month-expenses">${monthExpenses.length} expenses</div>
            ${trend}
        `;
        
        // Click to view month details
        card.onclick = () => showMonthDetails(currentYear, index, month);
        
        container.appendChild(card);
    });
}

// Show month details
function showMonthDetails(year, monthIndex, monthName) {
    const expenses = getExpensesForMonth(year, monthIndex);
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2><i class="fas fa-calendar-alt"></i> ${monthName} ${year}</h2>
            <div class="modal-stats">
                <div class="modal-stat">
                    <span>Total</span>
                    <strong>${formatCurrency(total)}</strong>
                </div>
                <div class="modal-stat">
                    <span>Expenses</span>
                    <strong>${expenses.length}</strong>
                </div>
                <div class="modal-stat">
                    <span>Daily Avg</span>
                    <strong>${formatCurrency(total / 30)}</strong>
                </div>
            </div>
            <div class="modal-expenses">
                <h3>Expenses</h3>
                ${expenses.length === 0 ? 
                    '<p class="empty">No expenses this month</p>' :
                    expenses.map(e => `
                        <div class="expense-item">
                            <div class="expense-icon">${getCategoryById(e.category)?.icon || '📦'}</div>
                            <div class="expense-details">
                                <strong>${e.description}</strong>
                                <small>${formatShortDate(e.date)} • ${getCategoryById(e.category)?.name || 'Other'}</small>
                            </div>
                            <div class="expense-amount">${formatCurrency(e.amount)}</div>
                        </div>
                    `).join('')
                }
            </div>
            <button class="btn-close" onclick="this.closest('.modal').remove()">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Update current month details
function updateCurrentMonthDetails() {
    const now = new Date();
    const expenses = getExpensesForMonth(now.getFullYear(), now.getMonth());
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Update stats
    document.getElementById('current-month-total').textContent = formatCurrency(total);
    document.getElementById('current-month-count').textContent = expenses.length;
    document.getElementById('current-month-daily-avg').textContent = formatCurrency(total / 30);
    
    // Update categories
    updateCurrentMonthCategories(expenses);
}

// Update current month categories
function updateCurrentMonthCategories(expenses) {
    const container = document.getElementById('current-month-categories');
    if (!container) return;
    
    const totals = getCategoryTotals(expenses);
    const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    
    container.innerHTML = sorted.map(([catId, amount]) => {
        const cat = getCategoryById(catId);
        return `
            <div class="category-item">
                <span class="category-name">${cat.icon} ${cat.name}</span>
                <span class="category-amount">${formatCurrency(amount)}</span>
            </div>
        `;
    }).join('') || '<p class="empty">No categories yet</p>';
}

// Update monthly chart
function updateMonthlyChart() {
    const ctx = document.getElementById('monthlyExpensesChart');
    if (!ctx) return;
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const data = monthNames.map((_, index) => {
        const expenses = getExpensesForMonth(currentYear, index);
        return expenses.reduce((sum, e) => sum + e.amount, 0);
    });
    
    // Destroy old chart
    if (window.monthlyChart) {
        window.monthlyChart.destroy();
    }
    
    window.monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthNames,
            datasets: [{
                label: 'Monthly Spending',
                data: data,
                backgroundColor: '#4361ee',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => formatCurrency(ctx.raw)
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => formatCurrency(value)
                    }
                }
            }
        }
    });
}

// Toggle view
function toggleMonthlyView() {
    isChartView = !isChartView;
    const grid = document.getElementById('months-grid-view');
    const chart = document.getElementById('monthly-chart-view');
    const btn = document.getElementById('toggle-view-btn');
    
    if (isChartView) {
        grid.style.display = 'none';
        chart.style.display = 'block';
        btn.innerHTML = '<i class="fas fa-th-large"></i> Grid View';
        updateMonthlyChart();
    } else {
        grid.style.display = 'block';
        chart.style.display = 'none';
        btn.innerHTML = '<i class="fas fa-chart-bar"></i> Chart View';
    }
}

// Change year
function changeYear(delta) {
    currentYear += delta;
    updateMonthlyView();
}

// Go to current year
function goToCurrentYear() {
    currentYear = new Date().getFullYear();
    updateMonthlyView();
}