import { onReady } from '../shared/ready.js';

// Add download buttons to all video cards automatically
onReady(() => {
  // Function to handle download with fetch
  function handleVideoDownload(e, downloadUrl, filename) {
    e.preventDefault();
    e.stopPropagation();
    
    const downloadBtn = e.currentTarget;
    const originalHTML = downloadBtn.innerHTML;
    
    // Show loading state
    downloadBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
        <path d="M16 12.5C16 12.5 13.054 16.4999 12 16.4999C10.9459 16.4999 8 12.4999 8 12.4999M12 15.9999V7.49994" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
      </svg>
      İndiriliyor...
    `;
    downloadBtn.style.opacity = '0.7';
    downloadBtn.style.pointerEvents = 'none';
    
    // Fetch and download
    fetch(downloadUrl)
      .then(response => {
        if (!response.ok) throw new Error('Download failed');
        return response.blob();
      })
      .then(blob => {
        // Create blob URL and trigger download
        const blobUrl = window.URL.createObjectURL(blob);
        const tempLink = document.createElement('a');
        tempLink.href = blobUrl;
        tempLink.download = filename;
        tempLink.style.display = 'none';
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
        
        // Clean up blob URL after a delay
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
        
        // Restore button state
        downloadBtn.innerHTML = originalHTML;
        downloadBtn.style.opacity = '1';
        downloadBtn.style.pointerEvents = 'auto';
      })
      .catch(error => {
        console.error('Download error:', error);
        // If fetch fails, fallback to direct link (opens in new tab)
        window.open(downloadUrl, '_blank');
        
        // Restore button state
        downloadBtn.innerHTML = originalHTML;
        downloadBtn.style.opacity = '1';
        downloadBtn.style.pointerEvents = 'auto';
      });
  }

  // Special download URLs for the first two videos
  const specialDownloads = {
    'https://www.youtube.com/embed/mbZrZ-LN3sg?autoplay=1': 'https://ogm-large-cdn.eba.gov.tr/mebi/content/mebi-sunum/mebi-sunum.pdf',
    'https://www.youtube.com/embed/qkL6ErVTNOA?autoplay=1': 'https://ogm-large-cdn.eba.gov.tr/mebi/content/video/mebi-ogrenci-tanitim.mp4'
  };

  // Get all video cards
  const videoCards = document.querySelectorAll('.video-card');
  
  videoCards.forEach(card => {
    // Check if download button already exists
    const existingBtn = card.querySelector('.download-btn');
    if (existingBtn) {
      // Add download handler to existing button
      const downloadUrl = existingBtn.href;
      const urlParts = downloadUrl.split('/');
      const filename = urlParts[urlParts.length - 1] || 'video';
      
      existingBtn.addEventListener('click', function(e) {
        handleVideoDownload(e, downloadUrl, filename);
      });
      return; // Skip creating new button
    }

    const videoUrl = card.getAttribute('data-video-url');
    if (!videoUrl) return;

    // Determine download URL
    let downloadUrl;
    if (specialDownloads[videoUrl]) {
      downloadUrl = specialDownloads[videoUrl];
    } else {
      // Extract the direct video URL from data-video-url
      // For mp4 files, use the same URL
      downloadUrl = videoUrl;
    }

    // Create download button
    const videoInfo = card.querySelector('.video-info');
    if (videoInfo && downloadUrl) {
      // Create actions container if it doesn't exist
      let actionsDiv = videoInfo.querySelector('.video-actions');
      if (!actionsDiv) {
        actionsDiv = document.createElement('div');
        actionsDiv.className = 'video-actions';
        videoInfo.appendChild(actionsDiv);
      }

      // Create download button
      const downloadBtn = document.createElement('a');
      downloadBtn.className = 'download-btn';
      downloadBtn.href = downloadUrl;
      downloadBtn.rel = 'noopener';
      
      // Extract filename from URL
      const urlParts = downloadUrl.split('/');
      const filename = urlParts[urlParts.length - 1] || 'video';
      downloadBtn.download = filename;
      
      downloadBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
          <path d="M16 12.5C16 12.5 13.054 16.4999 12 16.4999C10.9459 16.4999 8 12.4999 8 12.4999M12 15.9999V7.49994" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
        </svg>
        İndir
      `;
      
      // Add download handler
      downloadBtn.addEventListener('click', function(e) {
        handleVideoDownload(e, downloadUrl, filename);
      });

      actionsDiv.appendChild(downloadBtn);
    }
  });
});
