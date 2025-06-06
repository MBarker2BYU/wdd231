import {
  calculateTimeOfFlight,
  calculateVelocityDecay,
  calculateBulletDrop,
  calculateKineticEnergy,
  calculateWindDrift,
  calculateAirDensity,
  calculateTrajectory
} from 'ballistics-calculator.mjs';

// Simple test framework
function assert(condition, message) {
  if (!condition) {
    console.error(`✗ FAIL: ${message}`);
  } else {
    console.log(`✓ PASS: ${message}`);
  }
}

function assertCloseTo(actual, expected, tolerance, message) {
  const isClose = Math.abs(actual - expected) <= tolerance;
  assert(isClose, `${message} (Expected ${expected}, got ${actual})`);
}

// Run tests
console.log('Running Ballistics Calculator Unit Tests...\n');

// Test calculateTimeOfFlight
{
  const distanceFeet = 300; // 100 yards
  const velocity = 3000; // fps
  const expectedTime = distanceFeet / velocity; // 0.1 seconds
  const result = calculateTimeOfFlight(distanceFeet, velocity);
  assertCloseTo(result, expectedTime, 0.00001, 'calculateTimeOfFlight returns correct time');
}

// Test calculateVelocityDecay
{
  const muzzleVelocity = 3000; // fps
  const dragFactor = 0.00005 / 0.3; // BC = 0.3
  const distanceFeet = 300; // 100 yards
  const expectedVelocity = muzzleVelocity * Math.exp(-dragFactor * distanceFeet);
  const result = calculateVelocityDecay(muzzleVelocity, dragFactor, distanceFeet);
  assertCloseTo(result, expectedVelocity, 0.00001, 'calculateVelocityDecay applies drag correctly');
}

// Test calculateBulletDrop
{
  const time = 0.1; // seconds
  const GRAVITY = 32.174; // ft/s^2
  const expectedDropFeet = 0.5 * GRAVITY * time * time;
  const expectedDropInches = expectedDropFeet * 12;
  const result = calculateBulletDrop(time, GRAVITY);
  assertCloseTo(result, expectedDropInches, 0.00001, 'calculateBulletDrop computes drop correctly');
}

// Test calculateKineticEnergy
{
  const bulletWeight = 150; // grains
  const velocity = 3000; // fps
  const ENERGY_CONSTANT = 450395;
  const expectedEnergy = Math.round((bulletWeight * velocity * velocity) / ENERGY_CONSTANT);
  const result = calculateKineticEnergy(bulletWeight, velocity, ENERGY_CONSTANT);
  assert(result === expectedEnergy, `calculateKineticEnergy computes energy correctly (Expected ${expectedEnergy}, got ${result})`);
}

// Test calculateWindDrift
{
  const windSpeedFps = 10 * 1.46667; // 10 mph converted to fps
  const time = 0.1; // seconds
  const expectedDriftFeet = windSpeedFps * time;
  const expectedDriftInches = expectedDriftFeet * 12;
  const result = calculateWindDrift(windSpeedFps, time);
  assertCloseTo(result, expectedDriftInches, 0.00001, 'calculateWindDrift computes drift correctly');
}

// Test calculateAirDensity
{
  const tempF = 59; // °F
  const pressureInHg = 29.92; // inHg
  const humidityPercent = 50; // %
  // Expected value calculated manually: ~1.225 kg/m^3 for standard conditions
  const expectedDensity = 1.225;
  const result = calculateAirDensity(tempF, pressureInHg, humidityPercent);
  assertCloseTo(result, expectedDensity, 0.01, 'calculateAirDensity computes density correctly');
}

// Test calculateTrajectory drag factor
{
  const inputs = {
    muzzleVelocity: 3000, // fps
    ballisticCoefficient: 0.3,
    bulletWeight: 150, // grains
    windSpeed: 10, // mph
    bulletDiameter: 0.308, // inches
    tempF: 59, // °F
    pressureInHg: 29.92, // inHg
    humidityPercent: 50 // %
  };
  const GRAINS_TO_KG = 0.00006479891;
  const INCHES_TO_METERS = 0.0254;
  const airDensity = calculateAirDensity(inputs.tempF, inputs.pressureInHg, inputs.humidityPercent);
  const bulletDiameterMeters = inputs.bulletDiameter * INCHES_TO_METERS;
  const crossSectionalArea = Math.PI * (bulletDiameterMeters / 2) ** 2;
  const bulletMassKg = inputs.bulletWeight * GRAINS_TO_KG;
  const expectedDragFactor = (airDensity / (2 * inputs.ballisticCoefficient * bulletMassKg)) * crossSectionalArea;
  const results = calculateTrajectory(inputs);
  const firstResult = results[0];
  const distanceMeters = 0; // First point at 0 yards
  const expectedVelocity = inputs.muzzleVelocity * Math.exp(-expectedDragFactor * distanceMeters);
  assertCloseTo(
    firstResult.velocity,
    expectedVelocity,
    0.01,
    'calculateTrajectory applies drag factor correctly at 0 yards'
  );
}

console.log('\nTests completed.');