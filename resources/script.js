// Welcome Screen JavaScript
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

// Add click event listeners for project cards
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up event listeners');
    
    // Handle project card clicks
    const projectCards = document.querySelectorAll('.project-card');
    console.log('Found project cards:', projectCards.length);
    
    projectCards.forEach(card => {
        card.addEventListener('click', function(e) {
            console.log('Project card clicked');
            // Prevent double execution if onclick is also present
            e.stopPropagation();
            
            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // Get project type from card
            const type = this.querySelector('h3').textContent.toLowerCase();
            createProject(type);
        });
    });
    
    // Handle create buttons specifically
    const createButtons = document.querySelectorAll('.create-btn');
    console.log('Found create buttons:', createButtons.length);
    
    createButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            console.log('Create button clicked');
            e.preventDefault();
            e.stopPropagation();
            
            // Find the parent project card
            const projectCard = this.closest('.project-card');
            if (projectCard) {
                const type = projectCard.querySelector('h3').textContent.toLowerCase();
                createProject(type);
            } else {
                createProject();
            }
        });
    });
    
    // Handle action buttons
    const actionButtons = document.querySelectorAll('.action-btn');
    console.log('Found action buttons:', actionButtons.length);
    
    actionButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            console.log('Action button clicked:', this.textContent);
            e.preventDefault();
            
            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // Check button text or class to determine action
            const buttonText = this.textContent.toLowerCase();
            if (buttonText.includes('create') || buttonText.includes('new project')) {
                createProject();
            } else if (buttonText.includes('advanced') || buttonText.includes('templates')) {
                createAdvancedProject();
            } else if (buttonText.includes('documentation')) {
                showDocumentation();
            }
        });
    });
    
    // Handle language card clicks
    const languageCards = document.querySelectorAll('.language-card');
    console.log('Found language cards:', languageCards.length);
    
    languageCards.forEach(card => {
        card.addEventListener('click', function(e) {
            console.log('Language card clicked');
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
    
    // Add hover effects for interactive elements
    const interactiveElements = document.querySelectorAll('.project-card, .language-card, .action-btn, .create-btn');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

// Handle keyboard navigation
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        const focusedElement = document.activeElement;
        if (focusedElement.classList.contains('project-card') || 
            focusedElement.classList.contains('action-btn') ||
            focusedElement.classList.contains('language-card') ||
            focusedElement.classList.contains('create-btn')) {
            event.preventDefault();
            focusedElement.click();
        }
    }
});

// Debug function to test if script is loaded
console.log('Edino welcome panel script loaded successfully');
