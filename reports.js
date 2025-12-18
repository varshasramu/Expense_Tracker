// reports.js - EXPENSE REPORTS & ANALYTICS

let reportChart = null;

// Initialize reports
function initReports() {
    console.log('Initializing reports...');
    updateReport();
}

// Update report based on selections
function updateReport() {
    const reportType = document.getElementById('report-type').value;
    const period = document.getElementById('report-period').value;
    
    console.log('Generating report:', reportType, 'for', period);
    
    switch(reportType) {
        case 'category':
            generateCategoryReport(period);
            break;
        case 'monthly':
            generateMonthlyReport(period);
            break;
        case 'daily':
            generateDailyReport(period);
            break;
        
    }
}

// Generate category report
function generateCategoryReport(period) {
    let expenses = [];
    
    switch(period) {
        case 'current-month':
            const now = new Date();
            expenses = getExpensesForMonth(now.getFullYear(), now.getMonth());
            break;
        case 'last-month':
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            expenses = getExpensesForMonth(lastMonth.getFullYear(), lastMonth.getMonth());
            break;
       
        case 'all':
            expenses = getAllExpenses();
            break;
    }
    
    const categoryTotals = getCategoryTotals(expenses);
    const labels = Object.keys(categoryTotals).map(getCategoryName);
    const data = Object.values(categoryTotals);
    const colors = Object.keys(categoryTotals).map(getCategoryColor);
    
    // Update chart
    renderChart('doughnut', labels, data, colors, 'Spending by Category');
    
    // Update stats
    updateCategoryStats(expenses, categoryTotals);
}

// Generate monthly report
function generateMonthlyReport(period) {
    const year = new Date().getFullYear();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    let data = [];
    let labels = [];
    
    if (period === 'current-year') {
        labels = monthNames;
        data = getMonthlyTotals(year);
    } else {
        // For other periods, show last 6 months
        const currentMonth = new Date().getMonth();
        for (let i = 5; i >= 0; i--) {
            const month = (currentMonth - i + 12) % 12;
            const monthYear = year - (i > currentMonth ? 1 : 0);
            labels.push(monthNames[month] + ' ' + monthYear);
            data.push(getExpensesForMonth(monthYear, month).reduce((sum, e) => sum + e.amount, 0));
        }
    }
    
    renderChart('bar', labels, data, ['#4361ee'], 'Monthly Spending');
    updateMonthlyStats(data);
}

// Generate daily report
function generateDailyReport(period) {
    const now = new Date();
    let year, month;
    
    if (period === 'current-month') {
        year = now.getFullYear();
        month = now.getMonth();
    } else {
        // Last month
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        year = lastMonth.getFullYear();
        month = lastMonth.getMonth();
    }
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const labels = Array.from({length: daysInMonth}, (_, i) => i + 1);
    const data = getDailyTotals(year, month);
    
    renderChart('line', labels, data, ['#f72585'], 'Daily Spending');
    updateDailyStats(data);
}


// Render chart
function renderChart(type, labels, data, colors, title) {
    const ctx = document.getElementById('reportChart');
    if (!ctx) return;
    
    // Destroy previous chart
    if (reportChart) {
        reportChart.destroy();
    }
    
    const chartData = {
        labels: labels,
        datasets: [{
            label: title,
            data: data,
            backgroundColor: type === 'doughnut' ? colors : colors[0],
            borderColor: type === 'doughnut' ? colors : colors[0],
            borderWidth: 1
        }]
    };
    
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: type === 'doughnut' ? 'right' : 'top',
            },
            title: {
                display: true,
                text: title
            }
        }
    };
    
    reportChart = new Chart(ctx, {
        type: type,
        data: chartData,
        options: options
    });
}

// Update category stats
function updateCategoryStats(expenses, categoryTotals) {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    
    const statsHTML = `
        <div class="stat-item">
            <h4>Total Spending</h4>
            <p class="stat-value">${formatCurrency(total)}</p>
        </div>
        <div class="stat-item">
            <h4>Number of Expenses</h4>
            <p class="stat-value">${expenses.length}</p>
        </div>
        <div class="stat-item">
            <h4>Categories Used</h4>
            <p class="stat-value">${Object.keys(categoryTotals).length}</p>
        </div>
        <div class="stat-item">
            <h4>Top Category</h4>
            <p class="stat-value">${topCategory ? getCategoryName(topCategory[0]) : 'None'}</p>
        </div>
    `;
    
    document.getElementById('report-stats').innerHTML = statsHTML;
}

// Update monthly stats
function updateMonthlyStats(data) {
    const total = data.reduce((sum, val) => sum + val, 0);
    const avg = total / data.length;
    const max = Math.max(...data);
    const min = Math.min(...data.filter(val => val > 0));
    
    const statsHTML = `
        <div class="stat-item">
            <h4>Total Period</h4>
            <p class="stat-value">${formatCurrency(total)}</p>
        </div>
        <div class="stat-item">
            <h4>Monthly Average</h4>
            <p class="stat-value">${formatCurrency(avg)}</p>
        </div>
        <div class="stat-item">
            <h4>Highest Month</h4>
            <p class="stat-value">${formatCurrency(max)}</p>
        </div>
        <div class="stat-item">
            <h4>Lowest Month</h4>
            <p class="stat-value">${formatCurrency(min)}</p>
        </div>
    `;
    
    document.getElementById('report-stats').innerHTML = statsHTML;
}

// Update daily stats
function updateDailyStats(data) {
    const total = data.reduce((sum, val) => sum + val, 0);
    const daysWithSpending = data.filter(val => val > 0).length;
    const avg = daysWithSpending > 0 ? total / daysWithSpending : 0;
    const max = Math.max(...data);
    
    const statsHTML = `
        <div class="stat-item">
            <h4>Month Total</h4>
            <p class="stat-value">${formatCurrency(total)}</p>
        </div>
        <div class="stat-item">
            <h4>Spending Days</h4>
            <p class="stat-value">${daysWithSpending}</p>
        </div>
        <div class="stat-item">
            <h4>Daily Average</h4>
            <p class="stat-value">${formatCurrency(avg)}</p>
        </div>
        <div class="stat-item">
            <h4>Highest Day</h4>
            <p class="stat-value">${formatCurrency(max)}</p>
        </div>
    `;
    
    document.getElementById('report-stats').innerHTML = statsHTML;
}

