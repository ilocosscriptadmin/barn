import type { BuildingDimensions, RoomConstraints, WallFeature } from '../types';

/**
 * Standard room constraints for residential/commercial buildings
 */
export const STANDARD_ROOM_CONSTRAINTS: RoomConstraints = {
  minimumWallHeight: 8.0, // 8 feet minimum height
  minimumWallLength: 20.0, // 20 feet minimum length
  minimumWallWidth: 20.0, // 20 feet minimum width
  standardDoorHeight: 7.0, // 7 feet standard door height
  standardWindowHeight: 4.0, // 4 feet standard window height
  structuralClearance: 1.0, // 1 foot clearance above features
};

/**
 * Validates room dimensions against minimum requirements
 */
export const validateRoomDimensions = (
  dimensions: BuildingDimensions,
  constraints: RoomConstraints = STANDARD_ROOM_CONSTRAINTS
): {
  valid: boolean;
  errors: string[];
  warnings: string[];
  adjustedDimensions?: BuildingDimensions;
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let adjustedDimensions: BuildingDimensions | undefined;

  console.log(`\n🏠 ROOM DIMENSION VALIDATION`);
  console.log(`Proposed: ${dimensions.width}ft × ${dimensions.length}ft × ${dimensions.height}ft`);
  console.log(`Minimums: ${constraints.minimumWallWidth}ft × ${constraints.minimumWallLength}ft × ${constraints.minimumWallHeight}ft`);

  let needsAdjustment = false;
  const adjusted = { ...dimensions };

  // Validate width
  if (dimensions.width < constraints.minimumWallWidth) {
    const shortfall = constraints.minimumWallWidth - dimensions.width;
    errors.push(`Room width (${dimensions.width}ft) is ${shortfall.toFixed(1)}ft below minimum requirement (${constraints.minimumWallWidth}ft)`);
    adjusted.width = constraints.minimumWallWidth;
    needsAdjustment = true;
    console.log(`❌ Width too small: ${dimensions.width}ft < ${constraints.minimumWallWidth}ft`);
  }

  // Validate length
  if (dimensions.length < constraints.minimumWallLength) {
    const shortfall = constraints.minimumWallLength - dimensions.length;
    errors.push(`Room length (${dimensions.length}ft) is ${shortfall.toFixed(1)}ft below minimum requirement (${constraints.minimumWallLength}ft)`);
    adjusted.length = constraints.minimumWallLength;
    needsAdjustment = true;
    console.log(`❌ Length too small: ${dimensions.length}ft < ${constraints.minimumWallLength}ft`);
  }

  // Validate height
  if (dimensions.height < constraints.minimumWallHeight) {
    const shortfall = constraints.minimumWallHeight - dimensions.height;
    errors.push(`Room height (${dimensions.height}ft) is ${shortfall.toFixed(1)}ft below minimum requirement (${constraints.minimumWallHeight}ft)`);
    adjusted.height = constraints.minimumWallHeight;
    needsAdjustment = true;
    console.log(`❌ Height too small: ${dimensions.height}ft < ${constraints.minimumWallHeight}ft`);
  }

  // Warnings for dimensions close to minimums
  const warningThreshold = 2.0; // 2 foot buffer for 20ft minimums

  if (dimensions.width >= constraints.minimumWallWidth && 
      dimensions.width < constraints.minimumWallWidth + warningThreshold) {
    warnings.push(`Room width (${dimensions.width}ft) is close to minimum - consider increasing for comfort`);
  }

  if (dimensions.length >= constraints.minimumWallLength && 
      dimensions.length < constraints.minimumWallLength + warningThreshold) {
    warnings.push(`Room length (${dimensions.length}ft) is close to minimum - consider increasing for comfort`);
  }

  if (dimensions.height >= constraints.minimumWallHeight && 
      dimensions.height < constraints.minimumWallHeight + warningThreshold) {
    warnings.push(`Room height (${dimensions.height}ft) is close to minimum - consider increasing for comfort`);
  }

  if (needsAdjustment) {
    adjustedDimensions = adjusted;
    console.log(`📏 Suggested adjustments: ${adjusted.width}ft × ${adjusted.length}ft × ${adjusted.height}ft`);
  }

  const isValid = errors.length === 0;
  console.log(`Validation result: ${isValid ? '✅ VALID' : '❌ INVALID'} (${errors.length} errors, ${warnings.length} warnings)`);

  return {
    valid: isValid,
    errors,
    warnings,
    adjustedDimensions
  };
};

