import type { WallFeature, BuildingDimensions, WallPosition } from '../types';

export interface WallBounds {
  width: number;
  height: number;
  leftEdge: number;
  rightEdge: number;
  bottomEdge: number;
  topEdge: number;
}

export interface BoundsValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  featurePosition: {
    left: number;
    right: number;
    bottom: number;
    top: number;
  };
  wallBounds: WallBounds;
}

/**
 * Gets the wall bounds for a specific wall position
 */
export const getWallBounds = (
  wallPosition: WallPosition,
  dimensions: BuildingDimensions
): WallBounds => {
  let width: number;
  let height = dimensions.height;
  
  // Determine wall width based on position
  switch (wallPosition) {
    case 'front':
    case 'back':
      width = dimensions.width;
      break;
    case 'left':
    case 'right':
      width = dimensions.length;
      break;
    default:
      width = dimensions.width;
  }
  
  return {
    width,
    height,
    leftEdge: -width / 2,
    rightEdge: width / 2,
    bottomEdge: 0, // Ground level
    topEdge: height
  };
};

/**
 * Calculates the absolute position of a feature on its wall
 */
export const calculateFeaturePosition = (
  feature: WallFeature,
  wallBounds: WallBounds
): { left: number; right: number; bottom: number; top: number } => {
  let left: number;
  let right: number;
  
  // Calculate horizontal position based on alignment
  switch (feature.position.alignment) {
    case 'left':
      left = wallBounds.leftEdge + feature.position.xOffset;
      right = left + feature.width;
      break;
    case 'right':
      right = wallBounds.rightEdge - feature.position.xOffset;
      left = right - feature.width;
      break;
    case 'center':
    default:
      left = feature.position.xOffset - feature.width / 2;
      right = feature.position.xOffset + feature.width / 2;
      break;
  }
  
  // Calculate vertical position
  const bottom = feature.position.yOffset;
  const top = bottom + feature.height;
  
  return { left, right, bottom, top };
};

/**
 * Validates that a feature is positioned within wall bounds
 */
export const validateFeatureWithinWallBounds = (
  feature: WallFeature,
  dimensions: BuildingDimensions
): BoundsValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  console.log(`\n🏗️ WALL BOUNDS VALIDATION for ${feature.type} on ${feature.position.wallPosition} wall`);
  
  // Get wall bounds
  const wallBounds = getWallBounds(feature.position.wallPosition, dimensions);
  console.log(`Wall bounds: ${wallBounds.width}ft wide × ${wallBounds.height}ft tall`);
  console.log(`Wall edges: left=${wallBounds.leftEdge}ft, right=${wallBounds.rightEdge}ft, bottom=${wallBounds.bottomEdge}ft, top=${wallBounds.topEdge}ft`);
  
  // Calculate feature position
  const featurePosition = calculateFeaturePosition(feature, wallBounds);
  console.log(`Feature position: left=${featurePosition.left.toFixed(2)}ft, right=${featurePosition.right.toFixed(2)}ft, bottom=${featurePosition.bottom.toFixed(2)}ft, top=${featurePosition.top.toFixed(2)}ft`);
  
  // Validate horizontal bounds
  if (featurePosition.left < wallBounds.leftEdge) {
    const overhang = wallBounds.leftEdge - featurePosition.left;
    errors.push(`Error: ${feature.type} extends ${overhang.toFixed(2)}ft beyond left edge of ${feature.position.wallPosition} wall`);
    console.log(`❌ Left overhang: ${overhang.toFixed(2)}ft`);
  }
  
  if (featurePosition.right > wallBounds.rightEdge) {
    const overhang = featurePosition.right - wallBounds.rightEdge;
    errors.push(`Error: ${feature.type} extends ${overhang.toFixed(2)}ft beyond right edge of ${feature.position.wallPosition} wall`);
    console.log(`❌ Right overhang: ${overhang.toFixed(2)}ft`);
  }
  
  // Validate vertical bounds
  if (featurePosition.bottom < wallBounds.bottomEdge) {
    const overhang = wallBounds.bottomEdge - featurePosition.bottom;
    errors.push(`Error: ${feature.type} extends ${overhang.toFixed(2)}ft below ground level`);
    console.log(`❌ Below ground: ${overhang.toFixed(2)}ft`);
  }
  
  if (featurePosition.top > wallBounds.topEdge) {
    const overhang = featurePosition.top - wallBounds.topEdge;
    errors.push(`Error: ${feature.type} extends ${overhang.toFixed(2)}ft above wall height`);
    console.log(`❌ Above wall: ${overhang.toFixed(2)}ft`);
  }
  
  // Warnings for features too close to edges
  const edgeBuffer = 0.5; // 6 inches minimum from edge
  
  if (featurePosition.left - wallBounds.leftEdge < edgeBuffer && featurePosition.left >= wallBounds.leftEdge) {
    warnings.push(`Warning: ${feature.type} is very close to left edge of wall (${(featurePosition.left - wallBounds.leftEdge).toFixed(2)}ft clearance)`);
  }
  
  if (wallBounds.rightEdge - featurePosition.right < edgeBuffer && featurePosition.right <= wallBounds.rightEdge) {
    warnings.push(`Warning: ${feature.type} is very close to right edge of wall (${(wallBounds.rightEdge - featurePosition.right).toFixed(2)}ft clearance)`);
  }
  
  if (featurePosition.bottom - wallBounds.bottomEdge < edgeBuffer && featurePosition.bottom >= wallBounds.bottomEdge) {
    warnings.push(`Warning: ${feature.type} is very close to ground level (${(featurePosition.bottom - wallBounds.bottomEdge).toFixed(2)}ft clearance)`);
  }
  
  if (wallBounds.topEdge - featurePosition.top < edgeBuffer && featurePosition.top <= wallBounds.topEdge) {
    warnings.push(`Warning: ${feature.type} is very close to wall top (${(wallBounds.topEdge - featurePosition.top).toFixed(2)}ft clearance)`);
  }
  
  const isValid = errors.length === 0;
  console.log(`Validation result: ${isValid ? '✅ VALID' : '❌ INVALID'} (${errors.length} errors, ${warnings.length} warnings)`);
  
  return {
    valid: isValid,
    errors,
    warnings,
    featurePosition,
    wallBounds
  };
};

