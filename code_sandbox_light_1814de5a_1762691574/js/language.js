// 다국어 지원 (한국어/영어)
class LanguageToggle {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'kr';
        this.toggleButton = document.getElementById('languageToggle');
        this.languageLabel = document.getElementById('languageLabel');
        
        this.init();
    }
    
    init() {
        // 초기 언어 설정
        this.setLanguage(this.currentLanguage);
        
        // 토글 버튼 이벤트
        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', () => {
                this.currentLanguage = this.currentLanguage === 'kr' ? 'en' : 'kr';
                this.setLanguage(this.currentLanguage);
                localStorage.setItem('language', this.currentLanguage);
            });
        }
    }
    
    setLanguage(lang) {
        // 언어 레이블 업데이트
        if (this.languageLabel) {
            this.languageLabel.textContent = lang === 'kr' ? 'EN' : 'KR';
        }
        
        // 모든 다국어 요소 업데이트
        const elements = document.querySelectorAll('[data-kr][data-en]');
        elements.forEach(element => {
            const text = lang === 'kr' ? element.dataset.kr : element.dataset.en;
            element.textContent = text;
        });
        
        // 섹션 타이틀 업데이트
        this.updateSectionTitles(lang);
        
        // 섹션 설명 업데이트
        this.updateDescriptions(lang);
        
        // 서비스 카드 업데이트
        this.updateServiceCards(lang);
        
        // About 섹션 업데이트
        this.updateAboutSection(lang);
    }
    
    updateSectionTitles(lang) {
        const titles = {
            capabilities: {
                kr: 'Core Capabilities',
                en: 'Core Capabilities'
            },
            capabilitiesDesc: {
                kr: 'GM의 글로벌 기술력을 바탕으로 미래 모빌리티를 개척합니다',
                en: 'Pioneering future mobility based on GM\'s global technology'
            },
            innovation: {
                kr: 'Innovation & Technology',
                en: 'Innovation & Technology'
            },
            innovationDesc: {
                kr: 'General Motors의 110년 역사와 기술력을 바탕으로 한국에서 미래 자동차 산업의 혁신을 이끌어갑니다.',
                en: 'Leading innovation in the future automotive industry in Korea based on General Motors\' 110-year history and technology.'
            },
            about: {
                kr: 'About GMTCK',
                en: 'About GMTCK'
            },
            aboutDesc: {
                kr: 'GMTCK는 GM의 글로벌 기술 네트워크의 핵심 거점입니다',
                en: 'GMTCK is a key hub of GM\'s global technology network'
            }
        };
        
        // Capabilities 섹션
        const capTitle = document.querySelector('#capabilities .section-title');
        if (capTitle) capTitle.textContent = titles.capabilities[lang];
        
        const capDesc = document.querySelector('#capabilities .section-description');
        if (capDesc) capDesc.textContent = titles.capabilitiesDesc[lang];
        
        // Innovation 섹션
        const innovTitle = document.querySelector('#innovation .section-title');
        if (innovTitle) innovTitle.textContent = titles.innovation[lang];
        
        const innovDesc = document.querySelector('#innovation .technology-description');
        if (innovDesc) innovDesc.innerHTML = titles.innovationDesc[lang];
        
        // About 섹션
        const aboutTitle = document.querySelector('#about .section-title');
        if (aboutTitle) aboutTitle.textContent = titles.about[lang];
        
        const aboutDesc = document.querySelector('#about .section-description');
        if (aboutDesc) aboutDesc.textContent = titles.aboutDesc[lang];
    }
    
    updateDescriptions(lang) {
        const descriptions = {
            kr: {
                scroll: 'Scroll'
            },
            en: {
                scroll: 'Scroll'
            }
        };
        
        // Scroll indicator
        const scrollText = document.querySelector('.hero-scroll span');
        if (scrollText) scrollText.textContent = descriptions[lang].scroll;
    }
    
    updateServiceCards(lang) {
        const services = [
            {
                kr: {
                    title: '차량 엔지니어링',
                    description: '첨단 차량 설계 및 엔지니어링 솔루션으로 차세대 모빌리티를 구현합니다'
                },
                en: {
                    title: 'Vehicle Engineering',
                    description: 'Implementing next-generation mobility with advanced vehicle design and engineering solutions'
                }
            },
            {
                kr: {
                    title: '전동화 기술',
                    description: '전기차 및 하이브리드 시스템 개발을 통해 지속 가능한 미래를 만들어갑니다'
                },
                en: {
                    title: 'Electrification Technology',
                    description: 'Creating a sustainable future through EV and hybrid system development'
                }
            },
            {
                kr: {
                    title: '자율주행 시스템',
                    description: '안전하고 편리한 자율주행 기술로 모빌리티의 새로운 시대를 열어갑니다'
                },
                en: {
                    title: 'Autonomous Driving',
                    description: 'Opening a new era of mobility with safe and convenient autonomous driving technology'
                }
            }
        ];
        
        const serviceCards = document.querySelectorAll('.service-card');
        serviceCards.forEach((card, index) => {
            if (services[index]) {
                const title = card.querySelector('.service-title');
                const description = card.querySelector('.service-description');
                
                if (title) title.textContent = services[index][lang].title;
                if (description) description.textContent = services[index][lang].description;
            }
        });
    }
    
    updateAboutSection(lang) {
        const about = {
            kr: {
                intro: 'GMTCK는 General Motors의 글로벌 기술 네트워크에서 핵심적인 역할을 수행하는 한국의 기술 센터입니다.',
                mission: '우리의 미션',
                missionText: '혁신적인 기술 개발을 통해 미래 모빌리티를 선도하고, 지속 가능한 자동차 산업의 발전에 기여합니다.',
                vision: '우리의 비전',
                visionText: '글로벌 자동차 산업을 이끄는 기술 혁신의 중심지가 되어, 더 안전하고 친환경적인 모빌리티 솔루션을 제공합니다.'
            },
            en: {
                intro: 'GMTCK is a technology center in Korea that plays a key role in General Motors\' global technology network.',
                mission: 'Our Mission',
                missionText: 'Leading future mobility through innovative technology development and contributing to the advancement of sustainable automotive industry.',
                vision: 'Our Vision',
                visionText: 'Becoming a center of technological innovation leading the global automotive industry, providing safer and more eco-friendly mobility solutions.'
            }
        };
        
        // About 섹션의 텍스트 업데이트
        const aboutIntro = document.querySelector('#about .about-intro');
        if (aboutIntro) aboutIntro.textContent = about[lang].intro;
        
        const missionTitle = document.querySelector('#about .mission-title');
        if (missionTitle) missionTitle.textContent = about[lang].mission;
        
        const missionText = document.querySelector('#about .mission-text');
        if (missionText) missionText.textContent = about[lang].missionText;
        
        const visionTitle = document.querySelector('#about .vision-title');
        if (visionTitle) visionTitle.textContent = about[lang].vision;
        
        const visionText = document.querySelector('#about .vision-text');
        if (visionText) visionText.textContent = about[lang].visionText;
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    new LanguageToggle();
});