/**
 * Validates that features can fit within room constraints
 */
export const validateFeaturesWithinRoom = (
  features: WallFeature[],
  dimensions: BuildingDimensions,
  constraints: RoomConstraints = STANDARD_ROOM_CONSTRAINTS
): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  console.log(`\n🚪 FEATURE-ROOM COMPATIBILITY VALIDATION`);
  console.log(`Room: ${dimensions.width}ft × ${dimensions.length}ft × ${dimensions.height}ft`);
  console.log(`Features to validate: ${features.length}`);

  features.forEach((feature, index) => {
    console.log(`\n--- Feature ${index + 1}: ${feature.type} (${feature.width}ft × ${feature.height}ft) ---`);

    // Get wall dimensions for this feature's wall
    let wallWidth: number;
    let wallHeight = dimensions.height;

    switch (feature.position.wallPosition) {
      case 'front':
      case 'back':
        wallWidth = dimensions.width;
        break;
      case 'left':
      case 'right':
        wallWidth = dimensions.length;
        break;
      default:
        wallWidth = dimensions.width;
    }

    console.log(`Wall dimensions: ${wallWidth}ft × ${wallHeight}ft`);

    // Validate feature fits within wall
    if (feature.width > wallWidth) {
      errors.push(`${feature.type} width (${feature.width}ft) exceeds ${feature.position.wallPosition} wall width (${wallWidth}ft)`);
      console.log(`❌ Feature too wide for wall`);
    }

    if (feature.height > wallHeight) {
      errors.push(`${feature.type} height (${feature.height}ft) exceeds wall height (${wallHeight}ft)`);
      console.log(`❌ Feature too tall for wall`);
    }

    // Validate feature height against standard requirements
    if (feature.type === 'door' || feature.type === 'walkDoor' || feature.type === 'rollupDoor') {
      if (feature.height < constraints.standardDoorHeight - 0.5) {
        warnings.push(`${feature.type} height (${feature.height}ft) is below standard door height (${constraints.standardDoorHeight}ft)`);
      }

      // Check clearance above door
      const requiredClearance = feature.height + constraints.structuralClearance;
      if (requiredClearance > wallHeight) {
        errors.push(`${feature.type} requires ${requiredClearance.toFixed(1)}ft total height (${feature.height}ft + ${constraints.structuralClearance}ft clearance) but wall is only ${wallHeight}ft`);
      }
    }

    if (feature.type === 'window') {
      if (feature.height < constraints.standardWindowHeight - 1.0) {
        warnings.push(`Window height (${feature.height}ft) is below standard window height (${constraints.standardWindowHeight}ft)`);
      }
    }

    // Validate positioning
    const featureTop = feature.position.yOffset + feature.height;
    if (featureTop > wallHeight) {
      errors.push(`${feature.type} extends beyond wall top (position: ${feature.position.yOffset}ft + height: ${feature.height}ft = ${featureTop}ft > ${wallHeight}ft)`);
    }

    if (feature.position.yOffset < 0) {
      errors.push(`${feature.type} position (${feature.position.yOffset}ft) is below ground level`);
    }

    console.log(`Feature validation: ${errors.length === 0 ? '✅ OK' : '❌ Issues found'}`);
  });

  const isValid = errors.length === 0;
  console.log(`\nOverall feature validation: ${isValid ? '✅ VALID' : '❌ INVALID'} (${errors.length} errors, ${warnings.length} warnings)`);

  return {
    valid: isValid,
    errors,
    warnings
  };
};

/**
 * Suggests optimal room dimensions based on intended use
 */
