import type { 
  WallFeature, 
  BuildingDimensions, 
  WallPosition, 
  WallSegmentLock, 
  WallBoundsProtection, 
  FeatureBoundsLock 
} from '../types';

/**
 * Wall Bounds Lock System - Prevents modifications that compromise architectural integrity
 */

export interface BoundsLockValidationResult {
  canModify: boolean;
  restrictions: string[];
  warnings: string[];
  lockedSegments: WallSegmentLock[];
  affectedFeatures: WallFeature[];
}

export interface DimensionLockCheck {
  wallPosition: WallPosition;
  currentDimension: number;
  proposedDimension: number;
  canModify: boolean;
  lockingFeatures: WallFeature[];
  restrictions: string[];
}

/**
 * Creates a feature bounds lock when a feature is placed
 */
export const createFeatureBoundsLock = (
  feature: WallFeature,
  wallDimensions: BuildingDimensions
): FeatureBoundsLock => {
  console.log(`\n🔒 CREATING FEATURE BOUNDS LOCK for ${feature.type} on ${feature.position.wallPosition} wall`);
  
  const lockReason = `Architectural integrity protection: ${feature.type} placement locks wall segment dimensions`;
  
  const boundsLock: FeatureBoundsLock = {
    featureId: feature.id,
    featureType: feature.type,
    wallPosition: feature.position.wallPosition,
    lockedDimensions: {
      width: true,  // Lock wall width/length when features are placed
      height: true, // Lock wall height to prevent feature overflow
      position: true // Lock feature position to maintain structural integrity
    },
    affectedWallSegments: [`${feature.position.wallPosition}-segment-${feature.id}`],
    lockTimestamp: new Date(),
    lockReason,
    canOverride: false // Require explicit override for safety
  };
  
  console.log(`✅ Feature bounds lock created: ${feature.type} locks ${feature.position.wallPosition} wall dimensions`);
  return boundsLock;
};

/**
 * Creates wall segment locks based on placed features
 */
export const createWallSegmentLocks = (
  features: WallFeature[],
  wallPosition: WallPosition,
  wallDimensions: BuildingDimensions
): WallSegmentLock[] => {
  console.log(`\n🔒 CREATING WALL SEGMENT LOCKS for ${wallPosition} wall`);
  
  const wallFeatures = features.filter(f => f.position.wallPosition === wallPosition);
  const locks: WallSegmentLock[] = [];
  
  // Get wall width for this position
  const wallWidth = (wallPosition === 'front' || wallPosition === 'back') 
    ? wallDimensions.width 
    : wallDimensions.length;
  
  console.log(`Wall width: ${wallWidth}ft, Features: ${wallFeatures.length}`);
  
  wallFeatures.forEach((feature, index) => {
    // Calculate feature position on wall
    let featureStart: number;
    let featureEnd: number;
    
    switch (feature.position.alignment) {
      case 'left':
        featureStart = feature.position.xOffset;
        featureEnd = featureStart + feature.width;
        break;
      case 'right':
        featureEnd = wallWidth - feature.position.xOffset;
        featureStart = featureEnd - feature.width;
        break;
      case 'center':
      default:
        featureStart = (wallWidth / 2) + feature.position.xOffset - (feature.width / 2);
        featureEnd = featureStart + feature.width;
        break;
    }
    
    // Create protection buffer around feature
    const protectionBuffer = 1.0; // 1 foot buffer on each side
    const lockStart = Math.max(0, featureStart - protectionBuffer);
    const lockEnd = Math.min(wallWidth, featureEnd + protectionBuffer);
    
    const segmentLock: WallSegmentLock = {
      segmentId: `${wallPosition}-lock-${feature.id}`,
      wallPosition,
      startPosition: lockStart,
      endPosition: lockEnd,
      lockedBy: [feature.id],
      lockType: 'full', // Full lock prevents any modifications
      lockReason: `${feature.type} (${feature.width}ft × ${feature.height}ft) requires dimensional stability`,
      canModify: false
    };
    
    locks.push(segmentLock);
    
    console.log(`  🔐 Segment ${index + 1}: ${feature.type} locks ${lockStart.toFixed(1)}ft to ${lockEnd.toFixed(1)}ft`);
  });
  
  console.log(`✅ Created ${locks.length} wall segment locks for ${wallPosition} wall`);
  return locks;
};

