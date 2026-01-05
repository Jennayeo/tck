// YouTube 영상 정보 가져오기 (제목, 설명)
// YouTube API를 사용하지 않고 oEmbed를 통해 제목을 가져올 수 있지만,
// 설명을 가져오려면 YouTube Data API v3가 필요합니다.

// 방법 1: YouTube Data API v3 사용 (API 키 필요)
async function fetchVideoInfoWithAPI(videoId, apiKey) {
  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      throw new Error('영상을 찾을 수 없습니다');
    }
    
    const video = data.items[0];
    return {
      title: video.snippet.title,
      description: video.snippet.description
    };
  } catch (error) {
    console.error(`영상 정보 가져오기 실패 (${videoId}):`, error);
    return null;
  }
}

// 방법 2: YouTube oEmbed 사용 (제목만 가져오기 가능, 설명은 불가능)
async function fetchVideoTitleWithoEmbed(videoId) {
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`oEmbed 오류: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      title: data.title,
      description: null // oEmbed는 설명을 제공하지 않음
    };
  } catch (error) {
    console.error(`영상 제목 가져오기 실패 (${videoId}):`, error);
    return null;
  }
}

// 모든 썸네일의 영상 정보 가져오기 및 업데이트
async function updateThumbnailVideoInfo() {
  const thumbnailItems = document.querySelectorAll('.thumbnail-item.youtube-item[data-youtube-id]');
  
  if (thumbnailItems.length === 0) {
    console.log('YouTube 썸네일을 찾을 수 없습니다.');
    return;
  }
  
  // YouTube Config에서 API 키 확인
  let apiKey = null;
  if (typeof YOUTUBE_CONFIG !== 'undefined' && YOUTUBE_CONFIG.API_KEY && YOUTUBE_CONFIG.API_KEY !== 'YOUR_API_KEY_HERE') {
    apiKey = YOUTUBE_CONFIG.API_KEY;
  }
  
  // 각 썸네일에 대해 정보 가져오기
  for (const item of thumbnailItems) {
    const videoId = item.getAttribute('data-youtube-id');
    if (!videoId) continue;
    
    const titleElement = item.querySelector('.thumbnail-title');
    const descriptionElement = item.querySelector('.thumbnail-description');
    
    if (!titleElement) continue;
    
    let videoInfo = null;
    
    // API 키가 있으면 API 사용, 없으면 oEmbed 사용 (제목만)
    if (apiKey) {
      videoInfo = await fetchVideoInfoWithAPI(videoId, apiKey);
    } else {
      videoInfo = await fetchVideoTitleWithoEmbed(videoId);
      console.log('API 키가 없어 oEmbed를 사용합니다. 제목만 가져올 수 있습니다.');
    }
    
    if (videoInfo && videoInfo.title) {
      titleElement.textContent = videoInfo.title;
      
      // 설명이 있고 설명 요소가 있으면 업데이트
      if (videoInfo.description && descriptionElement) {
        // 설명이 너무 길면 자르기 (예: 100자)
        const maxLength = 100;
        const truncatedDescription = videoInfo.description.length > maxLength
          ? videoInfo.description.substring(0, maxLength) + '...'
          : videoInfo.description;
        descriptionElement.textContent = truncatedDescription;
      }
    }
  }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
  // 약간의 지연을 두어 다른 스크립트들이 로드될 시간을 줍니다
  setTimeout(() => {
    updateThumbnailVideoInfo();
  }, 500);
});


