import type { WallFeature, BuildingDimensions, BuildingCodeRequirements } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  minimumRequiredHeight?: number;
  breakdown?: HeightRequirementBreakdown;
}

export interface HeightRequirementBreakdown {
  baseCeilingHeight: number;
  highestFeatureRequirement: number;
  electricalRequirement: number;
  plumbingRequirement: number;
  structuralRequirement: number;
  fireCodeRequirement: number;
  ventilationRequirement: number;
  insulationRequirement: number;
  finalMinimum: number;
  contributingFactors: string[];
}

export interface FeatureValidationDetails {
  feature: WallFeature;
  individualValid: boolean;
  positionValid: boolean;
  errors: string[];
}

/**
 * Default building code requirements for Australian/New Zealand standards
 */
export const DEFAULT_BUILDING_CODE_REQUIREMENTS: BuildingCodeRequirements = {
  minimumCeilingHeight: 8.0, // 8 feet minimum ceiling height
  minimumDoorClearance: 0.5, // 6 inches above door
  minimumWindowClearance: 0.25, // 3 inches above window
  structuralLoadBearing: 0.5, // 6 inches for structural elements
  fireCodeClearance: 0.5, // 6 inches for fire safety
  electrical: {
    minimumOutletHeight: 1.0, // 12 inches from floor
    minimumSwitchHeight: 3.5, // 42 inches from floor
    minimumCeilingClearance: 1.0, // 12 inches from ceiling
    minimumServicePanelClearance: 3.0, // 36 inches around panel
  },
  plumbing: {
    minimumFixtureHeight: 2.5, // 30 inches from floor
    minimumCeilingClearance: 1.0, // 12 inches from ceiling
    minimumAccessClearance: 2.0, // 24 inches for access
    minimumVentClearance: 1.0, // 12 inches for vents
  },
  ventilationClearance: 1.0, // 12 inches for HVAC
  insulationSpace: 0.5, // 6 inches for insulation
};

/**
 * Calculates the minimum required wall height based on all building requirements
 */
export const calculateMinimumRequiredHeight = (
  features: WallFeature[],
  buildingCodeRequirements: BuildingCodeRequirements = DEFAULT_BUILDING_CODE_REQUIREMENTS
): HeightRequirementBreakdown => {
  console.log(`\n🏗️ CALCULATING MINIMUM REQUIRED WALL HEIGHT`);
  console.log(`Features to analyze: ${features.length}`);
  
  const breakdown: HeightRequirementBreakdown = {
    baseCeilingHeight: buildingCodeRequirements.minimumCeilingHeight,
    highestFeatureRequirement: 0,
    electricalRequirement: 0,
    plumbingRequirement: 0,
    structuralRequirement: buildingCodeRequirements.structuralLoadBearing,
    fireCodeRequirement: buildingCodeRequirements.fireCodeClearance,
    ventilationRequirement: buildingCodeRequirements.ventilationClearance,
    insulationRequirement: buildingCodeRequirements.insulationSpace,
    finalMinimum: 0,
    contributingFactors: []
  };

  // 1. Start with base ceiling height requirement
  let minimumHeight = breakdown.baseCeilingHeight;
  breakdown.contributingFactors.push(`Base ceiling height: ${breakdown.baseCeilingHeight}ft`);
  console.log(`📏 Base ceiling height: ${breakdown.baseCeilingHeight}ft`);

  // 2. Calculate highest feature requirement (doors and windows)
  if (features.length > 0) {
    let highestFeatureTop = 0;
    let criticalFeature: WallFeature | null = null;

    features.forEach(feature => {
      const featureTop = feature.position.yOffset + feature.height;
      let requiredClearance = 0;

      // Determine clearance based on feature type
      switch (feature.type) {
        case 'door':
        case 'rollupDoor':
        case 'walkDoor':
          requiredClearance = buildingCodeRequirements.minimumDoorClearance;
          break;
        case 'window':
          requiredClearance = buildingCodeRequirements.minimumWindowClearance;
          break;
      }

      const totalRequiredHeight = featureTop + requiredClearance;
      
      console.log(`  ${feature.type}: top at ${featureTop.toFixed(2)}ft + ${requiredClearance}ft clearance = ${totalRequiredHeight.toFixed(2)}ft required`);

      if (totalRequiredHeight > highestFeatureTop) {
        highestFeatureTop = totalRequiredHeight;
        criticalFeature = feature;
        breakdown.highestFeatureRequirement = totalRequiredHeight;
      }
    });

    if (criticalFeature && highestFeatureTop > minimumHeight) {
      minimumHeight = highestFeatureTop;
      breakdown.contributingFactors.push(
        `${criticalFeature.type} (${criticalFeature.width}×${criticalFeature.height}ft) requires ${highestFeatureTop.toFixed(2)}ft`
      );
      console.log(`🚪 Critical feature: ${criticalFeature.type} requires ${highestFeatureTop.toFixed(2)}ft`);
    }
  }

  // 3. Electrical requirements
  const electricalHeight = Math.max(
    buildingCodeRequirements.electrical.minimumSwitchHeight + buildingCodeRequirements.electrical.minimumCeilingClearance,
    buildingCodeRequirements.electrical.minimumOutletHeight + buildingCodeRequirements.electrical.minimumCeilingClearance
  );
  breakdown.electricalRequirement = electricalHeight;

  if (electricalHeight > minimumHeight) {
    minimumHeight = electricalHeight;
    breakdown.contributingFactors.push(`Electrical clearance: ${electricalHeight.toFixed(2)}ft`);
    console.log(`⚡ Electrical requirement: ${electricalHeight.toFixed(2)}ft`);
  }

  // 4. Plumbing requirements
  const plumbingHeight = buildingCodeRequirements.plumbing.minimumFixtureHeight + 
                         buildingCodeRequirements.plumbing.minimumCeilingClearance;
  breakdown.plumbingRequirement = plumbingHeight;

  if (plumbingHeight > minimumHeight) {
    minimumHeight = plumbingHeight;
    breakdown.contributingFactors.push(`Plumbing clearance: ${plumbingHeight.toFixed(2)}ft`);
    console.log(`🚰 Plumbing requirement: ${plumbingHeight.toFixed(2)}ft`);
  }

  // 5. Add cumulative overhead requirements
  const overheadRequirements = 
    breakdown.structuralRequirement +
    breakdown.fireCodeRequirement +
    breakdown.ventilationRequirement +
    breakdown.insulationRequirement;

  const finalMinimumHeight = minimumHeight + overheadRequirements;
  breakdown.finalMinimum = finalMinimumHeight;

  if (overheadRequirements > 0) {
    breakdown.contributingFactors.push(
      `Overhead requirements: +${overheadRequirements.toFixed(2)}ft (structural, fire, HVAC, insulation)`
    );
    console.log(`🏗️ Overhead requirements: +${overheadRequirements.toFixed(2)}ft`);
  }

  console.log(`📊 FINAL MINIMUM HEIGHT: ${finalMinimumHeight.toFixed(2)}ft`);
  console.log(`Contributing factors: ${breakdown.contributingFactors.length}`);

  return breakdown;
};

