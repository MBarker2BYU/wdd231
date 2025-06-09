// ballistics-pro.mjs
import { fetchData, saveDataToLocalStorage, getDataFromLocalStorage } from './utilities.mjs';
import { calculateTrajectory } from './ballistics-calculator.mjs';
import { renderChart, getDataFromTable, formatTrajectoryData } from './ballistics-charts.mjs';

const resultsTableName = 'resultsTableBody';
const trajectoryChartName = 'trajectory-chart';
const lastInputDataKey = 'lastInputData';

document.addEventListener('DOMContentLoaded', () => {
    loadAmmunitionData();
    initializeCalculator(displayTrajectoryData);
    initializeTableWatch(resultsTableName, refresh);
});

export function refresh() {
    const trajectoryData = getDataFromTable(resultsTableName);
    renderChart(trajectoryChartName, trajectoryData);
}

function loadAmmunitionData() {
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
    }).catch(error => {
        console.error('Failed to load ammunition data:', error);
    });
}

function displayTrajectoryData(trajectoryData) {
    const tbody = document.querySelector('#resultsTableBody');
    let tableContent = '';

    if (!trajectoryData || trajectoryData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No data available</td></tr>';
        renderChart(trajectoryChartName, []);
        return;
    }

    trajectoryData.forEach(trajectory => {
        tableContent += `
            <tr>
                <td>${trajectory.distance}</td>
                <td>${trajectory.velocity}</td>
                <td>${trajectory.energy}</td>
                <td>${trajectory.drop}</td>
                <td>${trajectory.lateralDrift}</td>
            </tr>`;
    });

    tbody.innerHTML = tableContent;
    const chartData = formatTrajectoryData(trajectoryData);
    renderChart(trajectoryChartName, chartData);
}

function initializeCalculator(displayCallback) {
    const form = document.getElementById('calcForm');

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(form);

        const inputData = {
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
            twistRate: parseFloat(formData.get('twistRate')),
            sightHeight: parseFloat(formData.get('sightHeight')),
            zeroRange: parseFloat(formData.get('zeroRange')),
            maxDistance: parseFloat(formData.get('maxDistance'))
        };

        // Comprehensive validation
        for (const [key, value] of Object.entries(inputData)) {
            if (isNaN(value)) {
                alert(`Please enter a valid number for ${key}.`);
                return;
            }
        }

        // Additional validation for specific fields
        if (inputData.muzzleVelocity <= 0) {
            alert('Muzzle velocity must be positive.');
            return;
        }
        if (inputData.ballisticCoefficient <= 0) {
            alert('Ballistic coefficient must be positive.');
            return;
        }
        if (inputData.bulletWeight <= 0) {
            alert('Bullet weight must be positive.');
            return;
        }
        if (inputData.windDirection < 0 || inputData.windDirection >= 360) {
            alert('Wind direction must be between 0 and 359 degrees.');
            return;
        }
        if (inputData.twistRate <= 0) {
            alert('Twist rate must be positive.');
            return;
        }
        if (inputData.zeroRange <= 0) {
            alert('Zero range must be positive.');
            return;
        }
        if (inputData.maxDistance <= 0) {
            alert('Max distance must be positive.');
            return;
        }

        let trajectoryData;
        try {
            trajectoryData = calculateTrajectory(inputData);
        } catch (error) {
            alert(`Calculation error: ${error.message}`);
            return;
        }

        saveDataToLocalStorage(lastInputDataKey, inputData);

        if (displayCallback) {
            displayCallback(trajectoryData);
        }
    });

    // Load last input data from localStorage
    let lastInputData = {};
    if (getDataFromLocalStorage(lastInputDataKey, lastInputData, true) && lastInputData.data) {
        const fields = [
            'muzzleVelocity', 'ballisticCoefficient', 'bulletWeight', 'bulletDiameter','windSpeed',
            'windDirection', 'temperature', 'pressure', 'humidity', 'latitude', 
            'twistRate', 'sightHeight', 'zeroRange', 'maxDistance'
        ];
        fields.forEach(field => {
            if (lastInputData.data[field]) {
                form.elements[field].value = lastInputData.data[field] || 0;
            }
        });
        form.dispatchEvent(new Event('submit'));
    }
}

function initializeTableWatch(id, callback, debounceMs = 100) {
    const table = document.getElementById(id);
    if (!table) {
        console.error(`Table with ID "${id}" not found`);
        return null;
    }

    if (typeof callback !== 'function') {
        console.error('Callback must be a function');
        return null;
    }

    let timeoutId;
    const debouncedCallback = (event) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            callback(event);
        }, debounceMs);
    };

    const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            debouncedCallback(mutation);
        });
    });

    mutationObserver.observe(table, {
        childList: true,
        subtree: true,
        attributes: true
    });

    const resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
            debouncedCallback(entry);
        });
    });

    resizeObserver.observe(table);

    return { mutationObserver, resizeObserver };
}