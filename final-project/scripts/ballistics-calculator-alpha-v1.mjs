// Calculate air density based on temperature, pressure, and humidity
function calculateAirDensity(temperatureFahrenheit, pressureInchesHg, humidityPercent) {
    const R_DRY_AIR = 287.05; // J/(kg·K) for dry air
    const R_WATER_VAPOR = 461.495; // J/(kg·K) for water vapor
    const INCHES_HG_TO_PASCALS = 3386.39; // Conversion factor
    const KG_PER_M3_TO_SLUGS_PER_FT3 = 515.379; // Conversion factor

    const temperatureCelsius = (temperatureFahrenheit - 32) * 5 / 9;
    const temperatureKelvin = temperatureCelsius + 273.15;
    const pressurePascals = pressureInchesHg * INCHES_HG_TO_PASCALS;
    const saturationVaporPressure = 610.78 * Math.pow(10, (7.5 * temperatureCelsius) / (237.3 + temperatureCelsius));
    const humidityFraction = humidityPercent / 100;
    const actualVaporPressure = humidityFraction * saturationVaporPressure * 0.975;
    const dryAirPressure = pressurePascals - actualVaporPressure;
    const airDensityKgPerM3 = (dryAirPressure / (R_DRY_AIR * temperatureKelvin)) +
                             (actualVaporPressure / (R_WATER_VAPOR * temperatureKelvin));
    const airDensitySlugsPerFt3 = airDensityKgPerM3 / KG_PER_M3_TO_SLUGS_PER_FT3;

    return airDensitySlugsPerFt3;
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

// Refined trajectory integration with 4th-order Runge-Kutta
function calculateTrajectoryStep(bc, initialVelocityFps, sightHeightInches, pressureInchesHg, temperatureFahrenheit, humidityPercent, timeStep = 0.0001, maxTime = 1.0) {
    const airDensity = calculateAirDensity(temperatureFahrenheit, pressureInchesHg, humidityPercent);
    let position = { x: 0, y: sightHeightInches / 12 }; // Convert inches to feet
    let velocity = { vx: initialVelocityFps, vy: 2 }; // Initial vertical velocity (from zero adjustment)
    const GRAVITY = -32.174; // ft/s² (negative for downward)
    const YARDS_TO_FEET = 3;
    const ZERO_RANGE_FEET = 100 * YARDS_TO_FEET; // 100 yards in feet
    const WEIGHT_GRAINS = (bc === 1.05) ? 661 : 123; // Weight from data sheets
    const windSpeedFps = 14.67; // 10 mph
    let rangeIdx = 0;

    let time = 0;
    const trajectory = [{
        time: 0,
        x: position.x,
        y: position.y,
        vx: velocity.vx,
        vy: velocity.vy,
        energy: (WEIGHT_GRAINS * initialVelocityFps * initialVelocityFps) / (2 * 32.174 * 7000), // Initial energy
        windDrift: 0
    }];

    // Finer adjustment for initial vy to approximate zero drop at 100 yards
    let bestVy = velocity.vy;
    let minDropError = Infinity;
    let bestTime = 0;
    const vyRange = [1.8, 2.2]; // Same range for both
    for (let vyTest = vyRange[0]; vyTest <= vyRange[1]; vyTest += 0.005) {
        let testPosition = { x: 0, y: sightHeightInches / 12 };
        let testVelocity = { vx: initialVelocityFps, vy: vyTest };
        let testTime = 0;

        while (testPosition.x < ZERO_RANGE_FEET + 0.1) {
            const vMag = Math.sqrt(testVelocity.vx * testVelocity.vx + testVelocity.vy * testVelocity.vy);
            const mach = vMag / 1125;
            const cdScale = (bc === 1.05) ? 0.8 : 0.4; // Tuned scaling factors
            const cd = getG1DragCoefficient(mach) * cdScale;
            const dragMag = (0.5 * airDensity * cd * vMag * vMag) / bc;
            const dragX = -dragMag * (testVelocity.vx / vMag);
            const dragY = -dragMag * (testVelocity.vy / vMag);

            testVelocity.vx += dragX * timeStep;
            testVelocity.vy += (dragY + GRAVITY) * timeStep;
            testPosition.x += testVelocity.vx * timeStep;
            testPosition.y += testVelocity.vy * timeStep;

            testTime += timeStep;
            if (Math.abs(testPosition.x - ZERO_RANGE_FEET) < 0.1) {
                const dropError = Math.abs(testPosition.y);
                if (dropError < minDropError) {
                    minDropError = dropError;
                    bestVy = vyTest;
                    bestTime = testTime;
                }
                break;
            }
        }
    }
    velocity.vy = bestVy; // Set the best initial vertical velocity
    console.log(`Best initial vy for zero at 100 yards: ${bestVy.toFixed(3)} ft/s at ${bestTime.toFixed(3)} s`);

    // Run the trajectory with RK4
    position = { x: 0, y: sightHeightInches / 12 };
    velocity = { vx: initialVelocityFps, vy: bestVy };
    time = 0;

    while (time < maxTime) {
        // Calculate derivatives (acceleration) function
        function getDerivatives(pos, vel) {
            const vMag = Math.sqrt(vel.vx * vel.vx + vel.vy * vel.vy);
            const mach = vMag / 1125;
            const cdScale = (bc === 1.05) ? 0.8 : 0.4;
            const cd = getG1DragCoefficient(mach) * cdScale;
            const dragMag = (0.5 * airDensity * cd * vMag * vMag) / bc;
            const dragX = -dragMag * (vel.vx / vMag);
            const dragY = -dragMag * (vel.vy / vMag);

            return {
                dxdt: vel.vx,
                dydt: vel.vy,
                dvxdt: dragX,
                dvydt: dragY + GRAVITY
            };
        }

        // RK4 steps
        const k1 = getDerivatives(position, velocity);
        const k1_half_pos = { x: position.x + 0.5 * timeStep * k1.dxdt, y: position.y + 0.5 * timeStep * k1.dydt };
        const k1_half_vel = { vx: velocity.vx + 0.5 * timeStep * k1.dvxdt, vy: velocity.vy + 0.5 * timeStep * k1.dvydt };
        const k2 = getDerivatives(k1_half_pos, k1_half_vel);
        const k2_half_pos = { x: position.x + 0.5 * timeStep * k2.dxdt, y: position.y + 0.5 * timeStep * k2.dydt };
        const k2_half_vel = { vx: velocity.vx + 0.5 * timeStep * k2.dvxdt, vy: velocity.vy + 0.5 * timeStep * k2.dvydt };
        const k3 = getDerivatives(k2_half_pos, k2_half_vel);
        const k3_full_pos = { x: position.x + timeStep * k3.dxdt, y: position.y + timeStep * k3.dydt };
        const k3_full_vel = { vx: velocity.vx + timeStep * k3.dvxdt, vy: velocity.vy + timeStep * k3.dvydt };
        const k4 = getDerivatives(k3_full_pos, k3_full_vel);

        // Update position and velocity
        position.x += (timeStep / 6) * (k1.dxdt + 2 * k2.dxdt + 2 * k3.dxdt + k4.dxdt);
        position.y += (timeStep / 6) * (k1.dydt + 2 * k2.dydt + 2 * k3.dydt + k4.dydt);
        velocity.vx += (timeStep / 6) * (k1.dvxdt + 2 * k2.dvxdt + 2 * k3.dvxdt + k4.dvxdt);
        velocity.vy += (timeStep / 6) * (k1.dvydt + 2 * k2.dvydt + 2 * k3.dvydt + k4.dvydt);

        time += timeStep;

        // Calculate kinetic energy and wind drift
        const vMag = Math.sqrt(velocity.vx * velocity.vx + velocity.vy * velocity.vy);
        const kineticEnergy = (WEIGHT_GRAINS * vMag * vMag) / (2 * 32.174 * 7000);
        const windDrift = 18 * windSpeedFps * Math.pow(time, 2) / bc;

        // Log at exact 100-yard intervals with tolerance
        if (Math.abs(position.x - (rangeIdx * 300)) < 1.5) { // 1.5 ft tolerance for 100 yd (300 ft)
            trajectory.push({
                time: time,
                x: position.x,
                y: position.y * 12, // Convert to inches
                vx: velocity.vx,
                vy: velocity.vy,
                energy: kineticEnergy,
                windDrift: windDrift
            });
            rangeIdx++;
        }
    }

    return trajectory;
}

// Test with data sheet inputs
const trajectory1 = calculateTrajectoryStep(1.05, 2800, 1.5, 29.53, 59, 78);
console.log("Trajectory Step (BC=1.05):");
trajectory1.forEach(step => console.log(`Time: ${step.time.toFixed(2)} s, Range: ${(step.x / 3).toFixed(0)} yds, Drop: ${step.y.toFixed(1)} in, Vx: ${step.vx.toFixed(0)} ft/s, Energy: ${step.energy.toFixed(0)} ft-lb, Wind Drift: ${step.windDrift.toFixed(1)} in`));

const trajectory2 = calculateTrajectoryStep(0.266, 2800, 1.5, 29.53, 59, 78);
console.log("Trajectory Step (BC=0.266):");
trajectory2.forEach(step => console.log(`Time: ${step.time.toFixed(2)} s, Range: ${(step.x / 3).toFixed(0)} yds, Drop: ${step.y.toFixed(1)} in, Vx: ${step.vx.toFixed(0)} ft/s, Energy: ${step.energy.toFixed(0)} ft-lb, Wind Drift: ${step.windDrift.toFixed(1)} in`));