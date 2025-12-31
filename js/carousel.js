// Values Carousel 기능
class ValuesCarousel {
  constructor() {
    this.container = document.getElementById("carouselSlides");
    this.slides = document.querySelectorAll(".carousel-slide");
    this.prevBtn = document.getElementById("carouselPrev");
    this.nextBtn = document.getElementById("carouselNext");
    this.currentIndex = 0;
    this.totalSlides = this.slides.length;
    this.autoPlayInterval = null;
    this.autoPlayDelay = 5000; // 5초
    this.isAnimating = false;
    this.animationTimeout = null;

    console.log(`Carousel initialized with ${this.totalSlides} slides`);
    console.log(
      "Slides found:",
      Array.from(this.slides).map(
        (s, i) => `${i}: ${s.querySelector("h3")?.textContent || "No title"}`
      )
    );

    // 카운터 업데이트
    const totalEl = document.getElementById("carouselTotal");
    if (totalEl) {
      totalEl.textContent = this.totalSlides;
    }

    this.init();
  }

  init() {
    if (!this.container || this.slides.length === 0) {
      console.error("Carousel elements not found");
      return;
    }

    // 이전 버튼 이벤트 리스너
    if (this.prevBtn) {
      // 기존 이벤트 리스너 제거 후 새로 등록 (중복 방지)
      const newPrevBtn = this.prevBtn.cloneNode(true);
      this.prevBtn.parentNode.replaceChild(newPrevBtn, this.prevBtn);
      this.prevBtn = newPrevBtn;

      this.prevBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.log(
          "Previous button clicked, currentIndex:",
          this.currentIndex
        );
        this.goToPrevious();
      });
      // 버튼이 클릭 가능하도록 확실히 설정
      this.prevBtn.style.pointerEvents = "auto";
      this.prevBtn.style.zIndex = "1000";
      this.prevBtn.style.position = "absolute";
    } else {
      console.error("Previous button not found");
    }

    // 다음 버튼 이벤트 리스너
    if (this.nextBtn) {
      // 기존 이벤트 리스너 제거 후 새로 등록 (중복 방지)
      const newNextBtn = this.nextBtn.cloneNode(true);
      this.nextBtn.parentNode.replaceChild(newNextBtn, this.nextBtn);
      this.nextBtn = newNextBtn;

      this.nextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.log("Next button clicked, currentIndex:", this.currentIndex);
        this.goToNext();
      });
      // 버튼이 클릭 가능하도록 확실히 설정
      this.nextBtn.style.pointerEvents = "auto";
      this.nextBtn.style.zIndex = "1000";
      this.nextBtn.style.position = "absolute";
    } else {
      console.error("Next button not found");
    }

    // 키보드 네비게이션
    this.section = document.getElementById("valuesCarousel");
    if (this.section) {
      this.section.setAttribute("tabindex", "0");
      this.section.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          this.goToPrevious();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          this.goToNext();
        }
      });
    }

    // 터치 스와이프 지원
    this.initTouchEvents();

    // HTML의 active 클래스 제거하고 초기 상태 설정
    this.slides.forEach((slide) => {
      slide.classList.remove("active", "prev", "next");
    });

    // 초기 슬라이드 설정 (currentIndex = 0)
    this.currentIndex = 0;

    // 약간의 지연 후 업데이트하여 CSS가 제대로 적용되도록
    setTimeout(() => {
      this.updateSlides();
      this.updateCounter();
    }, 10);

    // Intersection Observer로 화면에 보일 때만 자동 재생
    this.observeVisibility();
  }

  goToSlide(index) {
    // 인덱스 정규화 (범위 밖이면 순환)
    let normalizedIndex = index;
    if (normalizedIndex < 0) {
      normalizedIndex = this.totalSlides - 1;
    } else if (normalizedIndex >= this.totalSlides) {
      normalizedIndex = 0;
    }

    // 같은 슬라이드면 무시
    if (normalizedIndex === this.currentIndex) {
      console.log(`Same slide (${normalizedIndex}), skipping`);
      return;
    }

    // 기존 애니메이션 타임아웃 제거
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
    }

    console.log(
      `Moving from slide ${this.currentIndex} to ${normalizedIndex} (Total: ${this.totalSlides})`
    );

    this.currentIndex = normalizedIndex;
    this.updateSlides();
    this.updateCounter();
    this.resetAutoPlay();

    // 애니메이션 플래그 설정 (짧은 시간만)
    this.isAnimating = true;
    this.animationTimeout = setTimeout(() => {
      this.isAnimating = false;
      console.log(`Animation complete. Current slide: ${this.currentIndex}`);
    }, 600);
  }

  goToNext() {
    const nextIndex = this.currentIndex + 1;
    console.log(`goToNext: ${this.currentIndex} -> ${nextIndex}`);
    this.goToSlide(nextIndex);
  }

  goToPrevious() {
    const prevIndex = this.currentIndex - 1;
    this.goToSlide(prevIndex);
  }

  updateSlides() {
    // 모든 슬라이드의 클래스 초기화
    this.slides.forEach((slide) => {
      slide.classList.remove("active", "prev", "next");
    });

    // 현재 슬라이드가 유효한지 확인
    if (!this.slides[this.currentIndex]) {
      console.error(
        `Invalid currentIndex: ${this.currentIndex}. Total slides: ${this.totalSlides}`
      );
      this.currentIndex = 0;
    }

    // 이전 슬라이드 설정
    let prevIndex = this.currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = this.totalSlides - 1;
    }
    if (
      prevIndex >= 0 &&
      prevIndex < this.totalSlides &&
      prevIndex !== this.currentIndex
    ) {
      this.slides[prevIndex].classList.add("prev");
    }

    // 다음 슬라이드 설정
    let nextIndex = this.currentIndex + 1;
    if (nextIndex >= this.totalSlides) {
      nextIndex = 0;
    }
    if (
      nextIndex >= 0 &&
      nextIndex < this.totalSlides &&
      nextIndex !== this.currentIndex
    ) {
      this.slides[nextIndex].classList.add("next");
    }

    // 현재 슬라이드 활성화 (마지막에 실행하여 z-index가 제대로 적용되도록)
    const currentSlide = this.slides[this.currentIndex];
    currentSlide.classList.add("active");

    // 강제 리플로우 유도 (브라우저가 변경사항을 인식하도록)
    currentSlide.offsetHeight;

    // 디버깅: 실제 클래스 상태 확인
    const activeClasses = Array.from(this.slides).map(
      (slide, i) =>
        `${i}: ${slide.classList.contains("active") ? "active" : ""} ${
          slide.classList.contains("prev") ? "prev" : ""
        } ${slide.classList.contains("next") ? "next" : ""}`
    );

    console.log(
      `✅ Slide updated: Current=${this.currentIndex} (${
        this.currentIndex + 1
      }/${this.totalSlides}), Prev=${prevIndex}, Next=${nextIndex}`
    );
    console.log("Classes:", activeClasses);
  }

  updateCounter() {
    const currentEl = document.getElementById("carouselCurrent");
    if (currentEl) {
      currentEl.textContent = this.currentIndex + 1;
    }
  }

  startAutoPlay() {
    this.stopAutoPlay();
    // 자동 재생 시작
    this.autoPlayInterval = setInterval(() => {
      console.log(
        `Auto-play: currentIndex=${this.currentIndex}, isAnimating=${this.isAnimating}`
      );
      // 애니메이션 체크 제거 - 항상 넘김
      this.goToNext();
    }, this.autoPlayDelay);
    console.log("Auto-play started");
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  resetAutoPlay() {
    // 자동 재생 리셋 (타이머 재시작)
    this.stopAutoPlay();
    // 약간의 지연 후 재시작 (수동 클릭 직후 즉시 자동 재생이 시작되지 않도록)
    setTimeout(() => {
      this.startAutoPlay();
    }, 100);
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
