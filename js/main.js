/**
 * Monster Running - Main JavaScript
 * 
 * This file contains the core JavaScript functionality for the Monster Running game site
 * including mobile navigation, lazy loading, search functionality, and more.
 */

// DOM Ready Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initMobileMenu();
    initLazyLoading();
    initToastNotifications();
    initSearchFunctionality();
});

/**
 * Mobile Menu Toggle
 */
function initMobileMenu() {
    const menuToggle = document.querySelector('button[aria-label="Menu"]');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function() {
            const isHidden = mobileMenu.classList.contains('hidden');
            
            if (isHidden) {
                mobileMenu.classList.remove('hidden');
                mobileMenu.classList.add('slide-down');
            } else {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('slide-down');
            }
        });
    }
}

/**
 * Lazy Loading for Images
 */
function initLazyLoading() {
    // Select all images with data-src attribute
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.getAttribute('data-src');
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers without Intersection Observer support
        lazyImages.forEach(img => {
            img.src = img.getAttribute('data-src');
            img.classList.add('loaded');
        });
    }
}

/**
 * Toast Notification System
 */
function initToastNotifications() {
    // Create toast container if it doesn't exist
    if (!document.getElementById('toast-container')) {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.position = 'fixed';
        toastContainer.style.bottom = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.zIndex = '1000';
        document.body.appendChild(toastContainer);
    }
    
    // Expose showToast method globally
    window.showToast = function(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.getElementById('toast-container').appendChild(toast);
        
        // Show toast with animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Hide and remove toast after duration
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
    };
}

/**
 * Search Functionality
 */
function initSearchFunctionality() {
    const searchInputs = document.querySelectorAll('input[placeholder="Search games..."]');
    
    searchInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query.length > 0) {
                    window.location.href = `/search?q=${encodeURIComponent(query)}`;
                }
            }
        });
    });
}

/**
 * Performance optimization - defer non-critical operations
 */
window.addEventListener('load', function() {
    // Initialize components that are not critical for initial page load
    initAnalytics();
    preloadFuturePages();
    
    // Add class to body when everything is loaded
    document.body.classList.add('page-loaded');
});

/**
 * Analytics initialization (placeholder)
 */
function initAnalytics() {
    // This would be replaced with actual analytics code
    console.log('Analytics initialized');
}

/**
 * Preload likely next pages for faster navigation
 */
function preloadFuturePages() {
    // Detect most likely next pages based on current page
    const likelyNextPages = [];
    
    // On homepage, preload category pages
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        likelyNextPages.push('/categories', '/popular', '/action');
    }
    
    // On category pages, preload first few games
    if (window.location.pathname.match(/^\/[a-z-]+\/?$/)) {
        // This would be dynamic based on actual game links
        // For now, it's just a placeholder
    }
    
    // Preload pages
    likelyNextPages.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
    });
}

/**
 * Dynamic Image Quality based on connection
 */
if ('connection' in navigator) {
    if (navigator.connection.saveData === true) {
        document.documentElement.classList.add('save-data');
    }
    
    if (navigator.connection.effectiveType.includes('2g') || navigator.connection.effectiveType.includes('slow')) {
        document.documentElement.classList.add('slow-connection');
    }
}

/**
 * Service Worker Registration
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
} 