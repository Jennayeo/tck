# 스크롤 시퀀스 애니메이션 가이드 (Scroll-Jacking)

## 📖 개요

Apple과 Tesla 제품 페이지에서 볼 수 있는 **True Scroll-Jacking** 기능을 구현했습니다. 사용자가 스크롤할 때 화면이 완전히 고정되고, **와이어프레임 이미지가 서서히 사라지면서 실사 이미지로 변환**됩니다.

## 🎨 현재 구현: 듀얼 이미지 블렌딩

- **시작 (0%)**: 밝게 빛나는 와이어프레임 이미지
- **중간 (50%)**: 와이어프레임과 실사가 혼합
- **완료 (100%)**: 완전한 실사 이미지

## 🎯 핵심 기능

### 1. True Scroll-Jacking (진짜 스크롤 잠금)
- ✅ **화면 고정**: 스크롤해도 페이지가 내려가지 않고 현재 섹션에 고정
- ✅ **듀얼 이미지 블렌딩**: 와이어프레임 ↔ 실사 이미지로 부드럽게 전환
- ✅ **양방향 스크롤**: 아래로(와이어프레임→실사), 위로(실사→와이어프레임)
- ✅ **진행도 표시**: 0-100% 진행 바와 퍼센티지 표시
- ✅ **잠금 인디케이터**: "🔒 Scroll Locked" 메시지로 사용자에게 상태 알림
- ✅ **자동 전환**: 100% 완료 시 다음 섹션, 0%에서 위로 가면 이전 섹션

### 2. 시각 효과
- ✅ **와이어프레임 발광**: 시작 시 밝게 빛나는 네온 효과
- ✅ **점진적 투명도**: 와이어프레임이 서서히 사라짐 (opacity: 1 → 0)
- ✅ **실사 페이드인**: 실사 이미지가 서서히 나타남 (opacity: 0 → 1)
- ✅ **블러 효과**: 와이어프레임이 사라질 때 약간의 블러 적용
- ✅ **스케일 애니메이션**: 와이어프레임이 약간 확대되며 사라짐
- ✅ **플래시 효과**: 50% 지점에서 청록색 플래시 (전환 강조)

### 3. 기술적 구현

#### 두 이미지 로딩
```javascript
// 와이어프레임 이미지
this.wireframeImage.src = 'https://page.gensparksite.com/v1/base64_upload/d05c0b9a31f9cbc02a94b7c53fd7637f';

// 실사 이미지
this.realisticImage.src = 'https://page.gensparksite.com/v1/base64_upload/05e35d870bd12798c6ce19dd56f5fedf';
```

#### 스크롤 이벤트 가로채기 (양방향 지원)
```javascript
// wheel 이벤트를 passive: false로 등록하여 preventDefault() 가능
window.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });

handleWheel(event) {
    if (this.isScrollLocked) {
        // 기본 스크롤 동작 차단!
        event.preventDefault();
        
        // 스크롤 방향 감지
        const scrollDirection = event.deltaY > 0 ? 'down' : 'up';
        
        if (scrollDirection === 'down') {
            // 아래로 스크롤: 와이어프레임 → 실사
            this.scrollAccumulator += Math.abs(event.deltaY);
            this.scrollProgress = Math.min(1, this.scrollAccumulator / this.scrollThreshold);
            
            if (this.scrollProgress >= 1) {
                // 100% 도달 → 다음 섹션으로
                this.nextSection.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            // 위로 스크롤: 실사 → 와이어프레임
            this.scrollAccumulator -= Math.abs(event.deltaY);
            this.scrollAccumulator = Math.max(0, this.scrollAccumulator);
            this.scrollProgress = this.scrollAccumulator / this.scrollThreshold;
            
            if (this.scrollProgress <= 0) {
                // 0% 도달 → 이전 섹션으로
                this.prevSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
        
        // 렌더링 (양방향)
        this.render();
    }
}
```

#### Canvas 듀얼 이미지 블렌딩
```javascript
render() {
    const progress = this.scrollProgress; // 0 ~ 1
    
    // 1. 실사 이미지 먼저 그리기 (배경)
    const realisticBrightness = 0.3 + (progress * 0.7); // 어두움 → 밝음
    this.context.filter = `brightness(${realisticBrightness})`;
    this.context.globalAlpha = progress; // 투명 → 불투명
    this.context.drawImage(this.realisticImage, x, y, width, height);
    
    // 2. 와이어프레임 이미지 위에 그리기 (오버레이)
    const wireframeOpacity = 1 - progress; // 불투명 → 투명
    this.context.globalAlpha = wireframeOpacity;
    
    const glowIntensity = 1.3 - (progress * 0.5); // 강한 발광 → 약함
    this.context.filter = `brightness(${glowIntensity}) contrast(1.2)`;
    
    // 사라질 때 블러 효과
    if (progress > 0.7) {
        const blurAmount = (progress - 0.7) * 10;
        this.context.filter += ` blur(${blurAmount}px)`;
    }
    
    this.context.drawImage(this.wireframeImage, x, y, width, height);
}
```

