// 스크롤 시퀀스 이미지 애니메이션
// 와이어프레임 → 실사 이미지 블렌딩 효과 (True Scroll-Jacking)
class ScrollSequence {
    constructor(sectionId) {
        this.section = document.getElementById(sectionId);
        if (!this.section) {
            console.error('Section not found:', sectionId);
            return;
        }
        
        this.canvas = this.section.querySelector('#sequenceCanvas');
        this.context = this.canvas ? this.canvas.getContext('2d') : null;
        
        if (!this.canvas || !this.context) {
            console.error('Canvas not found');
            return;
        }
        
        // 두 이미지 설정
        this.wireframeImage = null;  // 와이어프레임 이미지
        this.realisticImage = null;  // 실사 이미지
        this.imagesLoaded = 0;
        
        // 스크롤 잠금 설정
        this.isScrollLocked = false;
        this.scrollProgress = 0; // 0 ~ 1 사이 값 (0: 와이어프레임, 1: 실사)
        this.scrollAccumulator = 0; // 누적 스크롤 델타
        this.scrollThreshold = 4000; // 전체 시퀀스를 완료하는데 필요한 총 스크롤량 (픽셀)
        
        // 진행 표시 요소
        this.progressBar = document.getElementById('progressBarFill');
        this.progressText = document.getElementById('progressPercentage');
        this.scrollIndicator = this.section.querySelector('.scroll-indicator');
        this.lockIndicator = document.getElementById('scrollLockIndicator');
        
        // 배경 슬라이드 요소
        this.backgroundSlide = document.getElementById('backgroundSlide');
        
        // 스크롤 상태 추적
        this.sectionInView = false;
        this.animationComplete = false;
        
        // 이전 스크롤 위치 추적 (방향 감지용)
        this.lastScrollY = 0;
        this.scrollDirection = 'down'; // 'down' or 'up'
        
        this.init();
    }
    
