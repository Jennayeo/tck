// Values Carousel 기능
class ValuesCarousel {
  constructor() {
    this.container = document.getElementById("carouselSlides");
    this.slides = document.querySelectorAll(".carousel-slide");
    this.prevBtn = document.getElementById("carouselPrev");
    this.nextBtn = document.getElementById("carouselNext");
    this.currentIndex = 0;
    this.totalSlides = this.slides.length;
    this.isTransitioning = false;
    this.autoPlayInterval = null;
    this.autoPlayDelay = 5000; // 5초

    // 카운터 업데이트
    document.getElementById("carouselTotal").textContent = this.totalSlides;

    this.init();
  }

  init() {
    if (!this.container || this.slides.length === 0) {
      console.error("Carousel elements not found");
      return;
    }

    // 이벤트 리스너 등록
    if (this.prevBtn) {
      this.prevBtn.addEventListener("click", () => this.goToPrevious());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener("click", () => this.goToNext());
    }

    // 키보드 네비게이션
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        this.goToPrevious();
      } else if (e.key === "ArrowRight") {
        this.goToNext();
      }
    });

    // 터치 스와이프 지원
    this.initTouchEvents();

    // 자동 재생
    this.startAutoPlay();

    // 초기 슬라이드 설정
    this.updateSlides();

    // Intersection Observer로 화면에 보일 때만 자동 재생
    this.observeVisibility();
  }

  goToSlide(index) {
    if (this.isTransitioning) return;
    if (index < 0) index = this.totalSlides - 1;
    if (index >= this.totalSlides) index = 0;

    this.currentIndex = index;
    this.updateSlides();
    this.updateCounter();
    this.resetAutoPlay();
  }

  goToNext() {
    this.goToSlide(this.currentIndex + 1);
  }

  goToPrevious() {
    this.goToSlide(this.currentIndex - 1);
  }

  updateSlides() {
    this.isTransitioning = true;

    this.slides.forEach((slide, index) => {
      slide.classList.remove("active", "prev", "next");

      if (index === this.currentIndex) {
        slide.classList.add("active");
      } else if (
        index === this.currentIndex - 1 ||
        (this.currentIndex === 0 && index === this.totalSlides - 1)
      ) {
        slide.classList.add("prev");
      } else if (
        index === this.currentIndex + 1 ||
        (this.currentIndex === this.totalSlides - 1 && index === 0)
      ) {
        slide.classList.add("next");
      }
    });

    // 전환 애니메이션 완료 후 플래그 해제
    setTimeout(() => {
      this.isTransitioning = false;
    }, 600);
  }

  updateCounter() {
    const currentEl = document.getElementById("carouselCurrent");
    if (currentEl) {
      currentEl.textContent = this.currentIndex + 1;
    }
  }

  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayInterval = setInterval(() => {
      this.goToNext();
    }, this.autoPlayDelay);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  resetAutoPlay() {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  // 터치 스와이프 지원
  initTouchEvents() {
    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 50;

    this.container.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].clientX;
        this.stopAutoPlay();
      },
      { passive: true }
    );

    this.container.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].clientX;
        const swipeDistance = touchStartX - touchEndX;

        if (Math.abs(swipeDistance) > minSwipeDistance) {
          if (swipeDistance > 0) {
            // 왼쪽으로 스와이프 (다음)
            this.goToNext();
          } else {
            // 오른쪽으로 스와이프 (이전)
            this.goToPrevious();
          }
        }

        this.resetAutoPlay();
      },
      { passive: true }
    );

    // 마우스 드래그 지원
    let mouseDownX = 0;
    let isDragging = false;

    this.container.addEventListener("mousedown", (e) => {
      mouseDownX = e.clientX;
      isDragging = true;
      this.stopAutoPlay();
    });

    this.container.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
    });

    this.container.addEventListener("mouseup", (e) => {
      if (!isDragging) return;
      isDragging = false;

      const dragDistance = mouseDownX - e.clientX;
      if (Math.abs(dragDistance) > minSwipeDistance) {
        if (dragDistance > 0) {
          this.goToNext();
        } else {
          this.goToPrevious();
        }
      }

      this.resetAutoPlay();
    });

    this.container.addEventListener("mouseleave", () => {
      isDragging = false;
      this.resetAutoPlay();
    });
  }

  // Intersection Observer로 화면에 보일 때만 자동 재생
  observeVisibility() {
    const section = document.getElementById("valuesCarousel");
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.startAutoPlay();
          } else {
            this.stopAutoPlay();
          }
        });
      },
      {
        threshold: 0.3,
      }
    );

    observer.observe(section);
  }
}

// 초기화
document.addEventListener("DOMContentLoaded", () => {
  new ValuesCarousel();
});
