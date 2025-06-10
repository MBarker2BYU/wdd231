import { roundTo } from './utilities.mjs';

function calculateTrajectory(TrajectoryInputs)
{
    const GRAVITY = 32.174; // ft/s^2
    const YARDS_TO_FEET = 3; // 1 yard = 3 feet
    const INCHES_TO_FEET = 1 / 12;
    const WIND_SPEED_CONVERSION = 1.46667; // mph to fps
    const ENERGY_CONSTANT = 450395; // ft-lbs constant
    const SEA_LEVEL_PRESSURE = 2116.22; // lb/ft²
    const SEA_LEVEL_TEMP = 518.67; // °R (59°F)
    const LAPSE_RATE = 0.003566; // °R/ft
    const GAS_CONSTANT_DRY = 1716; // ft·lb/(slug·°R)
    const GAS_CONSTANT_VAPOR = 2763; // ft·lb/(slug·°R)
    const GRAINS_TO_SLUGS = 1.0 / (7000 * 32.174); // grains to slugs
    const GRAINS_TO_POUNDS = 1.0 / 7000; // grains to lb
    const SUB_STEP_YARDS = 0.1; // Smaller step size for precision
    const BC_AREA_CONVERSION = 175.0; // Tuned for realistic drag
    const SPIN_DRIFT_CONSTANT = 1.25; // Adjusted for inches
    const EARTH_ANGULAR_VELOCITY = 7.292e-5; // rad/s
    
    const {
        muzzleVelocity,
        ballisticCoefficient,
        bulletWeight,
        // bulletDiameter,
        windSpeed,
        windDirection,
        altitude,
        temperature,
        // pressure,
        humidity,
        latitude,
        twistRate,
        sightHeight,
        zeroRange,
        maxDistance
    } = TrajectoryInputs;

    const windDirectionRad = windDirection * (Math.PI / 180);
    const relativeHumidity = Math.min(Math.max(humidity, 0), 1);
    const sightHeightFeet = sightHeight * INCHES_TO_FEET; // Convert inches to feet
    const latitudeRad = latitude * (Math.PI / 180);

    const rankine = temperature + 459.67; // Convert Fahrenheit to Rankine
    const celsius = (temperature - 32) * 5 / 9; // Convert Fahrenheit to Celsius

    const tempRatio = 1 - (LAPSE_RATE * altitude) / SEA_LEVEL_TEMP;
    const pressureValue = SEA_LEVEL_PRESSURE * Math.pow(tempRatio, 5.255);

    // Calculate saturation vapor pressure (Magnus-Tetens, converted to lb/ft²)
    const saturationVaporPressurePa = 610.78 * Math.pow(10, 7.5 * celsius / (celsius + 237.3));
    const saturationVaporPressure = saturationVaporPressurePa * 0.020885;

    // Water vapor pressure
    const vaporPressure = relativeHumidity * saturationVaporPressure;

    // Virtual temperature
    const gasDryGasVaporRatio = GAS_CONSTANT_DRY / GAS_CONSTANT_VAPOR;
    const virtualTempInRankine = rankine / (1 - (vaporPressure / pressureValue) * (1 - gasDryGasVaporRatio));

    // Air density
    const airDensity = pressureValue / (GAS_CONSTANT_DRY * virtualTempInRankine);

    // Convert bullet weight
    const massSlugs = bulletWeight * GRAINS_TO_SLUGS;
    const massPounds = bulletWeight * GRAINS_TO_POUNDS;

    // Drag coefficient * area
    const dragCoefficientArea = massPounds / (ballisticCoefficient * BC_AREA_CONVERSION);

    const zeroDistanceFeet = zeroRange * YARDS_TO_FEET;
    const avgVelocity = (muzzleVelocity + 2714.45) / 2; // Avg velocity to 100 yards
    const timeToZero = zeroDistanceFeet / avgVelocity;
    const dropAtZero = 0.5 * GRAVITY * timeToZero * timeToZero;
    const initialVy = (dropAtZero + sightHeightFeet) / timeToZero * 0.87;

    let trajectoryResults = [];

    let velocity = muzzleVelocity;
    let vy = initialVy;
    let cumulativeTime = 0;
    let currentDistanceInFeet = 0;
    let currentHeightFeet = -sightHeightFeet;
    let currentLateralDriftFeet = 0; 

    for (let distance = 0; distance <= maxDistance; distance += 100) 
    {
        const targetDistanceInFeet = distance * YARDS_TO_FEET;
        
        while (currentDistanceInFeet < targetDistanceInFeet) 
        {
            let subStepFeet = SUB_STEP_YARDS * YARDS_TO_FEET;
        
            if (subStepFeet > targetDistanceInFeet - currentDistanceInFeet)
                subStepFeet = targetDistanceInFeet - currentDistanceInFeet; 

            // Time for sub-step using average velocity
            const initialVelocity = velocity;
            const time = subStepFeet / initialVelocity;

            // Adjust velocity for headwind/tailwind
            const windComponentFps = windSpeed * WIND_SPEED_CONVERSION * Math.cos(windDirectionRad);

            let effectiveVelocity = initialVelocity - windComponentFps;

            if (effectiveVelocity < 0) 
                    effectiveVelocity = 0;

            // Drag force
            const dragForce = 0.5 * airDensity * effectiveVelocity * effectiveVelocity * dragCoefficientArea;

            // Drag acceleration
            const dragAcceleration = -dragForce / massSlugs;

            // Update horizontal velocity
            let finalVelocity = initialVelocity + dragAcceleration * time;
            
            if (finalVelocity < 0) 
                finalVelocity = 0;
            
            velocity = (initialVelocity + finalVelocity) / 2;

            // Update vertical velocity (gravity only)
            vy -= GRAVITY * time;

            // Update height
            currentHeightFeet += vy * time;

            // Calculate wind drift (crosswind component)
            const crosswindSpeedFps = windSpeed * WIND_SPEED_CONVERSION * Math.sin(windDirectionRad);
            const windDriftFeet = crosswindSpeedFps * time;

            // Calculate spin drift
            const spinDriftFeet = SPIN_DRIFT_CONSTANT * Math.pow(cumulativeTime + time, 2) / twistRate * Math.pow(velocity / 1000, 2) * INCHES_TO_FEET * time;

            // Calculate Coriolis drift
            const coriolisDriftFeet = EARTH_ANGULAR_VELOCITY * velocity * (cumulativeTime + time) * Math.sin(latitudeRad) * time;

            // Update lateral drift
            currentLateralDriftFeet += windDriftFeet + spinDriftFeet + coriolisDriftFeet;

            cumulativeTime += time;
            currentDistanceInFeet += subStepFeet;
        }

        // Bullet drop
        const dropInches =  vy < 0 ? currentHeightFeet * 12 : -currentHeightFeet * 12;

        // Kinetic energy
        const energy = (bulletWeight * velocity * velocity) / ENERGY_CONSTANT;
        const roundedEnergy = Math.round(energy);

        // Lateral drift
        const lateralDriftInches = currentLateralDriftFeet * 12;

        trajectoryResults.push({
            distance: distance,
            velocity: roundTo(velocity),
            energy: roundedEnergy,
            drop: roundTo(dropInches),
            lateralDrift: roundTo(lateralDriftInches)
        });

    }

    return trajectoryResults;

}

export { calculateTrajectory };