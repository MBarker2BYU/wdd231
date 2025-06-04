import { fetchData, saveDataToLocalStorage, getDataFromLocalStorage } from './utilities.mjs';
import { calculateTrajectory } from './ballistics-calculator.mjs';

import { renderChart } from './ballistics-charts.mjs';
import { formatTrajectoryData } from './ballistics-charts.mjs';
import { getDataFromTable } from './ballistics-charts.mjs';

const resultsTableName = 'resultsTableBody';
const trajectoryChartName = 'trajectory-chart';
const lastInputDataKey = 'lastInputData';

document.addEventListener('DOMContentLoaded', () => 
{  
    loadAmmunitionData();
    initilizeCalculator(displayTrajectoryData);   
    
    initializeTableWatch(resultsTableName, refresh);

});

export function refresh()
{
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
            bulletDiameter: parseFloat(formData.get('bulletDiameter')),
            windSpeed: parseFloat(formData.get('windSpeed')),
            windDirection: parseFloat(formData.get('windDirection')),
            temperature: parseFloat(formData.get('temperature')),
            pressure: parseFloat(formData.get('pressure')),
            humidity: parseFloat(formData.get('humidity')),
            latitude: parseFloat(formData.get('latitude')),
            twistLength: parseFloat(formData.get('twistLength')),
            sightHeight: parseFloat(formData.get('sightHeight')),
            zeroRange: parseFloat(formData.get('zeroRange')),
            maxDistance: parseFloat(formData.get('maxDistance'))
        };

        if (isNaN(inputData.muzzleVelocity) || isNaN(inputData.ballisticCoefficient) ||
            isNaN(inputData.bulletWeight) || isNaN(inputData.bulletDiameter) || 
            isNaN(inputData.windSpeed) || isNaN(inputData.windDirection) || 
            isNaN(inputData.temperature) || isNaN(inputData.pressure) || 
            isNaN(inputData.humidity) || isNaN(inputData.latitude) || 
            isNaN(inputData.twistLength) || isNaN(inputData.sightHeight) || 
            isNaN(inputData.zeroRange) || isNaN(inputData.maxDistance))
            {
                alert('Please enter valid numbers for all fields.');
                return;
            }

        const trajectoryData = calculateTrajectory(inputData);

        saveDataToLocalStorage(lastInputDataKey, inputData);

        if(displayCallback)
        { 
            displayCallback(trajectoryData);
        }

    });

    // Load last input data from localStorage
    let lastInputData = {};

    if(getDataFromLocalStorage(lastInputDataKey, lastInputData, true))
    {   
        if (lastInputData) 
        {
            form.elements['muzzleVelocity'].value = parseInt(lastInputData.data.muzzleVelocity) || 0;
            form.elements['ballisticCoefficient'].value = lastInputData.data.ballisticCoefficient || 0;
            form.elements['bulletWeight'].value = lastInputData.data.bulletWeight || 0;
            form.elements['windSpeed'].value = lastInputData.data.windSpeed || 0;
        }

        form.dispatchEvent(new Event('submit'));
    }

}


function initializeTableWatch(id, callback, debounceMs = 100) {
  
  const table = document.getElementById(id);
    
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
  
  
  let timeoutId;

  const debouncedCallback = (event) => 
  {
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => 
    {
      callback(event);
    }, debounceMs);
  };
  
  
  const mutationObserver = new MutationObserver((mutations) => 
  {
    mutations.forEach((mutation) => 
    {
      debouncedCallback(mutation);
    });
  });
  
  
  mutationObserver.observe(table, 
  {
    childList: true, // Watch for addition/removal of child elements
    subtree: true,   // Watch all descendants
    attributes: true // Watch for attribute changes
  });
  
  
  const resizeObserver = new ResizeObserver((entries) => 
  {
    entries.forEach((entry) => 
    {
      debouncedCallback(entry);
    });
  });
  
  
  resizeObserver.observe(table);
  
  
  return 
  {
    mutationObserver,
    resizeObserver
  };
}