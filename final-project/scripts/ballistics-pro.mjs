import { fetchData, saveDataToLocalStorage, getDataFromLocalStorage } from './utilities.mjs';
import { calculateTrajectory } from './ballistics-calculator.mjs';
import { renderChart, getDataFromTable, formatTrajectoryData } from './ballistics-charts.mjs';

const resultsTableName = 'resultsTable';
const trajectoryChartName = 'trajectory-chart';
const lastInputDataKey = 'lastInputData';

/**
 * Initialize ballistics calculator for index page
 */
export function initializeCalculator() 
{
    loadAmmunitionData();
    setupForm();
}

/**
 * Refresh trajectory chart
 */
export function refresh() 
{
    const data = getDataFromTable(resultsTableName);
    renderChart(trajectoryChartName, data);
}

/**
 * Load ammunition data into table
 */
async function loadAmmunitionData() 
{
    const tbody = document.querySelector('#ammoTable tbody');
    
    if (!tbody) {
        console.error('Ammunition table not found');
        return;
    }

    try 
    {
        const data = await fetchData('data/ammunition.json');
        
        tbody.innerHTML = data.map(item => `
            <tr>
                <td>${item.name || 'N/A'}</td>
                <td>${item.muzzleVelocity || 0}</td>
                <td>${item.ballisticCoefficient || 0}</td>
                <td>${item.bulletWeight || 0}</td>
            </tr>
        `).join('');
    } 
    catch (error) {
        console.error('Failed to load ammunition data:', error);
        tbody.innerHTML = '<tr><td colspan="4">No data available</td></tr>';
    }
}

/**
 * Display trajectory data in table and chart
 * @param {Array} data - Trajectory data
 */
function displayTrajectoryData(data) 
{
    const tbody = document.querySelector('#resultsTable tbody');
    
    if (!tbody) {
        console.error('Results table not found');
        return;
    }

    if (!data?.length) {
        tbody.innerHTML = '<tr><td colspan="5">No data available</td></tr>';
        renderChart(trajectoryChartName, []);
        return;
    }

    try 
    {

        tbody.innerHTML = data.map(trajectory => `
        <tr>
            <td>${trajectory.distance}</td>
            <td>${trajectory.velocity}</td>
            <td>${trajectory.energy}</td>
            <td>${trajectory.drop}</td>
            <td>${trajectory.lateralDrift}</td>
        </tr>
    `).join('');
        renderChart(trajectoryChartName, formatTrajectoryData(data));
    }
    catch (error) {
        console.error('Error displaying trajectory data:', error);
        tbody.innerHTML = '<tr><td colspan="5">Error displaying data</td></tr>';
        renderChart(trajectoryChartName, []);
    }
}

/**
 * Set up calculator form
 */
function setupForm() 
{
    const form = document.getElementById('calcForm');

    if (!form) {
        console.error('Calculator form not found');
        return;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const inputData = {
            muzzleVelocity: parseFloat(formData.get('muzzleVelocity')),
            ballisticCoefficient: parseFloat(formData.get('ballisticCoefficient')),
            bulletWeight: parseFloat(formData.get('bulletWeight')),
            windSpeed: parseFloat(formData.get('windSpeed')),
            windDirection: parseFloat(formData.get('windDirection')),
            altitude: parseFloat(formData.get('altitude')),
            temperature: parseFloat(formData.get('temperature')),
            humidity: parseFloat(formData.get('humidity')),
            latitude: parseFloat(formData.get('latitude')),
            twistRate: parseFloat(formData.get('twistRate')),
            sightHeight: parseFloat(formData.get('sightHeight')),
            zeroRange: parseFloat(formData.get('zeroRange')),
            maxDistance: parseFloat(formData.get('maxDistance'))
        };

        // Validation
        const errors = [];
        for (const [key, value] of Object.entries(inputData)) {
            if (isNaN(value)) errors.push(`Invalid ${key}`);
        }
        if (inputData.muzzleVelocity <= 0) errors.push('Muzzle velocity must be positive');
        if (inputData.ballisticCoefficient <= 0) errors.push('Ballistic coefficient must be positive');
        if (inputData.bulletWeight <= 0) errors.push('Bullet weight must be positive');
        if (inputData.windDirection < 0 || inputData.windDirection >= 360) errors.push('Wind direction must be 0-359°');
        if (inputData.twistRate <= 0) errors.push('Twist rate must be positive');
        if (inputData.zeroRange <= 0) errors.push('Zero range must be positive');
        if (inputData.maxDistance <= 0) errors.push('Max distance must be positive');

        if (errors.length) {
            alert(errors.join('\n'));
            return;
        }

        try 
        {
            const trajectoryData = calculateTrajectory(inputData);
        
            saveDataToLocalStorage(lastInputDataKey, inputData);
        
            displayTrajectoryData(trajectoryData);
        } catch (error) {
            alert(`Calculation error: ${error.message}`);
        }
    });

    // Load saved inputs
    const savedData = getDataFromLocalStorage(lastInputDataKey);

    if (savedData) 
    {
        Object.entries(savedData).forEach(([key, value]) => {
            if (form.elements[key]) form.elements[key].value = value;
        });
        form.dispatchEvent(new Event('submit'));
    }
}