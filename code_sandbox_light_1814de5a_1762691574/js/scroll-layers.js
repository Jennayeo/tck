// Scroll-based Image Blending Transition
class ScrollImageBlending {
    constructor(sectionId) {
        this.section = document.getElementById(sectionId);
        if (!this.section) return;
        
        this.completeImage = this.section.querySelector('.complete-image');
        this.progressBarFill = document.getElementById('progressBarFill');
        this.progressPercentage = document.getElementById('progressPercentage');
        this.scrollIndicator = this.section.querySelector('.scroll-indicator');
        
        this.init();
    }
    
    init() {
        // Bind scroll event
        window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
        
        // Initial check
        this.handleScroll();
    }
    
    handleScroll() {
        if (!this.section) return;
        
        const rect = this.section.getBoundingClientRect();
        const sectionHeight = this.section.offsetHeight;
        const viewportHeight = window.innerHeight;
        
        // 섹션이 화면 밖에 있으면 리턴
        if (rect.bottom < 0) {
            // 섹션을 완전히 지나친 경우 - 100% 완성차 상태 유지
            if (this.completeImage) {
                this.completeImage.style.opacity = '1';
            }
            if (this.progressBarFill) {
                this.progressBarFill.style.height = '100%';
            }
            if (this.progressPercentage) {
                this.progressPercentage.textContent = '100%';
            }
            return;
        }
        
        if (rect.top > viewportHeight) {
            // 섹션이 아직 안 나타난 경우 - 0% 와이어프레임 상태 유지
            if (this.completeImage) {
                this.completeImage.style.opacity = '0';
            }
            if (this.progressBarFill) {
                this.progressBarFill.style.height = '0%';
            }
            if (this.progressPercentage) {
                this.progressPercentage.textContent = '0%';
            }
            return;
        }
        
        // 섹션 시작점 (top이 viewport 안으로 들어온 시점)
        const sectionStart = viewportHeight - rect.bottom + sectionHeight;
        
        // 전체 스크롤 가능 범위
        const scrollRange = sectionHeight;
        
        // 진행도 계산 (0 to 1)
        let scrollProgress = Math.max(0, Math.min(1, sectionStart / scrollRange));
        
        // 더 부드러운 전환을 위해 easing 적용
        scrollProgress = this.easeInOutCubic(scrollProgress);
        
        // Hide scroll indicator after initial scroll
        if (scrollProgress > 0.05 && this.scrollIndicator) {
            this.scrollIndicator.style.opacity = '0';
        } else if (this.scrollIndicator && rect.top < viewportHeight) {
            this.scrollIndicator.style.opacity = '1';
        }
        
        // Update image opacity (와이어프레임 → 완성차)
        if (this.completeImage) {
            this.completeImage.style.opacity = scrollProgress.toFixed(3);
        }
        
        // Update progress bar
        const percentage = Math.round(scrollProgress * 100);
        if (this.progressBarFill) {
            this.progressBarFill.style.height = percentage + '%';
        }
        if (this.progressPercentage) {
            this.progressPercentage.textContent = percentage + '%';
        }
        
        // Update image scale for depth effect
        this.updateImageScale(scrollProgress);
    }
    
    updateImageScale(progress) {
        const baseScale = 1;
        const maxScale = 1.1;
        const scale = baseScale + (progress * (maxScale - baseScale));
        
        if (this.completeImage) {
            this.completeImage.style.transform = `scale(${scale})`;
        }
    }
    
    // Easing function for smooth transition
    easeInOutCubic(t) {
        return t < 0.5 
            ? 4 * t * t * t 
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    new ScrollImageBlending('futureVision');
});

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        new ScrollImageBlending('futureVision');
    }, 250);
});