import { getQueryParam } from "./query-param.mjs";

export class CarouselComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.currentIndex = 0;
  }

  connectedCallback() {
    this.render();
    this.setupCarousel();
  }

  render() {
    this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            max-inline-size: 100%;
            overflow: hidden;
            position: relative;
            container-type: inline-size;
          }

          .carousel {
            display: grid;
            grid-auto-flow: column;
            grid-auto-columns: calc(100% - 2rem);
            gap: 1rem;
            overflow-x: auto;
            scroll-snap-type: inline mandatory;
            scrollbar-width: none;
            scroll-behavior: smooth;
            padding-block: 1rem;
            -webkit-overflow-scrolling: touch;
          }

          .carousel::-webkit-scrollbar {
            display: none;
          }

          .carousel-item {
            scroll-snap-align: center;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: 
              transform 0.2s ease-out, 
              opacity 0.2s ease-out,
              filter 0.2s ease-out;
            opacity: 0.75;
            transform: scale(0.98);
            filter: brightness(0.95) contrast(0.95);
          }

          .carousel-item.active {
            opacity: 1;
            transform: scale(1);
            filter: brightness(1) contrast(1);
          }

          .carousel-item img,
          .carousel-item iframe {
            inline-size: 100%;
            max-block-size: 500px;
            object-fit: cover;
            border-radius: 0.5rem;
            box-shadow: 0 3px 5px rgba(0,0,0,0.08);
            transition: 
              border-radius 0.2s ease-out,
              box-shadow 0.2s ease-out;
          }

          .carousel-item.active img,
          .carousel-item.active iframe {
            border-radius: 0.75rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.12);
          }

          .navigation {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0.5rem;
            margin-block-start: 1rem;
          }

          .nav-dot {
            inline-size: 8px;
            block-size: 8px;
            background-color: rgba(0,0,0,0.2);
            border-radius: 50%;
            cursor: pointer;
            transition: 
              background-color 0.2s ease-out,
              transform 0.2s ease-out;
          }

          .nav-dot:hover {
            transform: scale(1.2);
          }

          .nav-dot.active {
            background-color: rgba(0,0,0,0.6);
            inline-size: 12px;
            block-size: 12px;
          }

          @container (max-width: 600px) {
            .carousel {
              grid-auto-columns: 100%;
            }
          }
        </style>
        <div class="carousel-container">
          <div class="carousel">
            ${this.carouselAssets[0]
              .map((asset, index) =>
                asset.endsWith(".webp")
                  ? `<div class="carousel-item ${index === 0 ? 'active' : ''}" data-index="${index}">
                      <img src="https://raw.githubusercontent.com/LiquidGalaxyLAB/Data/refs/heads/main${
                        this.carouselAssets[1] + asset
                      }" alt="Carousel item ${index + 1}" draggable="false" loading="lazy">
                     </div>`
                  : `<div class="carousel-item ${index === 0 ? 'active' : ''}" data-index="${index}">
                      <iframe title="Video ${index + 1}" 
                              src="https://www.youtube.com/embed/${
                                new URL(asset).pathname.split("/")[1]
                              }?modestbranding=1&rel=0" 
                              frameborder="0" 
                              allowfullscreen 
                              loading="lazy"></iframe>
                     </div>`
              )
              .join("")}
          </div>
          
          <div class="navigation">
            ${this.carouselAssets[0]
              .map((_, index) => 
                `<div class="nav-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></div>`
              )
              .join("")}
          </div>
        </div>
      `;
  }

  get carouselAssets() {
    const storedData = JSON.parse(localStorage.getItem("store"));
    const data = storedData.find((item) => item.name === getQueryParam("name"));
    return [data.carousel_assets, data.base_url];
  }

  setupCarousel() {
    const carousel = this.shadowRoot.querySelector(".carousel");
    const navDots = this.shadowRoot.querySelectorAll(".nav-dot");
    const carouselItems = this.shadowRoot.querySelectorAll(".carousel-item");

    // Improved scroll and active state management
    const updateActiveState = () => {
      const scrollPosition = carousel.scrollLeft;
      const itemWidth = carousel.children[0].getBoundingClientRect().width;
      const gap = 16; // matching the 1rem gap in CSS

      const currentIndex = Math.round(scrollPosition / (itemWidth + gap));
      
      // Update active states with soft transitions
      carouselItems.forEach((item, index) => {
        const isActive = index === currentIndex;
        
        // Use a slight delay to create a smoother visual transition
        setTimeout(() => {
          item.classList.toggle('active', isActive);
        }, 50);
      });
      
      navDots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
      });

      this.currentIndex = currentIndex;
    };

    // Scroll event listener with debounce
    let scrollTimeout;
    carousel.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateActiveState, 50);
    });

    // Navigation dot click handler with improved scroll behavior
    navDots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        const itemWidth = carousel.children[0].getBoundingClientRect().width;
        
        carousel.scrollTo({
          left: index * (itemWidth + 16),
          behavior: 'smooth'
        });
      });
    });

    // Enhanced touch and drag scroll support
    let isDragging = false;
    let startX, scrollLeft, velocityX = 0, lastX, lastTime;

    const updateVelocity = (currentX, currentTime) => {
      if (lastX !== undefined && lastTime !== undefined) {
        const timeDelta = currentTime - lastTime;
        const distanceDelta = currentX - lastX;
        
        // Calculate velocity (pixels per millisecond)
        velocityX = distanceDelta / timeDelta;
      }
      
      lastX = currentX;
      lastTime = currentTime;
    };

    carousel.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
      
      // Reset velocity tracking
      velocityX = 0;
      lastX = undefined;
      lastTime = undefined;
    });

    carousel.addEventListener('mouseleave', () => {
      isDragging = false;
    });

    carousel.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      
      isDragging = false;
      
      // Apply momentum scrolling
      const momentumScroll = () => {
        carousel.scrollLeft += velocityX * 100;
        velocityX *= 0.95; // Gradually reduce velocity
        
        if (Math.abs(velocityX) > 0.1) {
          requestAnimationFrame(momentumScroll);
        }
      };
      
      momentumScroll();
    });

    carousel.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - startX) * 1.5; // Adjusted multiplier for smoother scrolling
      carousel.scrollLeft = scrollLeft - walk;
      
      // Track velocity
      updateVelocity(x, performance.now());
    });
  }
};