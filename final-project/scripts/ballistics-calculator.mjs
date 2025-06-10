// ballistics-calculator.mjs
/**
 * @typedef {Object} TrajectoryInput
 * @property {number} muzzleVelocity - Muzzle velocity in fps
 * @property {number} ballisticCoefficient - Ballistic coefficient
 * @property {number} bulletWeight - Bullet weight in grains
 * @property {number} windSpeed - Wind speed in mph
 * @property {number} windDirection - Wind direction in degrees (0 = headwind, 90 = right, 180 = tailwind, 270 = left)
 * @property {number} altitude - Altitude in feet
 * @property {number} temperature - Temperature in °F
 * @property {number} humidity - Relative humidity (0 to 100%)
 * @property {number} sightHeight - Sight height in inches
 * @property {number} twistRate - Twist rate in inches per turn
 * @property {number} latitude - Latitude in degrees
 * @property {number} zeroRange - Zero range in yards
 * @property {number} maxDistance - Maximum distance in yards
 */

/**
 * @typedef {Object} TrajectoryResult
 * @property {number} distance - Distance in yards
 * @property {string} velocity - Velocity in fps, formatted to 2 decimal places
 * @property {string} energy - Energy in ft-lbs, rounded to 0 decimal places
 * @property {string} drop - Drop in inches, formatted to 2 decimal places
 * @property {string} lateralDrift - Lateral drift in inches, formatted to 2 decimal places
 */

// Constants (unchanged)
const GRAVITY = 32.174;
const YARDS_TO_FEET = 3;
const INCHES_TO_FEET = 1 / 12;
const WIND_SPEED_CONVERSION = 1.46667;
const ENERGY_CONSTANT = 450395;
const GAS_CONSTANT_DRY = 1716;
const GAS_CONSTANT_VAPOR = 2763;
const SEA_LEVEL_PRESSURE = 2116.22;
const SEA_LEVEL_TEMP = 518.67;
const LAPSE_RATE = 0.003566;
const GRAINS_TO_SLUGS = 1 / (7000 * 32.174);
const GRAINS_TO_POUNDS = 1 / 7000;
const SUB_STEP_YARDS = 0.1;
const BC_AREA_CONVERSION = 175.0;
const SPIN_DRIFT_CONSTANT = 1.25;
const EARTH_ANGULAR_VELOCITY = 7.292e-5;

/**
 * Calculates the bullet trajectory based on input parameters
 * @param {TrajectoryInput} inputs - Input parameters for trajectory calculation
 * @returns {TrajectoryResult[]} Array of trajectory results
 */
