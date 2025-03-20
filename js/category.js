/**
 * Monster Running - Category Page JavaScript
 * 
 * This file contains functionality specific to category pages, including:
 * - Filter and sort functionality
 * - Dynamic loading of games
 * - Pagination
 */

// DOM Ready Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initFilterControls();
    initSortControls();
    initPagination();
    initLazyLoadGames();
});

/**
 * Filter Controls Functionality
 */
function initFilterControls() {
    const filterTags = document.querySelectorAll('.filter-tag');
    
    if (filterTags.length > 0) {
        // Get filter from URL if present
        const urlParams = new URLSearchParams(window.location.search);
        const currentFilter = urlParams.get('filter');
        
        filterTags.forEach(tag => {
            // Set active state based on URL parameter
            if (currentFilter && tag.getAttribute('data-filter') === currentFilter) {
                tag.classList.add('active');
            }
            
            // Add click event listeners
            tag.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                
                // Update URL
                const url = new URL(window.location);
                url.searchParams.set('filter', filter);
                window.history.pushState({}, '', url);
                
                // Update active state
                filterTags.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Show loading state
                showFilterLoadingState();
                
                // Fetch filtered games (simulated for now)
                fetchFilteredGames(filter);
            });
        });
    }
}

/**
 * Show loading state while filtering
 */
function showFilterLoadingState() {
    const gamesGrid = document.querySelector('.games-grid');
    
    if (gamesGrid) {
        // Save current scroll position
        const scrollPosition = window.scrollY;
        
        // Add loading class
        gamesGrid.classList.add('opacity-50');
        
        // Restore scroll position after DOM update
        setTimeout(() => {
            window.scrollTo(0, scrollPosition);
        }, 100);
    }
}

/**
 * Fetch filtered games (simulated)
 */
function fetchFilteredGames(filter) {
    // This would normally be an AJAX call to fetch games based on the filter
    // For demo purposes, we'll just simulate a delay and then remove the loading state
    
    setTimeout(() => {
        const gamesGrid = document.querySelector('.games-grid');
        if (gamesGrid) {
            gamesGrid.classList.remove('opacity-50');
            
            // Show a toast notification
            if (window.showToast) {
                window.showToast(`Filtered by: ${filter}`, 'info');
            }
        }
    }, 800);
}

/**
 * Sort Controls Functionality
 */
function initSortControls() {
    const sortDropdown = document.querySelector('.sort-dropdown select');
    
    if (sortDropdown) {
        // Get sort from URL if present
        const urlParams = new URLSearchParams(window.location.search);
        const currentSort = urlParams.get('sort');
        
        // Set dropdown value based on URL parameter
        if (currentSort) {
            sortDropdown.value = currentSort;
        }
        
        // Add change event listener
        sortDropdown.addEventListener('change', function() {
            const sort = this.value;
            
            // Update URL
            const url = new URL(window.location);
            url.searchParams.set('sort', sort);
            window.history.pushState({}, '', url);
            
            // Show loading state
            showFilterLoadingState();
            
            // Fetch sorted games (simulated for now)
            fetchSortedGames(sort);
        });
    }
}

/**
 * Fetch sorted games (simulated)
 */
function fetchSortedGames(sort) {
    // This would normally be an AJAX call to fetch games based on the sort parameter
    // For demo purposes, we'll just simulate a delay and then remove the loading state
    
    setTimeout(() => {
        const gamesGrid = document.querySelector('.games-grid');
        if (gamesGrid) {
            gamesGrid.classList.remove('opacity-50');
            
            // Show a toast notification
            if (window.showToast) {
                window.showToast(`Sorted by: ${sort}`, 'info');
            }
        }
    }, 800);
}

/**
 * Pagination Functionality
 */
function initPagination() {
    const paginationItems = document.querySelectorAll('.pagination-item');
    
    if (paginationItems.length > 0) {
        // Get page from URL if present
        const urlParams = new URLSearchParams(window.location.search);
        const currentPage = urlParams.get('page') || '1';
        
        paginationItems.forEach(item => {
            // Skip non-links (like the ellipsis)
            if (!item.getAttribute('href')) {
                return;
            }
            
            // Set active state based on URL parameter
            if (item.textContent === currentPage) {
                item.classList.add('active');
            }
            
            // Add click event listeners
            item.addEventListener('click', function(e) {
                if (!this.classList.contains('active')) {
                    e.preventDefault();
                    
                    const page = this.textContent;
                    
                    // Update URL
                    const url = new URL(window.location);
                    url.searchParams.set('page', page);
                    window.history.pushState({}, '', url);
                    
                    // Scroll to top of game list
                    const gamesSection = document.querySelector('.games-grid');
                    if (gamesSection) {
                        // Scroll a bit above the games section for context
                        window.scrollTo({
                            top: gamesSection.offsetTop - 100,
                            behavior: 'smooth'
                        });
                    }
                    
                    // Show loading state
                    showFilterLoadingState();
                    
                    // Fetch page of games (simulated for now)
                    fetchPageOfGames(page);
                }
            });
        });
    }
}

/**
 * Fetch page of games (simulated)
 */
function fetchPageOfGames(page) {
    // This would normally be an AJAX call to fetch games for the requested page
    // For demo purposes, we'll just simulate a delay and then remove the loading state
    
    setTimeout(() => {
        const gamesGrid = document.querySelector('.games-grid');
        if (gamesGrid) {
            gamesGrid.classList.remove('opacity-50');
            
            // Update active state in pagination
            const paginationItems = document.querySelectorAll('.pagination-item');
            paginationItems.forEach(item => {
                item.classList.remove('active');
                if (item.textContent === page) {
                    item.classList.add('active');
                }
            });
            
            // Show a toast notification
            if (window.showToast) {
                window.showToast(`Showing page ${page}`, 'info');
            }
        }
    }, 800);
}

/**
 * Lazy Loading of Games when scrolling
 */
function initLazyLoadGames() {
    // Only activate for first page when no filters are applied
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('page') || urlParams.has('filter') || urlParams.has('sort')) {
        return;
    }
    
    let loading = false;
    let reachedEnd = false;
    
    window.addEventListener('scroll', function() {
        if (loading || reachedEnd) return;
        
        const gamesGrid = document.querySelector('.games-grid');
        if (!gamesGrid) return;
        
        // Check if user has scrolled near the bottom
        const scrollPosition = window.scrollY + window.innerHeight;
        const threshold = document.body.scrollHeight - 500;
        
        if (scrollPosition >= threshold) {
            loading = true;
            
            // Add loading indicator
            const loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'text-center py-8 col-span-full';
            loadingIndicator.innerHTML = `
                <div class="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p class="mt-2 text-gray-600">Loading more games...</p>
            `;
            gamesGrid.appendChild(loadingIndicator);
            
            // Simulate loading more games
            setTimeout(() => {
                // Remove loading indicator
                loadingIndicator.remove();
                
                // Here you would normally append new games to the grid
                // For demo purposes, we'll just simulate reaching the end
                
                reachedEnd = true;
                
                // Add "end of results" message
                const endMessage = document.createElement('div');
                endMessage.className = 'text-center py-8 col-span-full';
                endMessage.innerHTML = `
                    <p class="text-gray-600">You've reached the end of the results.</p>
                    <a href="#" class="mt-2 inline-block text-blue-600 hover:underline">Back to top</a>
                `;
                gamesGrid.appendChild(endMessage);
                
                // Add click event to "back to top" link
                endMessage.querySelector('a').addEventListener('click', function(e) {
                    e.preventDefault();
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                });
                
                loading = false;
            }, 1500);
        }
    });
} 