/**
 * Creates comprehensive wall bounds protection
 */
export const createWallBoundsProtection = (
  features: WallFeature[],
  wallPosition: WallPosition,
  wallDimensions: BuildingDimensions
): WallBoundsProtection => {
  console.log(`\n🛡️ CREATING WALL BOUNDS PROTECTION for ${wallPosition} wall`);
  
  const protectedSegments = createWallSegmentLocks(features, wallPosition, wallDimensions);
  const wallFeatures = features.filter(f => f.position.wallPosition === wallPosition);
  
  // Calculate total locked length
  const totalLockedLength = protectedSegments.reduce((sum, segment) => {
    return sum + (segment.endPosition - segment.startPosition);
  }, 0);
  
  // Get wall width for this position
  const wallWidth = (wallPosition === 'front' || wallPosition === 'back') 
    ? wallDimensions.width 
    : wallDimensions.length;
  
  const availableLength = wallWidth - totalLockedLength;
  
  // Generate modification restrictions
  const restrictions: string[] = [];
  
  if (wallFeatures.length > 0) {
    restrictions.push(`${wallFeatures.length} feature(s) prevent wall dimension changes`);
    restrictions.push(`${totalLockedLength.toFixed(1)}ft of wall length is protected`);
    
    wallFeatures.forEach(feature => {
      restrictions.push(`${feature.type} requires stable ${feature.width}ft × ${feature.height}ft opening`);
    });
    
    if (availableLength < 2.0) {
      restrictions.push(`CRITICAL: Only ${availableLength.toFixed(1)}ft unprotected space remaining`);
    }
  }
  
  const protection: WallBoundsProtection = {
    wallPosition,
    protectedSegments,
    totalLockedLength,
    availableLength,
    modificationRestrictions: restrictions,
    lastModified: new Date()
  };
  
  console.log(`🛡️ Wall protection created: ${totalLockedLength.toFixed(1)}ft locked, ${availableLength.toFixed(1)}ft available`);
  return protection;
};

/**
 * Validates if wall dimensions can be modified without affecting features
 */
