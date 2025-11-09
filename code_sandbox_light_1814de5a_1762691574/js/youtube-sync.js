// YouTube 데이터 동기화
class YouTubeDataSync {
    constructor(apiService) {
        this.api = apiService;
    }

    // 채널 데이터를 데이터베이스에 저장
    async syncChannelData() {
        try {
            console.log('YouTube 데이터 동기화 시작...');
            
            // 1. YouTube API에서 데이터 가져오기
            const channelStats = await this.api.getChannelStatistics();
            console.log('채널 통계:', channelStats);
            
            // 2. 최근 영상 목록 가져오기
            const recentVideos = await this.api.getRecentVideos(10);
            console.log(`최근 영상 ${recentVideos.length}개 조회`);
            
            // 3. 최근 영상들의 상세 통계 가져오기
            const videoIds = recentVideos.map(v => v.videoId);
            const videoStats = await this.api.getVideoStatistics(videoIds);
            console.log('영상 통계:', videoStats);
            
            // 4. 총 시청 시간 계산
            let totalWatchTimeMinutes = 0;
            videoStats.forEach(stat => {
                const durationMinutes = this.api.parseDuration(stat.duration);
                totalWatchTimeMinutes += (stat.viewCount * durationMinutes);
            });
            
            // 5. 평균 참여율 계산
            let totalEngagement = 0;
            let validVideos = 0;
            
            videoStats.forEach(stat => {
                if (stat.viewCount > 0) {
                    const engagement = this.api.calculateEngagementRate(
                        stat.likeCount,
                        stat.commentCount,
                        stat.viewCount
                    );
                    totalEngagement += engagement;
                    validVideos++;
                }
            });
            
            const avgEngagementRate = validVideos > 0 
                ? (totalEngagement / validVideos) 
                : 0;
            
            // 6. 데이터베이스에 저장할 객체 생성
            const analyticsData = {
                date: new Date().toISOString().split('T')[0],
                views: channelStats.statistics.viewCount,
                subscribers: channelStats.statistics.subscriberCount,
                videos: channelStats.statistics.videoCount,
                watch_time: Math.round(totalWatchTimeMinutes),
                engagement_rate: parseFloat(avgEngagementRate.toFixed(2))
            };
            
            console.log('저장할 데이터:', analyticsData);
            
            // 7. 오늘 날짜의 기존 데이터 확인
            const today = analyticsData.date;
            const existingResponse = await fetch(`tables/youtube_analytics?search=${today}&limit=1`);
            const existingData = await existingResponse.json();
            
            let result;
            
            if (existingData.data && existingData.data.length > 0) {
                // 기존 데이터가 있으면 업데이트
                const existingId = existingData.data[0].id;
                console.log(`기존 데이터 업데이트 (ID: ${existingId})`);
                
                const updateResponse = await fetch(`tables/youtube_analytics/${existingId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(analyticsData)
                });
                
                if (!updateResponse.ok) {
                    throw new Error('데이터 업데이트 실패');
                }
                
                result = await updateResponse.json();
            } else {
                // 새로운 데이터 추가
                console.log('새 데이터 추가');
                
                const createResponse = await fetch('tables/youtube_analytics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(analyticsData)
                });
                
                if (!createResponse.ok) {
                    throw new Error('데이터 저장 실패');
                }
                
                result = await createResponse.json();
            }
            
            console.log('YouTube 데이터 동기화 완료:', result);
            
            return {
                success: true,
                channelName: channelStats.title,
                data: result
            };
            
        } catch (error) {
            console.error('YouTube 데이터 동기화 실패:', error);
            throw error;
        }
    }

    // 수동 데이터 입력 (날짜 지정 가능)
    async addManualData(date, views, subscribers, videos, watchTime, engagementRate) {
        try {
            const analyticsData = {
                date: date,
                views: parseInt(views),
                subscribers: parseInt(subscribers),
                videos: parseInt(videos),
                watch_time: parseInt(watchTime),
                engagement_rate: parseFloat(engagementRate)
            };
            
            const response = await fetch('tables/youtube_analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(analyticsData)
            });
            
            if (!response.ok) {
                throw new Error('데이터 저장 실패');
            }
            
            const result = await response.json();
            console.log('수동 데이터 추가 완료:', result);
            
            return result;
            
        } catch (error) {
            console.error('수동 데이터 추가 실패:', error);
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
        
        console.log(`자동 동기화 설정: ${Math.round(timeUntilMidnight / 1000 / 60)}분 후 첫 실행`);
        
        // 첫 실행
        setTimeout(() => {
            console.log('자동 동기화 실행');
            this.syncChannelData()
                .then(() => console.log('자동 동기화 성공'))
                .catch(err => console.error('자동 동기화 실패:', err));
            
            // 이후 24시간마다 반복
            setInterval(() => {
                console.log('자동 동기화 실행');
                this.syncChannelData()
                    .then(() => console.log('자동 동기화 성공'))
                    .catch(err => console.error('자동 동기화 실패:', err));
            }, 24 * 60 * 60 * 1000);
        }, timeUntilMidnight);
        
        console.log('자동 동기화 설정 완료 (매일 자정)');
    }

    // 특정 기간의 데이터 일괄 수집 (과거 데이터)
    async syncHistoricalData(startDate, endDate) {
        // Note: YouTube Data API v3는 과거 데이터를 직접 제공하지 않습니다.
        // YouTube Analytics API (OAuth 필요) 사용 필요
        console.warn('과거 데이터 수집은 YouTube Analytics API가 필요합니다.');
        console.warn('현재는 수동으로 입력하거나 현재 시점 데이터만 수집 가능합니다.');
    }
}