    init() {
        this.setCanvasSize();
        window.addEventListener('resize', () => this.setCanvasSize());
        
        // 스크롤 방향 추적 (섹션 진입 시 방향 판단용)
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            this.scrollDirection = currentScrollY > this.lastScrollY ? 'down' : 'up';
            this.lastScrollY = currentScrollY;
        }, { passive: true });
        
        // wheel 이벤트로 스크롤 가로채기 (passive: false 필수!)
        window.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
        
        // Intersection Observer로 섹션 진입 감지 (더 정확함)
        this.setupIntersectionObserver();
        
        // 터치 이벤트 지원 (모바일)
        window.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.touchStartY = 0;
        window.addEventListener('touchstart', (e) => {
            this.touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        // 두 이미지 로드
        this.loadImages();
    }
    
    // Intersection Observer 설정 (정확한 섹션 진입 감지)
    setupIntersectionObserver() {
        const options = {
            root: null,
            threshold: 0.5, // 섹션의 50%가 보이면 트리거
            rootMargin: '0px'
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && this.imagesLoaded >= 2) {
                    // 섹션이 화면 중앙에 왔을 때
                    if (!this.sectionInView) {
                        const direction = this.scrollDirection;
                        console.log(`🎯 Section entered view from ${direction} - activating scroll lock`);
                        
                        // 스크롤 방향에 따라 시작 상태 설정
                        if (direction === 'down') {
                            // 아래에서 진입: 0%부터 시작 (와이어프레임)
                            this.scrollAccumulator = 0;
                            this.scrollProgress = 0;
                            this.animationComplete = false;
                            console.log('⬇️ Starting from 0% (wireframe)');
                        } else {
                            // 위에서 진입: 100%부터 시작 (실사)
                            this.scrollAccumulator = this.scrollThreshold;
                            this.scrollProgress = 1;
                            this.animationComplete = true; // 이미 완료 상태
                            console.log('⬆️ Starting from 100% (realistic)');
                        }
                        
                        // 초기 렌더링
                        this.render();
                        this.updateProgress(Math.round(this.scrollProgress * 100));
                        
                        // 섹션을 정확히 상단에 스냅
                        setTimeout(() => {
                            window.scrollTo({
                                top: this.section.offsetTop,
                                behavior: 'smooth'
                            });
                            
                            // 약간의 지연 후 잠금 활성화
                            setTimeout(() => {
                                this.activateScrollLock();
                            }, 300);
                        }, 100);
                    }
                } else {
                    // 섹션이 화면 밖으로 나갔을 때
                    if (this.sectionInView) {
                        // 진행도는 유지하고 잠금만 해제
                        this.sectionInView = false;
                        this.isScrollLocked = false;
                        console.log('🔓 Section left view - scroll lock released');
                    }
                }
            });
        }, options);
        
        this.observer.observe(this.section);
    }
    
    // 스크롤 잠금 활성화
    activateScrollLock() {
        this.sectionInView = true;
        this.isScrollLocked = true;
        console.log('🔒 Scroll locked - Animation started');
        
        // 스크롤 인디케이터 숨기기
        if (this.scrollIndicator) {
            this.scrollIndicator.style.opacity = '0';
        }
        
        // 잠금 인디케이터 표시
        if (this.lockIndicator) {
            this.lockIndicator.style.opacity = '1';
        }
    }
    
    // 스크롤 잠금 해제 (진행도는 유지)
    deactivateScrollLock() {
        this.sectionInView = false;
        this.isScrollLocked = false;
        // 진행도는 유지! (다시 돌아올 때를 위해)
        // this.scrollAccumulator, this.scrollProgress는 그대로 유지
        
        if (this.scrollIndicator) {
            this.scrollIndicator.style.opacity = '1';
        }
        
        if (this.lockIndicator) {
            this.lockIndicator.style.opacity = '0';
        }
        
        console.log('🔓 Scroll lock deactivated (progress preserved)');
    }
    
    setCanvasSize() {
        // 100vh 고정 높이 사용
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        
        // CSS 크기는 실제 화면 크기로 설정
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        
        // Context를 DPR로 스케일링
        this.context.scale(dpr, dpr);
        
        // 이미지 렌더링 품질 향상
        this.context.imageSmoothingEnabled = true;
        this.context.imageSmoothingQuality = 'high';
        
        this.render(); // 리사이즈 후 다시 그리기
    }
    
    // 두 이미지 로드
    loadImages() {
        // 첫 번째 이미지 - 클래식 코르벳 (흑백, 스튜디오)
        this.wireframeImage = new Image();
        this.wireframeImage.crossOrigin = "anonymous";
        this.wireframeImage.src = 'https://page.gensparksite.com/v1/base64_upload/168d4b33d26edff92f6dfb079c906371';
        
        this.wireframeImage.onload = () => {
            console.log('✅ First image loaded (Classic Corvette Studio)');
            this.imagesLoaded++;
            if (this.imagesLoaded === 2) {
                this.render(); // 두 이미지 모두 로드되면 렌더링
            }
        };
        
        this.wireframeImage.onerror = (e) => {
            console.error('❌ First image load failed:', e);
        };
        
        // 두 번째 이미지 - 블루 코르벳 (스튜디오, 세로)
        this.realisticImage = new Image();
        this.realisticImage.crossOrigin = "anonymous";
        this.realisticImage.src = 'https://page.gensparksite.com/v1/base64_upload/589cfaeda88f10ee46bc8162fbe75500';
        
        this.realisticImage.onload = () => {
            console.log('✅ Second image loaded (Blue Corvette)');
            this.imagesLoaded++;
            if (this.imagesLoaded === 2) {
                this.render(); // 두 이미지 모두 로드되면 렌더링
            }
        };
        
        this.realisticImage.onerror = (e) => {
            console.error('❌ Second image load failed:', e);
        };
    }
    

    // Wheel 이벤트 핸들러 (핵심: 스크롤 가로채기 + 양방향 지원)
    handleWheel(event) {
        // 이미지가 로드되지 않았거나 섹션이 활성화되지 않으면 무시
        if (this.imagesLoaded < 2 || !this.sectionInView) return;
        
        // 스크롤이 잠겨있을 때
        if (this.isScrollLocked) {
            // 기본 스크롤 동작 차단!
            event.preventDefault();
            
            // 스크롤 방향 감지
            const scrollDirection = event.deltaY > 0 ? 'down' : 'up';
            
            // === 아래로 스크롤 (와이어프레임 → 실사) ===
            if (scrollDirection === 'down') {
                // 아직 애니메이션이 완료되지 않았으면
                if (!this.animationComplete) {
                    // 스크롤 델타 누적
                    this.scrollAccumulator += Math.abs(event.deltaY);
                    
                    // 진행도 계산 (0 ~ 1)
                    this.scrollProgress = Math.min(1, this.scrollAccumulator / this.scrollThreshold);
                    
                    // 렌더링
                    this.render();
                    
                    // 진행 표시 업데이트
                    this.updateProgress(Math.round(this.scrollProgress * 100));
                    
                    // 애니메이션 100% 완료 시
                    if (this.scrollProgress >= 1) {
                        this.animationComplete = true;
                        console.log('✅ Animation complete (forward)');
                        
                        // 잠금 인디케이터 숨기기
                        if (this.lockIndicator) {
                            this.lockIndicator.style.opacity = '0';
                        }
                        
                        // 약간의 지연 후 자동으로 다음 섹션으로 스크롤
                        setTimeout(() => {
                            this.isScrollLocked = false;
                            const nextSection = this.section.nextElementSibling;
                            if (nextSection) {
                                console.log('⬇️ Auto-scrolling to next section');
                                nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }, 500);
                    }
                }
            }
            // === 위로 스크롤 (실사 → 와이어프레임) 역방향 ===
            else if (scrollDirection === 'up') {
                // 진행도가 0보다 크면 되돌리기 가능
                if (this.scrollProgress > 0) {
                    // 애니메이션 완료 상태 해제 (역방향 허용)
                    if (this.animationComplete) {
                        this.animationComplete = false;
                        console.log('🔄 Reversing animation');
                        
                        // 잠금 인디케이터 다시 표시
                        if (this.lockIndicator) {
                            this.lockIndicator.style.opacity = '1';
                        }
                    }
                    
                    // 스크롤 델타 감소 (역방향)
                    this.scrollAccumulator -= Math.abs(event.deltaY);
                    this.scrollAccumulator = Math.max(0, this.scrollAccumulator); // 음수 방지
                    
                    // 진행도 재계산
                    this.scrollProgress = Math.min(1, this.scrollAccumulator / this.scrollThreshold);
                    
                    // 렌더링 (실사 → 와이어프레임)
                    this.render();
                    
                    // 진행 표시 업데이트
                    this.updateProgress(Math.round(this.scrollProgress * 100));
                    
                    console.log(`⬆️ Reverse progress: ${Math.round(this.scrollProgress * 100)}%`);
                } else {
                    // 진행도가 0이면 이전 섹션으로 이동
                    this.isScrollLocked = false;
                    const prevSection = this.section.previousElementSibling;
                    if (prevSection) {
                        console.log('⬆️ Auto-scrolling to previous section');
                        prevSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            }
        }
    }
    
    // 터치 이벤트 핸들러 (모바일 지원 + 양방향)
    handleTouchMove(event) {
        if (this.imagesLoaded < 2 || !this.sectionInView) return;
        
        if (this.isScrollLocked) {
            event.preventDefault();
            
            const touchY = event.touches[0].clientY;
            const deltaY = this.touchStartY - touchY;
            this.touchStartY = touchY;
            
            // 터치 방향 감지
            const touchDirection = deltaY > 0 ? 'down' : 'up';
            
            // === 아래로 스와이프 (와이어프레임 → 실사) ===
            if (touchDirection === 'down') {
                if (!this.animationComplete) {
                    // 스크롤 델타 누적
                    this.scrollAccumulator += Math.abs(deltaY);
                    
                    // 진행도 계산
                    this.scrollProgress = Math.min(1, this.scrollAccumulator / this.scrollThreshold);
                    
                    // 렌더링
                    this.render();
                    
                    this.updateProgress(Math.round(this.scrollProgress * 100));
                    
                    // 애니메이션 완료
                    if (this.scrollProgress >= 1) {
                        this.animationComplete = true;
                        
                        if (this.lockIndicator) {
                            this.lockIndicator.style.opacity = '0';
                        }
                        
                        setTimeout(() => {
                            this.isScrollLocked = false;
                            const nextSection = this.section.nextElementSibling;
                            if (nextSection) {
                                nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }, 500);
                    }
                }
            }
            // === 위로 스와이프 (실사 → 와이어프레임) 역방향 ===
            else if (touchDirection === 'up') {
                if (this.scrollProgress > 0) {
                    // 애니메이션 완료 상태 해제
                    if (this.animationComplete) {
                        this.animationComplete = false;
                        if (this.lockIndicator) {
                            this.lockIndicator.style.opacity = '1';
                        }
                    }
                    
                    // 스크롤 델타 감소
                    this.scrollAccumulator -= Math.abs(deltaY);
                    this.scrollAccumulator = Math.max(0, this.scrollAccumulator);
                    
                    // 진행도 재계산
                    this.scrollProgress = Math.min(1, this.scrollAccumulator / this.scrollThreshold);
                    
                    // 렌더링
                    this.render();
                    
                    this.updateProgress(Math.round(this.scrollProgress * 100));
                } else {
                    // 진행도가 0이면 이전 섹션으로
                    this.isScrollLocked = false;
                    const prevSection = this.section.previousElementSibling;
                    if (prevSection) {
                        prevSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            }
        }
    }
    
    // Canvas에 두 이미지를 와이프 효과로 렌더링 (좌→우 클리핑)
    render() {
        if (!this.context || !this.wireframeImage || !this.realisticImage) return;
        if (this.imagesLoaded < 2) return;
        
        // 고품질 렌더링 설정
        this.context.imageSmoothingEnabled = true;
        this.context.imageSmoothingQuality = 'high';
        
        // 캔버스 초기화 (DPR 적용된 크기 사용)
        const dpr = window.devicePixelRatio || 1;
        this.context.clearRect(0, 0, this.canvas.width / dpr, this.canvas.height / dpr);
        
        // 이미지 크기 및 위치 계산 (가로 꽉 채움, 비율 유지)
        const canvasDisplayWidth = window.innerWidth;
        const canvasDisplayHeight = window.innerHeight;
        
        // 가로 기준으로 스케일 계산 (비율 유지)
        const scale = canvasDisplayWidth / this.wireframeImage.width;
        
        const width = this.wireframeImage.width * scale;
        const height = this.wireframeImage.height * scale;
        const x = 0; // 가로 꽉 채움
        const y = (canvasDisplayHeight - height) / 2; // 세로 중앙 정렬
        
        // 진행도에 따른 효과
        const progress = this.scrollProgress; // 0 (와이어프레임) ~ 1 (실사)
        
        // === 와이프 효과: 화면 전체 기준으로 클리핑 (배경 슬라이드와 sync) ===
        const divideX = canvasDisplayWidth * progress; // 화면 전체 기준 구분선 X 좌표
        
        // === 1. 왼쪽: 실사 이미지 (진행된 부분) ===
        this.context.save();
        
        // 클리핑 영역: 좌측 0부터 divideX까지 (화면 전체 기준)
        this.context.beginPath();
        this.context.rect(0, 0, divideX, canvasDisplayHeight);
        this.context.clip();
        
        // 실사 이미지 그리기 (전체 이미지, 클리핑 영역만 보임)
        this.context.filter = 'brightness(1.0) contrast(1.08)';
        this.context.drawImage(this.realisticImage, x, y, width, height);
        
        this.context.restore();
        
        // === 2. 오른쪽: 와이어프레임 이미지 (아직 진행 안 된 부분) ===
        this.context.save();
        
        // 클리핑 영역: divideX부터 우측 끝까지
        this.context.beginPath();
        this.context.rect(divideX, 0, canvasDisplayWidth - divideX, canvasDisplayHeight);
        this.context.clip();
        
        // 클래식 코르벳 효과 (발광 감소, 자연스러운 회색)
        this.context.filter = 'brightness(1.1) contrast(1.15)';
        this.context.drawImage(this.wireframeImage, x, y, width, height);
        
        this.context.restore();
        
        // === 3. 구분선 (청록색 발광 라인) - 배경 슬라이드 경계와 정확히 일치 ===
        if (progress > 0 && progress < 1) {
            this.context.save();
            
            // 세로 구분선 그리기
            const lineWidth = 3;
            
            // 그라디언트 생성 (발광 효과)
            const gradient = this.context.createLinearGradient(
                divideX - lineWidth, 0,
                divideX + lineWidth, 0
            );
            gradient.addColorStop(0, 'rgba(0, 200, 255, 0)');
            gradient.addColorStop(0.5, 'rgba(0, 200, 255, 0.9)');
            gradient.addColorStop(1, 'rgba(0, 200, 255, 0)');
            
            // 구분선 그리기
            this.context.fillStyle = gradient;
            this.context.fillRect(divideX - lineWidth, 0, lineWidth * 2, canvasDisplayHeight);
            
            // 글로우 효과
            this.context.shadowColor = 'rgba(0, 200, 255, 0.8)';
            this.context.shadowBlur = 20;
            this.context.fillRect(divideX - 1, 0, 2, canvasDisplayHeight);
            
            this.context.restore();
        }
    }
    
    updateProgress(percentage) {
        // 진행 바는 숨김 처리 (CSS에서 display: none)
        if (this.progressBar) {
            this.progressBar.style.height = percentage + '%';
        }
        if (this.progressText) {
            this.progressText.textContent = percentage + '%';
        }
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    new ScrollSequence('futureVision');
    console.log('ScrollSequence initialized with dual-image blending');
});
