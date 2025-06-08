// Calculate air density based on temperature, pressure, and humidity
function calculateAirDensity(temperatureFahrenheit, pressureInchesHg, humidityPercent) {
    const dryAirGasConstant = 287.05;  // J/(kg·K) for dry air
    const waterVaporGasConstant = 461.495; // J/(kg·K) for water vapor

    const temperatureCelsius = (temperatureFahrenheit - 32) * 5 / 9;
    const temperatureKelvin = temperatureCelsius + 273.15;

    const pressurePascals = pressureInchesHg * 3386.39;

    const humidityFraction = humidityPercent / 100;

    const maxVaporPressure = 610.78 * Math.pow(10, (7.5 * temperatureCelsius) / (237.3 + temperatureCelsius));

    const actualVaporPressure = humidityFraction * maxVaporPressure;

    const dryAirPressure = pressurePascals - actualVaporPressure;

    const airDensity = (dryAirPressure / (dryAirGasConstant * temperatureKelvin)) +
                      (actualVaporPressure / (waterVaporGasConstant * temperatureKelvin));

    return airDensity; // kg/m³
}

// G1 drag coefficient with detailed table
function getG1DragCoefficient(mach) {
    const dragTable = [
        { mach: 0.00, cd: 0.300 }, { mach: 0.50, cd: 0.295 },
        { mach: 0.70, cd: 0.285 }, { mach: 0.90, cd: 0.260 },
        { mach: 1.00, cd: 0.240 }, { mach: 1.10, cd: 0.220 },
        { mach: 1.20, cd: 0.200 }, { mach: 1.30, cd: 0.190 },
        { mach: 1.50, cd: 0.180 }, { mach: 1.70, cd: 0.175 },
        { mach: 2.00, cd: 0.170 }, { mach: 2.50, cd: 0.165 }
    ];

    if (mach <= dragTable[0].mach) return dragTable[0].cd;
    if (mach >= dragTable[dragTable.length - 1].mach) return dragTable[dragTable.length - 1].cd;

    for (let i = 0; i < dragTable.length - 1; i++) {
        if (mach >= dragTable[i].mach && mach <= dragTable[i + 1].mach) {
            const frac = (mach - dragTable[i].mach) / (dragTable[i + 1].mach - dragTable[i].mach);
            return dragTable[i].cd + frac * (dragTable[i + 1].cd - dragTable[i].cd);
        }
    }
    return 0.165; // Default for high Mach
}

