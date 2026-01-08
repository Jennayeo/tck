// Corvette Vehicle 3D Rotation 기능
class CorvetteRotate {
  constructor() {
    this.image = document.querySelector('.about-image-img');
    this.container = document.querySelector('.about-image');
    
    if (!this.image || !this.container) {
      return;
    }

    this.rotationY = 0;
    this.isDragging = false;
    this.startX = 0;
    this.startRotationY = 0;

    // 2D 회전을 위한 CSS 초기 설정
    this.image.style.transition = 'transform 0.1s ease-out';
    this.image.style.cursor = 'grab';
    this.image.style.transformOrigin = 'center center';

    this.init();
  }

  init() {
    // 마우스 이벤트
    this.image.addEventListener('mousedown', this.onMouseDown.bind(this));
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));

    // 터치 이벤트
    this.image.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.onTouchEnd.bind(this));

    // 마우스가 이미지 위에 있을 때 커서 변경
    this.image.addEventListener('mouseenter', () => {
      if (!this.isDragging) {
        this.image.style.cursor = 'grab';
      }
    });

    this.image.addEventListener('mouseleave', () => {
      if (!this.isDragging) {
        this.image.style.cursor = 'default';
      }
    });
  }

  onMouseDown(e) {
    this.isDragging = true;
    this.startX = e.clientX;
    this.startRotationY = this.rotationY;
    this.image.style.cursor = 'grabbing';
    this.image.style.transition = 'none'; // 드래그 중에는 transition 제거
    e.preventDefault();
  }

  onMouseMove(e) {
    if (!this.isDragging) return;

    const deltaX = e.clientX - this.startX;

    // Y축 회전만 (평면 회전)
    this.rotationY = this.startRotationY + deltaX * 0.5;
    
    // 0~360도 범위로 정규화
    this.rotationY = this.rotationY % 360;
    if (this.rotationY < 0) {
      this.rotationY += 360;
    }

    this.updateTransform();
  }

  onMouseUp() {
    if (this.isDragging) {
      this.isDragging = false;
      this.image.style.cursor = 'grab';
      this.image.style.transition = 'transform 0.3s ease-out';
      
      // 자동 회전 중지 (선택사항)
      // this.rotationY = this.rotationY;
    }
  }

  onTouchStart(e) {
    if (e.touches.length === 1) {
      this.isDragging = true;
      this.startX = e.touches[0].clientX;
      this.startRotationY = this.rotationY;
      this.image.style.transition = 'none';
      e.preventDefault();
    }
  }

  onTouchMove(e) {
    if (!this.isDragging || e.touches.length !== 1) return;

    const deltaX = e.touches[0].clientX - this.startX;

    // Y축 회전만 (평면 회전)
    this.rotationY = this.startRotationY + deltaX * 0.5;
    
    // 0~360도 범위로 정규화
    this.rotationY = this.rotationY % 360;
    if (this.rotationY < 0) {
      this.rotationY += 360;
    }

    this.updateTransform();
    e.preventDefault();
  }

  onTouchEnd() {
    if (this.isDragging) {
      this.isDragging = false;
      this.image.style.transition = 'transform 0.3s ease-out';
    }
  }

  updateTransform() {
    // 2D 평면 회전 (차량이 회전하는 것처럼)
    this.image.style.transform = `rotate(${this.rotationY}deg)`;
  }

  // 리셋 함수 (선택사항)
  reset() {
    this.rotationY = 0;
    this.image.style.transition = 'transform 0.5s ease-out';
    this.updateTransform();
  }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  new CorvetteRotate();
});