/**
 * Validates all features against their respective wall bounds
 */
export const validateAllFeaturesWithinWallBounds = (
  features: WallFeature[],
  dimensions: BuildingDimensions
): {
  valid: boolean;
  errors: string[];
  warnings: string[];
  featureValidations: Map<string, BoundsValidationResult>;
} => {
  console.log(`\n🏗️ === COMPREHENSIVE WALL BOUNDS VALIDATION ===`);
  console.log(`Building dimensions: ${dimensions.width}ft × ${dimensions.length}ft × ${dimensions.height}ft`);
  console.log(`Total features to validate: ${features.length}`);
  
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  const featureValidations = new Map<string, BoundsValidationResult>();
  
  features.forEach((feature, index) => {
    console.log(`\n--- Feature ${index + 1}/${features.length}: ${feature.type} ---`);
    
    const validation = validateFeatureWithinWallBounds(feature, dimensions);
    featureValidations.set(feature.id, validation);
    
    allErrors.push(...validation.errors);
    allWarnings.push(...validation.warnings);
  });
  
  const overallValid = allErrors.length === 0;
  
  console.log(`\n📊 OVERALL VALIDATION SUMMARY:`);
  console.log(`Total errors: ${allErrors.length}`);
  console.log(`Total warnings: ${allWarnings.length}`);
  console.log(`Overall result: ${overallValid ? '✅ ALL FEATURES WITHIN BOUNDS' : '❌ SOME FEATURES OUT OF BOUNDS'}`);
  
  return {
    valid: overallValid,
    errors: allErrors,
    warnings: allWarnings,
    featureValidations
  };
};

/**
 * Suggests valid positioning for a feature that's out of bounds
 */
