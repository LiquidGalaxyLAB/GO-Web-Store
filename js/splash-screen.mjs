export class SplashScreen extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    const template = document.createElement("template");
    template.innerHTML = `
        <style>
          :host {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #10131a 0%, #1a1d23 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            opacity: 1;
            transition: opacity 0.5s ease-out;
          }

          :host(.hidden) {
            opacity: 0;
            pointer-events: none;
          }

          .splash-content {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .logo-container {
            animation: fadeInUp 0.8s ease-out;
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

        </style>

        <div class="splash-content">
          <div class="logo-container" id="logo-container">
            </div>
        </div>
      `;
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // FIX: Use localStorage instead of sessionStorage.
    // localStorage survives hard reloads and browser restarts.
    if (localStorage.getItem('splashShown') === 'true') {
      this.hide(true); // Hide immediately
      return;
    }

    // Mark as shown permanently
    localStorage.setItem('splashShown', 'true');

    // Create and insert animated logo
    this.initializeLogo();

    // Auto-hide splash screen after animation completes
    this.animationTimeout = setTimeout(() => {
      this.hide();
    }, 4000); // 4 seconds to allow animation to complete
  }

  initializeLogo() {
    // Wait for animated-logo custom element to be defined
    const checkLogoDefined = () => {
      if (customElements.get('animated-logo')) {
        const logoContainer = this.shadowRoot.getElementById('logo-container');
        const animatedLogo = document.createElement('animated-logo');
        animatedLogo.setAttribute('animate', 'true');
        logoContainer.appendChild(animatedLogo);
      } else {
        // Retry after a short delay
        setTimeout(checkLogoDefined, 10);
      }
    };
    checkLogoDefined();
  }

  hide(immediate = false) {
    if (immediate) {
      // Set display none immediately to prevent flash
      this.style.display = 'none';
      
      // Use setTimeout to allow the main thread to unblock
      setTimeout(() => {
        if (this.parentNode) {
          this.parentNode.removeChild(this);
        }
        // Ensure main content is shown
        if (window.showMainContent) {
          window.showMainContent();
        }
      }, 0);
      return;
    }

    this.classList.add('hidden');
    // Remove from DOM after transition
    setTimeout(() => {
      if (this.parentNode) {
        this.parentNode.removeChild(this);
      }
      // Call global function to show main content
      if (window.showMainContent) {
        window.showMainContent();
      }
    }, 500);
  }

  disconnectedCallback() {
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
    }
  }
}

// Register the component
customElements.define('splash-screen', SplashScreen);