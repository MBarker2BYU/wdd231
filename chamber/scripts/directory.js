document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelector('#cards');
    const viewToggle = document.querySelector('#view-toggle');

    // Debug: Log to verify elements are found
    console.log('viewToggle:', viewToggle);
    console.log('cards:', cards);

    if (!viewToggle || !cards) {
        console.error('Required elements not found. viewToggle:', viewToggle, 'cards:', cards);
        return;
    }

    // Function to create an SVG element with the given attributes and children
    const createSVGElement = (tag, attributes = {}, children = []) => {
        const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
        Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
        children.forEach(child => element.appendChild(child));
        return element;
    };

    // Create SVG elements for the icons (same for both light and dark modes)
    const listIcon = createSVGElement('svg', { 
        width: '32', 
        height: '32', 
        viewBox: '0 0 32 32', 
        class: 'view-icon', 
        'aria-hidden': 'true' 
    }, [
        createSVGElement('rect', { x: '5', y: '3', width: '21', height: '5', fill: 'var(--osu-white)', stroke: 'var(--osu-scarlet)', 'stroke-width': '2' }),
        createSVGElement('rect', { x: '5', y: '11', width: '21', height: '5', fill: 'var(--osu-white)', stroke: 'var(--osu-scarlet)', 'stroke-width': '2' }),
        createSVGElement('rect', { x: '5', y: '19', width: '21', height: '5', fill: 'var(--osu-white)', stroke: 'var(--osu-scarlet)', 'stroke-width': '2' })
    ]);

    const gridIcon = createSVGElement('svg', { 
        width: '32', 
        height: '32', 
        viewBox: '0 0 32 32', 
        class: 'view-icon', 
        'aria-hidden': 'true' 
    }, [
        createSVGElement('rect', { x: '4', y: '4', width: '8', height: '8', fill: 'var(--osu-white)', stroke: 'var(--osu-scarlet)', 'stroke-width': '2' }),
        createSVGElement('rect', { x: '13', y: '4', width: '8', height: '8', fill: 'var(--osu-white)', stroke: 'var(--osu-scarlet)', 'stroke-width': '2' }),
        createSVGElement('rect', { x: '22', y: '4', width: '8', height: '8', fill: 'var(--osu-white)', stroke: 'var(--osu-scarlet)', 'stroke-width': '2' }),
        createSVGElement('rect', { x: '4', y: '13', width: '8', height: '8', fill: 'var(--osu-white)', stroke: 'var(--osu-scarlet)', 'stroke-width': '2' }),
        createSVGElement('rect', { x: '13', y: '13', width: '8', height: '8', fill: 'var(--osu-white)', stroke: 'var(--osu-scarlet)', 'stroke-width': '2' }),
        createSVGElement('rect', { x: '22', y: '13', width: '8', height: '8', fill: 'var(--osu-white)', stroke: 'var(--osu-scarlet)', 'stroke-width': '2' }),
        createSVGElement('rect', { x: '4', y: '22', width: '8', height: '8', fill: 'var(--osu-white)', stroke: 'var(--osu-scarlet)', 'stroke-width': '2' }),
        createSVGElement('rect', { x: '13', y: '22', width: '8', height: '8', fill: 'var(--osu-white)', stroke: 'var(--osu-scarlet)', 'stroke-width': '2' }),
        createSVGElement('rect', { x: '22', y: '22', width: '8', height: '8', fill: 'var(--osu-white)', stroke: 'var(--osu-scarlet)', 'stroke-width': '2' })
    ]);

    // Set initial icon (default is grid view, so show list icon)
    viewToggle.appendChild(listIcon);
    viewToggle.setAttribute('aria-label', 'Switch to List View');

    async function getMemberData() {
        const response = await fetch('./data/members.json');
        const data = await response.json();
        displayMemberData(data.members);
    }

    getMemberData();

    const displayMemberData = (members) => 
    {
        members.forEach((member) => {
            let card = document.createElement('section');
            let image = document.createElement('img');
            let address = document.createElement('p');
            let phone = document.createElement('p');
            let website = document.createElement('a');

            setImageAttributes(image, `./images/${member.image_icon_filename}`, `${member.image_icon_filename} Logo`, '128', 'auto');
            setMemberInfo(address, phone, website, member.address, member.phone_number, member.website_url);

            card.appendChild(image);
            card.appendChild(address);
            card.appendChild(phone);
            card.appendChild(website);

            cards.appendChild(card);
        });
    }

    function setImageAttributes(element, source, alt, height, width) 
    {
        const imageWidth = '256px';

        element.setAttribute('src', source);
        element.setAttribute('alt', alt);
        element.setAttribute('loading', 'lazy');

        const img = new Image();
        img.src = source;
        img.onload = () => 
            {
                const naturalWidth = img.naturalWidth;
                const naturalHeight = img.naturalHeight;
                const fixedWidth = imageWidth;
                // Calculate height to maintain aspect ratio: height = (naturalHeight / naturalWidth) * fixedWidth
                const calculatedHeight = Math.round((naturalHeight / naturalWidth) * fixedWidth);
                element.setAttribute('width', fixedWidth);
                element.setAttribute('height', calculatedHeight);
                element.style.minHeight = 'auto'; // Remove placeholder height            
            };

        element.onerror = () => 
            {
                alert('Error loading image:', source);
                // Fallback dimensions if image fails to load
                element.setAttribute('width', imageWidth);
                element.setAttribute('height', imageWidth);
                element.style.minHeight = 'auto';
            };
        
    }

    function setMemberInfo(addressElement, phoneElement, websiteElement, address, phone, website) 
    {
        addressElement.textContent = address;
        phoneElement.textContent = phone;
        websiteElement.textContent = website;
        websiteElement.setAttribute('href', "#");
    }

    // Toggle between grid and list view with SVG icons
    viewToggle.addEventListener('click', () => {
        cards.classList.toggle('list-view');
        const isListView = cards.classList.contains('list-view');
        viewToggle.innerHTML = ''; // Clear current content
        viewToggle.appendChild(isListView ? gridIcon : listIcon);
        viewToggle.setAttribute('aria-label', isListView ? 'Switch to Grid View' : 'Switch to List View');
    });

    // Update icon when theme changes (no change needed since icons are the same)
    document.querySelector('.theme-toggle').addEventListener('click', () => {
        const isListView = cards.classList.contains('list-view');
        console.log('Theme toggle - isListView:', isListView);
        viewToggle.innerHTML = ''; // Clear current content
        viewToggle.appendChild(isListView ? gridIcon : listIcon);
    });
});