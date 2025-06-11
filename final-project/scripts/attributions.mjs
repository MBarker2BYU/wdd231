import { fetchData } from './utilities.mjs';

async function setupAttributionsModal() 
{
    const attributionsModal = document.getElementById('attributions-modal');
    const openAttributionsModal = document.getElementById('open-attributions-modal');
    const closeAttributionsModal = document.getElementById('close-attributions-modal');

    openAttributionsModal.addEventListener('click', async (e) => {
        e.preventDefault();

        if (attributionsModal) {
            // Hide body scrollbars when modal is open
            document.body.style.overflow = 'hidden';

            attributionsModal.showModal();

            closeAttributionsModal.addEventListener('click', () => 
            {
                attributionsModal.close();
                // Restore body scrollbars
                document.body.style.overflow = '';
            });

        }
        else {
            console.error('Attributions modal not found in the DOM');
        }

        const data = await fetchData('./data/attributions.json');

        if (!data || data.length === 0) 
        {
            console.error('No attributions data found or invalid format');
            return;
        }

        const contributors = document.getElementById('contributors');

        contributors.innerHTML = ''; // Clear existing content
        contributors.id ="contributors"; // Ensure the ID is set correctly
               

        data.forEach(attribution => 
        {
            const infoCard = document.createElement('div');
            infoCard.className = 'info-card';

            const cardHeader = document.createElement('div');
            cardHeader.className = 'card-header';
            const header = document.createElement('h3');
            header.textContent = `${attribution.name || 'Unknown' } (${attribution.lifespan || 'Date not available'})`;
            cardHeader.appendChild(header);
            
            const cardContent = document.createElement('div');
            cardContent.className = 'card-content';
            
            const p = document.createElement('p');
            p.textContent = attribution.contributions;
            
            cardContent.appendChild(p);
            
            infoCard.appendChild(cardHeader);
            infoCard.appendChild(cardContent);

            contributors.appendChild(infoCard);

        });
        
    });

}

export { setupAttributionsModal };