/**
 * Validates that a single feature doesn't exceed wall height constraints
 */
export const validateFeatureHeight = (
  feature: WallFeature,
  wallHeight: number
): FeatureValidationDetails => {
  const errors: string[] = [];
  let individualValid = true;
  let positionValid = true;

  // Check if individual feature height exceeds wall height
  if (feature.height > wallHeight) {
    errors.push(`Error: ${feature.type} height (${feature.height}ft) exceeds wall height (${wallHeight}ft)`);
    individualValid = false;
  }

  // Check if feature position + height exceeds wall height
  const featureTop = feature.position.yOffset + feature.height;
  if (featureTop > wallHeight) {
    errors.push(`Error: ${feature.type} extends beyond wall top (position: ${feature.position.yOffset}ft + height: ${feature.height}ft = ${featureTop}ft > ${wallHeight}ft)`);
    positionValid = false;
  }

  // Check if feature position is below ground level
  if (feature.position.yOffset < 0) {
    errors.push(`Error: ${feature.type} position (${feature.position.yOffset}ft) is below ground level`);
    positionValid = false;
  }

  return {
    feature,
    individualValid,
    positionValid,
    errors
  };
};

/**
 * Validates stacked features on the same wall position
 */
export const validateStackedFeatures = (
  features: WallFeature[],
  wallHeight: number,
  wallPosition: string
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Group features by wall position and horizontal overlap
  const wallFeatures = features.filter(f => f.position.wallPosition === wallPosition);
  
  // Check for vertically stacked features (same horizontal position)
  const featureGroups = new Map<string, WallFeature[]>();
  
  wallFeatures.forEach(feature => {
    // Create a key based on horizontal position for grouping
    let horizontalKey = '';
    switch (feature.position.alignment) {
      case 'left':
        horizontalKey = `left-${feature.position.xOffset}`;
        break;
      case 'right':
        horizontalKey = `right-${feature.position.xOffset}`;
        break;
      case 'center':
        horizontalKey = `center-${feature.position.xOffset}`;
        break;
    }
    
    if (!featureGroups.has(horizontalKey)) {
      featureGroups.set(horizontalKey, []);
    }
    featureGroups.get(horizontalKey)!.push(feature);
  });

  // Validate each group for vertical stacking
  featureGroups.forEach((groupFeatures, position) => {
    if (groupFeatures.length > 1) {
      // Sort by vertical position (yOffset)
      const sortedFeatures = groupFeatures.sort((a, b) => a.position.yOffset - b.position.yOffset);
      
      let totalStackedHeight = 0;
      let currentTop = 0;
      
      sortedFeatures.forEach((feature, index) => {
        const featureBottom = feature.position.yOffset;
        const featureTop = featureBottom + feature.height;
        
        // Check for overlap with previous feature
        if (index > 0 && featureBottom < currentTop) {
          errors.push(`Error: ${feature.type} overlaps with feature above it at ${position} position`);
        }
        
        totalStackedHeight += feature.height;
        currentTop = Math.max(currentTop, featureTop);
      });
      
      // Check if total stacked height exceeds wall height
      if (currentTop > wallHeight) {
        errors.push(`Error: Combined height of stacked features at ${position} (${currentTop.toFixed(1)}ft) exceeds wall height (${wallHeight}ft)`);
      }
      
      // Warning for high stacking ratio
      if (totalStackedHeight / wallHeight > 0.8) {
        warnings.push(`Warning: High feature density at ${position} position may affect structural integrity`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Comprehensive wall height validation for all features with building code requirements
 */
export const validateWallHeights = (
  dimensions: BuildingDimensions,
  features: WallFeature[],
  buildingCodeRequirements: BuildingCodeRequirements = DEFAULT_BUILDING_CODE_REQUIREMENTS
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const wallHeight = dimensions.height;

  console.log(`\n🏗️ COMPREHENSIVE WALL HEIGHT VALIDATION`);
  console.log(`Proposed wall height: ${wallHeight}ft`);
  console.log(`Total features to validate: ${features.length}`);

  // Calculate minimum required height based on all requirements
  const heightBreakdown = calculateMinimumRequiredHeight(features, buildingCodeRequirements);
  const minimumRequiredHeight = heightBreakdown.finalMinimum;

  console.log(`📏 Minimum required height: ${minimumRequiredHeight.toFixed(2)}ft`);

  // CRITICAL CHECK: Validate proposed height against minimum requirement
  if (wallHeight < minimumRequiredHeight) {
    const shortfall = minimumRequiredHeight - wallHeight;
    errors.push(
      `CRITICAL: Wall height (${wallHeight}ft) is ${shortfall.toFixed(2)}ft below minimum required height (${minimumRequiredHeight.toFixed(2)}ft)`
    );
    errors.push(`Minimum height determined by: ${heightBreakdown.contributingFactors.join(', ')}`);
    console.log(`❌ CRITICAL: Wall height too low by ${shortfall.toFixed(2)}ft`);
  } else {
    const clearance = wallHeight - minimumRequiredHeight;
    console.log(`✅ Wall height acceptable with ${clearance.toFixed(2)}ft clearance above minimum`);
    
    if (clearance < 1.0) {
      warnings.push(`Warning: Wall height (${wallHeight}ft) has minimal clearance (${clearance.toFixed(2)}ft) above minimum requirement`);
    }
  }

  // Validate each individual feature
  const featureValidations = features.map(feature => 
    validateFeatureHeight(feature, wallHeight)
  );

  // Collect individual feature errors
  featureValidations.forEach(validation => {
    errors.push(...validation.errors);
  });

  // Validate stacked features for each wall
  const wallPositions = ['front', 'back', 'left', 'right'];
  wallPositions.forEach(wallPosition => {
    const stackValidation = validateStackedFeatures(features, wallHeight, wallPosition);
    errors.push(...stackValidation.errors);
    warnings.push(...stackValidation.warnings);
  });

  // Additional structural warnings
  const totalFeatureArea = features.reduce((sum, feature) => sum + (feature.width * feature.height), 0);
  const wallArea = dimensions.width * 2 * wallHeight + dimensions.length * 2 * wallHeight; // Total wall area
  const openingRatio = totalFeatureArea / wallArea;

  if (openingRatio > 0.4) {
    warnings.push(`Warning: High opening ratio (${(openingRatio * 100).toFixed(1)}%) may require additional structural support`);
  }

  // Building code compliance warnings
  if (wallHeight < buildingCodeRequirements.minimumCeilingHeight + 1.0) {
    warnings.push(`Warning: Wall height is close to minimum ceiling height requirement - consider increasing for comfort`);
  }

  console.log(`Validation complete: ${errors.length} errors, ${warnings.length} warnings`);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    minimumRequiredHeight,
    breakdown: heightBreakdown
  };
};

/**
 * Validates a new feature before adding it to the building
 */
export const validateNewFeature = (
  newFeature: Omit<WallFeature, 'id'>,
  existingFeatures: WallFeature[],
  wallHeight: number,
  buildingCodeRequirements: BuildingCodeRequirements = DEFAULT_BUILDING_CODE_REQUIREMENTS
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Create a temporary feature with ID for validation
  const tempFeature: WallFeature = {
    ...newFeature,
    id: 'temp-validation'
  };

  // Validate individual feature height
  const featureValidation = validateFeatureHeight(tempFeature, wallHeight);
  errors.push(...featureValidation.errors);

  // Check if adding this feature would increase minimum required height
  const allFeatures = [...existingFeatures, tempFeature];
  const heightBreakdown = calculateMinimumRequiredHeight(allFeatures, buildingCodeRequirements);
  
  if (heightBreakdown.finalMinimum > wallHeight) {
    const shortfall = heightBreakdown.finalMinimum - wallHeight;
    errors.push(
      `Error: Adding this ${newFeature.type} would require wall height of ${heightBreakdown.finalMinimum.toFixed(2)}ft (${shortfall.toFixed(2)}ft above current ${wallHeight}ft)`
    );
  }

  // Validate against existing features on the same wall
  const wallFeatures = existingFeatures.filter(f => 
    f.position.wallPosition === newFeature.position.wallPosition
  );

  // Check for conflicts with existing features
  wallFeatures.forEach(existing => {
    // Check for horizontal overlap
    const newLeft = getFeatureLeft(tempFeature);
    const newRight = newLeft + newFeature.width;
    const existingLeft = getFeatureLeft(existing);
    const existingRight = existingLeft + existing.width;

    const horizontalOverlap = !(newRight <= existingLeft || newLeft >= existingRight);

    if (horizontalOverlap) {
      // Check for vertical overlap
      const newBottom = newFeature.position.yOffset;
      const newTop = newBottom + newFeature.height;
      const existingBottom = existing.position.yOffset;
      const existingTop = existingBottom + existing.height;

      const verticalOverlap = !(newTop <= existingBottom || newBottom >= existingTop);

      if (verticalOverlap) {
        errors.push(`Error: ${newFeature.type} overlaps with existing ${existing.type}`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    minimumRequiredHeight: heightBreakdown.finalMinimum,
    breakdown: heightBreakdown
  };
};

/**
 * Helper function to get the left edge position of a feature
 */
const getFeatureLeft = (feature: WallFeature): number => {
  // This would need to be calculated based on wall width and alignment
  // For now, return the xOffset as a simplified calculation
  switch (feature.position.alignment) {
    case 'left':
      return feature.position.xOffset;
    case 'right':
      return -feature.position.xOffset - feature.width;
    case 'center':
    default:
      return feature.position.xOffset - feature.width / 2;
  }
};

/**
 * Get maximum allowed height for a feature at a specific position
 */
export const getMaxAllowedHeight = (
  position: { yOffset: number },
  wallHeight: number
): number => {
  return wallHeight - position.yOffset;
};

/**
 * Suggest valid positioning for a feature that exceeds constraints
 */
export const suggestValidPosition = (
  feature: Omit<WallFeature, 'id'>,
  wallHeight: number,
  buildingCodeRequirements: BuildingCodeRequirements = DEFAULT_BUILDING_CODE_REQUIREMENTS
): { yOffset: number; height: number; minimumWallHeight: number } => {
  let suggestedHeight = feature.height;
  let suggestedYOffset = feature.position.yOffset;

  // Calculate what the minimum wall height would be with this feature
  const tempFeature: WallFeature = { ...feature, id: 'temp' };
  const heightBreakdown = calculateMinimumRequiredHeight([tempFeature], buildingCodeRequirements);
  const minimumWallHeight = heightBreakdown.finalMinimum;

  // If feature height exceeds wall height, reduce it
  if (feature.height > wallHeight) {
    suggestedHeight = wallHeight * 0.8; // 80% of wall height as maximum
  }

  // If position + height exceeds wall height, adjust position
  if (feature.position.yOffset + suggestedHeight > wallHeight) {
    suggestedYOffset = wallHeight - suggestedHeight;
  }

  // Ensure position is not below ground
  if (suggestedYOffset < 0) {
    suggestedYOffset = 0;
  }

  return {
    yOffset: Math.max(0, suggestedYOffset),
    height: Math.min(suggestedHeight, wallHeight),
    minimumWallHeight
  };
};