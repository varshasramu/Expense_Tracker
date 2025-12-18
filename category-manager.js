// category-manager.js - SIMPLIFIED VERSION

function initCategorySystem() {
    console.log('Initializing category system...');
    
    const container = document.getElementById('quick-category-buttons');
    if (!container || !window.categories) {
        console.log('Container or categories not ready');
        setTimeout(initCategorySystem, 100);
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
    
    console.log('Category system initialized');
}

// Export to window
window.initCategorySystem = initCategorySystem;