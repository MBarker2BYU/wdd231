import { fetchData } from './utilities.mjs';

/**
 * Set up attributions modal for about page
 */
async function setupAttributionsModal() 
{
    const modal = document.getElementById('attributions-modal');
    const openBtn = document.getElementById('open-attributions-modal');
    const closeBtn = document.getElementById('close-attributions-modal');
    const contributors = document.getElementById('contributors');

    if (!modal || !openBtn || !closeBtn || !contributors) {
        console.error('Attributions modal elements not found');
        return;
    }

    openBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        document.body.style.overflow = 'hidden';
        modal.showModal();

        const data = await fetchData('./data/attributions.json');
        if (!data?.length) {
            console.error('No attributions data found');
            contributors.innerHTML = '<p>No data available</p>';
            return;
        }

        contributors.innerHTML = data.map(attribution => `
            <div class="info-card">
                <div class="card-header">
                    <h3>${attribution.name || 'Unknown'} (${attribution.lifespan || 'N/A'})</h3>
                </div>
                <div class="card-content">
                    <p>${attribution.contributions || 'No contributions listed'}</p>
                </div>
            </div>
        `).join('');
    });

    closeBtn.addEventListener('click', () => {
        modal.close();
        document.body.style.overflow = '';
    });
}

export { setupAttributionsModal };