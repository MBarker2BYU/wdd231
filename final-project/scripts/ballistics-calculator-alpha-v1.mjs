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

// G1 drag coefficient approximation (simplified lookup table)
function getG1DragCoefficient(mach) {
    const dragTable = [
        { mach: 0.0, cd: 0.300 }, { mach: 0.5, cd: 0.295 },
        { mach: 1.0, cd: 0.240 }, { mach: 1.2, cd: 0.200 },
        { mach: 1.5, cd: 0.180 }, { mach: 2.0, cd: 0.170 }
    ];

    // Linear interpolation between points
    for (let i = 0; i < dragTable.length - 1; i++) {
        if (mach >= dragTable[i].mach && mach <= dragTable[i + 1].mach) {
            const frac = (mach - dragTable[i].mach) / (dragTable[i + 1].mach - dragTable[i].mach);
            return dragTable[i].cd + frac * (dragTable[i + 1].cd - dragTable[i].cd);
        }
    }
    return mach > 2.0 ? 0.170 : 0.300; // Extrapolate for high/low Mach
}

// Calculate drag deceleration (ft/s²)
function calculateDragDeceleration(bc, velocityFps, pressureInchesHg, temperatureFahrenheit, humidityPercent) {
    // Constants
    const GRAVITY = 32.174; // ft/s²
    const SPEED_OF_SOUND = 1125; // ft/s at 59°F (approximate, varies with temperature)

    // Convert velocity to m/s for air density consistency
    const velocityMs = velocityFps * 0.3048;

    // Calculate air density (kg/m³)
    const airDensity = calculateAirDensity(temperatureFahrenheit, pressureInchesHg, humidityPercent);

    // Calculate Mach number
    const mach = velocityFps / SPEED_OF_SOUND;

    // Get drag coefficient from G1 model
    const cd = getG1DragCoefficient(mach);

    // Convert BC to SI units (assuming BC is in lbs/in² form, adjust if needed)
    // For now, assume BC is dimensionless as per standard G1 definition
    const bcSi = bc; // No unit conversion needed if BC is already normalized

    // Cross-sectional area (A) and mass (m) are embedded in BC; no need to compute separately
    // Drag deceleration in m/s²
    const dragDecelMs = (0.5 * airDensity * cd * velocityMs * velocityMs) / bcSi;

    // Convert drag deceleration to ft/s²
    const dragDecelFps = dragDecelMs / 0.3048;

    return dragDecelFps;
}

// Test with data sheet inputs
const test1 = calculateDragDeceleration(1.05, 2800, 29.53, 59, 78); // First data sheet
const test2 = calculateDragDeceleration(0.266, 2800, 29.53, 59, 78); // Second data sheet

console.log(`Drag Deceleration (BC=1.05): ${test1.toFixed(2)} ft/s²`);
console.log(`Drag Deceleration (BC=0.266): ${test2.toFixed(2)} ft/s²`);