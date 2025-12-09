// Thumbnail Carousel 기능 - 중앙 강조 방식
class ThumbnailCarousel {
  constructor() {
    this.container = document.getElementById("thumbnailCarouselSlides");
    this.slides = document.querySelectorAll(".thumbnail-slide");
    this.prevBtn = document.getElementById("thumbnailCarouselPrev");
    this.nextBtn = document.getElementById("thumbnailCarouselNext");
    this.currentIndex = 0;
    this.totalSlides = this.slides.length;
    this.isTransitioning = false;

    if (!this.container || this.slides.length === 0) {
      console.error("Thumbnail Carousel elements not found");
      return;
    }

    // 각 슬라이드에 원본 인덱스 저장 (초기화)
    this.slides.forEach((slide, index) => {
      slide.setAttribute("data-slide-index", index);
    });

    // 카운터 업데이트
    const totalEl = document.getElementById("thumbnailCarouselTotal");
    if (totalEl) {
      totalEl.textContent = this.totalSlides;
    }

    this.init();
  }

  init() {
    // 이벤트 리스너 등록
    if (this.prevBtn) {
      this.prevBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Previous button clicked");
        this.goToPrevious();
      });
    } else {
      console.error("Previous button not found");
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Next button clicked");
        this.goToNext();
      });
    } else {
      console.error("Next button not found");
    }

    // 키보드 네비게이션
    document.addEventListener("keydown", (e) => {
      const section = document.getElementById("thumbnailCarousel");
      if (section && this.isElementInViewport(section)) {
        if (e.key === "ArrowLeft") {
          this.goToPrevious();
        } else if (e.key === "ArrowRight") {
          this.goToNext();
        }
      }
    });

    // 터치 스와이프 지원
    this.initTouchEvents();

    // 초기 슬라이드 설정
    this.updateSlides();
  }

  isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  goToSlide(index) {
    if (this.isTransitioning) {
      console.log("Transition in progress, ignoring");
      return;
    }

    if (index < 0) index = this.totalSlides - 1;
    if (index >= this.totalSlides) index = 0;

    console.log(`Going to slide ${index}`);
    this.currentIndex = index;
    this.updateSlides();
    this.updateCounter();
  }

  goToNext() {
    console.log(`Current index: ${this.currentIndex}, Going to next`);
    this.goToSlide(this.currentIndex + 1);
  }

  goToPrevious() {
    console.log(`Current index: ${this.currentIndex}, Going to previous`);
    this.goToSlide(this.currentIndex - 1);
  }

  updateSlides() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    // 기존 슬라이드에 fade-out 효과 추가 (약간만)
    const slidesArray = Array.from(this.slides);
    slidesArray.forEach((slide) => {
      slide.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    });

    // 슬라이드를 중앙 기준으로 재배치
    this.rearrangeSlides();

    // 새로 배치된 슬라이드가 부드럽게 나타나도록
    requestAnimationFrame(() => {
      const newSlides = this.container.querySelectorAll(".thumbnail-slide");
      newSlides.forEach((slide) => {
        slide.style.transition = "";
        // 강제 리플로우로 애니메이션 트리거
        slide.offsetHeight;
      });
    });

    // 전환 애니메이션 완료 후 플래그 해제
    setTimeout(() => {
      this.isTransitioning = false;
    }, 700);
  }

  rearrangeSlides() {
    // 모든 슬라이드를 배열로 가져오기
    const slidesArray = Array.from(this.slides);

    // 현재 슬라이드
    const currentSlide = slidesArray[this.currentIndex];

    // 이전 슬라이드 인덱스
    const prevIndex =
      this.currentIndex === 0 ? this.totalSlides - 1 : this.currentIndex - 1;

    // 다음 슬라이드 인덱스
    const nextIndex =
      this.currentIndex === this.totalSlides - 1 ? 0 : this.currentIndex + 1;

    // DOM에서 모든 슬라이드 제거
    slidesArray.forEach((slide) => {
      if (slide.parentNode) {
        slide.parentNode.removeChild(slide);
      }
    });

    // 모든 클래스 제거
    slidesArray.forEach((slide) => {
      slide.classList.remove("active", "prev", "next");
    });

    // 중앙 강조 순서로 재배치: [prev, active, next, ...others]
    const prevSlide = slidesArray[prevIndex];
    const nextSlide = slidesArray[nextIndex];

    if (prevSlide) {
      prevSlide.classList.add("prev");
      this.container.appendChild(prevSlide);
    }

    if (currentSlide) {
      currentSlide.classList.add("active");
      this.container.appendChild(currentSlide);
    }

    if (nextSlide) {
      nextSlide.classList.add("next");
      this.container.appendChild(nextSlide);
    }

    // 나머지 슬라이드 추가
    slidesArray.forEach((slide, idx) => {
      if (idx !== this.currentIndex && idx !== prevIndex && idx !== nextIndex) {
        this.container.appendChild(slide);
      }
    });

    // slides NodeList 업데이트
    this.slides = this.container.querySelectorAll(".thumbnail-slide");
  }

  updateCounter() {
    const currentEl = document.getElementById("thumbnailCarouselCurrent");
    if (currentEl) {
      currentEl.textContent = this.currentIndex + 1;
    }
  }

  initTouchEvents() {
    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 50;

    this.container.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].clientX;
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
            this.goToNext();
          } else {
            this.goToPrevious();
          }
        }
      },
      { passive: true }
    );
  }
}

// 초기화
document.addEventListener("DOMContentLoaded", () => {
  new ThumbnailCarousel();
});