export const validateWallDimensionChange = (
  wallPosition: WallPosition,
  currentDimensions: BuildingDimensions,
  proposedDimensions: Partial<BuildingDimensions>,
  features: WallFeature[]
): BoundsLockValidationResult => {
  console.log(`\n🔍 VALIDATING WALL DIMENSION CHANGE for ${wallPosition} wall`);
  
  const restrictions: string[] = [];
  const warnings: string[] = [];
  const affectedFeatures: WallFeature[] = [];
  
  // Get current and proposed wall dimensions
  const currentWallWidth = (wallPosition === 'front' || wallPosition === 'back') 
    ? currentDimensions.width 
    : currentDimensions.length;
  
  const proposedWallWidth = (wallPosition === 'front' || wallPosition === 'back')
    ? (proposedDimensions.width ?? currentDimensions.width)
    : (proposedDimensions.length ?? currentDimensions.length);
  
  const proposedWallHeight = proposedDimensions.height ?? currentDimensions.height;
  
  console.log(`Current: ${currentWallWidth}ft × ${currentDimensions.height}ft`);
  console.log(`Proposed: ${proposedWallWidth}ft × ${proposedWallHeight}ft`);
  
  // Check features on this wall
  const wallFeatures = features.filter(f => f.position.wallPosition === wallPosition);
  
  if (wallFeatures.length === 0) {
    console.log(`✅ No features on ${wallPosition} wall - modifications allowed`);
    return {
      canModify: true,
      restrictions: [],
      warnings: [],
      lockedSegments: [],
      affectedFeatures: []
    };
  }
  
  console.log(`Checking ${wallFeatures.length} features for conflicts...`);
  
  // Check each feature for conflicts
  wallFeatures.forEach((feature, index) => {
    console.log(`\n--- Feature ${index + 1}: ${feature.type} (${feature.width}ft × ${feature.height}ft) ---`);
    
    // Calculate feature position with proposed dimensions
    let featureStart: number;
    let featureEnd: number;
    
    switch (feature.position.alignment) {
      case 'left':
        featureStart = feature.position.xOffset;
        featureEnd = featureStart + feature.width;
        break;
      case 'right':
        featureEnd = proposedWallWidth - feature.position.xOffset;
        featureStart = featureEnd - feature.width;
        break;
      case 'center':
      default:
        featureStart = (proposedWallWidth / 2) + feature.position.xOffset - (feature.width / 2);
        featureEnd = featureStart + feature.width;
        break;
    }
    
    const featureTop = feature.position.yOffset + feature.height;
    
    console.log(`Feature bounds: ${featureStart.toFixed(1)}ft to ${featureEnd.toFixed(1)}ft, height to ${featureTop.toFixed(1)}ft`);
    
    // Check horizontal bounds
    if (featureStart < 0 || featureEnd > proposedWallWidth) {
      restrictions.push(`${feature.type} would extend beyond ${wallPosition} wall bounds (${featureStart.toFixed(1)}ft to ${featureEnd.toFixed(1)}ft vs ${proposedWallWidth}ft wall)`);
      affectedFeatures.push(feature);
      console.log(`❌ Horizontal bounds violation`);
    }
    
    // Check vertical bounds
    if (featureTop > proposedWallHeight) {
      restrictions.push(`${feature.type} would extend beyond wall height (${featureTop.toFixed(1)}ft vs ${proposedWallHeight}ft wall)`);
      affectedFeatures.push(feature);
      console.log(`❌ Vertical bounds violation`);
    }
    
    // Check for tight clearances
    const leftClearance = featureStart;
    const rightClearance = proposedWallWidth - featureEnd;
    const topClearance = proposedWallHeight - featureTop;
    
    if (leftClearance < 1.0 && leftClearance >= 0) {
      warnings.push(`${feature.type} has minimal left clearance (${leftClearance.toFixed(1)}ft)`);
    }
    
    if (rightClearance < 1.0 && rightClearance >= 0) {
      warnings.push(`${feature.type} has minimal right clearance (${rightClearance.toFixed(1)}ft)`);
    }
    
    if (topClearance < 1.0 && topClearance >= 0) {
      warnings.push(`${feature.type} has minimal top clearance (${topClearance.toFixed(1)}ft)`);
    }
    
    console.log(`Clearances: left=${leftClearance.toFixed(1)}ft, right=${rightClearance.toFixed(1)}ft, top=${topClearance.toFixed(1)}ft`);
  });
  
  // Create locked segments for affected features
  const lockedSegments = createWallSegmentLocks(affectedFeatures, wallPosition, currentDimensions);
  
  const canModify = restrictions.length === 0;
  
  if (!canModify) {
    restrictions.unshift(`LOCKED: ${wallPosition} wall dimensions cannot be modified`);
    restrictions.push(`Remove or relocate conflicting features before resizing wall`);
  }
  
  console.log(`\n📊 VALIDATION RESULT: ${canModify ? '✅ CAN MODIFY' : '❌ LOCKED'}`);
  console.log(`Restrictions: ${restrictions.length}, Warnings: ${warnings.length}, Affected features: ${affectedFeatures.length}`);
  
  return {
    canModify,
    restrictions,
    warnings,
    lockedSegments,
    affectedFeatures
  };
};

/**
 * Checks if a specific dimension change is allowed
 */
