# YouTube API 연동 가이드

## 📺 YouTube Data API v3 연동 방법

### 1단계: Google Cloud Console에서 API 키 발급

#### 1.1 프로젝트 생성
1. **Google Cloud Console** 접속: https://console.cloud.google.com/
2. 상단 프로젝트 선택 → **새 프로젝트** 클릭
3. 프로젝트 이름 입력 (예: "GMTCK-Analytics")
4. **만들기** 클릭

#### 1.2 YouTube Data API v3 활성화
1. 왼쪽 메뉴 → **API 및 서비스** → **라이브러리**
2. "YouTube Data API v3" 검색
3. **YouTube Data API v3** 선택 → **사용** 클릭

#### 1.3 API 키 생성
1. 왼쪽 메뉴 → **API 및 서비스** → **사용자 인증 정보**
2. 상단 **+ 사용자 인증 정보 만들기** → **API 키** 선택
3. API 키가 생성됨 → **복사**하여 저장
4. (권장) **키 제한** 클릭:
   - **애플리케이션 제한사항**: HTTP 리퍼러 (웹사이트)
   - **API 제한사항**: YouTube Data API v3만 선택

---

## 2단계: 채널 ID 확인

### 방법 1: YouTube Studio에서 확인
1. YouTube Studio 접속: https://studio.youtube.com/
2. 왼쪽 메뉴 → **설정** → **채널** → **고급 설정**
3. **채널 ID** 복사

### 방법 2: 채널 URL에서 확인
- 채널 URL이 `youtube.com/channel/UCxxxxxxxxx` 형태라면
- `UCxxxxxxxxx` 부분이 채널 ID입니다

### 방법 3: 사용자명으로 조회 (API 사용)
```javascript
// 사용자명으로 채널 ID 조회
const username = "YourChannelName";
const apiKey = "YOUR_API_KEY";
const url = `https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=${username}&key=${apiKey}`;
```

---

## 3단계: 코드 구현

### 3.1 설정 파일 생성 (`js/youtube-config.js`)

```javascript
// YouTube API 설정
const YOUTUBE_CONFIG = {
    API_KEY: 'YOUR_API_KEY_HERE', // 발급받은 API 키
    CHANNEL_ID: 'YOUR_CHANNEL_ID_HERE', // 채널 ID
    MAX_RESULTS: 50 // 한 번에 가져올 최대 결과 수
};
```

### 3.2 YouTube API 서비스 파일 생성 (`js/youtube-api.js`)

