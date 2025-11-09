// YouTube API 설정
// ⚠️ 주의: 이 파일을 GitHub에 업로드하지 마세요!
// .gitignore에 추가하세요: js/youtube-config.js

const YOUTUBE_CONFIG = {
    // Google Cloud Console에서 발급받은 API 키를 입력하세요
    API_KEY: 'YOUR_API_KEY_HERE',
    
    // YouTube 채널 ID를 입력하세요
    // 예: UCxxxxxxxxxxxxxxxxxx
    CHANNEL_ID: 'YOUR_CHANNEL_ID_HERE',
    
    // 한 번에 가져올 최대 영상 수
    MAX_RESULTS: 50
};

// API 키 발급 방법:
// 1. https://console.cloud.google.com/ 접속
// 2. 새 프로젝트 생성
// 3. YouTube Data API v3 활성화
// 4. API 키 생성
// 5. 위의 YOUR_API_KEY_HERE를 실제 API 키로 교체

// 채널 ID 확인 방법:
// 1. YouTube Studio (https://studio.youtube.com/) 접속
// 2. 설정 → 채널 → 고급 설정
// 3. 채널 ID 복사
// 4. 위의 YOUR_CHANNEL_ID_HERE를 실제 채널 ID로 교체