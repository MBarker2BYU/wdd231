import { roundTo } from './utilities.mjs';

/**
 * Calculate bullet trajectory
 * @param {Object} inputs - Trajectory inputs
 * @returns {Array} - Trajectory data points
 */
function calculateTrajectory({
    muzzleVelocity,
    ballisticCoefficient,
    bulletWeight,
    windSpeed,
    windDirection,
    altitude,
    temperature,
    humidity,
    latitude,
    twistRate,
    sightHeight,
    zeroRange,
    maxDistance
}) {
    const CONSTANTS = {
        GRAVITY: 32.174,
        YARDS_TO_FEET: 3,
        INCHES_TO_FEET: 1 / 12,
        WIND_SPEED_CONVERSION: 1.46667,
        ENERGY_CONSTANT: 450395,
        SEA_LEVEL_PRESSURE: 2116.22,
        SEA_LEVEL_TEMP: 518.67,
        LAPSE_RATE: 0.003566,
        GAS_CONSTANT_DRY: 1716,
        GAS_CONSTANT_VAPOR: 2763,
        GRAINS_TO_SLUGS: 1 / (7000 * 32.174),
        GRAINS_TO_POUNDS: 1 / 7000,
        SUB_STEP_YARDS: 0.1,
        BC_AREA_CONVERSION: 175.0,
        SPIN_DRIFT_CONSTANT: 1.25,
        EARTH_ANGULAR_VELOCITY: 7.292e-5
    };

    try {

        const windDirectionRad = windDirection * (Math.PI / 180);
        const relativeHumidity = Math.min(Math.max(humidity, 0), 1);
        const sightHeightFeet = sightHeight * CONSTANTS.INCHES_TO_FEET;
        const latitudeRad = latitude * (Math.PI / 180);
        const rankine = temperature + 459.67;
        const celsius = (temperature - 32) * 5 / 9;

        const tempRatio = 1 - (CONSTANTS.LAPSE_RATE * altitude) / CONSTANTS.SEA_LEVEL_TEMP;
        const pressure = CONSTANTS.SEA_LEVEL_PRESSURE * tempRatio ** 5.255;
        const saturationVaporPressure = 610.78 * 10 ** (7.5 * celsius / (celsius + 237.3)) * 0.020885;
        const vaporPressure = relativeHumidity * saturationVaporPressure;
        const virtualTemp = rankine / (1 - (vaporPressure / pressure) * (1 - CONSTANTS.GAS_CONSTANT_DRY / CONSTANTS.GAS_CONSTANT_VAPOR));
        const airDensity = pressure / (CONSTANTS.GAS_CONSTANT_DRY * virtualTemp);

        const massSlugs = bulletWeight * CONSTANTS.GRAINS_TO_SLUGS;
        const massPounds = bulletWeight * CONSTANTS.GRAINS_TO_POUNDS;
        const dragCoefficientArea = massPounds / (ballisticCoefficient * CONSTANTS.BC_AREA_CONVERSION);

        const zeroDistanceFeet = zeroRange * CONSTANTS.YARDS_TO_FEET;
        const avgVelocity = (muzzleVelocity + 2714.45) / 2;
        const timeToZero = zeroDistanceFeet / avgVelocity;
        const dropAtZero = 0.5 * CONSTANTS.GRAVITY * timeToZero ** 2;
        const initialVy = (dropAtZero + sightHeightFeet) / timeToZero * 0.87;

        let trajectory = [];
        let velocity = muzzleVelocity;
        let vy = initialVy;
        let time = 0;
        let distanceFeet = 0;
        let heightFeet = -sightHeightFeet;
        let lateralDriftFeet = 0;

        for (let distance = 0; distance <= maxDistance; distance += 100) {
            const targetDistanceFeet = distance * CONSTANTS.YARDS_TO_FEET;
            while (distanceFeet < targetDistanceFeet) {
                const subStepFeet = Math.min(CONSTANTS.SUB_STEP_YARDS * CONSTANTS.YARDS_TO_FEET, targetDistanceFeet - distanceFeet);
                const initialVelocity = velocity;
                const stepTime = subStepFeet / initialVelocity;
                const windComponentFps = windSpeed * CONSTANTS.WIND_SPEED_CONVERSION * Math.cos(windDirectionRad);
                let effectiveVelocity = Math.max(initialVelocity - windComponentFps, 0);
                const dragForce = 0.5 * airDensity * effectiveVelocity ** 2 * dragCoefficientArea;
                const dragAcceleration = -dragForce / massSlugs;
                const finalVelocity = Math.max(initialVelocity + dragAcceleration * stepTime, 0);
                velocity = (initialVelocity + finalVelocity) / 2;
                vy -= CONSTANTS.GRAVITY * stepTime;
                heightFeet += vy * stepTime;

                const crosswindSpeedFps = windSpeed * CONSTANTS.WIND_SPEED_CONVERSION * Math.sin(windDirectionRad);
                const windDriftFeet = crosswindSpeedFps * stepTime;
                const spinDriftFeet = CONSTANTS.SPIN_DRIFT_CONSTANT * (time + stepTime) ** 2 / twistRate * (velocity / 1000) ** 2 * CONSTANTS.INCHES_TO_FEET * stepTime;
                const coriolisDriftFeet = CONSTANTS.EARTH_ANGULAR_VELOCITY * velocity * (time + stepTime) * Math.sin(latitudeRad) * stepTime;
                lateralDriftFeet += windDriftFeet + spinDriftFeet + coriolisDriftFeet;

                time += stepTime;
                distanceFeet += subStepFeet;
            }

            const dropInches = vy < 0 ? heightFeet * 12 : -heightFeet * 12;
            const energy = bulletWeight * velocity ** 2 / CONSTANTS.ENERGY_CONSTANT;

            trajectory.push({
                distance,
                velocity: roundTo(velocity),
                energy: Math.round(energy),
                drop: roundTo(dropInches),
                lateralDrift: roundTo(lateralDriftFeet * 12)
            });
        }

        return trajectory;
    }
    catch (error) {
        console.error('Error calculating trajectory:', error);
        return [];
    }
}

export { calculateTrajectory };