// Runge-Kutta 4 integration step with wind and Coriolis
function rk4Step(state, bc, airDensity, windSpeedFps, windAngleRad, latitudeRad, timeStep) {
    const [x, y, z, vx, vy, vz] = state;
    const v = Math.sqrt(vx * vx + vy * vy + vz * vz);
    const mach = v * 0.3048 / 1125; // Convert to m/s, use 1125 ft/s as speed of sound
    const cd = getG1DragCoefficient(mach);
    const dragMag = (airDensity * v * v) / (2 * bc); // m/s² in SI
    const dragX = -dragMag * (vx / v) * 0.3048; // Convert to ft/s²
    const dragY = -dragMag * (vy / v) * 0.3048;
    const dragZ = -dragMag * (vz / v) * 0.3048;
    const gravY = -32.174; // ft/s²
    const windVelX = windSpeedFps * Math.cos(windAngleRad);
    const windVelZ = windSpeedFps * Math.sin(windAngleRad);
    const windAccelX = (airDensity * (windVelX - vx) * Math.abs(windVelX - vx)) / (2 * bc) * 0.3048;
    const windAccelZ = (airDensity * (windVelZ - vz) * Math.abs(windVelZ - vz)) / (2 * bc) * 0.3048;
    const omega = 7.292e-5; // Earth's angular velocity (rad/s)
    const coriolisX = 2 * omega * (vy * Math.sin(latitudeRad) - vz * Math.cos(latitudeRad));
    const coriolisY = -2 * omega * vx * Math.sin(latitudeRad);
    const coriolisZ = 2 * omega * vx * Math.cos(latitudeRad);

    const k1x = vx * timeStep;
    const k1y = vy * timeStep;
    const k1z = vz * timeStep;
    const k1vx = (dragX + windAccelX + coriolisX) * timeStep;
    const k1vy = (dragY + gravY + coriolisY) * timeStep;
    const k1vz = (dragZ + windAccelZ + coriolisZ) * timeStep;

    const k2x = (vx + k1vx / 2) * timeStep;
    const k2y = (vy + k1vy / 2) * timeStep;
    const k2z = (vz + k1vz / 2) * timeStep;
    const k2vx = (dragX + windAccelX + coriolisX) * timeStep;
    const k2vy = (dragY + gravY + coriolisY) * timeStep;
    const k2vz = (dragZ + windAccelZ + coriolisZ) * timeStep;

    const k3x = (vx + k2vx / 2) * timeStep;
    const k3y = (vy + k2vy / 2) * timeStep;
    const k3z = (vz + k2vz / 2) * timeStep;
    const k3vx = (dragX + windAccelX + coriolisX) * timeStep;
    const k3vy = (dragY + gravY + coriolisY) * timeStep;
    const k3vz = (dragZ + windAccelZ + coriolisZ) * timeStep;

    const k4x = (vx + k3vx) * timeStep;
    const k4y = (vy + k3vy) * timeStep;
    const k4z = (vz + k3vz) * timeStep;
    const k4vx = (dragX + windAccelX + coriolisX) * timeStep;
    const k4vy = (dragY + gravY + coriolisY) * timeStep;
    const k4vz = (dragZ + windAccelZ + coriolisZ) * timeStep;

    return [
        (k1x + 2 * k2x + 2 * k3x + k4x) / 6,
        (k1y + 2 * k2y + 2 * k3y + k4y) / 6,
        (k1z + 2 * k2z + 2 * k3z + k4z) / 6,
        (k1vx + 2 * k2vx + 2 * k3vx + k4vx) / 6,
        (k1vy + 2 * k2vy + 2 * k3vy + k4vy) / 6,
        (k1vz + 2 * k2vz + 2 * k3vz + k4vz) / 6
    ];
}

// Calculate full trajectory with RK4, returning a plot object
function calculateTrajectory(bc, initialVelocityFps, launchAngleDeg, sightHeightInches, maxRangeYds, pressureInchesHg, temperatureFahrenheit, humidityPercent, weightGrains, windSpeedMph, windAngleDeg, latitudeDeg, intervalYds = 100, timeStep = 0.001) {
    const airDensity = calculateAirDensity(temperatureFahrenheit, pressureInchesHg, humidityPercent);
    const YARDS_TO_FEET = 3;
    const maxRangeFeet = maxRangeYds * YARDS_TO_FEET;
    const windSpeedFps = windSpeedMph * 1.467; // Convert mph to fps
    const windAngleRad = windAngleDeg * Math.PI / 180;
    const latitudeRad = latitudeDeg * Math.PI / 180;

    // Initial conditions
    const launchAngleRad = launchAngleDeg * Math.PI / 180;
    const vx0 = initialVelocityFps * Math.cos(launchAngleRad);
    const vy0 = initialVelocityFps * Math.sin(launchAngleRad);
    let state = [0, sightHeightInches, 0, vx0, vy0, 0]; // [x, y, z, vx, vy, vz]
    const points = [];

    let lastDistanceYds = 0;
    while (state[0] < maxRangeFeet) {
        const delta = rk4Step(state, bc, airDensity, windSpeedFps, windAngleRad, latitudeRad, timeStep);
        state = [
            state[0] + delta[0],
            state[1] + delta[1],
            state[2] + delta[2],
            state[3] + delta[3],
            state[4] + delta[4],
            state[5] + delta[5]
        ];
        const currentDistanceYds = state[0] / YARDS_TO_FEET;
        const velocityFps = Math.sqrt(state[3] * state[3] + state[4] * state[4] + state[5] * state[5]);
        const weightLbs = weightGrains / 7000; // Convert grains to pounds
        const energyFtLb = (weightLbs * velocityFps * velocityFps) / (2 * 32.174); // Kinetic energy in ft-lb
        const totalDriftInches = state[2] * 12; // Lateral displacement in inches (wind + Coriolis)

        if (Math.floor(currentDistanceYds / intervalYds) > Math.floor(lastDistanceYds / intervalYds)) {
            points.push({
                x: currentDistanceYds, // Distance in yards for x-axis
                y: -state[1], // Negative drop in inches for y-axis (plotting convention)
                velocity: velocityFps,
                energy: energyFtLb,
                windDrift: totalDriftInches
            });
        }
        lastDistanceYds = currentDistanceYds;

        if (currentDistanceYds > maxRangeYds) break;
    }

    // Ensure the max range is included if close
    if (Math.abs(points[points.length - 1].x - maxRangeYds) > intervalYds / 2) {
        const velocityFps = Math.sqrt(state[3] * state[3] + state[4] * state[4] + state[5] * state[5]);
        const weightLbs = weightGrains / 7000;
        const energyFtLb = (weightLbs * velocityFps * velocityFps) / (2 * 32.174);
        const totalDriftInches = state[2] * 12;
        points.push({
            x: maxRangeYds,
            y: -state[1],
            velocity: velocityFps,
            energy: energyFtLb,
            windDrift: totalDriftInches
        });
    }

    return { points };
}

