export function calculateTrajectory(inputs) {
  const { muzzleVelocity, ballisticCoefficient, bulletWeight, windSpeed } = inputs;

  // Constants
  const GRAVITY = 32.174; // ft/s^2
  const YARDS_TO_FEET = 3; // 1 yard = 3 feet
  const WIND_SPEED_FPS = windSpeed * 1.46667; // Convert mph to fps (1 mph = 1.46667 fps)
  const ENERGY_CONSTANT = 450395; // Updated ballistics energy constant for ft-lbs

  // Simplified drag factor
  const dragFactor = 0.00005 / ballisticCoefficient;

  // Calculate trajectory at 100-yard intervals up to 500 yards
  const results = [];
  let velocity = muzzleVelocity; // Initial velocity in fps
  for (let distance = 0; distance <= 500; distance += 100) {
    const distanceFeet = distance * YARDS_TO_FEET; // Convert yards to feet

    // Calculate time of flight
    const time = calculateTimeOfFlight(distanceFeet, velocity);

    // Calculate velocity decay
    velocity = calculateVelocityDecay(muzzleVelocity, dragFactor, distanceFeet);

    // Calculate bullet drop
    const dropInches = calculateBulletDrop(time, GRAVITY);

    // Calculate kinetic energy
    const energy = calculateKineticEnergy(bulletWeight, velocity, ENERGY_CONSTANT);

    // Calculate wind drift
    const windDriftInches = calculateWindDrift(WIND_SPEED_FPS, time);

    results.push({
      distance: distance, // yards
      velocity: velocity.toFixed(2), // fps
      energy: energy.toFixed(0), // ft-lbs, rounded to 0 decimal places
      drop: dropInches.toFixed(2), // inches
      windDrift: windDriftInches.toFixed(2) // inches
    });
  }

  return results;
}

// Calculate time of flight (simplified, assumes constant velocity for each segment)
function calculateTimeOfFlight(distanceFeet, velocity) {
  return distanceFeet / velocity;
}

// Calculate velocity decay due to drag (simplified exponential decay)
function calculateVelocityDecay(muzzleVelocity, dragFactor, distanceFeet) {
  return muzzleVelocity * Math.exp(-dragFactor * distanceFeet);
}

// Calculate bullet drop due to gravity (d = 0.5 * g * t^2)
function calculateBulletDrop(time, gravity) {
  const dropFeet = 0.5 * gravity * time * time;
  return dropFeet * 12; // Convert feet to inches
}

// Calculate kinetic energy (E = (weight * v^2) / energyConstant)
function calculateKineticEnergy(bulletWeight, velocity, energyConstant) {
  const energy = (bulletWeight * velocity * velocity) / energyConstant;
  return Math.round(energy); // Round to 0 decimal places
}

// Calculate wind drift (simplified: drift = wind speed * time of flight)
function calculateWindDrift(windSpeedFps, time) {
  const windDriftFeet = windSpeedFps * time;
  return windDriftFeet * 12; // Convert feet to inches
}

// Calculate air density (kg/m^3) given temperature (°F), pressure (inHg), and relative humidity (%)
export function calculateAirDensity(tempF, pressureInHg, humidityPercent) {
    /**
     * Calculate air density (kg/m^3) given temperature (°F), pressure (inHg), and relative humidity (%).
     * 
     * @param {number} tempF - Temperature in Fahrenheit
     * @param {number} pressureInHg - Atmospheric pressure in inches of mercury
     * @param {number} humidityPercent - Relative humidity as a percentage (0-100)
     * @returns {number} Air density in kg/m^3
     */
    
    // Constants
    const RD = 287.05;  // Gas constant for dry air (J/(kg·K))
    const RV = 461.495; // Gas constant for water vapor (J/(kg·K))
    
    // Convert inputs
    const tempC = (tempF - 32) * 5 / 9; // °F to °C
    const tempK = tempC + 273.15;       // °C to K
    const pressurePa = pressureInHg * 3386.39; // inHg to Pa
    const humidity = humidityPercent / 100.0;  // Percentage to decimal
    
    // Calculate saturation vapor pressure using Tetens formula
    const satVaporPressure = 610.78 * Math.pow(10, (7.5 * tempC) / (237.3 + tempC)); // Pa
    
    // Actual vapor pressure
    const vaporPressure = humidity * satVaporPressure;
    
    // Dry air partial pressure
    const dryPressure = pressurePa - vaporPressure;
    
    // Air density: ρ = (Pd / (Rd * T)) + (Pv / (Rv * T))
    const density = (dryPressure / (RD * tempK)) + (vaporPressure / (RV * tempK));
    
    return density;
}

// Self-check function to run tests
export async function runSelfCheck() {
  try {
    // Dynamically import the test module
    await import('./testBallistics-calculator.js');
    console.log('Self-check completed: All tests executed.');
  } catch (error) {
    console.error('Self-check failed:', error.message);
  }
}