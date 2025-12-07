// ===========================
// Navigation Scroll Effect
// ===========================
const navbar = document.getElementById("navbar");
const heroSection = document.querySelector(".hero");
let lastScroll = 0;

window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;
  const heroHeight = heroSection
    ? heroSection.offsetHeight
    : window.innerHeight;

  // Check if navbar is over hero section
  if (currentScroll < heroHeight - 80) {
    navbar.classList.add("over-hero");
    navbar.classList.remove("scrolled");
  } else {
    navbar.classList.remove("over-hero");
    navbar.classList.add("scrolled");
  }

  lastScroll = currentScroll;
});

// Check initial state on load
window.addEventListener("load", () => {
  const currentScroll = window.pageYOffset;
  const heroHeight = heroSection
    ? heroSection.offsetHeight
    : window.innerHeight;

  if (currentScroll < heroHeight - 80) {
    navbar.classList.add("over-hero");
  }
});

// ===========================
// Mobile Menu Toggle
// ===========================
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");

hamburger.addEventListener("click", () => {
  navMenu.classList.toggle("active");

  // Animate hamburger icon
  const spans = hamburger.querySelectorAll("span");
  if (navMenu.classList.contains("active")) {
    spans[0].style.transform = "rotate(45deg) translate(5px, 5px)";
    spans[1].style.opacity = "0";
    spans[2].style.transform = "rotate(-45deg) translate(7px, -6px)";
  } else {
    spans[0].style.transform = "none";
    spans[1].style.opacity = "1";
    spans[2].style.transform = "none";
  }
});

// Close menu when clicking on a link
navMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("active");
    const spans = hamburger.querySelectorAll("span");
    spans[0].style.transform = "none";
    spans[1].style.opacity = "1";
    spans[2].style.transform = "none";
  });
});

// ===========================
// Smooth Scroll
// ===========================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));

    if (target) {
      const offsetTop = target.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  });
});

// ===========================
// Stats Counter Animation
// ===========================
const stats = document.querySelectorAll(".stat-number");
let statsAnimated = false;

const animateStats = () => {
  stats.forEach((stat) => {
    const target = parseInt(stat.getAttribute("data-target"));
    const duration = 2000; // 2 seconds
    const increment = target / (duration / 16); // 60fps
    let current = 0;

    const formatNumber = (num) => {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const updateCounter = () => {
      current += increment;
      if (current < target) {
        stat.textContent = formatNumber(Math.floor(current));
        requestAnimationFrame(updateCounter);
      } else {
        stat.textContent = formatNumber(target);
      }
    };

    updateCounter();
  });
};

// Trigger animation when stats section is in view
const statsSection =
  document.querySelector(".stats") ||
  document.querySelector(".technology-stats-overlay") ||
  document.querySelector("#innovation");
const observerOptions = {
  threshold: 0.5,
};

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && !statsAnimated) {
      animateStats();
      statsAnimated = true;
    }
  });
}, observerOptions);

if (statsSection) {
  statsObserver.observe(statsSection);
}

// ===========================
// Fade In Animation on Scroll
// ===========================
const observeElements = document.querySelectorAll(
  ".service-card, .tech-feature, .stat-item"
);

const fadeInObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }, index * 100);
      }
    });
  },
  {
    threshold: 0.1,
  }
);

observeElements.forEach((element) => {
  element.style.opacity = "0";
  element.style.transform = "translateY(30px)";
  element.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  fadeInObserver.observe(element);
});

// ===========================
// Services Section Fade In Animation
// ===========================
const storySections = document.querySelectorAll(".story-section");

const storyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in");
      }
    });
  },
  {
    threshold: 0.2,
    rootMargin: "0px 0px -50px 0px",
  }
);

storySections.forEach((section) => {
  storyObserver.observe(section);
});

// ===========================
// Contact Form Handling
// ===========================
const contactForm = document.querySelector(".contact-form");

contactForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get form data
  const formData = new FormData(contactForm);
  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });

  // Show success message (you can customize this)
  alert("문의가 성공적으로 전송되었습니다!\n빠른 시일 내에 답변드리겠습니다.");

  // Reset form
  contactForm.reset();

  // Here you would normally send data to a server
  // Example:
  // fetch('/api/contact', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(data)
  // });
});

// ===========================
// Parallax Effect for Hero
// ===========================
const heroContent = document.querySelector(".hero-content");

window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset;
  if (heroContent && scrolled < window.innerHeight) {
    heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
    heroContent.style.opacity = 1 - scrolled / 600;
  }
});

// ===========================
// Service Cards Hover Effect
// ===========================
const serviceCards = document.querySelectorAll(".service-card");

serviceCards.forEach((card) => {
  card.addEventListener("mouseenter", function () {
    this.style.borderRadius = "32px";
  });

  card.addEventListener("mouseleave", function () {
    this.style.borderRadius = "24px";
  });
});

// ===========================
// Add active state to navigation
// ===========================
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-menu a");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (pageYOffset >= sectionTop - 200) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
});

// ===========================
// Loading Animation
// ===========================
window.addEventListener("load", () => {
  document.body.style.opacity = "0";
  setTimeout(() => {
    document.body.style.transition = "opacity 0.5s ease";
    document.body.style.opacity = "1";
  }, 100);
});

