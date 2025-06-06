// Calculate air density based on temperature, pressure, and humidity
function calculateAirDensity(temperatureFahrenheit, pressureInchesHg, humidityPercent) {
    // Constants for calculations
    const dryAirGasConstant = 287.05;  // J/(kg·K) for dry air
    const waterVaporGasConstant = 461.495; // J/(kg·K) for water vapor

    // Convert temperature to Celsius and Kelvin
    const temperatureCelsius = (temperatureFahrenheit - 32) * 5 / 9;
    const temperatureKelvin = temperatureCelsius + 273.15;

    // Convert pressure to Pascals
    const pressurePascals = pressureInchesHg * 3386.39;

    // Convert humidity to a fraction (e.g., 70% becomes 0.7)
    const humidityFraction = humidityPercent / 100;

    // Calculate maximum possible water vapor pressure using Tetens formula
    const maxVaporPressure = 610.78 * Math.pow(10, (7.5 * temperatureCelsius) / (237.3 + temperatureCelsius));

    // Calculate actual water vapor pressure based on humidity
    const actualVaporPressure = humidityFraction * maxVaporPressure;

    // Calculate pressure of dry air
    const dryAirPressure = pressurePascals - actualVaporPressure;

    // Calculate air density using contributions from dry air and water vapor
    const airDensity = (dryAirPressure / (dryAirGasConstant * temperatureKelvin)) +
                      (actualVaporPressure / (waterVaporGasConstant * temperatureKelvin));

    return airDensity;
}

// Set up initial parameters for the bullet simulation
function initializeParameters(inputData) {
    // Conversion factors to switch from U.S. to metric units
    const conversions = {
        grainsToKilograms: 0.0000648, // 1 grain = 0.0000648 kg
        feetPerSecondToMetersPerSecond: 0.3048, // 1 fps = 0.3048 m/s
        milesPerHourToMetersPerSecond: 0.44704, // 1 mph = 0.44704 m/s
        inchesToMeters: 0.0254, // 1 inch = 0.0254 m
        yardsToMeters: 0.9144, // 1 yard = 0.9144 m
        degreesToRadians: Math.PI / 180, // Convert degrees to radians
        fahrenheitToCelsius: (tempF) => (tempF - 32) * 5 / 9, // °F to °C
        inchesHgToPascals: 3386.39 // 1 inHg = 3386.39 Pa
    };

    // Convert U.S. units to metric units for calculations
    const params = {
        // Bullet properties
        bulletMass: inputData.bulletWeight * conversions.grainsToKilograms, // Mass in kg
        initialVelocity: inputData.muzzleVelocity * conversions.feetPerSecondToMetersPerSecond, // Velocity in m/s
        bulletCrossSectionArea: Math.PI * Math.pow((inputData.bulletDiameter * conversions.inchesToMeters) / 2, 2), // Area in m^2
        dragCoefficient: inputData.ballisticCoefficient, // Drag coefficient (no units)
        // Environment
        temperatureCelsius: conversions.fahrenheitToCelsius(inputData.temperature), // Temperature in °C
        pressurePascals: inputData.pressure * conversions.inchesHgToPascals, // Pressure in Pa
        humidityFraction: inputData.humidity / 100, // Humidity as a fraction
        windEast: inputData.windSpeed * conversions.milesPerHourToMetersPerSecond * Math.sin(inputData.windDirection * conversions.degreesToRadians), // Wind speed east (m/s)
        windNorth: inputData.windSpeed * conversions.milesPerHourToMetersPerSecond * Math.cos(inputData.windDirection * conversions.degreesToRadians), // Wind speed north (m/s)
        gravity: 9.81, // Gravity in m/s^2
        // Earth's rotation effects
        earthRotationSpeed: 7.292e-5, // Earth's angular velocity in rad/s
        latitudeRadians: inputData.latitude * conversions.degreesToRadians, // Latitude in radians
        // Bullet spin effects
        bulletRadius: (inputData.bulletDiameter * conversions.inchesToMeters) / 2, // Radius in m
        riflingTwistLength: inputData.twistLength * conversions.inchesToMeters, // Twist length in m
        // Simulation settings
        timeStep: 0.01, // Time step in seconds (hardcoded as per original)
        maxTime: 1, // Maximum simulation time in seconds (hardcoded as per original)
        sightHeight: inputData.sightHeight * conversions.inchesToMeters, // Sight height in m
        // Output settings
        maxDistanceYards: inputData.maxDistance, // Max distance in yards
        minDropInches: -50, // Max drop in inches (hardcoded as per original)
        zeroRangeYards: inputData.zeroRange, // Zero range in yards
        metersToYards: 1 / conversions.yardsToMeters, // Convert meters to yards
        metersToInches: 1 / conversions.inchesToMeters // Convert meters to inches
    };

    // Calculate air density using the provided function
    params.airDensity = calculateAirDensity(
        inputData.temperature,
        inputData.pressure,
        inputData.humidity
    );

    // Calculate additional parameters
    params.earthRotationNorth = params.earthRotationSpeed * Math.cos(params.latitudeRadians);
    params.earthRotationVertical = params.earthRotationSpeed * Math.sin(params.latitudeRadians);
    params.bulletSpinRate = (2 * Math.PI * params.initialVelocity) / params.riflingTwistLength; // Spin rate in rad/s
    params.magnusCoefficient = params.airDensity * Math.PI * Math.pow(params.bulletRadius, 3); // For Magnus effect

    return params;
}

