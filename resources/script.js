// Edino Project Generator - Webview Script
console.log('🚀 Edino webview script loaded');

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, initializing event handlers');
    
    // Initialize all interactive elements
    initializeEventHandlers();
    
    // Initialize search functionality
    initializeSearch();
    
    // Add performance monitoring
    console.log('⚡ Performance: DOM ready in', performance.now(), 'ms');
});

function initializeEventHandlers() {
    console.log('🔧 Setting up event handlers');
    
    // Action buttons (ultra compact design)
    const actionBtns = document.querySelectorAll('.action-btn');
    console.log('📋 Found', actionBtns.length, 'action buttons');
    
    actionBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const action = this.getAttribute('data-action');
            console.log('🎯 Action button clicked:', action);
            
            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            if (action === 'quick') {
                createProject();
            } else if (action === 'advanced') {
                createAdvancedProject();
            } else if (action === 'ai') {
                createAIProject();
            } else if (action === 'clear-search') {
                clearSearch();
            }
        });
    });
    
    // Template items ultra (ultra compact design)
    const templateItemsUltra = document.querySelectorAll('.template-item-ultra');
    console.log('📋 Found', templateItemsUltra.length, 'ultra template items');
    
    templateItemsUltra.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const templateType = item.getAttribute('data-template');
            const language = item.getAttribute('data-language');
            const framework = item.getAttribute('data-framework');
            const title = item.querySelector('.template-name-ultra')?.textContent || '';
            
            console.log('🎯 Ultra template item clicked:', { templateType, language, framework, title });
            
            // Add visual feedback
            item.style.transform = 'scale(0.95)';
            setTimeout(() => {
                item.style.transform = '';
            }, 150);
            
            if (templateType) {
                createProject(templateType, { language, framework, title });
            } else {
                createProject();
            }
        });
    });
    
    // Action cards (professional design)
    const actionCards = document.querySelectorAll('.action-card');
    console.log('📋 Found', actionCards.length, 'action cards');
    
    actionCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const action = this.getAttribute('data-action');
            console.log('🎯 Action card clicked:', action);
            
            // Add visual feedback
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            if (action === 'quick') {
                createProject();
            } else if (action === 'advanced') {
                createAdvancedProject();
            } else if (action === 'ai') {
                createAIProject();
            } else if (action === 'clear-search') {
                clearSearch();
            }
        });
    });
    
    // Template cards (professional design)
    const templateCards = document.querySelectorAll('.template-card');
    console.log('📋 Found', templateCards.length, 'template cards');
    
    templateCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const templateType = card.getAttribute('data-template');
            const language = card.getAttribute('data-language');
            const framework = card.getAttribute('data-framework');
            const title = card.querySelector('h4')?.textContent || '';
            
            console.log('🎯 Template card clicked:', { templateType, language, framework, title });
            
            // Add visual feedback
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                card.style.transform = '';
            }, 150);
            
            if (templateType) {
                createProject(templateType, { language, framework, title });
            } else {
                createProject();
            }
        });
    });
    
    // Legacy support for old design elements
    const actionItems = document.querySelectorAll('.action-item');
    console.log('📋 Found', actionItems.length, 'legacy action items');
    
    actionItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const action = this.getAttribute('data-action');
            console.log('🎯 Legacy action item clicked:', action);
            
            // Add visual feedback
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            if (action === 'quick') {
                createProject();
            } else if (action === 'advanced') {
                createAdvancedProject();
            } else if (action === 'ai') {
                createAIProject();
            } else if (action === 'clear-search') {
                clearSearch();
            }
        });
    });
    
    // Legacy template items
    const templateItems = document.querySelectorAll('.template-item');
    console.log('📋 Found', templateItems.length, 'legacy template items');
    
    templateItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const templateType = this.getAttribute('data-template');
            const language = this.getAttribute('data-language');
            const framework = this.getAttribute('data-framework');
            const title = this.querySelector('.template-title')?.textContent || '';
            
            console.log('🎯 Legacy template item clicked:', { templateType, language, framework, title });
            
            // Add visual feedback
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            if (templateType) {
                createProject(templateType, { language, framework, title });
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
            
            const action = this.getAttribute('data-action');
            console.log('🎯 Language item clicked:', action);
            
            // Add visual feedback
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            if (action === 'advanced') {
                createAdvancedProject();
            }
        });
    });
    
    // Footer links
    const footerLinks = document.querySelectorAll('.footer-link');
    console.log('📋 Found', footerLinks.length, 'footer links');
    
    footerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const action = this.getAttribute('data-action');
            console.log('🎯 Footer link clicked:', action);
            
            if (action === 'documentation') {
                showDocumentation();
            }
        });
    });
}

function initializeSearch() {
    console.log('🔍 Initializing search functionality');
    
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    const searchStats = document.getElementById('searchStats');
    const searchResults = document.getElementById('searchResults');
    
    if (!searchInput) {
        console.error('❌ Search input not found');
        return;
    }
    
    // Search input event listener
    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase().trim();
        console.log('🔍 Search query:', query);
        
        if (query.length === 0) {
            clearSearch();
            return;
        }
        
        performSearch(query);
    });
    
    // Search clear button
    if (searchClear) {
        searchClear.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            clearSearch();
        });
    }
    
    // Keyboard shortcuts
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            clearSearch();
        }
    });
}

