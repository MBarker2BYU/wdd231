import { fetchData } from './utilities.mjs';
import { calculateTrajectory } from './ballistics-calculator.mjs';

import { renderChart } from './ballistics-charts.mjs';
import { formatTrajectoryData } from './ballistics-charts.mjs';
import { getDataFromTable } from './ballistics-charts.mjs';

const resultsTableName = 'resultsTableBody';
const trajectoryChartName = 'trajectory-chart';

document.addEventListener('DOMContentLoaded', () => 
{
    
    // const resultsTableName = 'resultsTableBody';
    // const trajectoryChartName = 'trajectory-chart';

    loadAmmunitionData();
    initilizeCalculator(displayTrajectoryData);   
    
    initializeTableWatch(resultsTableName, refresh);

});

export function refresh()
{
  // const trajectoryChartName = 'trajectory-chart';

  var trajectoryData = getDataFromTable(resultsTableName);

  renderChart(trajectoryChartName, trajectoryData);
}

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


function initializeTableWatch(id, callback, debounceMs = 100) {
  // Get the table element by ID
  const table = document.getElementById(id);
  
  // Validate inputs
  if (!table) 
  {
    console.error(`Table with ID "${id}" not found`);
    return null;
  }

  if (typeof callback !== 'function') 
  {
    console.error('Callback must be a function');
    return null;
  }
  
  // Debounce function to limit callback frequency
  let timeoutId;

  const debouncedCallback = (event) => 
  {
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => 
    {
      callback(event);
    }, debounceMs);
  };
  
  // Create a MutationObserver to watch for changes
  const mutationObserver = new MutationObserver((mutations) => 
  {
    mutations.forEach((mutation) => 
    {
      debouncedCallback(mutation);
    });
  });
  
  // Configure and start the MutationObserver
  mutationObserver.observe(table, 
  {
    childList: true, // Watch for addition/removal of child elements
    subtree: true,   // Watch all descendants
    attributes: true // Watch for attribute changes
  });
  
  // Create a ResizeObserver to watch for size changes
  const resizeObserver = new ResizeObserver((entries) => 
  {
    entries.forEach((entry) => 
    {
      debouncedCallback(entry);
    });
  });
  
  // Start the ResizeObserver
  resizeObserver.observe(table);
  
  // Return both observers to allow for disconnection later
  return 
  {
    mutationObserver,
    resizeObserver
  };
}