// Adjust the bullet's launch angle to hit the target at a specific distance
function zeroTrajectory(params) {
    let launchAngle = 0; // Angle in radians
    let isZeroed = false;
    let angleGuess = 0.001; // Start with a small angle (radians)
    const angleAdjustment = 0.00001; // Small step to adjust angle

    while (!isZeroed) {
        // Set initial bullet position and velocity
        let bulletState = {
            distance: 0, // Distance traveled (m)
            height: params.sightHeight, // Height above ground (m)
            sideDrift: 0, // Sideways drift (m)
            velocityForward: params.initialVelocity * Math.cos(angleGuess), // Forward velocity (m/s)
            velocityUp: params.initialVelocity * Math.sin(angleGuess), // Upward velocity (m/s)
            velocitySide: 0 // Sideways velocity (m/s)
        };

        // Simulate until the bullet reaches the zero range
        while (bulletState.distance * params.metersToYards < params.zeroRangeYards) {
            bulletState = advanceSimulationStep(bulletState, params);
        }

        // Check if the bullet's height is close to zero at the target distance
        const heightAtTarget = bulletState.height * params.metersToInches;
        if (Math.abs(heightAtTarget) < 0.1) { // If within 0.1 inches
            launchAngle = angleGuess;
            isZeroed = true;
        } else {
            // Adjust angle: decrease if too high, increase if too low
            angleGuess += angleAdjustment * (heightAtTarget > 0 ? -1 : 1);
        }
    }

    return launchAngle;
}

// Simulate the bullet's full path
function simulateTrajectory(launchAngle, params) {
    const totalSteps = Math.floor(params.maxTime / params.timeStep);
    const trajectory = {
        distances: new Array(totalSteps).fill(0), // Distance in yards
        heights: new Array(totalSteps).fill(0), // Height in inches
        sideDrifts: new Array(totalSteps).fill(0), // Side drift in inches
        windDrifts: new Array(totalSteps).fill(0), // Wind-only drift in inches
        coriolisDrifts: new Array(totalSteps).fill(0), // Coriolis-only drift in inches
        currentStep: 0 // Current step in simulation
    };

    // Initialize bullet state
    let bulletState = {
        distance: 0,
        height: params.sightHeight,
        sideDrift: 0,
        velocityForward: params.initialVelocity * Math.cos(launchAngle),
        velocityUp: params.initialVelocity * Math.sin(launchAngle),
        velocitySide: 0
    };

    let windDrift = 0; // Track wind effect separately
    let coriolisDrift = 0; // Track Coriolis effect separately

    // Simulate until time runs out, distance is reached, or steps are used
    for (let time = 0; time < params.maxTime && bulletState.distance * params.metersToYards <= params.maxDistanceYards && trajectory.currentStep < totalSteps; time += params.timeStep) {
        // Store current position
        trajectory.distances[trajectory.currentStep] = bulletState.distance * params.metersToYards;
        trajectory.heights[trajectory.currentStep] = bulletState.height * params.metersToInches;
        trajectory.sideDrifts[trajectory.currentStep] = bulletState.sideDrift * params.metersToInches;
        trajectory.windDrifts[trajectory.currentStep] = windDrift * params.metersToInches;
        trajectory.coriolisDrifts[trajectory.currentStep] = coriolisDrift * params.metersToInches;

        // Update wind and Coriolis drifts
        windDrift += params.windEast * params.timeStep;
        const sideVelocityCoriolis = -2 * (-params.earthRotationNorth * bulletState.velocityForward);
        coriolisDrift += sideVelocityCoriolis * params.timeStep;

        // Advance the simulation
        bulletState = advanceSimulationStep(bulletState, params);
        trajectory.currentStep++;
    }

    return trajectory;
}

