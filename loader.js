document.addEventListener('DOMContentLoaded', () => {
    // 1. Inject the loader HTML
    const loaderHTML = `
        <div id="page-loader-overlay">
            <div class="loader"></div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', loaderHTML);

    const loaderOverlay = document.getElementById('page-loader-overlay');

    // 2. Handle Link Clicks
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        
        // Check if it's a valid link
        if (link && link.href) {
            const targetUrl = link.href;
            const currentUrl = window.location.href;
            
            // Ignore:
            // - Empty links or #
            // - External links (optional, but usually good to keep loader for them too if you want)
            // - Target blank (new tab)
            // - Same page anchors
            
            if (
                targetUrl.startsWith('javascript:') || 
                link.target === '_blank' || 
                targetUrl.includes('#') && targetUrl.split('#')[0] === currentUrl.split('#')[0]
            ) {
                return;
            }

            // Prevent default navigation
            e.preventDefault();

            // Show loader
            loaderOverlay.classList.add('visible');

            // Wait for animation then navigate
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 800); // 800ms delay to show the loader
        }
    });

    // 3. Optional: Handle browser back/forward cache (bfcache)
    // If the user clicks back, the page might be restored from cache with the loader still visible.
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            loaderOverlay.classList.remove('visible');
        }
    });
});