#### 섹션 진입 감지
```javascript
checkSectionVisibility() {
    const rect = this.section.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // 섹션이 화면 중앙에 도달하면 스크롤 잠금 활성화
    if (sectionTop <= viewportHeight * 0.3 && sectionBottom > viewportHeight * 0.7) {
        if (!this.sectionInView && !this.animationComplete) {
            this.isScrollLocked = true;  // 🔒 잠금!
            console.log('🔒 Scroll locked - Animation started');
        }
    }
}
```

## 📁 파일 구조

### 1. `js/scroll-sequence.js` (핵심 로직)
- **ScrollSequence 클래스**: 모든 애니메이션 로직 관리
- **이미지 로딩**: 120개 프레임 관리
- **스크롤 잠금**: wheel/touch 이벤트 처리
- **Canvas 렌더링**: 프레임별 효과 적용
- **진행도 추적**: 누적 스크롤 델타 계산

### 2. `css/scroll-layers.css` (스타일)
- **섹션 레이아웃**: sticky positioning
- **Canvas 스타일**: 전체 화면 크기
- **진행도 UI**: 수직 진행 바, 퍼센티지, 잠금 인디케이터
- **배경 효과**: 그리드, 그라디언트, 글로우 효과

### 3. `index.html` (HTML 구조)
```html
<section class="scroll-layers-section" id="futureVision">
    <div class="scroll-layers-container">
        <!-- Canvas for Image Sequence -->
        <canvas id="sequenceCanvas"></canvas>
        
        <!-- Progress Indicator -->
        <div class="layer-progress">
            <div class="scroll-lock-indicator" id="scrollLockIndicator">
                🔒 Scroll Locked
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar-fill" id="progressBarFill"></div>
            </div>
            <div class="progress-percentage" id="progressPercentage">0%</div>
        </div>
        
        <!-- Scroll Indicator -->
        <div class="scroll-indicator">
            <span>SCROLL</span>
        </div>
    </div>
</section>
```

## 🔧 커스터마이징

### 이미지 URL 변경
```javascript
// js/scroll-sequence.js
// 와이어프레임 이미지
this.wireframeImage.src = '여기에_와이어프레임_URL';

// 실사 이미지
this.realisticImage.src = '여기에_실사_이미지_URL';
```

### 스크롤 속도 조정
```javascript
// js/scroll-sequence.js
this.scrollThreshold = 5000;  // 완료에 필요한 스크롤량 (픽셀)
                               // 값이 클수록 더 많이 스크롤해야 함
```

### 섹션 높이 조정
```css
/* css/scroll-layers.css */
.scroll-layers-section {
    min-height: 300vh;  /* 기본 3배 높이, 필요시 조정 */
}
```

### 애니메이션 효과 조정
```javascript
// js/scroll-sequence.js - render() 함수 내

// 실사 이미지 밝기 범위 조정
const realisticBrightness = 0.3 + (progress * 0.7);  // 0.3 ~ 1.0

// 와이어프레임 발광 강도 조정
const glowIntensity = 1.3 - (progress * 0.5);  // 1.3 ~ 0.8

// 블러 시작 시점 및 강도 조정
if (progress > 0.7) {  // 70%부터 블러 시작
    const blurAmount = (progress - 0.7) * 10;  // 최대 3px
}

// 와이어프레임 스케일 효과 조정
const wireframeScale = 1 + (progress * 0.05);  // 1.0 ~ 1.05
```

## 🎬 이미지 변경 방법

현재는 **두 개의 이미지를 블렌딩**하는 방식입니다:
- **와이어프레임**: 밝게 빛나는 청록색 F1 카
- **실사**: 어두운 배경의 완성된 F1 카

### 이미지 교체하기

다른 이미지로 변경하려면 `js/scroll-sequence.js`에서:

```javascript
loadImages() {
    // 와이어프레임 이미지 (시작 상태)
    this.wireframeImage = new Image();
    this.wireframeImage.src = '여기에_와이어프레임_이미지_URL';
    
    // 실사 이미지 (최종 상태)
    this.realisticImage = new Image();
    this.realisticImage.src = '여기에_실사_이미지_URL';
}
```