function performSearch(query) {
    console.log('🔍 Performing search for:', query);
    
    const searchClear = document.getElementById('searchClear') || document.getElementById('searchClear-pro') || document.getElementById('searchClear-ultra');
    const searchStats = document.getElementById('searchStats');
    const searchResults = document.getElementById('searchResults');
    const noResults = document.getElementById('noResults') || document.getElementById('noResults-pro') || document.getElementById('noResults-ultra');
    
    let totalResults = 0;
    
    // Search in ultra compact template items
    const templateItemsUltra = document.querySelectorAll('.template-item-ultra');
    let templateResults = 0;
    
    templateItemsUltra.forEach(item => {
        const searchData = item.getAttribute('data-search') || '';
        const title = item.querySelector('.template-name-ultra')?.textContent || '';
        const stack = item.querySelector('.template-stack-ultra')?.textContent || '';
        
        const searchText = `${searchData} ${title} ${stack}`.toLowerCase();
        
        if (searchText.includes(query)) {
            item.classList.remove('hidden');
            templateResults++;
            totalResults++;
        } else {
            item.classList.add('hidden');
        }
    });
    
    // Search in template cards (professional design)
    const templateCards = document.querySelectorAll('.template-card');
    
    templateCards.forEach(card => {
        const searchData = card.getAttribute('data-search') || '';
        const title = card.querySelector('h4')?.textContent || '';
        const stack = card.querySelector('.template-stack')?.textContent || '';
        const tags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent).join(' ');
        
        const searchText = `${searchData} ${title} ${stack} ${tags}`.toLowerCase();
        
        if (searchText.includes(query)) {
            card.classList.remove('hidden');
            totalResults++;
        } else {
            card.classList.add('hidden');
        }
    });
    
    // Search in legacy template items
    const templateItems = document.querySelectorAll('.template-item');
    
    templateItems.forEach(item => {
        const searchData = item.getAttribute('data-search') || '';
        const title = item.querySelector('.template-title')?.textContent || '';
        const stack = item.querySelector('.template-stack')?.textContent || '';
        const tags = Array.from(item.querySelectorAll('.tag')).map(tag => tag.textContent).join(' ');
        
        const searchText = `${searchData} ${title} ${stack} ${tags}`.toLowerCase();
        
        if (searchText.includes(query)) {
            item.classList.remove('hidden');
            totalResults++;
        } else {
            item.classList.add('hidden');
        }
    });
    
    // Search in languages
    const langItems = document.querySelectorAll('.lang-item');
    let langResults = 0;
    
    langItems.forEach(item => {
        const searchData = item.getAttribute('data-search') || '';
        const name = item.querySelector('.lang-name')?.textContent || '';
        const frameworks = item.querySelector('.lang-frameworks')?.textContent || '';
        
        const searchText = `${searchData} ${name} ${frameworks}`.toLowerCase();
        
        if (searchText.includes(query)) {
            item.classList.remove('hidden');
            langResults++;
            totalResults++;
        } else {
            item.classList.add('hidden');
        }
    });
    
    // Update UI
    if (searchClear) {
        searchClear.style.display = 'block';
    }
    
    if (searchStats && searchResults) {
        searchStats.style.display = 'block';
        searchResults.textContent = `${totalResults} result${totalResults !== 1 ? 's' : ''}`;
    }
    
    // Show/hide no results message
    if (noResults) {
        if (totalResults === 0) {
            noResults.style.display = 'block';
        } else {
            noResults.style.display = 'none';
        }
    }
    
    console.log('🔍 Search results:', { templateResults, langResults, totalResults });
}

function clearSearch() {
    console.log('🧹 Clearing search');
    
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    const searchStats = document.getElementById('searchStats');
    const noResults = document.getElementById('noResults');
    
    // Clear search input
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Hide clear button
    if (searchClear) {
        searchClear.style.display = 'none';
    }
    
    // Hide search stats
    if (searchStats) {
        searchStats.style.display = 'none';
    }
    
    // Hide no results message
    if (noResults) {
        noResults.style.display = 'none';
    }
    
    // Show all items
    const allItems = document.querySelectorAll('.template-item, .lang-item');
    allItems.forEach(item => {
        item.classList.remove('hidden');
    });
    
    // Focus back to search input
    if (searchInput) {
        searchInput.focus();
    }
}



// Project creation functions
function createProject(type = 'quick', templateInfo = {}) {
    console.log('🚀 Creating project:', type, templateInfo);
    
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
            type: type,
            templateInfo: templateInfo
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

function createAIProject() {
    console.log('🤖 Creating AI-powered project');
    
    // Add loading state
    const container = document.querySelector('.welcome-container');
    if (container) {
        container.classList.add('loading');
    }
    
    // Send message to extension
    if (typeof acquireVsCodeApi !== 'undefined') {
        const vscode = acquireVsCodeApi();
        vscode.postMessage({
            command: 'createAIProject'
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
