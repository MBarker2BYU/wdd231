import { fetchData } from './utilities.mjs';
import { calculateTrajectory } from './ballistics-calculator.mjs';

import { renderChart } from './ballistics-charts.mjs';
import { formatTrajectoryData } from './ballistics-charts.mjs';

document.addEventListener('DOMContentLoaded', () => 
{

    const table = document.getElementById('resultsTableBody');
    const canvas = document.getElementById('trajectory-chart');    
    
    loadAmmunitionData();
    initilizeCalculator(displayTrajectoryData);   
    
    initializeObserver('resultsTableBody');
});


function loadAmmunitionData() 
{
    fetchData('data/ammunition.json').then(data => {
        const tbody = document.querySelector('#ammoTable tbody');

        let tableContent = '';

        data.forEach(item => {
            tableContent += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.muzzleVelocity}</td>
                    <td>${item.ballisticCoefficient}</td>
                    <td>${item.bulletWeight}</td>
                </tr>`;
        });

        tbody.innerHTML = tableContent;
    });
}

function displayTrajectoryData(trajectoryData) {
    const tbody = document.querySelector('#resultsTableBody tbody');
    let tableContent = '';

    trajectoryData.forEach(trajectory => {
        tableContent += `
            <tr>
                <td>${trajectory.distance}</td>
                <td>${trajectory.velocity}</td>
                <td>${trajectory.energy}</td>
                <td>${trajectory.drop}</td>
                <td>${trajectory.windDrift}</td>
            </tr>`;
    });

    tbody.innerHTML = tableContent;

    renderChart(formatTrajectoryData(trajectoryData));
}

function initilizeCalculator(displayCallback) 
{
    const form = document.getElementById('calcForm');

    form.addEventListener('submit', (event) => 
    {
        event.preventDefault();

        const formData = new FormData(form);

        const inputData = 
        {
            muzzleVelocity: parseFloat(formData.get('muzzleVelocity')),
            ballisticCoefficient: parseFloat(formData.get('ballisticCoefficient')),
            bulletWeight: parseFloat(formData.get('bulletWeight')),
            windSpeed: parseFloat(formData.get('windSpeed'))
        };

        if (isNaN(inputData.muzzleVelocity) || isNaN(inputData.ballisticCoefficient) ||
            isNaN(inputData.bulletWeight) || isNaN(inputData.windSpeed)) {
            alert('Please enter valid numbers for all fields.');
            return;
        }

        const trajectoryData = calculateTrajectory(inputData);

        if(displayCallback)
        { 
            displayCallback(trajectoryData);
        }

    });
}

function initializeObserver(tableSelector, callback) {
  const table = document.querySelector(tableSelector);

  // MutationObserver for data and structural changes
  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        callback('Size changed', {
          rows: table.querySelectorAll('tr').length,
          cols: table.querySelector('tr')?.querySelectorAll('td, th').length || 0
        });
      } else if (mutation.type === 'characterData') {
        callback('Data changed', { cell: mutation.target.textContent });
      } else if (mutation.type === 'attributes' && ['style', 'width', 'height'].includes(mutation.attributeName)) {
        callback('Attribute-based size changed', table.getBoundingClientRect());
      }
    });
  });

  mutationObserver.observe(table, {
    childList: true,
    characterData: true,
    attributes: true,
    subtree: true,
    attributeFilter: ['style', 'width', 'height']
  });

  // ResizeObserver for rendered size changes
  const resizeObserver = new ResizeObserver(() => {
    callback('Rendered size changed', table.getBoundingClientRect());
  });

  resizeObserver.observe(table);

  // Return function to stop observing
  return () => {
    mutationObserver.disconnect();
    resizeObserver.disconnect();
  };
}