// ===========================
// Video Auto-Play with Enhanced Support (Safari Compatible)
// ===========================
const heroVideo = document.querySelector(".hero-video");
if (heroVideo) {
  // Detect Safari browser
  const isSafari =
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
    (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);

  // Ensure video is muted for autoplay (browser policy requirement)
  heroVideo.muted = true;
  heroVideo.setAttribute("muted", "");
  heroVideo.setAttribute("playsinline", "");
  heroVideo.setAttribute("webkit-playsinline", "");

  // Safari-specific: set volume to 0 explicitly
  heroVideo.volume = 0;

  // Hide all video controls and play buttons
  heroVideo.controls = false;
  heroVideo.removeAttribute("controls");
  heroVideo.setAttribute("controls", "false");

  // Disable pointer events to prevent control overlay
  heroVideo.style.pointerEvents = "none";

  // Safari-specific: Remove controls attribute completely
  if (isSafari) {
    heroVideo.removeAttribute("controls");
    // Force remove controls after a delay to ensure Safari respects it
    setTimeout(() => {
      heroVideo.controls = false;
      heroVideo.removeAttribute("controls");
    }, 100);
  }

  let playAttempted = false;
  let playPromise = null;

  // Function to play video with enhanced retry logic for Safari
  const playVideo = async (retryCount = 0) => {
    // Prevent multiple simultaneous play attempts
    if (playPromise) {
      return playPromise;
    }

    const maxRetries = isSafari ? 10 : 5;
    const retryDelay = isSafari ? 1000 : 500;

    playPromise = (async () => {
      try {
        // Ensure video is ready
        if (heroVideo.readyState >= 2) {
          // HAVE_CURRENT_DATA or higher
          await heroVideo.play();
          console.log("Video autoplay successful");
          playAttempted = true;
          playPromise = null;
          return true;
        } else {
          throw new Error("Video not ready");
        }
      } catch (error) {
        console.warn(`Autoplay attempt ${retryCount + 1} failed:`, error);
        playPromise = null;

        // Retry with exponential backoff for Safari
        if (retryCount < maxRetries) {
          const delay = retryDelay * Math.pow(1.5, retryCount);
          setTimeout(() => {
            playVideo(retryCount + 1);
          }, delay);
        } else {
          console.warn(
            "Autoplay failed after all retries. User interaction required."
          );
        }
        return false;
      }
    })();

    return playPromise;
  };

  // Safari-specific: Wait for full page load
  const attemptPlayAfterLoad = () => {
    if (!playAttempted) {
      // Safari needs a bit more time
      setTimeout(
        () => {
          playVideo();
        },
        isSafari ? 500 : 100
      );
    }
  };

  // Try to play on multiple video events
  const videoEvents = [
    "loadeddata",
    "canplay",
    "canplaythrough",
    "loadedmetadata",
  ];

  videoEvents.forEach((event) => {
    heroVideo.addEventListener(
      event,
      () => {
        attemptPlayAfterLoad();
      },
      { once: true }
    );
  });

  // Safari-specific: Wait for window load event
  if (document.readyState === "complete") {
    attemptPlayAfterLoad();
  } else {
    window.addEventListener("load", () => {
      setTimeout(attemptPlayAfterLoad, isSafari ? 800 : 300);
    });
  }

  // Also try DOMContentLoaded for faster initial attempt
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(attemptPlayAfterLoad, 200);
    });
  }

  // Try to play immediately if video is already loaded
  if (heroVideo.readyState >= 2) {
    attemptPlayAfterLoad();
  }

  // Try to play when page becomes visible (handles tab switching)
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && heroVideo.paused) {
      playVideo();
    }
  });

  // Safari: Handle focus event (when user switches back to tab)
  window.addEventListener("focus", () => {
    if (heroVideo.paused) {
      setTimeout(() => playVideo(), 100);
    }
  });

  // Error handling
  heroVideo.addEventListener("error", (e) => {
    console.warn("Video failed to load, using fallback");
    heroVideo.setAttribute("data-error", "true");
  });

  // Enhanced user interaction handling (critical for Safari)
  const handleUserInteraction = () => {
    if (heroVideo.paused) {
      playVideo();
    }
  };

  // Add multiple interaction events for Safari
  const interactionEvents = [
    "click",
    "touchstart",
    "touchend",
    "scroll",
    "mousemove",
    "keydown",
  ];
  interactionEvents.forEach((event) => {
    document.addEventListener(event, handleUserInteraction, {
      once: false,
      passive: true,
    });
  });

  // Ensure video loops continuously
  heroVideo.addEventListener("ended", () => {
    heroVideo.currentTime = 0;
    heroVideo.play().catch(() => {});
  });

  // Safari: Force play on first user interaction anywhere on page
  const firstInteraction = () => {
    if (!playAttempted || heroVideo.paused) {
      playVideo();
      // Remove listeners after first successful play
      interactionEvents.forEach((event) => {
        document.removeEventListener(event, firstInteraction, {
          passive: true,
        });
      });
    }
  };

  // Add first interaction listeners
  interactionEvents.forEach((event) => {
    document.addEventListener(event, firstInteraction, {
      once: true,
      passive: true,
    });
  });
}

// ===========================
// Performance Optimization
// ===========================
// Debounce scroll events
let scrollTimeout;
window.addEventListener(
  "scroll",
  () => {
    if (scrollTimeout) {
      window.cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = window.requestAnimationFrame(() => {
      // Scroll-based animations here
    });
  },
  { passive: true }
);