```javascript
// YouTube Data API Service
class YouTubeAPIService {
    constructor(apiKey, channelId) {
        this.apiKey = apiKey;
        this.channelId = channelId;
        this.baseUrl = 'https://www.googleapis.com/youtube/v3';
    }

    // 채널 통계 가져오기
    async getChannelStatistics() {
        try {
            const url = `${this.baseUrl}/channels?part=statistics,snippet&id=${this.channelId}&key=${this.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`API 오류: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.items || data.items.length === 0) {
                throw new Error('채널을 찾을 수 없습니다');
            }
            
            const channel = data.items[0];
            return {
                title: channel.snippet.title,
                description: channel.snippet.description,
                publishedAt: channel.snippet.publishedAt,
                thumbnails: channel.snippet.thumbnails,
                statistics: {
                    viewCount: parseInt(channel.statistics.viewCount),
                    subscriberCount: parseInt(channel.statistics.subscriberCount),
                    videoCount: parseInt(channel.statistics.videoCount)
                }
            };
        } catch (error) {
            console.error('채널 통계 가져오기 실패:', error);
            throw error;
        }
    }

    // 최근 영상 목록 가져오기
    async getRecentVideos(maxResults = 10) {
        try {
            const url = `${this.baseUrl}/search?part=snippet&channelId=${this.channelId}&order=date&type=video&maxResults=${maxResults}&key=${this.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`API 오류: ${response.status}`);
            }
            
            const data = await response.json();
            
            return data.items.map(item => ({
                videoId: item.id.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                publishedAt: item.snippet.publishedAt,
                thumbnail: item.snippet.thumbnails.medium.url
            }));
        } catch (error) {
            console.error('영상 목록 가져오기 실패:', error);
            throw error;
        }
    }

    // 영상 상세 정보 (조회수, 좋아요 등)
    async getVideoStatistics(videoIds) {
        try {
            const ids = Array.isArray(videoIds) ? videoIds.join(',') : videoIds;
            const url = `${this.baseUrl}/videos?part=statistics&id=${ids}&key=${this.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`API 오류: ${response.status}`);
            }
            
            const data = await response.json();
            
            return data.items.map(item => ({
                videoId: item.id,
                viewCount: parseInt(item.statistics.viewCount),
                likeCount: parseInt(item.statistics.likeCount),
                commentCount: parseInt(item.statistics.commentCount)
            }));
        } catch (error) {
            console.error('영상 통계 가져오기 실패:', error);
            throw error;
        }
    }

    // 참여율 계산
    calculateEngagementRate(likeCount, commentCount, viewCount) {
        if (viewCount === 0) return 0;
        return ((likeCount + commentCount) / viewCount * 100).toFixed(2);
    }
}
```

### 3.3 데이터 동기화 함수 (`js/youtube-sync.js`)

```javascript
// YouTube 데이터 동기화
class YouTubeDataSync {
    constructor(apiService) {
        this.api = apiService;
    }

    // 채널 데이터를 데이터베이스에 저장
    async syncChannelData() {
        try {
            // 1. YouTube API에서 데이터 가져오기
            const channelStats = await this.api.getChannelStatistics();
            const recentVideos = await this.api.getRecentVideos(10);
            
            // 2. 최근 영상들의 상세 통계 가져오기
            const videoIds = recentVideos.map(v => v.videoId);
            const videoStats = await this.api.getVideoStatistics(videoIds);
            
            // 3. 총 시청 시간 계산 (근사값)
            const totalViews = channelStats.statistics.viewCount;
            const estimatedWatchTime = totalViews * 5; // 평균 5분 가정
            
            // 4. 참여율 계산
            let totalEngagement = 0;
            videoStats.forEach(stat => {
                const engagement = parseFloat(
                    this.api.calculateEngagementRate(
                        stat.likeCount,
                        stat.commentCount,
                        stat.viewCount
                    )
                );
                totalEngagement += engagement;
            });
            const avgEngagementRate = totalEngagement / videoStats.length;
            
            // 5. 데이터베이스에 저장
            const analyticsData = {
                date: new Date().toISOString().split('T')[0],
                views: channelStats.statistics.viewCount,
                subscribers: channelStats.statistics.subscriberCount,
                videos: channelStats.statistics.videoCount,
                watch_time: estimatedWatchTime,
                engagement_rate: avgEngagementRate
            };
            
            // 6. RESTful API로 저장
            const response = await fetch('tables/youtube_analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(analyticsData)
            });
            
            if (!response.ok) {
                throw new Error('데이터 저장 실패');
            }
            
            const result = await response.json();
            console.log('YouTube 데이터 동기화 완료:', result);
            
            return result;
            
        } catch (error) {
            console.error('YouTube 데이터 동기화 실패:', error);
            throw error;
        }
    }

    // 자동 동기화 설정 (매일 자정)
    setupAutoSync() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const timeUntilMidnight = tomorrow - now;
        
        // 첫 실행
        setTimeout(() => {
            this.syncChannelData();
            // 이후 24시간마다 반복
            setInterval(() => {
                this.syncChannelData();
            }, 24 * 60 * 60 * 1000);
        }, timeUntilMidnight);
        
        console.log('자동 동기화 설정 완료 (매일 자정)');
    }
}
```

---

## 4단계: 관리자 페이지에 동기화 버튼 추가

### 4.1 HTML 수정 (`admin-analytics.html`)

```html
<!-- 헤더 액션 부분에 추가 -->
<div class="header-actions">
    <button class="btn-sync" id="btnSyncYouTube">
        <span>📺</span> YouTube 동기화
    </button>
    <button class="btn-refresh" id="btnRefresh">
        <span>🔄</span> 새로고침
    </button>
</div>
```

### 4.2 CSS 추가 (`css/analytics.css`)

```css
.btn-sync {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: #FF0000;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-sync:hover {
    background: #CC0000;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 0, 0, 0.3);
}

.btn-sync:disabled {
    background: #ccc;
    cursor: not-allowed;
}
```

### 4.3 JavaScript 통합 (`js/analytics.js` 하단에 추가)

```javascript
// YouTube API 초기화
let youtubeAPI = null;
let youtubeSync = null;

// API 설정이 있는 경우에만 초기화
if (typeof YOUTUBE_CONFIG !== 'undefined' && YOUTUBE_CONFIG.API_KEY) {
    youtubeAPI = new YouTubeAPIService(
        YOUTUBE_CONFIG.API_KEY,
        YOUTUBE_CONFIG.CHANNEL_ID
    );
    youtubeSync = new YouTubeDataSync(youtubeAPI);
}

// 동기화 버튼 이벤트
const btnSyncYouTube = document.getElementById('btnSyncYouTube');
if (btnSyncYouTube) {
    btnSyncYouTube.addEventListener('click', async () => {
        if (!youtubeSync) {
            alert('YouTube API 설정이 필요합니다. youtube-config.js를 확인하세요.');
            return;
        }
        
        btnSyncYouTube.disabled = true;
        btnSyncYouTube.textContent = '동기화 중...';
        
        try {
            await youtubeSync.syncChannelData();
            alert('YouTube 데이터가 성공적으로 동기화되었습니다!');
            // 페이지 새로고침
            await loadYouTubeData();
            renderYouTubeCharts();
            renderYouTubeTable();
        } catch (error) {
            alert('동기화 실패: ' + error.message);
        } finally {
            btnSyncYouTube.disabled = false;
            btnSyncYouTube.innerHTML = '<span>📺</span> YouTube 동기화';
        }
    });
}
```

---

## 5단계: 파일 구조

```
프로젝트/
├── admin-analytics.html
├── js/
│   ├── youtube-config.js    ← 생성 (API 키 설정)
│   ├── youtube-api.js       ← 생성 (API 서비스)
│   ├── youtube-sync.js      ← 생성 (데이터 동기화)
│   └── analytics.js         ← 수정 (통합)
└── css/
    └── analytics.css         ← 수정 (버튼 스타일)
```

### HTML에 스크립트 추가

```html
<!-- admin-analytics.html의 </body> 직전에 추가 -->
<script src="js/youtube-config.js"></script>
<script src="js/youtube-api.js"></script>
<script src="js/youtube-sync.js"></script>
<script src="js/analytics.js"></script>
```

---

## 6단계: 사용 방법

### 6.1 초기 설정
1. `js/youtube-config.js` 파일에서 API 키와 채널 ID 입력
2. `admin-analytics.html` 접속
3. "YouTube 동기화" 버튼 클릭
4. 데이터가 데이터베이스에 저장됨

### 6.2 자동 동기화 설정
```javascript
// 페이지 로드 시 자동 동기화 설정
if (youtubeSync) {
    youtubeSync.setupAutoSync();
}
```

---

## ⚠️ 주의사항

### API 할당량
- YouTube Data API v3는 **하루 10,000 단위** 무료 할당량 제공
- 채널 통계 조회: ~5 단위
- 영상 목록 조회: ~100 단위
- **권장**: 하루 1-2회만 동기화

### 보안
- ⚠️ **API 키를 GitHub에 업로드하지 마세요!**
- `.gitignore`에 `youtube-config.js` 추가:
  ```
  js/youtube-config.js
  ```
- 프로덕션에서는 서버 사이드에서 API 호출 권장

### 에러 처리
- API 키 만료: 새 키 발급
- 할당량 초과: 다음 날까지 대기 또는 할당량 구매
- CORS 에러: 서버 사이드 프록시 사용

---

## 🔄 고급 기능

### 1. YouTube Analytics API (상세 분석)
더 자세한 분석이 필요하면 **YouTube Analytics API** 사용:
- 시청 시간 (정확한 값)
- 트래픽 소스
- 인구통계
- 수익 데이터

**참고**: OAuth 2.0 인증 필요

### 2. 서버 사이드 구현
보안을 위해 Node.js/Python 서버에서 API 호출:
```javascript
// 클라이언트 → 서버 → YouTube API
fetch('/api/sync-youtube')
```

### 3. 웹훅 설정
YouTube에서 새 영상 업로드 시 자동 알림

---

## 📚 참고 자료

- [YouTube Data API v3 공식 문서](https://developers.google.com/youtube/v3)
- [API 할당량 관리](https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas)
- [YouTube API 샘플 코드](https://github.com/youtube/api-samples)

---

**다음 단계**: LinkedIn API 연동도 비슷한 방식으로 구현 가능합니다!