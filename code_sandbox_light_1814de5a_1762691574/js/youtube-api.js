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
                const errorData = await response.json();
                throw new Error(`API 오류: ${response.status} - ${errorData.error.message}`);
            }
            
            const data = await response.json();
            
            if (!data.items || data.items.length === 0) {
                throw new Error('채널을 찾을 수 없습니다. 채널 ID를 확인하세요.');
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
                const errorData = await response.json();
                throw new Error(`API 오류: ${response.status} - ${errorData.error.message}`);
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
            const url = `${this.baseUrl}/videos?part=statistics,contentDetails&id=${ids}&key=${this.apiKey}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API 오류: ${response.status} - ${errorData.error.message}`);
            }
            
            const data = await response.json();
            
            return data.items.map(item => ({
                videoId: item.id,
                viewCount: parseInt(item.statistics.viewCount || 0),
                likeCount: parseInt(item.statistics.likeCount || 0),
                commentCount: parseInt(item.statistics.commentCount || 0),
                duration: item.contentDetails.duration
            }));
        } catch (error) {
            console.error('영상 통계 가져오기 실패:', error);
            throw error;
        }
    }

    // ISO 8601 duration을 분으로 변환
    parseDuration(duration) {
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        const hours = parseInt(match[1] || 0);
        const minutes = parseInt(match[2] || 0);
        const seconds = parseInt(match[3] || 0);
        return hours * 60 + minutes + seconds / 60;
    }

    // 참여율 계산
    calculateEngagementRate(likeCount, commentCount, viewCount) {
        if (viewCount === 0) return 0;
        return ((likeCount + commentCount) / viewCount * 100);
    }

    // API 키 유효성 검사
    async validateApiKey() {
        try {
            await this.getChannelStatistics();
            return true;
        } catch (error) {
            return false;
        }
    }
}