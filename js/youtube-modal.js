// YouTube Video Modal 기능
class YouTubeModal {
  constructor() {
    this.modal = document.getElementById('youtubeModal');
    this.closeBtn = document.getElementById('youtubeModalClose');
    this.overlay = this.modal?.querySelector('.youtube-modal-overlay');
    this.titleEl = document.getElementById('youtubeModalTitle');
    this.thumbnailEl = document.getElementById('youtubeModalThumbnail');
    this.thumbnailContainer = document.getElementById('youtubeModalThumbnailContainer');
    this.playButton = document.getElementById('youtubeModalPlayButton');
    this.iframeEl = document.getElementById('youtubeModalIframe');
    this.videoContainer = document.getElementById('youtubeModalVideo');
    this.linkEl = document.getElementById('youtubeModalLink');
    this.currentVideoId = null;

    if (!this.modal) {
      console.error('YouTube modal elements not found');
      return;
    }

    this.init();
  }

  init() {
    // 썸네일 클릭 이벤트
    const thumbnailItems = document.querySelectorAll('.thumbnail-item.youtube-item');
    thumbnailItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const youtubeId = item.getAttribute('data-youtube-id');
        const href = item.getAttribute('href');
        const titleEl = item.querySelector('.thumbnail-title');
        const descEl = item.querySelector('.thumbnail-description');
        const imgEl = item.querySelector('.thumbnail-img');
        
        const title = titleEl?.textContent || 'YouTube Video';
        const description = descEl?.textContent || '';
        const thumbnail = imgEl?.getAttribute('src') || `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
        
        this.openModal(youtubeId, href, title, description, thumbnail);
      });
    });

    // 닫기 버튼
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.closeModal());
    }

    // 오버레이 클릭 시 닫기
    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.closeModal());
    }

    // ESC 키로 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.closeModal();
      }
    });

    // 모달 내부 링크 클릭 시 기본 동작 허용
    if (this.linkEl) {
      this.linkEl.addEventListener('click', (e) => {
        // 링크는 새 탭에서 열리도록 (target="_blank" 이미 설정됨)
      });
    }
  }

  openModal(youtubeId, href, title, description, thumbnail) {
    if (!this.modal) return;

    this.currentVideoId = youtubeId;

    // 모달 내용 업데이트
    if (this.titleEl) {
      this.titleEl.textContent = title;
    }
    if (this.thumbnailEl) {
      this.thumbnailEl.src = thumbnail;
      this.thumbnailEl.alt = title;
    }
    if (this.linkEl) {
      this.linkEl.href = href;
    }

    // 썸네일 표시, iframe 숨김
    if (this.thumbnailContainer) {
      this.thumbnailContainer.style.display = 'flex';
    }
    if (this.iframeEl) {
      this.iframeEl.style.display = 'none';
      this.iframeEl.src = ''; // iframe 초기화
    }

    // 플레이 버튼 클릭 이벤트
    if (this.playButton) {
      this.playButton.onclick = () => this.playVideo(youtubeId);
    }

    // 썸네일 클릭 이벤트
    if (this.thumbnailContainer) {
      this.thumbnailContainer.onclick = () => this.playVideo(youtubeId);
      this.thumbnailContainer.style.cursor = 'pointer';
    }

    // 모달 표시
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
  }

  playVideo(youtubeId) {
    if (!this.iframeEl || !this.thumbnailContainer) return;

    // YouTube embed URL 생성 (autoplay=1 추가)
    const embedUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`;

    // iframe에 영상 로드
    this.iframeEl.src = embedUrl;

    // 썸네일 숨기고 iframe 표시
    this.thumbnailContainer.style.display = 'none';
    this.iframeEl.style.display = 'block';
  }

  closeModal() {
    if (!this.modal) return;

    // iframe 정지 (src 제거)
    if (this.iframeEl) {
      this.iframeEl.src = '';
      this.iframeEl.style.display = 'none';
    }

    // 썸네일 다시 표시
    if (this.thumbnailContainer) {
      this.thumbnailContainer.style.display = 'flex';
    }

    this.modal.classList.remove('active');
    document.body.style.overflow = ''; // 배경 스크롤 복원
    this.currentVideoId = null;
  }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  new YouTubeModal();
});