export const suggestValidFeaturePosition = (
  feature: WallFeature,
  dimensions: BuildingDimensions
): {
  suggestedXOffset: number;
  suggestedYOffset: number;
  suggestedWidth: number;
  suggestedHeight: number;
  adjustments: string[];
} => {
  const wallBounds = getWallBounds(feature.position.wallPosition, dimensions);
  const adjustments: string[] = [];
  
  let suggestedWidth = feature.width;
  let suggestedHeight = feature.height;
  let suggestedXOffset = feature.position.xOffset;
  let suggestedYOffset = feature.position.yOffset;
  
  // Adjust width if too wide for wall
  if (feature.width > wallBounds.width) {
    suggestedWidth = wallBounds.width * 0.8; // 80% of wall width maximum
    adjustments.push(`Reduced width from ${feature.width}ft to ${suggestedWidth.toFixed(2)}ft to fit wall`);
  }
  
  // Adjust height if too tall for wall
  if (feature.height > wallBounds.height) {
    suggestedHeight = wallBounds.height * 0.8; // 80% of wall height maximum
    adjustments.push(`Reduced height from ${feature.height}ft to ${suggestedHeight.toFixed(2)}ft to fit wall`);
  }
  
  // Calculate suggested position based on alignment
  const featurePos = calculateFeaturePosition(
    { ...feature, width: suggestedWidth, height: suggestedHeight },
    wallBounds
  );
  
  // Adjust horizontal position if out of bounds
  if (featurePos.left < wallBounds.leftEdge || featurePos.right > wallBounds.rightEdge) {
    switch (feature.position.alignment) {
      case 'left':
        suggestedXOffset = 0.5; // 6 inches from left edge
        adjustments.push(`Moved to 0.5ft from left edge`);
        break;
      case 'right':
        suggestedXOffset = 0.5; // 6 inches from right edge
        adjustments.push(`Moved to 0.5ft from right edge`);
        break;
      case 'center':
      default:
        suggestedXOffset = 0; // Center of wall
        adjustments.push(`Centered horizontally on wall`);
        break;
    }
  }
  
  // Adjust vertical position if out of bounds
  if (featurePos.bottom < wallBounds.bottomEdge) {
    suggestedYOffset = 0.5; // 6 inches from ground
    adjustments.push(`Moved to 0.5ft above ground level`);
  } else if (featurePos.top > wallBounds.topEdge) {
    suggestedYOffset = wallBounds.topEdge - suggestedHeight - 0.5; // 6 inches from top
    adjustments.push(`Moved to 0.5ft below wall top`);
  }
  
  return {
    suggestedXOffset,
    suggestedYOffset,
    suggestedWidth,
    suggestedHeight,
    adjustments
  };
};

/**
 * Gets the maximum allowed dimensions for a feature at a specific position
 */
export const getMaxAllowedFeatureDimensions = (
  wallPosition: WallPosition,
  alignment: 'left' | 'center' | 'right',
  xOffset: number,
  yOffset: number,
  dimensions: BuildingDimensions
): { maxWidth: number; maxHeight: number } => {
  const wallBounds = getWallBounds(wallPosition, dimensions);
  
  let maxWidth: number;
  
  // Calculate maximum width based on alignment and position
  switch (alignment) {
    case 'left':
      maxWidth = wallBounds.rightEdge - (wallBounds.leftEdge + xOffset);
      break;
    case 'right':
      maxWidth = (wallBounds.rightEdge - xOffset) - wallBounds.leftEdge;
      break;
    case 'center':
    default:
      const distanceToLeft = xOffset - wallBounds.leftEdge;
      const distanceToRight = wallBounds.rightEdge - xOffset;
      maxWidth = Math.min(distanceToLeft, distanceToRight) * 2;
      break;
  }
  
  // Calculate maximum height
  const maxHeight = wallBounds.topEdge - yOffset;
  
  return {
    maxWidth: Math.max(0, maxWidth),
    maxHeight: Math.max(0, maxHeight)
  };
};

/**
 * Checks if a feature position is valid for the given wall
 */
export const isValidFeaturePosition = (
  feature: Omit<WallFeature, 'id'>,
  dimensions: BuildingDimensions
): boolean => {
  const tempFeature: WallFeature = { ...feature, id: 'temp' };
  const validation = validateFeatureWithinWallBounds(tempFeature, dimensions);
  return validation.valid;
};

/**
 * Gets available space around a feature position
 */
export const getAvailableSpace = (
  wallPosition: WallPosition,
  alignment: 'left' | 'center' | 'right',
  xOffset: number,
  yOffset: number,
  dimensions: BuildingDimensions
): {
  leftSpace: number;
  rightSpace: number;
  bottomSpace: number;
  topSpace: number;
} => {
  const wallBounds = getWallBounds(wallPosition, dimensions);
  
  let leftSpace: number;
  let rightSpace: number;
  
  switch (alignment) {
    case 'left':
      leftSpace = xOffset;
      rightSpace = wallBounds.rightEdge - (wallBounds.leftEdge + xOffset);
      break;
    case 'right':
      leftSpace = (wallBounds.rightEdge - xOffset) - wallBounds.leftEdge;
      rightSpace = xOffset;
      break;
    case 'center':
    default:
      leftSpace = xOffset - wallBounds.leftEdge;
      rightSpace = wallBounds.rightEdge - xOffset;
      break;
  }
  
  return {
    leftSpace: Math.max(0, leftSpace),
    rightSpace: Math.max(0, rightSpace),
    bottomSpace: yOffset - wallBounds.bottomEdge,
    topSpace: wallBounds.topEdge - yOffset
  };
};