### 권장 이미지 사양
- **포맷**: JPEG 또는 WebP
- **해상도**: 1920x1080 이상 (고해상도 디스플레이 대응)
- **비율**: 두 이미지의 비율이 동일하면 더 자연스러움
- **파일 크기**: 각 1-3MB (너무 크면 로딩 시간 증가)
- **배경**: 와이어프레임은 어두운 배경, 실사도 비슷한 배경 권장

## 📱 모바일 지원

터치 이벤트로 모바일 디바이스에서도 동일하게 작동:

```javascript
handleTouchMove(event) {
    if (this.isScrollLocked && !this.animationComplete) {
        event.preventDefault();  // 기본 터치 스크롤 차단
        
        const touchY = event.touches[0].clientY;
        const deltaY = this.touchStartY - touchY;
        this.touchStartY = touchY;
        
        // 누적하여 진행도 계산
        this.scrollAccumulator += Math.abs(deltaY);
        this.scrollProgress = Math.min(1, this.scrollAccumulator / this.scrollThreshold);
        
        // 프레임 업데이트
        const frameIndex = Math.floor(this.scrollProgress * (this.imageCount - 1));
        this.render(frameIndex);
    }
}
```

## 🎓 작동 원리

### 1. 섹션 진입 감지
- Intersection Observer로 섹션이 viewport 50% 진입 시 감지
- 자동으로 섹션 상단에 스냅하여 정확한 위치 고정
- 섹션이 화면 중앙에 도달하면 `isScrollLocked = true`

### 2. 스크롤 가로채기
- `wheel` 이벤트에서 `event.preventDefault()` 호출
- 기본 스크롤 동작이 차단되어 페이지가 고정됨
- 스크롤 방향 감지: `event.deltaY > 0` (아래) vs `< 0` (위)

### 3. 진행도 계산 (양방향)
- **아래로 스크롤**: `scrollAccumulator += deltaY` (누적 증가)
- **위로 스크롤**: `scrollAccumulator -= deltaY` (누적 감소)
- `scrollProgress = accumulator / threshold` (0~1 사이 값)

### 4. 프레임 렌더링 (양방향)
- 진행도에 따라 두 이미지의 혼합 비율 계산
- **Progress 0%**: 와이어프레임 100%, 실사 0%
- **Progress 50%**: 와이어프레임 50%, 실사 50%
- **Progress 100%**: 와이어프레임 0%, 실사 100%
- Canvas에 블렌딩하여 그리기
- 밝기, 스케일, 블러 등 효과 적용

### 5. 잠금 해제 및 섹션 전환
- **진행도 100% + 아래 스크롤**: 다음 섹션으로 자동 이동
- **진행도 0% + 위 스크롤**: 이전 섹션으로 자동 이동
- 중간에서 방향 전환 가능 (자유롭게 앞뒤 이동)

## ⚠️ 주의사항

### 1. Passive Event Listener
```javascript
// ❌ 잘못된 방법 (preventDefault 불가능)
window.addEventListener('wheel', handler, { passive: true });

// ✅ 올바른 방법 (preventDefault 가능)
window.addEventListener('wheel', handler, { passive: false });
```

### 2. 성능 고려사항
- **이미지 수**: 120프레임은 많은 메모리 사용 (각 2-5MB × 120 = 240-600MB)
- **해결책**: 이미지 압축, WebP 포맷, Progressive Loading

### 3. 접근성
- 스크롤 잠금은 일부 사용자에게 혼란을 줄 수 있음
- 명확한 진행도 표시와 스크롤 인디케이터 필수

### 4. 브라우저 호환성
- `wheel` 이벤트: 모든 모던 브라우저 지원
- `passive: false`: Chrome, Firefox, Safari 지원
- Canvas API: IE9+ 지원

## 🚀 다음 단계 (향상 아이디어)

1. **더 많은 프레임**: 2개 → 10개 → 30개 중간 프레임으로 더욱 부드러운 전환
2. **WebGL 디스플레이스먼트**: Three.js로 더 고급스러운 왜곡 효과
3. **역방향 스크롤**: 완성차 → 와이어프레임 (위로 스크롤 시)
4. **이미지 프리로딩**: Progressive loading으로 초기 로딩 개선
5. **파티클 효과**: 전환 중 파티클 애니메이션 추가

## 📞 문의

스크롤 시퀀스 애니메이션 관련 문의사항이 있으시면 개발팀에 연락주세요.

---

**구현 완료**: 2024-11-08  
**파일**: `js/scroll-sequence.js`, `css/scroll-layers.css`, `index.html`  
**기술**: Canvas API, Wheel Event, Touch Events, Intersection Observer
