// Edino Project Generator - Webview Script
console.log('🚀 Edino webview script loaded');

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, initializing event handlers');
    
    // Initialize all interactive elements
    initializeEventHandlers();
    
    // Add performance monitoring
    console.log('⚡ Performance: DOM ready in', performance.now(), 'ms');
});

function initializeEventHandlers() {
    console.log('🔧 Setting up event handlers');
    
    // Action items
    const actionItems = document.querySelectorAll('.action-item');
    console.log('📋 Found', actionItems.length, 'action items');
    
    actionItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isPrimary = this.classList.contains('primary');
            console.log('🎯 Action item clicked:', isPrimary ? 'primary' : 'secondary');
            
            // Add visual feedback
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            if (isPrimary) {
                createProject();
            } else {
                createAdvancedProject();
            }
        });
    });
    
    // Template items
    const templateItems = document.querySelectorAll('.template-item');
    console.log('📋 Found', templateItems.length, 'template items');
    
    templateItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🎯 Template item clicked');
            
            // Add visual feedback
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // Extract template type from onclick attribute or default to quick start
            const onclickAttr = this.getAttribute('onclick');
            if (onclickAttr && onclickAttr.includes('fullstack')) {
                createProject('fullstack');
            } else if (onclickAttr && onclickAttr.includes('frontend')) {
                createProject('frontend');
            } else if (onclickAttr && onclickAttr.includes('backend')) {
                createProject('backend');
            } else {
                createProject();
            }
        });
    });
    
    // Language items
    const langItems = document.querySelectorAll('.lang-item');
    console.log('📋 Found', langItems.length, 'language items');
    
    langItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🎯 Language item clicked');
            
            // Add visual feedback
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            createAdvancedProject();
        });
    });
    
    // Footer links
    const footerLinks = document.querySelectorAll('.footer-link');
    console.log('📋 Found', footerLinks.length, 'footer links');
    
    footerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const text = this.textContent;
            console.log('🎯 Footer link clicked:', text);
            
            if (text.includes('Documentation')) {
                showDocumentation();
            }
        });
    });
    
    // Remove inline onclick attributes to prevent double-triggering
    removeInlineOnclicks();
}

function removeInlineOnclicks() {
    console.log('🧹 Removing inline onclick attributes');
    
    const elementsWithOnclick = document.querySelectorAll('[onclick]');
    elementsWithOnclick.forEach(element => {
        element.removeAttribute('onclick');
    });
}

// Project creation functions
function createProject(type = 'quick') {
    console.log('🚀 Creating project:', type);
    
    // Add loading state
    const container = document.querySelector('.welcome-container');
    if (container) {
        container.classList.add('loading');
    }
    
    // Send message to extension
    if (typeof acquireVsCodeApi !== 'undefined') {
        const vscode = acquireVsCodeApi();
        vscode.postMessage({
            command: 'createProject',
            type: type
        });
    } else {
        console.error('❌ VSCode API not available');
    }
    
    // Remove loading state after a delay
    setTimeout(() => {
        if (container) {
            container.classList.remove('loading');
        }
    }, 2000);
}

function createAdvancedProject() {
    console.log('🎯 Creating advanced project');
    
    // Add loading state
    const container = document.querySelector('.welcome-container');
    if (container) {
        container.classList.add('loading');
    }
    
    // Send message to extension
    if (typeof acquireVsCodeApi !== 'undefined') {
        const vscode = acquireVsCodeApi();
        vscode.postMessage({
            command: 'createAdvancedProject'
        });
    } else {
        console.error('❌ VSCode API not available');
    }
    
    // Remove loading state after a delay
    setTimeout(() => {
        if (container) {
            container.classList.remove('loading');
        }
    }, 2000);
}

function showDocumentation() {
    console.log('📚 Showing documentation');
    
    // Send message to extension
    if (typeof acquireVsCodeApi !== 'undefined') {
        const vscode = acquireVsCodeApi();
        vscode.postMessage({
            command: 'showDocumentation'
        });
    } else {
        console.error('❌ VSCode API not available');
    }
}

// Touch support for mobile devices
document.addEventListener('touchstart', function(e) {
    const target = e.target.closest('.action-item, .template-item, .lang-item, .footer-link');
    if (target) {
        target.style.opacity = '0.7';
    }
});

document.addEventListener('touchend', function(e) {
    const target = e.target.closest('.action-item, .template-item, .lang-item, .footer-link');
    if (target) {
        target.style.opacity = '';
    }
});

// Smooth scrolling for better UX
document.addEventListener('click', function(e) {
    const target = e.target.closest('.action-item, .template-item, .lang-item');
    if (target) {
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }
});

// Performance monitoring
window.addEventListener('load', function() {
    console.log('⚡ Performance: Page fully loaded in', performance.now(), 'ms');
    
    // Log element counts for debugging
    const actionCount = document.querySelectorAll('.action-item').length;
    const templateCount = document.querySelectorAll('.template-item').length;
    const langCount = document.querySelectorAll('.lang-item').length;
    
    console.log('📊 UI Elements:', {
        actions: actionCount,
        templates: templateCount,
        languages: langCount
    });
});

// Error handling
window.addEventListener('error', function(e) {
    console.error('❌ Script error:', e.error);
});

// Success logging
console.log('✅ Edino webview script initialized successfully');
