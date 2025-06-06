export function calculateTrajectory(inputs) 
{
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

    // Time of flight (simplified, assumes constant velocity for each segment)
    const time = distanceFeet / velocity;

    // Velocity decay due to drag (simplified exponential decay)
    velocity = muzzleVelocity * Math.exp(-dragFactor * distanceFeet);

    // Bullet drop due to gravity (d = 0.5 * g * t^2)
    const dropFeet = 0.5 * GRAVITY * time * time;
    const dropInches = dropFeet * 12; // Convert feet to inches

    // Kinetic energy (E = (weight * v^2) / 450395)
    const energy = (bulletWeight * velocity * velocity) / ENERGY_CONSTANT;
    const roundedEnergy = Math.round(energy); // Round to 0 decimal places

    // Wind drift (simplified: drift = wind speed * time of flight)
    const windDriftFeet = WIND_SPEED_FPS * time;
    const windDriftInches = windDriftFeet * 12; // Convert feet to inches

    results.push({
      distance: distance, // yards
      velocity: velocity.toFixed(2), // fps
      energy: roundedEnergy.toFixed(0), // ft-lbs, rounded to 0 decimal places
      drop: dropInches.toFixed(2), // inches
      windDrift: windDriftInches.toFixed(2) // inches
    });
  }

  return results;
}