function calculateTrajectory(inputs) 
{
    // Input validation
    if (inputs.muzzleVelocity <= 0) throw new Error("Muzzle velocity must be positive.");
    if (inputs.ballisticCoefficient <= 0) throw new Error("Ballistic coefficient must be positive.");
    if (inputs.bulletWeight <= 0) throw new Error("Bullet weight must be positive.");
    if (inputs.altitude < -1000 || inputs.altitude > 30000) throw new Error("Altitude out of reasonable range.");
    if (inputs.temperature < -50 || inputs.temperature > 120) throw new Error("Temperature out of reasonable range.");
    if (inputs.twistRate <= 0) throw new Error("Twist rate must be positive.");
    if (inputs.latitude < -90 || inputs.latitude > 90) throw new Error("Latitude out of range.");
    if (inputs.windDirection < 0 || inputs.windDirection >= 360) throw new Error("Wind direction must be 0–359 degrees.");
    if (inputs.zeroRange <= 0) throw new Error("Zero range must be positive.");
    if (inputs.maxDistance <= 0) throw new Error("Max distance must be positive.");

    const muzzleVelocity = inputs.muzzleVelocity;
    const ballisticCoefficient = inputs.ballisticCoefficient;
    const bulletWeight = inputs.bulletWeight;
    const windSpeed = inputs.windSpeed;
    const windDirectionRad = inputs.windDirection * Math.PI / 180;
    const altitude = inputs.altitude;
    const temperatureF = inputs.temperature;
    const relativeHumidity = Math.min(Math.max(inputs.humidity / 100, 0), 1); // Convert % to fraction
    const sightHeightFeet = inputs.sightHeight * INCHES_TO_FEET;
    const twistRateInches = inputs.twistRate;
    const latitudeRad = inputs.latitude * Math.PI / 180;
    const zeroRangeYards = inputs.zeroRange;
    const maxDistanceYards = Math.min(inputs.maxDistance, 1000); // Cap for safety

    // Convert temperature to Rankine and Celsius
    const temperatureR = temperatureF + 459.67;
    const temperatureC = (temperatureF - 32) * 5 / 9;

    // Calculate pressure at altitude (ignoring form's pressure input for now)
    const tempRatio = 1 - (LAPSE_RATE * altitude) / SEA_LEVEL_TEMP;
    if (tempRatio <= 0) throw new Error("Altitude too high for standard atmosphere model.");
    const pressure = SEA_LEVEL_PRESSURE * Math.pow(tempRatio, 5.255);

    // Calculate saturation vapor pressure (Magnus-Tetens, converted to lb/ft²)
    const satVaporPressurePa = 610.78 * Math.pow(10, 7.5 * temperatureC / (temperatureC + 237.3));
    const satVaporPressure = satVaporPressurePa * 0.020885;

    // Water vapor pressure
    const vaporPressure = relativeHumidity * satVaporPressure;

    // Virtual temperature
    const Rd_Rv_Ratio = GAS_CONSTANT_DRY / GAS_CONSTANT_VAPOR;
    const virtualTempR = temperatureR / (1 - (vaporPressure / pressure) * (1 - Rd_Rv_Ratio));

    // Air density
    const airDensity = pressure / (GAS_CONSTANT_DRY * virtualTempR);

    // Convert bullet weight
    const massSlugs = bulletWeight * GRAINS_TO_SLUGS;
    const massPounds = bulletWeight * GRAINS_TO_POUNDS;

    // Drag coefficient * area
    const dragCoefficientArea = massPounds / (ballisticCoefficient * BC_AREA_CONVERSION);

    // Calculate initial upward velocity for zero range
    const zeroDistanceFeet = zeroRangeYards * YARDS_TO_FEET;
    const avgVelocity = (muzzleVelocity + 2714.45) / 2; // Avg velocity approximation
    const timeToZero = zeroDistanceFeet / avgVelocity;
    const dropAtZero = 0.5 * GRAVITY * timeToZero * timeToZero;
    const initialVy = (dropAtZero + sightHeightFeet) / timeToZero * 0.87;

    // Calculate trajectory
    const results = [];
    let velocity = muzzleVelocity;
    let vy = initialVy;
    let cumulativeTime = 0;
    let currentDistanceFeet = 0;
    let currentHeightFeet = -sightHeightFeet;
    let currentLateralDriftFeet = 0;
    
    // return null;

    for (let distance = 0; distance <= maxDistanceYards; distance += 100) 
    {
        const targetDistanceFeet = distance * YARDS_TO_FEET;

        // Process sub-steps
        while (currentDistanceFeet < targetDistanceFeet) 
        {
            let subStepFeet = SUB_STEP_YARDS * YARDS_TO_FEET;
            if (subStepFeet > targetDistanceFeet - currentDistanceFeet) {
                subStepFeet = targetDistanceFeet - currentDistanceFeet;
            }

            const initialVelocity = velocity;
            const time = subStepFeet / initialVelocity;

            const windComponentFps = windSpeed * WIND_SPEED_CONVERSION * Math.cos(windDirectionRad);
            let effectiveVelocity = initialVelocity - windComponentFps;
            if (effectiveVelocity < 0) effectiveVelocity = 0;

            const dragForce = 0.5 * airDensity * effectiveVelocity * effectiveVelocity * dragCoefficientArea;
            const dragAcceleration = -dragForce / massSlugs;

            let finalVelocity = initialVelocity + dragAcceleration * time;
            if (finalVelocity < 0) finalVelocity = 0;
            velocity = (initialVelocity + finalVelocity) / 2;

            vy -= GRAVITY * time;
            currentHeightFeet += vy * time;

            const crosswindSpeedFps = windSpeed * WIND_SPEED_CONVERSION * Math.sin(windDirectionRad);
            const windDriftFeet = crosswindSpeedFps * time;

            const spinDriftFeet = SPIN_DRIFT_CONSTANT * Math.pow(cumulativeTime + time, 2) /
                twistRateInches * Math.pow(velocity / 1000, 2) * INCHES_TO_FEET * time;

            const coriolisDriftFeet = EARTH_ANGULAR_VELOCITY * velocity *
                (cumulativeTime + time) * Math.sin(latitudeRad) * time;

            currentLateralDriftFeet += windDriftFeet + spinDriftFeet + coriolisDriftFeet;

            cumulativeTime += time;
            currentDistanceFeet += subStepFeet;
        }

        const dropInches = -currentHeightFeet * 12;
        const energy = (bulletWeight * velocity * velocity) / ENERGY_CONSTANT;
        const roundedEnergy = Math.round(energy);
        const lateralDriftInches = currentLateralDriftFeet * 12;

        results.push({
            distance: distance,
            velocity: velocity.toFixed(2),
            energy: roundedEnergy.toFixed(0),
            drop: dropInches.toFixed(2),
            lateralDrift: lateralDriftInches.toFixed(2)
        });
    }

    return results;
}

export { calculateTrajectory };