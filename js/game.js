/**
 * Monster Running - Game Page JavaScript
 * 
 * This file contains functionality specific to game pages, including:
 * - Game iframe loading and error handling
 * - Like button functionality
 * - Device orientation detection for mobile
 * - Game fullscreen functionality
 */

// DOM Ready Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initGameLoading();
    initLikeButton();
    initGameOrientation();
    initFullscreenButton();
    initSocialSharing();
});

/**
 * Game Loading Functionality
 */
function initGameLoading() {
    const gameContainer = document.querySelector('.game-container');
    
    if (gameContainer) {
        const iframe = gameContainer.querySelector('iframe');
        
        if (iframe) {
            // Add loading indicator
            const loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'game-loading';
            loadingIndicator.innerHTML = '<div class="game-loading-spinner"></div>';
            gameContainer.appendChild(loadingIndicator);
            
            // When iframe loads
            iframe.addEventListener('load', function() {
                // Remove loading indicator with a slight delay to ensure game is rendered
                setTimeout(() => {
                    loadingIndicator.style.opacity = '0';
                    setTimeout(() => {
                        loadingIndicator.remove();
                    }, 300);
                }, 500);
            });
            
            // Handle iframe loading errors
            iframe.addEventListener('error', function() {
                loadingIndicator.innerHTML = `
                    <div class="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p>Failed to load the game.</p>
                        <button class="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg" onclick="location.reload()">Reload</button>
                    </div>
                `;
            });
            
            // Handle timeout if game takes too long to load
            const loadTimeout = setTimeout(() => {
                if (document.querySelector('.game-loading')) {
                    loadingIndicator.innerHTML = `
                        <div class="text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p>Game is taking longer than expected to load.</p>
                            <button class="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg" onclick="location.reload()">Reload</button>
                        </div>
                    `;
                }
            }, 15000); // 15 seconds timeout
            
            // Clear timeout on successful load
            iframe.addEventListener('load', function() {
                clearTimeout(loadTimeout);
            });
        }
    }
}

/**
 * Like Button Functionality
 */
function initLikeButton() {
    const likeButton = document.querySelector('.like-button');
    
    if (likeButton) {
        likeButton.addEventListener('click', function() {
            // Toggle liked state
            this.classList.toggle('liked');
            
            // Get the current like count
            const countElement = this.querySelector('span');
            if (countElement) {
                let count = parseInt(countElement.textContent, 10);
                
                // Update count based on liked state
                if (this.classList.contains('liked')) {
                    count++;
                    showToast('Added to your liked games!', 'success');
                } else {
                    count--;
                    showToast('Removed from your liked games', 'info');
                }
                
                // Update display
                countElement.textContent = count;
                
                // Here you would typically make an AJAX call to update the like count in your database
                // For now, this is just a client-side simulation
                console.log('Game like status changed. New count:', count);
            }
        });
    }
}

/**
 * Orientation Warning for Mobile Devices
 */
function initGameOrientation() {
    // Check if this is a mobile device
    if (window.innerWidth <= 768) {
        // Create orientation warning if it doesn't exist
        if (!document.querySelector('.orientation-warning')) {
            const warning = document.createElement('div');
            warning.className = 'orientation-warning';
            warning.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                </svg>
                <h3 class="text-xl font-bold mb-2">Rotate Your Device</h3>
                <p>This game is best played in landscape mode. Please rotate your device for the best experience.</p>
            `;
            document.body.appendChild(warning);
            
            // Show warning if in portrait mode
            if (window.innerHeight > window.innerWidth) {
                warning.classList.add('show');
            }
            
            // Listen for orientation changes
            window.addEventListener('orientationchange', function() {
                setTimeout(() => {
                    if (window.innerHeight > window.innerWidth) {
                        warning.classList.add('show');
                    } else {
                        warning.classList.remove('show');
                    }
                }, 300);
            });
            
            // Close button for the warning
            const closeButton = document.createElement('button');
            closeButton.className = 'mt-4 px-4 py-2 bg-white text-black rounded-lg';
            closeButton.textContent = 'Continue anyway';
            closeButton.addEventListener('click', function() {
                warning.classList.remove('show');
            });
            warning.appendChild(closeButton);
        }
    }
}

/**
 * Fullscreen Button
 */
function initFullscreenButton() {
    const gameContainer = document.querySelector('.game-container');
    
    if (gameContainer) {
        // Create fullscreen button if it doesn't exist
        if (!document.querySelector('.fullscreen-button')) {
            const fullscreenBtn = document.createElement('button');
            fullscreenBtn.className = 'fullscreen-button';
            fullscreenBtn.setAttribute('aria-label', 'Toggle fullscreen');
            fullscreenBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
            `;
            gameContainer.appendChild(fullscreenBtn);
            
            // Toggle fullscreen when clicked
            fullscreenBtn.addEventListener('click', function() {
                if (!document.fullscreenElement) {
                    // Enter fullscreen
                    if (gameContainer.requestFullscreen) {
                        gameContainer.requestFullscreen();
                    } else if (gameContainer.webkitRequestFullscreen) {
                        gameContainer.webkitRequestFullscreen();
                    } else if (gameContainer.msRequestFullscreen) {
                        gameContainer.msRequestFullscreen();
                    }
                } else {
                    // Exit fullscreen
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    }
                }
            });
            
            // Update button icon when fullscreen state changes
            document.addEventListener('fullscreenchange', updateFullscreenButton);
            document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
            document.addEventListener('msfullscreenchange', updateFullscreenButton);
            
            function updateFullscreenButton() {
                if (document.fullscreenElement) {
                    fullscreenBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    `;
                } else {
                    fullscreenBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                        </svg>
                    `;
                }
            }
        }
    }
}

/**
 * Social Sharing Functionality
 */
function initSocialSharing() {
    const shareButtons = document.querySelectorAll('a[href^="https://twitter.com/intent/tweet"], a[href^="https://www.facebook.com/sharer"], a[href^="https://www.reddit.com/submit"]');
    
    shareButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Open share dialog in a popup window
            const width = 600;
            const height = 400;
            const left = (window.innerWidth / 2) - (width / 2);
            const top = (window.innerHeight / 2) - (height / 2);
            
            window.open(
                this.href,
                'share-dialog',
                `width=${width},height=${height},top=${top},left=${left},toolbar=0,location=0,menubar=0,directories=0,scrollbars=0`
            );
        });
    });
} 