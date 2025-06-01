import { fetchData } from './utilities.mjs';
// import { calculateTrajectory } from './ballistics-calculator.mjs';

// import { initializeCharting } from './ballistics-charts.mjs';
// import { renderChart } from './ballistics-charts.mjs';

document.addEventListener('DOMContentLoaded', () => 
{

    const table = document.getElementById('resultsTableBody');
    const canvas = document.getElementById('trajectory-chart');

    const loadAmmunition = document.getElementById('load-ammo');
    
    loadAmmunition.addEventListener('click', () => 
    {
        loadAmmunitionData();
    });
    // initializeCharting(table, canvas);

    // loadAmmunitionData();
    // initilizeCalculator(displayTrajectoryData);
    // loadLastCalculation();
});



// function loadAmmunitionData() 
// {
//     fetchData('data/ammunition.json').then(data => 
//     {
//         const tbody = document.querySelector('#ammoTable tbody');
            
//         data.forEach(item => {
//             const row = document.createElement('tr');
            
//             row.innerHTML = `
//             <td>${item.name}</td>
//             <td>${item.muzzleVelocity}</td>
//             <td>${item.ballisticCoefficient}</td>
//             <td>${item.bulletWeight}</td>
//             `;

//             tbody.appendChild(row);
//         });
//     });
// }


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

// function displayTrajectoryData(trajectoryData)
// {    
//     const tbody = document.querySelector('#resultsTableBody tbody');
 
//     tbody.innerHTML = ''; // Clear previous results
 
//     trajectoryData.forEach(trajectory => {
//         const row = document.createElement('tr');
//         row.innerHTML = `
//         <td>${trajectory.distance}</td>
//         <td>${trajectory.velocity}</td>
//         <td>${trajectory.energy}</td>
//         <td>${trajectory.drop}</td>
//         <td>${trajectory.windDrift}</td>
//         `;
//         tbody.appendChild(row);
//     });

//     // renderChart(trajectoryData);
// }

// function displayTrajectoryData(trajectoryData) {
//     const tbody = document.querySelector('#resultsTableBody tbody');
//     let tableContent = '';

//     trajectoryData.forEach(trajectory => {
//         tableContent += `
//             <tr>
//                 <td>${trajectory.distance}</td>
//                 <td>${trajectory.velocity}</td>
//                 <td>${trajectory.energy}</td>
//                 <td>${trajectory.drop}</td>
//                 <td>${trajectory.windDrift}</td>
//             </tr>`;
//     });

//     tbody.innerHTML = tableContent;

//     renderChart(trajectoryData);
// }

// function initilizeCalculator(displayCallback) 
// {
//     const form = document.getElementById('calcForm');

//     form.addEventListener('submit', (event) => 
//     {
//         event.preventDefault();

//         const formData = new FormData(form);

//         const inputData = 
//         {
//             muzzleVelocity: parseFloat(formData.get('muzzleVelocity')),
//             ballisticCoefficient: parseFloat(formData.get('ballisticCoefficient')),
//             bulletWeight: parseFloat(formData.get('bulletWeight')),
//             windSpeed: parseFloat(formData.get('windSpeed'))
//         };

//         if (isNaN(inputData.muzzleVelocity) || isNaN(inputData.ballisticCoefficient) ||
//             isNaN(inputData.bulletWeight) || isNaN(inputData.windSpeed)) {
//             alert('Please enter valid numbers for all fields.');
//             return;
//         }

//         const trajectoryData = calculateTrajectory(inputData);

//         saveLastCalculation(inputData, trajectoryData);

//         if(displayCallback)
//         { 
//             displayCallback(trajectoryData);
//         }

//     });

// }

// function loadLastCalculation() 
// {       
//     const lastCalculation = localStorage.getItem('lastCalculation');

//     if (lastCalculation) 
//     {
//         try
//         {
//             const { inputData, trajectoryData } = JSON.parse(lastCalculation);
            
//             // Populate the form with the last input data
//             document.querySelector('#calcForm [name="muzzleVelocity"]').value = inputData.muzzleVelocity;
//             document.querySelector('#calcForm [name="ballisticCoefficient"]').value = inputData.ballisticCoefficient;
//             document.querySelector('#calcForm [name="bulletWeight"]').value = inputData.bulletWeight;
//             document.querySelector('#calcForm [name="windSpeed"]').value = inputData.windSpeed;

//             // Display the trajectory data
//             displayTrajectoryData(trajectoryData);
//         }
//         catch (error) 
//         {
//             console.error('Error loading last calculation:', error);
//             localStorage.removeItem('lastCalculation'); // Clear invalid data
//         }
//     }
// }

// function saveLastCalculation(inputData, trajectoryData)
// {
//     const lastCalculation = {
//         inputData: inputData,
//         trajectoryData: trajectoryData
//     };

//     localStorage.setItem('lastCalculation', JSON.stringify(lastCalculation));
// }