export const checkDimensionLock = (
  wallPosition: WallPosition,
  dimensionType: 'width' | 'length' | 'height',
  currentValue: number,
  proposedValue: number,
  features: WallFeature[],
  currentDimensions: BuildingDimensions
): DimensionLockCheck => {
  console.log(`\n🔍 CHECKING DIMENSION LOCK: ${wallPosition} wall ${dimensionType} ${currentValue}ft → ${proposedValue}ft`);
  
  const lockingFeatures: WallFeature[] = [];
  const restrictions: string[] = [];
  
  // Determine if this dimension affects this wall
  let affectsThisWall = false;
  
  switch (wallPosition) {
    case 'front':
    case 'back':
      affectsThisWall = (dimensionType === 'width' || dimensionType === 'height');
      break;
    case 'left':
    case 'right':
      affectsThisWall = (dimensionType === 'length' || dimensionType === 'height');
      break;
  }
  
  if (!affectsThisWall) {
    console.log(`✅ Dimension change does not affect ${wallPosition} wall`);
    return {
      wallPosition,
      currentDimension: currentValue,
      proposedDimension: proposedValue,
      canModify: true,
      lockingFeatures: [],
      restrictions: []
    };
  }
  
  // Check features on this wall
  const wallFeatures = features.filter(f => f.position.wallPosition === wallPosition);
  
  if (wallFeatures.length === 0) {
    console.log(`✅ No features on ${wallPosition} wall - dimension change allowed`);
    return {
      wallPosition,
      currentDimension: currentValue,
      proposedDimension: proposedValue,
      canModify: true,
      lockingFeatures: [],
      restrictions: []
    };
  }
  
  // Test the proposed change
  const testDimensions = { ...currentDimensions };
  if (dimensionType === 'width') testDimensions.width = proposedValue;
  if (dimensionType === 'length') testDimensions.length = proposedValue;
  if (dimensionType === 'height') testDimensions.height = proposedValue;
  
  const validation = validateWallDimensionChange(
    wallPosition,
    currentDimensions,
    testDimensions,
    features
  );
  
  if (!validation.canModify) {
    lockingFeatures.push(...validation.affectedFeatures);
    restrictions.push(...validation.restrictions);
    restrictions.push(`${wallFeatures.length} feature(s) prevent ${dimensionType} modification on ${wallPosition} wall`);
  }
  
  const canModify = restrictions.length === 0;
  
  console.log(`📊 DIMENSION LOCK CHECK: ${canModify ? '✅ ALLOWED' : '❌ LOCKED'} (${lockingFeatures.length} locking features)`);
  
  return {
    wallPosition,
    currentDimension: currentValue,
    proposedDimension: proposedValue,
    canModify,
    lockingFeatures,
    restrictions
  };
};

/**
 * Gets comprehensive wall protection status
 */
export const getWallProtectionStatus = (
  wallPosition: WallPosition,
  features: WallFeature[],
  dimensions: BuildingDimensions
): WallBoundsProtection | null => {
  const wallFeatures = features.filter(f => f.position.wallPosition === wallPosition);
  
  if (wallFeatures.length === 0) {
    return null; // No protection needed
  }
  
  return createWallBoundsProtection(features, wallPosition, dimensions);
};

/**
 * Generates user-friendly lock status message
 */
export const generateLockStatusMessage = (
  wallPosition: WallPosition,
  protection: WallBoundsProtection | null
): string => {
  if (!protection) {
    return `${wallPosition.charAt(0).toUpperCase() + wallPosition.slice(1)} wall: No dimensional restrictions`;
  }
  
  const featureCount = protection.protectedSegments.length;
  const lockedPercentage = (protection.totalLockedLength / (protection.totalLockedLength + protection.availableLength)) * 100;
  
  if (lockedPercentage >= 90) {
    return `${wallPosition.charAt(0).toUpperCase() + wallPosition.slice(1)} wall: FULLY LOCKED - ${featureCount} feature(s) prevent any modifications`;
  } else if (lockedPercentage >= 50) {
    return `${wallPosition.charAt(0).toUpperCase() + wallPosition.slice(1)} wall: MOSTLY LOCKED - ${featureCount} feature(s) restrict modifications (${lockedPercentage.toFixed(0)}% protected)`;
  } else {
    return `${wallPosition.charAt(0).toUpperCase() + wallPosition.slice(1)} wall: PARTIALLY LOCKED - ${featureCount} feature(s) limit some modifications (${lockedPercentage.toFixed(0)}% protected)`;
  }
};

