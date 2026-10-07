import { onReady } from '../shared/ready.js';

// Testimonials slider horizontal scroll on mouse wheel and drag
onReady(() => {
  const testimonialsSlider = document.querySelector('.testimonials-slider');
  
  if (testimonialsSlider) {
    // Drag-to-scroll variables
    let isDown = false;
    let startX;
    let scrollLeft;
    let velocity = 0;
    let lastX = 0;
    let lastTime = Date.now();
    let animationFrame;

    // Mouse wheel scroll
    testimonialsSlider.addEventListener('wheel', function(e) {
      // Only handle vertical scroll (not horizontal)
      if (e.deltaY === 0) return;
      
      const scrollLeft = this.scrollLeft;
      const maxScrollLeft = this.scrollWidth - this.clientWidth;
      const isAtStart = scrollLeft <= 0;
      const isAtEnd = scrollLeft >= maxScrollLeft - 1; // Small tolerance for floating point precision
      
      // If there's no horizontal scrollable content, let page scroll naturally
      if (maxScrollLeft <= 0) {
        return;
      }
      
      // If scrolling up and we're not at the start, or scrolling down and we're not at the end
      if ((e.deltaY < 0 && !isAtStart) || (e.deltaY > 0 && !isAtEnd)) {
        e.preventDefault();
        this.scrollLeft += e.deltaY;
      }
      // If at edges, allow normal page scroll (don't prevent default)
    }, { passive: false });

    // Drag-to-scroll: Mouse down
    testimonialsSlider.addEventListener('mousedown', function(e) {
      isDown = true;
      this.style.cursor = 'grabbing';
      this.style.userSelect = 'none';
      startX = e.pageX - this.offsetLeft;
      scrollLeft = this.scrollLeft;
      lastX = e.pageX;
      lastTime = Date.now();
      velocity = 0;
      
      // Cancel any ongoing momentum animation
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    });

    // Drag-to-scroll: Mouse leave
    testimonialsSlider.addEventListener('mouseleave', function() {
      if (isDown) {
        isDown = false;
        this.style.cursor = 'grab';
        this.style.userSelect = '';
        startMomentumScroll(this);
      }
    });

    // Drag-to-scroll: Mouse up
    testimonialsSlider.addEventListener('mouseup', function() {
      if (isDown) {
        isDown = false;
        this.style.cursor = 'grab';
        this.style.userSelect = '';
        startMomentumScroll(this);
      }
    });

    // Drag-to-scroll: Mouse move
    testimonialsSlider.addEventListener('mousemove', function(e) {
      if (!isDown) return;
      
      e.preventDefault();
      
      const currentTime = Date.now();
      const currentX = e.pageX;
      const timeDiff = currentTime - lastTime;
      
      if (timeDiff > 0) {
        velocity = (currentX - lastX) / timeDiff;
      }
      
      const x = e.pageX - this.offsetLeft;
      const walk = (x - startX) * 1.5; // Scroll speed multiplier
      this.scrollLeft = scrollLeft - walk;
      
      lastX = currentX;
      lastTime = currentTime;
    });

    // Touch events for mobile
    testimonialsSlider.addEventListener('touchstart', function(e) {
      const touchStartX = e.touches[0].pageX - this.offsetLeft;
      const touchScrollLeft = this.scrollLeft;
      lastX = e.touches[0].pageX;
      lastTime = Date.now();
      velocity = 0;
      
      // Store values for touch move
      this.touchStartX = touchStartX;
      this.touchScrollLeft = touchScrollLeft;
      
      // Cancel any ongoing momentum animation
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    }, { passive: true });

    testimonialsSlider.addEventListener('touchmove', function(e) {
      if (!e.touches[0]) return;
      
      const currentTime = Date.now();
      const currentX = e.touches[0].pageX;
      const timeDiff = currentTime - lastTime;
      
      if (timeDiff > 0) {
        velocity = (currentX - lastX) / timeDiff;
      }
      
      const x = e.touches[0].pageX - this.offsetLeft;
      const walk = (x - this.touchStartX) * 1.5;
      this.scrollLeft = this.touchScrollLeft - walk;
      
      lastX = currentX;
      lastTime = currentTime;
    }, { passive: true });

    testimonialsSlider.addEventListener('touchend', function() {
      startMomentumScroll(this);
    }, { passive: true });

    // Momentum scrolling function
    function startMomentumScroll(element) {
      if (!element || Math.abs(velocity) < 0.1) return;
      
      function animate() {
        velocity *= 0.95; // Friction
        element.scrollLeft -= velocity * 16; // 16ms frame time
        
        if (Math.abs(velocity) > 0.1) {
          animationFrame = requestAnimationFrame(animate);
        }
      }
      
      animationFrame = requestAnimationFrame(animate);
    }

    // Set initial cursor style
    testimonialsSlider.style.cursor = 'grab';
  }
});
