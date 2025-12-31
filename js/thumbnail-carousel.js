// Thumbnail Carousel 기능 - 중앙 강조 방식
class ThumbnailCarousel {
  constructor() {
    this.container = document.getElementById("thumbnailCarouselSlides");
    this.slides = document.querySelectorAll(".thumbnail-slide");
    this.prevBtn = document.getElementById("thumbnailCarouselPrev");
    this.nextBtn = document.getElementById("thumbnailCarouselNext");
    this.currentIndex = 2; // 디폴트를 3번 슬라이드로 설정 (인덱스는 0부터 시작)
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
    
    // 화면 크기 변경 시 재계산
    window.addEventListener('resize', () => {
      this.updateSlides();
    });
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
    this.updateCounter();
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

    // 모든 슬라이드에서 active 클래스 제거
    this.slides.forEach((slide) => {
      slide.classList.remove('active');
    });

    // 현재 슬라이드에 active 클래스 추가
    if (this.slides[this.currentIndex]) {
      this.slides[this.currentIndex].classList.add('active');
    }

    // 모바일 여부 확인
    const isMobile = window.innerWidth <= 768;
    
    // 컨테이너를 부드럽게 이동시키기 위해 translateX 사용
    // 각 슬라이드가 33.333% 너비이므로, 현재 슬라이드를 중앙에 위치시키려면
    // translateX = -currentIndex * 33.333% + 33.333%
    let translateX;
    
    if (isMobile) {
      // 모바일: 3등분 레이아웃 (33.333% 너비), 중앙(2번째)에 배치
      const slideWidthPercent = 33.333;
      // 중앙에 배치하기 위한 오프셋: (100% - 33.333%) / 2 = 33.333%
      const centerOffset = (100 - slideWidthPercent) / 2;
      // 각 슬라이드마다 33.333%씩 왼쪽으로 이동
      translateX = centerOffset - this.currentIndex * slideWidthPercent;
    } else {
      // 데스크톱: 중앙 정렬 (33.333% 너비)
      const slideWidthPercent = 33.333;
      // 중앙에 배치하기 위한 오프셋: (100% - 33.333%) / 2 = 33.333%
      const centerOffset = (100 - slideWidthPercent) / 2;
      // 각 슬라이드마다 33.333%씩 왼쪽으로 이동
      translateX = centerOffset - this.currentIndex * slideWidthPercent;
    }
    
    this.container.style.transform = `translateX(${translateX}%)`;
    
    // 전환 애니메이션 완료 후 플래그 해제
    setTimeout(() => {
      this.isTransitioning = false;
    }, 600);
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