// Advance the bullet's position using the RK4 method
function advanceSimulationStep(bulletState, params) {
    // Calculate derivatives at four points (RK4 method)
    const k1 = calculateDerivatives(bulletState, params);
    const state2 = {};
    Object.keys(bulletState).forEach((key, i) => {
        state2[key] = bulletState[key] + 0.5 * params.timeStep * k1[i];
    });
    const k2 = calculateDerivatives(state2, params);

    const state3 = {};
    Object.keys(bulletState).forEach((key, i) => {
        state3[key] = bulletState[key] + 0.5 * params.timeStep * k2[i];
    });
    const k3 = calculateDerivatives(state3, params);

    const state4 = {};
    Object.keys(bulletState).forEach((key, i) => {
        state4[key] = bulletState[key] + params.timeStep * k3[i];
    });
    const k4 = calculateDerivatives(state4, params);

    // Update state using weighted average of derivatives
    const newState = {};
    Object.keys(bulletState).forEach((key, i) => {
        newState[key] = bulletState[key] + (params.timeStep / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
    });

    return newState;
}

// Calculate how the bullet's position and velocity change
function calculateDerivatives(bulletState, params) {
    const { distance, height, sideDrift, velocityForward, velocityUp, velocitySide } = bulletState;

    // Calculate relative velocity (accounting for wind)
    const relativeVelocityEast = velocityForward - params.windEast;
    const relativeVelocityNorth = velocityUp - params.windNorth;
    const relativeSpeed = Math.sqrt(relativeVelocityEast * relativeVelocityEast + relativeVelocityNorth * relativeVelocityNorth);

    // Initialize accelerations
    let accelerationForward = 0;
    let accelerationUp = -params.gravity;

    // Apply drag force if moving
    if (relativeSpeed > 0) {
        accelerationForward = -(params.airDensity * params.dragCoefficient * params.bulletCrossSectionArea / (2 * params.bulletMass)) * relativeSpeed * relativeVelocityEast;
        accelerationUp -= (params.airDensity * params.dragCoefficient * params.bulletCrossSectionArea / (2 * params.bulletMass)) * relativeSpeed * relativeVelocityNorth;
    }

    // Apply Coriolis effect
    const coriolisAccelerationForward = -2 * (params.earthRotationNorth * velocitySide - params.earthRotationVertical * velocityUp);
    const coriolisAccelerationUp = 2 * (params.earthRotationVertical * velocityForward);
    const coriolisAccelerationSide = -2 * (-params.earthRotationNorth * velocityForward);

    accelerationForward += coriolisAccelerationForward;
    accelerationUp += coriolisAccelerationUp;

    // Apply Magnus effect (due to bullet spin)
    const magnusForce = params.magnusCoefficient * params.bulletSpinRate * relativeVelocityNorth;
    const magnusAccelerationUp = magnusForce / params.bulletMass;
    const magnusAccelerationSide = -params.magnusCoefficient * params.bulletSpinRate * relativeVelocityEast / params.bulletMass;

    accelerationUp += magnusAccelerationUp;

    // Return velocities and accelerations
    return [
        velocityForward, // dx/dt
        velocityUp,      // dy/dt
        velocitySide,    // dz/dt
        accelerationForward, // dvx/dt
        accelerationUp,      // dvy/dt
        coriolisAccelerationSide + magnusAccelerationSide // dvz/dt
    ];
}

// Main function to calculate the bullet's path
function calculateTrajectoryPath(inputData) {
    // Initialize parameters
    const params = initializeParameters(inputData);

    // Find the launch angle to hit the target at the zero range
    const launchAngle = zeroTrajectory(params);

    // Simulate the full trajectory
    const trajectory = simulateTrajectory(launchAngle, params);

    return trajectory;
    //return null;
}

export { calculateTrajectoryPath };