export const suggestOptimalRoomDimensions = (
  intendedUse: 'residential' | 'commercial' | 'storage' | 'workshop',
  features: WallFeature[] = [],
  constraints: RoomConstraints = STANDARD_ROOM_CONSTRAINTS
): BuildingDimensions => {
  console.log(`\n🏗️ SUGGESTING OPTIMAL ROOM DIMENSIONS for ${intendedUse}`);

  let baseWidth = constraints.minimumWallWidth;
  let baseLength = constraints.minimumWallLength;
  let baseHeight = constraints.minimumWallHeight;

  // Adjust base dimensions based on intended use
  switch (intendedUse) {
    case 'residential':
      baseWidth = Math.max(22, constraints.minimumWallWidth);
      baseLength = Math.max(24, constraints.minimumWallLength);
      baseHeight = Math.max(9, constraints.minimumWallHeight);
      break;
    case 'commercial':
      baseWidth = Math.max(26, constraints.minimumWallWidth);
      baseLength = Math.max(30, constraints.minimumWallLength);
      baseHeight = Math.max(10, constraints.minimumWallHeight);
      break;
    case 'storage':
      baseWidth = Math.max(24, constraints.minimumWallWidth);
      baseLength = Math.max(26, constraints.minimumWallLength);
      baseHeight = Math.max(10, constraints.minimumWallHeight);
      break;
    case 'workshop':
      baseWidth = Math.max(28, constraints.minimumWallWidth);
      baseLength = Math.max(34, constraints.minimumWallLength);
      baseHeight = Math.max(12, constraints.minimumWallHeight);
      break;
  }

  // Adjust for features
  if (features.length > 0) {
    const maxFeatureHeight = Math.max(...features.map(f => f.height + f.position.yOffset));
    if (maxFeatureHeight + constraints.structuralClearance > baseHeight) {
      baseHeight = maxFeatureHeight + constraints.structuralClearance;
    }

    // Add space for multiple features on same wall
    const frontFeatures = features.filter(f => f.position.wallPosition === 'front');
    const backFeatures = features.filter(f => f.position.wallPosition === 'back');
    const leftFeatures = features.filter(f => f.position.wallPosition === 'left');
    const rightFeatures = features.filter(f => f.position.wallPosition === 'right');

    if (frontFeatures.length > 1 || backFeatures.length > 1) {
      const totalFrontWidth = frontFeatures.reduce((sum, f) => sum + f.width, 0);
      const totalBackWidth = backFeatures.reduce((sum, f) => sum + f.width, 0);
      const maxRequiredWidth = Math.max(totalFrontWidth, totalBackWidth) + 6; // 6ft spacing for larger rooms
      baseWidth = Math.max(baseWidth, maxRequiredWidth);
    }

    if (leftFeatures.length > 1 || rightFeatures.length > 1) {
      const totalLeftWidth = leftFeatures.reduce((sum, f) => sum + f.width, 0);
      const totalRightWidth = rightFeatures.reduce((sum, f) => sum + f.width, 0);
      const maxRequiredLength = Math.max(totalLeftWidth, totalRightWidth) + 6; // 6ft spacing for larger rooms
      baseLength = Math.max(baseLength, maxRequiredLength);
    }
  }

  const suggested: BuildingDimensions = {
    width: baseWidth,
    length: baseLength,
    height: baseHeight,
    roofPitch: 4 // Standard 4:12 pitch
  };

  console.log(`Suggested dimensions: ${suggested.width}ft × ${suggested.length}ft × ${suggested.height}ft`);
  console.log(`Meets minimums: width ${suggested.width >= constraints.minimumWallWidth ? '✅' : '❌'}, length ${suggested.length >= constraints.minimumWallLength ? '✅' : '❌'}, height ${suggested.height >= constraints.minimumWallHeight ? '✅' : '❌'}`);

  return suggested;
};

/**
 * Enforces minimum room dimensions during updates
 */
export const enforceMinimumDimensions = (
  proposedDimensions: Partial<BuildingDimensions>,
  currentDimensions: BuildingDimensions,
  constraints: RoomConstraints = STANDARD_ROOM_CONSTRAINTS
): BuildingDimensions => {
  const enforced = { ...currentDimensions, ...proposedDimensions };

  // Enforce minimums
  enforced.width = Math.max(enforced.width, constraints.minimumWallWidth);
  enforced.length = Math.max(enforced.length, constraints.minimumWallLength);
  enforced.height = Math.max(enforced.height, constraints.minimumWallHeight);

  console.log(`\n🔒 ENFORCING MINIMUM DIMENSIONS`);
  console.log(`Proposed: ${JSON.stringify(proposedDimensions)}`);
  console.log(`Enforced: ${enforced.width}ft × ${enforced.length}ft × ${enforced.height}ft`);

  return enforced;
};