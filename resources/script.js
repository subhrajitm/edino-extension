// Welcome Screen JavaScript
const vscode = acquireVsCodeApi();

function createProject(type = null) {
    // Send message to extension
    vscode.postMessage({
        command: 'createProject',
        type: type
    });
}

function showDocumentation() {
    // Send message to extension
    vscode.postMessage({
        command: 'showDocumentation'
    });
}

// Add click event listeners for project cards
document.addEventListener('DOMContentLoaded', function() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('click', function() {
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
    
    // Add hover effects for buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

// Handle keyboard navigation
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        const focusedElement = document.activeElement;
        if (focusedElement.classList.contains('project-card') || 
            focusedElement.classList.contains('action-btn')) {
            event.preventDefault();
            focusedElement.click();
        }
    }
});