// Adjust for zero with binary search (unchanged)
function adjustForZero(bc, initialVelocityFps, sightHeightInches, zeroRangeYds, pressureInchesHg, temperatureFahrenheit, humidityPercent) {
    let minAngle = -0.1; // degrees
    let maxAngle = 0.1;
    const tolerance = 0.01; // inches

    while (maxAngle - minAngle > 0.0001) {
        const midAngle = (minAngle + maxAngle) / 2;
        const result = calculateTrajectory(bc, initialVelocityFps, midAngle, sightHeightInches, zeroRangeYds, pressureInchesHg, temperatureFahrenheit, humidityPercent, 0, 0, 0, 0, zeroRangeYds).points[0];
        const dropError = -result.y; // Convert back to positive drop for comparison

        if (Math.abs(dropError) < tolerance) {
            return { zeroAngle: midAngle, drop: dropError };
        } else if (dropError > 0) {
            maxAngle = midAngle;
        } else {
            minAngle = midAngle;
        }
    }
    return { zeroAngle: (minAngle + maxAngle) / 2, drop: 0 };
}

// Test with data sheets (latitude 0° for minimal Coriolis)
const bc1 = 1.05;
const velocity1 = 2800;
const sightHeight1 = 1.5;
const maxRange1 = 500;
const pressure1 = 29.53;
const temperature1 = 59;
const humidity1 = 78;
const weight1 = 661; // grains from first data sheet
const windSpeed1 = 0; // mph
const windAngle1 = 90; // degrees
const latitude1 = 0; // degrees

const zeroResult1 = adjustForZero(bc1, velocity1, sightHeight1, 100, pressure1, temperature1, humidity1);
const trajectory1 = calculateTrajectory(bc1, velocity1, zeroResult1.zeroAngle, sightHeight1, maxRange1, pressure1, temperature1, humidity1, weight1, windSpeed1, windAngle1, latitude1);
console.log("Trajectory Plot Data (BC=1.05):");
console.log(JSON.stringify(trajectory1, null, 2));

const bc2 = 0.266;
const velocity2 = 2800;
const sightHeight2 = 1.5;
const maxRange2 = 500;
const pressure2 = 29.53;
const temperature2 = 59;
const humidity2 = 78;
const weight2 = 123; // grains from second data sheet
const windSpeed2 = 0; // mph
const windAngle2 = 90; // degrees
const latitude2 = 0; // degrees

const zeroResult2 = adjustForZero(bc2, velocity2, sightHeight2, 100, pressure2, temperature2, humidity2);
const trajectory2 = calculateTrajectory(bc2, velocity2, zeroResult2.zeroAngle, sightHeight2, maxRange2, pressure2, temperature2, humidity2, weight2, windSpeed2, windAngle2, latitude2);
console.log("Trajectory Plot Data (BC=0.266):");
console.log(JSON.stringify(trajectory2, null, 2));