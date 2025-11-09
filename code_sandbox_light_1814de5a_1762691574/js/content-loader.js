// Content Loader - Load content from database for main site
class ContentLoader {
    constructor() {
        this.content = {};
    }

    async loadAllContent() {
        try {
            const response = await fetch('tables/site_content?limit=100');
            const result = await response.json();
            
            if (result.data) {
                // Group content by section
                result.data.forEach(item => {
                    if (!this.content[item.section]) {
                        this.content[item.section] = {};
                    }
                    this.content[item.section][item.key] = item.value;
                });
                
                this.renderContent();
            }
        } catch (error) {
            console.error('Error loading content:', error);
        }
    }

    renderContent() {
        this.renderHero();
        this.renderCapabilities();
        this.renderInnovation();
        this.renderStats();
        this.renderAbout();
        this.renderLocation();
    }

    renderHero() {
        const hero = this.content.hero || {};
        
        const mainTitle = document.querySelector('.hero-title-main');
        const subTitle = document.querySelector('.hero-title-sub');
        const description = document.querySelector('.hero-description');
        
        if (mainTitle && hero.title_main) mainTitle.textContent = hero.title_main;
        if (subTitle && hero.title_sub) subTitle.textContent = hero.title_sub;
        if (description && hero.description) description.textContent = hero.description;
    }

    renderCapabilities() {
        const cap = this.content.capabilities || {};
        
        const title = document.querySelector('#capabilities .section-title');
        const subtitle = document.querySelector('#capabilities .section-description');
        
        if (title && cap.title) title.textContent = cap.title;
        if (subtitle && cap.subtitle) subtitle.textContent = cap.subtitle;
        
        // Render cards
        for (let i = 1; i <= 4; i++) {
            const cardTitle = document.querySelector(`#capabilities .service-card:nth-child(${i}) .service-title`);
            const cardDesc = document.querySelector(`#capabilities .service-card:nth-child(${i}) .service-description`);
            
            if (cardTitle && cap[`card${i}_title`]) cardTitle.textContent = cap[`card${i}_title`];
            if (cardDesc && cap[`card${i}_desc`]) cardDesc.textContent = cap[`card${i}_desc`];
        }
    }

    renderInnovation() {
        const inn = this.content.innovation || {};
        
        const title = document.querySelector('#innovation .section-title');
        const description = document.querySelector('#innovation .technology-description');
        
        if (title && inn.title) title.textContent = inn.title;
        if (description && inn.description) {
            description.innerHTML = inn.description.replace(/\n/g, '<br>');
        }
        
        // Render features
        for (let i = 1; i <= 3; i++) {
            const featureTitle = document.querySelector(`#innovation .tech-feature:nth-child(${i}) h4`);
            const featureDesc = document.querySelector(`#innovation .tech-feature:nth-child(${i}) p`);
            
            if (featureTitle && inn[`feature${i}_title`]) featureTitle.textContent = inn[`feature${i}_title`];
            if (featureDesc && inn[`feature${i}_desc`]) featureDesc.textContent = inn[`feature${i}_desc`];
        }
    }

    renderStats() {
        const stats = this.content.stats || {};
        
        // Render stat numbers and labels
        for (let i = 1; i <= 4; i++) {
            const statNumber = document.querySelector(`.stats .stat-item:nth-child(${i}) .stat-number`);
            const statLabel = document.querySelector(`.stats .stat-item:nth-child(${i}) .stat-label`);
            
            if (statNumber && stats[`stat${i}_number`]) {
                statNumber.setAttribute('data-target', stats[`stat${i}_number`]);
                statNumber.textContent = '0'; // Will be animated
            }
            if (statLabel && stats[`stat${i}_label`]) statLabel.textContent = stats[`stat${i}_label`];
        }
    }

    renderAbout() {
        const about = this.content.about || {};
        
        const label = document.querySelector('#about .about-label');
        const title = document.querySelector('#about .section-title');
        const description = document.querySelector('#about .about-description');
        
        if (label && about.label) label.textContent = about.label;
        if (title && about.title) {
            title.innerHTML = about.title.replace(/\n/g, '<br>');
        }
        if (description && about.description) {
            description.innerHTML = about.description.replace(/\n/g, '<br>');
        }
        
        // Render list items
        const list = document.querySelector('#about .about-list');
        if (list) {
            const items = [about.list1, about.list2, about.list3, about.list4].filter(item => item);
            if (items.length > 0) {
                list.innerHTML = items.map(item => `<li>${item}</li>`).join('');
            }
        }
    }

    renderLocation() {
        const loc = this.content.location || {};
        
        const title = document.querySelector('#location .section-title');
        const description = document.querySelector('#location .location-description');
        
        if (title && loc.title) title.textContent = loc.title;
        if (description && loc.description) {
            description.innerHTML = loc.description.replace(/\n/g, '<br>');
        }
        
        // Render contact details
        const addressP = document.querySelector('#location .contact-detail:nth-child(1) p');
        const phoneP = document.querySelector('#location .contact-detail:nth-child(2) p');
        const emailP = document.querySelector('#location .contact-detail:nth-child(3) p');
        
        if (addressP && loc.address) {
            addressP.innerHTML = loc.address.replace(/\n/g, '<br>');
        }
        if (phoneP && loc.phone) phoneP.textContent = loc.phone;
        if (emailP && loc.email) emailP.textContent = loc.email;
    }
}

// Initialize content loader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const loader = new ContentLoader();
    loader.loadAllContent();
});