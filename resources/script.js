// Welcome Screen JavaScript - Ultra Compact & Informative
const vscode = acquireVsCodeApi();

function createProject(type = null) {
    console.log('createProject called with type:', type);
    // Send message to extension
    vscode.postMessage({
        command: 'createProject',
        type: type
    });
}

function createAdvancedProject() {
    console.log('createAdvancedProject called');
    // Send message to extension to create advanced project
    vscode.postMessage({
        command: 'createAdvancedProject'
    });
}

function showDocumentation() {
    console.log('showDocumentation called');
    // Send message to extension
    vscode.postMessage({
        command: 'showDocumentation'
    });
}

// Add click event listeners for all interactive elements
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up compact UI event listeners');
    
    // Handle template card clicks
    const templateCards = document.querySelectorAll('.template-card.compact');
    console.log('Found template cards:', templateCards.length);
    
    templateCards.forEach(card => {
        card.addEventListener('click', function(e) {
            console.log('Template card clicked');
            e.preventDefault();
            e.stopPropagation();
            
            // Add visual feedback
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // Get project type from card
            const type = this.querySelector('h4').textContent.toLowerCase();
            createProject(type);
        });
    });
    
    // Handle language item clicks
    const langItems = document.querySelectorAll('.lang-item');
    console.log('Found language items:', langItems.length);
    
    langItems.forEach(item => {
        item.addEventListener('click', function(e) {
            console.log('Language item clicked');
            e.preventDefault();
            e.stopPropagation();
            
            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            createAdvancedProject();
        });
    });
    
    // Handle action button clicks
    const actionButtons = document.querySelectorAll('.action-btn.compact');
    console.log('Found action buttons:', actionButtons.length);
    
    actionButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            console.log('Action button clicked:', this.textContent);
            e.preventDefault();
            e.stopPropagation();
            
            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // Check button text to determine action
            const buttonText = this.textContent.toLowerCase();
            if (buttonText.includes('quick start')) {
                createProject();
            } else if (buttonText.includes('advanced')) {
                createAdvancedProject();
            }
        });
    });
    
    // Handle footer button clicks
    const footerButtons = document.querySelectorAll('.footer-btn');
    console.log('Found footer buttons:', footerButtons.length);
    
    footerButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            console.log('Footer button clicked:', this.textContent);
            e.preventDefault();
            e.stopPropagation();
            
            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // Check button text to determine action
            const buttonText = this.textContent.toLowerCase();
            if (buttonText.includes('quick start')) {
                createProject();
            } else if (buttonText.includes('browse all')) {
                createAdvancedProject();
            }
        });
    });
    
    // Handle documentation link clicks
    const docsLinks = document.querySelectorAll('.docs-link');
    docsLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            console.log('Documentation link clicked');
            e.preventDefault();
            e.stopPropagation();
            showDocumentation();
        });
    });
    
    // Add hover effects for all interactive elements
    const interactiveElements = document.querySelectorAll('.template-card.compact, .lang-item, .action-btn.compact, .footer-btn, .docs-link');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            if (!this.classList.contains('template-card')) {
                this.style.transform = 'translateY(-1px)';
            }
        });
        
        element.addEventListener('mouseleave', function() {
            if (!this.classList.contains('template-card')) {
                this.style.transform = 'translateY(0)';
            }
        });
    });
    
    // Add loading states for better UX
    function addLoadingState(element) {
        element.classList.add('loading');
        element.style.pointerEvents = 'none';
        
        setTimeout(() => {
            element.classList.remove('loading');
            element.style.pointerEvents = 'auto';
        }, 2000);
    }
    
    // Add success states for feedback
    function addSuccessState(element) {
        element.classList.add('success');
        setTimeout(() => {
            element.classList.remove('success');
        }, 1000);
    }
    
    // Enhanced click handlers with loading states
    const allClickableElements = document.querySelectorAll('.template-card.compact, .lang-item, .action-btn.compact, .footer-btn');
    allClickableElements.forEach(element => {
        const originalClickHandler = element.onclick;
        element.addEventListener('click', function(e) {
            addLoadingState(this);
        });
    });
});

// Handle keyboard navigation for accessibility
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        const focusedElement = document.activeElement;
        if (focusedElement.classList.contains('template-card') || 
            focusedElement.classList.contains('lang-item') ||
            focusedElement.classList.contains('action-btn') ||
            focusedElement.classList.contains('footer-btn') ||
            focusedElement.classList.contains('docs-link')) {
            event.preventDefault();
            focusedElement.click();
        }
    }
});

// Add smooth scrolling for better UX
document.addEventListener('wheel', function(event) {
    if (event.deltaY !== 0) {
        event.preventDefault();
        const container = document.querySelector('.welcome-container.compact');
        container.scrollTop += event.deltaY * 0.5;
    }
}, { passive: false });

// Add touch support for mobile devices
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', function(event) {
    touchStartY = event.touches[0].clientY;
});

document.addEventListener('touchend', function(event) {
    touchEndY = event.changedTouches[0].clientY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > swipeThreshold) {
        const container = document.querySelector('.welcome-container.compact');
        if (diff > 0) {
            // Swipe up
            container.scrollTop += 100;
        } else {
            // Swipe down
            container.scrollTop -= 100;
        }
    }
}

// Performance optimization: Debounce scroll events
let scrollTimeout;
document.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        // Handle scroll end
        console.log('Scroll ended');
    }, 150);
});

// Debug function to test if script is loaded
console.log('Edino ultra-compact welcome panel script loaded successfully');

// Add performance monitoring
const startTime = performance.now();
window.addEventListener('load', function() {
    const loadTime = performance.now() - startTime;
    console.log(`Welcome panel loaded in ${loadTime.toFixed(2)}ms`);
});
