// landing.js - Landing Page Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(15, 23, 42, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = 'rgba(15, 23, 42, 0.9)';
            navbar.style.backdropFilter = 'blur(10px)';
        }
    });
    
    // Animate features on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__animated', 'animate__fadeInUp');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        observer.observe(card);
    });
    
    // Observe steps
    document.querySelectorAll('.step').forEach(step => {
        observer.observe(step);
    });
    
    // Demo animation
    animateDemoApp();
});

// Animate the demo app in the phone mockup
function animateDemoApp() {
    const demoExpenses = document.querySelectorAll('.demo-expense');
    const chartBars = document.querySelectorAll('.chart-bar');
    
    if (demoExpenses.length === 0) return;
    
    // Animate expenses one by one
    demoExpenses.forEach((expense, index) => {
        setTimeout(() => {
            expense.style.opacity = '1';
            expense.style.transform = 'translateX(0)';
        }, index * 500);
    });
    
    // Animate chart bars
    chartBars.forEach((bar, index) => {
        setTimeout(() => {
            const randomHeight = 30 + Math.random() * 40;
            bar.style.height = `${randomHeight}%`;
        }, index * 300 + 1500);
    });
    
    // Restart animation every 5 seconds
    setTimeout(() => {
        resetDemoAnimation();
        setTimeout(animateDemoApp, 500);
    }, 5000);
}

// Reset demo animation
function resetDemoAnimation() {
    const demoExpenses = document.querySelectorAll('.demo-expense');
    const chartBars = document.querySelectorAll('.chart-bar');
    
    demoExpenses.forEach(expense => {
        expense.style.opacity = '0.5';
        expense.style.transform = 'translateX(-10px)';
    });
    
    chartBars.forEach(bar => {
        bar.style.height = '10%';
    });
}

// Login button handler
function handleLogin() {
    alert('Login feature will be implemented in the next version!');
}

// Get Started button handler
function handleGetStarted() {
    // Smooth transition to dashboard
    document.body.classList.add('page-transition');
    
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 500);
}

// Watch Demo button handler
function handleWatchDemo() {
    // Create demo video modal
    const modal = document.createElement('div');
    modal.className = 'demo-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-modal" onclick="closeDemoModal()">×</button>
            <h2>SmartSpend Demo</h2>
            <div class="demo-video">
                <!-- You can add a YouTube embed or custom video here -->
                <div class="video-placeholder">
                    <i class="fas fa-play-circle"></i>
                    <p>See how SmartSpend helps you track expenses easily</p>
                </div>
            </div>
            <div class="demo-features">
                <div class="demo-feature">
                    <i class="fas fa-bolt"></i>
                    <h4>Quick Add</h4>
                    <p>Add expenses in seconds</p>
                </div>
                <div class="demo-feature">
                    <i class="fas fa-chart-pie"></i>
                    <h4>Visual Reports</h4>
                    <p>See spending patterns</p>
                </div>
                <div class="demo-feature">
                    <i class="fas fa-calendar-alt"></i>
                    <h4>Calendar View</h4>
                    <p>Track daily spending</p>
                </div>
            </div>
            <button class="btn-primary" onclick="handleGetStarted()">
                Try It Yourself
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .demo-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            animation: fadeIn 0.3s ease;
        }
        .demo-modal .modal-content {
            background: var(--dark);
            border-radius: 20px;
            padding: 30px;
            max-width: 800px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .close-modal {
            position: absolute;
            top: 20px;
            right: 20px;
            background: none;
            border: none;
            color: white;
            font-size: 2rem;
            cursor: pointer;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.3s;
        }
        .close-modal:hover {
            background: rgba(255,255,255,0.1);
        }
        .demo-video {
            background: rgba(0,0,0,0.3);
            border-radius: 15px;
            padding: 40px;
            text-align: center;
            margin: 20px 0;
        }
        .video-placeholder i {
            font-size: 4rem;
            color: var(--primary);
            margin-bottom: 20px;
        }
        .video-placeholder p {
            color: #94a3b8;
            font-size: 1.1rem;
        }
        .demo-features {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin: 30px 0;
        }
        .demo-feature {
            text-align: center;
            padding: 20px;
            background: rgba(255,255,255,0.05);
            border-radius: 15px;
        }
        .demo-feature i {
            font-size: 2rem;
            margin-bottom: 15px;
            color: var(--primary);
        }
        .demo-feature h4 {
            margin-bottom: 10px;
            color: white;
        }
        .demo-feature p {
            color: #94a3b8;
            font-size: 0.9rem;
        }
        .page-transition {
            animation: fadeOut 0.5s ease forwards;
        }
        @keyframes fadeOut {
            to {
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Close demo modal
function closeDemoModal() {
    const modal = document.querySelector('.demo-modal');
    if (modal) {
        modal.remove();
    }
}