/**
 * Suggests safe dimension modifications that won't affect features
 */
export const suggestSafeDimensionChanges = (
  wallPosition: WallPosition,
  features: WallFeature[],
  currentDimensions: BuildingDimensions,
  desiredDimensions: Partial<BuildingDimensions>
): {
  safeDimensions: BuildingDimensions;
  modifications: string[];
  warnings: string[];
} => {
  console.log(`\n💡 SUGGESTING SAFE DIMENSION CHANGES for ${wallPosition} wall`);
  
  const modifications: string[] = [];
  const warnings: string[] = [];
  const safeDimensions = { ...currentDimensions };
  
  const wallFeatures = features.filter(f => f.position.wallPosition === wallPosition);
  
  if (wallFeatures.length === 0) {
    // No features, all changes are safe
    Object.assign(safeDimensions, desiredDimensions);
    modifications.push(`No features on ${wallPosition} wall - all dimension changes are safe`);
    return { safeDimensions, modifications, warnings };
  }
  
  // Calculate minimum safe dimensions based on features
  let minSafeWidth = 0;
  let minSafeHeight = 0;
  
  wallFeatures.forEach(feature => {
    // Calculate required width for this feature
    let requiredWidth = 0;
    
    switch (feature.position.alignment) {
      case 'left':
        requiredWidth = feature.position.xOffset + feature.width + 1.0; // 1ft clearance
        break;
      case 'right':
        requiredWidth = feature.position.xOffset + feature.width + 1.0; // 1ft clearance
        break;
      case 'center':
      default:
        requiredWidth = Math.abs(feature.position.xOffset) * 2 + feature.width + 2.0; // 1ft clearance each side
        break;
    }
    
    const requiredHeight = feature.position.yOffset + feature.height + 1.0; // 1ft clearance above
    
    minSafeWidth = Math.max(minSafeWidth, requiredWidth);
    minSafeHeight = Math.max(minSafeHeight, requiredHeight);
  });
  
  // Apply safe dimensions
  if (desiredDimensions.width !== undefined && (wallPosition === 'front' || wallPosition === 'back')) {
    if (desiredDimensions.width >= minSafeWidth) {
      safeDimensions.width = desiredDimensions.width;
      modifications.push(`Width change to ${desiredDimensions.width}ft is safe`);
    } else {
      safeDimensions.width = Math.max(currentDimensions.width, minSafeWidth);
      warnings.push(`Width limited to ${safeDimensions.width}ft to protect features (requested: ${desiredDimensions.width}ft)`);
    }
  }
  
  if (desiredDimensions.length !== undefined && (wallPosition === 'left' || wallPosition === 'right')) {
    if (desiredDimensions.length >= minSafeWidth) {
      safeDimensions.length = desiredDimensions.length;
      modifications.push(`Length change to ${desiredDimensions.length}ft is safe`);
    } else {
      safeDimensions.length = Math.max(currentDimensions.length, minSafeWidth);
      warnings.push(`Length limited to ${safeDimensions.length}ft to protect features (requested: ${desiredDimensions.length}ft)`);
    }
  }
  
  if (desiredDimensions.height !== undefined) {
    if (desiredDimensions.height >= minSafeHeight) {
      safeDimensions.height = desiredDimensions.height;
      modifications.push(`Height change to ${desiredDimensions.height}ft is safe`);
    } else {
      safeDimensions.height = Math.max(currentDimensions.height, minSafeHeight);
      warnings.push(`Height limited to ${safeDimensions.height}ft to protect features (requested: ${desiredDimensions.height}ft)`);
    }
  }
  
  console.log(`💡 Safe dimensions: ${safeDimensions.width}ft × ${safeDimensions.length}ft × ${safeDimensions.height}ft`);
  console.log(`Modifications: ${modifications.length}, Warnings: ${warnings.length}`);
  
  return { safeDimensions, modifications, warnings };
};