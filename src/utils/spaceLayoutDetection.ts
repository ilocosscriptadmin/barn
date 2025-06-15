import type { 
  WallFeature, 
  BuildingDimensions, 
  SpaceLayoutDetection, 
  DetectedWallFeature,
  ClearanceZone,
  AccessPath,
  VentilationArea,
  StructuralElement,
  LayoutConstraint,
  ClearanceRequirement,
  FunctionalZone,
  AccessRequirement,
  StructuralImpact,
  WallPosition
} from '../types';

/**
 * Space Layout Detection System - Identifies and maps all architectural elements
 */

/**
 * Scans the space and detects all wall features with their requirements
 */
export const scanSpaceLayout = (
  features: WallFeature[],
  dimensions: BuildingDimensions
): SpaceLayoutDetection => {
  console.log(`\n🔍 === SPACE LAYOUT DETECTION SCAN ===`);
  console.log(`Space: ${dimensions.width}ft × ${dimensions.length}ft × ${dimensions.height}ft`);
  console.log(`Features to analyze: ${features.length}`);

  const detectedFeatures = features.map(feature => detectFeatureRequirements(feature, dimensions));
  const clearanceZones = generateClearanceZones(detectedFeatures, dimensions);
  const accessPaths = generateAccessPaths(detectedFeatures, dimensions);
  const ventilationAreas = generateVentilationAreas(detectedFeatures, dimensions);
  const structuralElements = detectStructuralElements(detectedFeatures, dimensions);
  const layoutConstraints = generateLayoutConstraints(detectedFeatures, clearanceZones, dimensions);

  console.log(`✅ Space scan complete:`);
  console.log(`  - ${detectedFeatures.length} features detected`);
  console.log(`  - ${clearanceZones.length} clearance zones mapped`);
  console.log(`  - ${accessPaths.length} access paths identified`);
  console.log(`  - ${ventilationAreas.length} ventilation areas found`);
  console.log(`  - ${structuralElements.length} structural elements detected`);
  console.log(`  - ${layoutConstraints.length} layout constraints generated`);

  return {
    detectedFeatures,
    clearanceZones,
    accessPaths,
    ventilationAreas,
    structuralElements,
    layoutConstraints,
    lastScan: new Date()
  };
};

/**
 * Detects comprehensive requirements for a wall feature
 */
export const detectFeatureRequirements = (
  feature: WallFeature,
  dimensions: BuildingDimensions
): DetectedWallFeature => {
  console.log(`\n🔍 DETECTING REQUIREMENTS: ${feature.type} on ${feature.position.wallPosition} wall`);

  const clearanceRequirements = calculateClearanceRequirements(feature);
  const functionalZone = defineFunctionalZone(feature, dimensions);
  const accessRequirements = defineAccessRequirements(feature);
  const structuralImpact = assessStructuralImpact(feature, dimensions);

  const isProtected = true; // All features are protected by default
  const protectionReason = `${feature.type} requires dimensional stability and clearance maintenance`;

  console.log(`  ✅ Requirements detected for ${feature.type}`);
  console.log(`    - Clearances: front=${clearanceRequirements.front}ft, sides=${clearanceRequirements.sides}ft`);
  console.log(`    - Functional zone: ${functionalZone.type} (${functionalZone.purpose})`);
  console.log(`    - Access: ${accessRequirements.minimumWidth}ft × ${accessRequirements.minimumHeight}ft`);
  console.log(`    - Structural impact: ${structuralImpact.affectsWallIntegrity ? 'YES' : 'NO'}`);

  return {
    id: feature.id,
    type: feature.type,
    width: feature.width,
    height: feature.height,
    position: feature.position,
    clearanceRequirements,
    functionalZone,
    accessRequirements,
    structuralImpact,
    isProtected,
    protectionReason
  };
};

/**
 * Calculates clearance requirements based on feature type
 */
export const calculateClearanceRequirements = (feature: WallFeature): ClearanceRequirement => {
  let clearances: ClearanceRequirement;

  switch (feature.type) {
    case 'door':
    case 'walkDoor':
      clearances = {
        front: 3.0, // 3 feet in front for approach
        sides: 1.5, // 1.5 feet on each side
        above: 1.0, // 1 foot above for header
        swing: 3.0, // 3 feet for door swing
        emergency: 4.0 // 4 feet for emergency egress
      };
      break;

    case 'rollupDoor':
      clearances = {
        front: 4.0, // 4 feet in front for vehicle approach
        sides: 2.0, // 2 feet on each side for clearance
        above: 2.0, // 2 feet above for mechanism
        swing: 0, // No swing clearance (rolls up)
        emergency: 6.0 // 6 feet for emergency vehicle access
      };
      break;

    case 'window':
      clearances = {
        front: 1.0, // 1 foot in front for operation
        sides: 1.0, // 1 foot on each side
        above: 0.5, // 6 inches above for header
        swing: 2.0, // 2 feet for window operation
        emergency: 3.0 // 3 feet for emergency egress (if applicable)
      };
      break;

    default:
      clearances = {
        front: 2.0,
        sides: 1.0,
        above: 1.0,
        swing: 2.0,
        emergency: 3.0
      };
  }

  console.log(`    Clearances for ${feature.type}: front=${clearances.front}ft, swing=${clearances.swing}ft`);
  return clearances;
};

/**
 * Defines the functional zone around a feature
 */
export const defineFunctionalZone = (
  feature: WallFeature,
  dimensions: BuildingDimensions
): FunctionalZone => {
  const clearances = calculateClearanceRequirements(feature);
  
  // Calculate zone bounds based on feature position and clearances
  const wallWidth = (feature.position.wallPosition === 'front' || feature.position.wallPosition === 'back')
    ? dimensions.width
    : dimensions.length;

  let featureLeft: number;
  let featureRight: number;

  switch (feature.position.alignment) {
    case 'left':
      featureLeft = feature.position.xOffset;
      featureRight = featureLeft + feature.width;
      break;
    case 'right':
      featureRight = wallWidth - feature.position.xOffset;
      featureLeft = featureRight - feature.width;
      break;
    case 'center':
    default:
      featureLeft = (wallWidth / 2) + feature.position.xOffset - (feature.width / 2);
      featureRight = featureLeft + feature.width;
      break;
  }

  const bounds = {
    left: Math.max(0, featureLeft - clearances.sides),
    right: Math.min(wallWidth, featureRight + clearances.sides),
    front: clearances.front,
    back: 0,
    bottom: Math.max(0, feature.position.yOffset - 0.5),
    top: Math.min(dimensions.height, feature.position.yOffset + feature.height + clearances.above)
  };

  let zoneType: 'entry' | 'exit' | 'window' | 'ventilation' | 'access';
  let purpose: string;
  let restrictions: string[] = [];
  let canModify = false;

  switch (feature.type) {
    case 'door':
    case 'walkDoor':
      zoneType = 'entry';
      purpose = 'Primary access point requiring clear approach and egress paths';
      restrictions = [
        'Maintain clear path for daily access',
        'Ensure door swing clearance',
        'Preserve emergency egress capability'
      ];
      break;

    case 'rollupDoor':
      zoneType = 'entry';
      purpose = 'Vehicle/equipment access requiring large clearance area';
      restrictions = [
        'Maintain vehicle approach clearance',
        'Ensure overhead clearance for operation',
        'Preserve emergency vehicle access'
      ];
      break;

    case 'window':
      zoneType = 'window';
      purpose = 'Natural light and ventilation source requiring unobstructed operation';
      restrictions = [
        'Maintain natural light penetration',
        'Ensure window operation clearance',
        'Preserve ventilation airflow'
      ];
      break;

    default:
      zoneType = 'access';
      purpose = 'General access feature requiring basic clearances';
      restrictions = ['Maintain basic clearance requirements'];
  }

  console.log(`    Functional zone: ${zoneType} - ${purpose}`);

  return {
    type: zoneType,
    bounds,
    purpose,
    restrictions,
    canModify
  };
};

/**
 * Defines access requirements for a feature
 */
export const defineAccessRequirements = (feature: WallFeature): AccessRequirement => {
  let requirements: AccessRequirement;

  switch (feature.type) {
    case 'door':
    case 'walkDoor':
      requirements = {
        minimumWidth: feature.width + 2.0, // Feature width + 2ft clearance
        minimumHeight: feature.height + 1.0, // Feature height + 1ft clearance
        clearPath: true,
        emergencyAccess: true,
        dailyUse: true,
        restrictions: [
          'Must maintain clear approach path',
          'Required for emergency egress',
          'Daily access route - cannot be obstructed'
        ]
      };
      break;

    case 'rollupDoor':
      requirements = {
        minimumWidth: feature.width + 4.0, // Feature width + 4ft clearance
        minimumHeight: feature.height + 2.0, // Feature height + 2ft clearance
        clearPath: true,
        emergencyAccess: true,
        dailyUse: true,
        restrictions: [
          'Must maintain vehicle approach clearance',
          'Required for emergency vehicle access',
          'Primary equipment access - cannot be blocked'
        ]
      };
      break;

    case 'window':
      requirements = {
        minimumWidth: feature.width + 1.0, // Feature width + 1ft clearance
        minimumHeight: feature.height + 0.5, // Feature height + 6in clearance
        clearPath: false,
        emergencyAccess: feature.height >= 5.0 && feature.width >= 2.0, // Emergency egress window
        dailyUse: true,
        restrictions: [
          'Must maintain operation clearance',
          'Cannot obstruct natural light',
          'Required for ventilation'
        ]
      };
      break;

    default:
      requirements = {
        minimumWidth: feature.width + 1.0,
        minimumHeight: feature.height + 1.0,
        clearPath: false,
        emergencyAccess: false,
        dailyUse: false,
        restrictions: ['Basic clearance requirements']
      };
  }

  console.log(`    Access requirements: ${requirements.minimumWidth}ft × ${requirements.minimumHeight}ft, emergency=${requirements.emergencyAccess}`);
  return requirements;
};

/**
 * Assesses structural impact of a feature
 */
export const assessStructuralImpact = (
  feature: WallFeature,
  dimensions: BuildingDimensions
): StructuralImpact => {
  const wallArea = (feature.position.wallPosition === 'front' || feature.position.wallPosition === 'back')
    ? dimensions.width * dimensions.height
    : dimensions.length * dimensions.height;

  const featureArea = feature.width * feature.height;
  const openingRatio = featureArea / wallArea;

  const loadBearing = openingRatio > 0.15; // >15% opening affects load bearing
  const affectsWallIntegrity = openingRatio > 0.25; // >25% opening affects wall integrity
  const requiresReinforcement = openingRatio > 0.35; // >35% opening requires reinforcement
  const engineeringRequired = openingRatio > 0.5; // >50% opening requires engineering

  const modificationLimits: string[] = [];

  if (loadBearing) {
    modificationLimits.push('Load-bearing considerations limit wall modifications');
  }

  if (affectsWallIntegrity) {
    modificationLimits.push('Wall integrity requires dimensional stability');
  }

  if (requiresReinforcement) {
    modificationLimits.push('Structural reinforcement required for modifications');
  }

  if (engineeringRequired) {
    modificationLimits.push('Professional engineering review required');
  }

  console.log(`    Structural impact: opening ratio=${(openingRatio * 100).toFixed(1)}%, affects integrity=${affectsWallIntegrity}`);

  return {
    loadBearing,
    affectsWallIntegrity,
    requiresReinforcement,
    modificationLimits,
    engineeringRequired
  };
};

/**
 * Generates clearance zones around detected features
 */
export const generateClearanceZones = (
  detectedFeatures: DetectedWallFeature[],
  dimensions: BuildingDimensions
): ClearanceZone[] => {
  console.log(`\n🔍 GENERATING CLEARANCE ZONES for ${detectedFeatures.length} features`);

  const clearanceZones: ClearanceZone[] = [];

  detectedFeatures.forEach((feature, index) => {
    const clearances = feature.clearanceRequirements;

    // Door swing clearance zone
    if (feature.type === 'door' || feature.type === 'walkDoor') {
      clearanceZones.push({
        id: `swing-${feature.id}`,
        featureId: feature.id,
        type: 'door_swing',
        bounds: {
          left: feature.functionalZone.bounds.left,
          right: feature.functionalZone.bounds.right,
          front: clearances.swing,
          back: 0,
          bottom: feature.functionalZone.bounds.bottom,
          top: feature.functionalZone.bounds.top
        },
        isProtected: true,
        restrictions: [
          'Door swing area must remain clear',
          'No permanent obstructions allowed',
          'Required for safe door operation'
        ],
        purpose: 'Door swing clearance for safe operation'
      });
    }

    // Window operation clearance zone
    if (feature.type === 'window') {
      clearanceZones.push({
        id: `operation-${feature.id}`,
        featureId: feature.id,
        type: 'window_operation',
        bounds: {
          left: feature.functionalZone.bounds.left,
          right: feature.functionalZone.bounds.right,
          front: clearances.swing,
          back: 0,
          bottom: feature.functionalZone.bounds.bottom,
          top: feature.functionalZone.bounds.top
        },
        isProtected: true,
        restrictions: [
          'Window operation area must remain accessible',
          'Natural light path must be preserved',
          'Ventilation airflow cannot be obstructed'
        ],
        purpose: 'Window operation and light/ventilation clearance'
      });
    }

    // Emergency egress clearance zone
    if (feature.accessRequirements.emergencyAccess) {
      clearanceZones.push({
        id: `emergency-${feature.id}`,
        featureId: feature.id,
        type: 'emergency_egress',
        bounds: {
          left: feature.functionalZone.bounds.left - 1.0,
          right: feature.functionalZone.bounds.right + 1.0,
          front: clearances.emergency,
          back: 0,
          bottom: feature.functionalZone.bounds.bottom,
          top: feature.functionalZone.bounds.top
        },
        isProtected: true,
        restrictions: [
          'Emergency egress path must remain clear',
          'Required by building codes',
          'Cannot be obstructed or reduced'
        ],
        purpose: 'Emergency egress clearance - code required'
      });
    }

    console.log(`  ✅ Generated clearance zones for ${feature.type} (${clearanceZones.length - clearanceZones.length + (feature.type === 'window' ? 2 : feature.accessRequirements.emergencyAccess ? 2 : 1)} zones)`);
  });

  console.log(`✅ Total clearance zones generated: ${clearanceZones.length}`);
  return clearanceZones;
};

/**
 * Generates access paths between features
 */
export const generateAccessPaths = (
  detectedFeatures: DetectedWallFeature[],
  dimensions: BuildingDimensions
): AccessPath[] => {
  console.log(`\n🔍 GENERATING ACCESS PATHS between ${detectedFeatures.length} features`);

  const accessPaths: AccessPath[] = [];
  const entryFeatures = detectedFeatures.filter(f => 
    f.type === 'door' || f.type === 'walkDoor' || f.type === 'rollupDoor'
  );

  // Generate paths between all entry points
  for (let i = 0; i < entryFeatures.length; i++) {
    for (let j = i + 1; j < entryFeatures.length; j++) {
      const feature1 = entryFeatures[i];
      const feature2 = entryFeatures[j];

      // Calculate path requirements
      const minimumWidth = Math.max(
        feature1.accessRequirements.minimumWidth,
        feature2.accessRequirements.minimumWidth
      ) * 0.75; // 75% of larger requirement

      const pathType = (feature1.accessRequirements.emergencyAccess && feature2.accessRequirements.emergencyAccess)
        ? 'emergency' as const
        : (feature1.accessRequirements.dailyUse && feature2.accessRequirements.dailyUse)
          ? 'primary' as const
          : 'secondary' as const;

      // Calculate current available width (simplified)
      const currentWidth = Math.min(dimensions.width, dimensions.length) - 4.0; // Rough estimate

      const isBlocked = currentWidth < minimumWidth;

      const restrictions: string[] = [];
      if (pathType === 'emergency') {
        restrictions.push('Emergency egress path - must remain clear');
        restrictions.push('Required by building codes');
      }
      if (pathType === 'primary') {
        restrictions.push('Primary circulation path - daily use');
      }
      if (isBlocked) {
        restrictions.push('Path currently blocked or too narrow');
      }

      accessPaths.push({
        id: `path-${feature1.id}-${feature2.id}`,
        fromFeature: feature1.id,
        toFeature: feature2.id,
        pathType,
        minimumWidth,
        currentWidth,
        isBlocked,
        restrictions
      });

      console.log(`  ✅ Path: ${feature1.type} → ${feature2.type} (${pathType}, ${minimumWidth.toFixed(1)}ft min, ${isBlocked ? 'BLOCKED' : 'CLEAR'})`);
    }
  }

  console.log(`✅ Total access paths generated: ${accessPaths.length}`);
  return accessPaths;
};

/**
 * Generates ventilation areas for windows
 */
export const generateVentilationAreas = (
  detectedFeatures: DetectedWallFeature[],
  dimensions: BuildingDimensions
): VentilationArea[] => {
  console.log(`\n🔍 GENERATING VENTILATION AREAS for windows`);

  const ventilationAreas: VentilationArea[] = [];
  const windows = detectedFeatures.filter(f => f.type === 'window');

  windows.forEach((window, index) => {
    // Calculate airflow zone (area in front of window)
    const airflowDepth = 6.0; // 6 feet airflow zone
    const ventilationCapacity = window.width * window.height * 50; // Rough CFM calculation

    const airflowZone = {
      left: window.functionalZone.bounds.left,
      right: window.functionalZone.bounds.right,
      front: airflowDepth,
      back: 0,
      bottom: window.functionalZone.bounds.bottom,
      top: window.functionalZone.bounds.top
    };

    // Check for obstructions (simplified)
    const isObstructed = false; // Would check against other features/obstacles

    const restrictions = [
      'Airflow path must remain unobstructed',
      'Natural ventilation requires clear zone',
      'Cross-ventilation patterns must be preserved'
    ];

    if (isObstructed) {
      restrictions.push('Currently obstructed - ventilation compromised');
    }

    ventilationAreas.push({
      id: `ventilation-${window.id}`,
      windowId: window.id,
      airflowZone,
      naturalLight: true,
      ventilationCapacity,
      isObstructed,
      restrictions
    });

    console.log(`  ✅ Ventilation area for window: ${ventilationCapacity.toFixed(0)} CFM capacity, ${isObstructed ? 'OBSTRUCTED' : 'CLEAR'}`);
  });

  console.log(`✅ Total ventilation areas generated: ${ventilationAreas.length}`);
  return ventilationAreas;
};

/**
 * Detects structural elements that affect layout
 */
export const detectStructuralElements = (
  detectedFeatures: DetectedWallFeature[],
  dimensions: BuildingDimensions
): StructuralElement[] => {
  console.log(`\n🔍 DETECTING STRUCTURAL ELEMENTS`);

  const structuralElements: StructuralElement[] = [];

  // Detect headers above large openings
  detectedFeatures.forEach((feature, index) => {
    if (feature.width > 4.0) { // Large openings need headers
      const headerElement: StructuralElement = {
        id: `header-${feature.id}`,
        type: 'header',
        position: {
          x: feature.functionalZone.bounds.left + (feature.width / 2),
          y: feature.position.yOffset + feature.height + 0.5,
          z: 0
        },
        dimensions: {
          width: feature.width + 2.0, // Header extends beyond opening
          height: 1.0, // 12 inch header
          depth: 0.5 // 6 inch depth
        },
        isLoadBearing: true,
        canModify: false,
        restrictions: [
          'Load-bearing header - cannot be modified',
          'Required for structural integrity',
          'Professional engineering required for changes'
        ]
      };

      structuralElements.push(headerElement);
      console.log(`  ✅ Header detected above ${feature.type}: ${headerElement.dimensions.width}ft × ${headerElement.dimensions.height}ft`);
    }
  });

  // Detect corner reinforcements
  const corners = [
    { x: 0, y: 0, z: 0 },
    { x: dimensions.width, y: 0, z: 0 },
    { x: 0, y: dimensions.length, z: 0 },
    { x: dimensions.width, y: dimensions.length, z: 0 }
  ];

  corners.forEach((corner, index) => {
    const cornerElement: StructuralElement = {
      id: `corner-${index}`,
      type: 'column',
      position: corner,
      dimensions: {
        width: 0.5,
        height: dimensions.height,
        depth: 0.5
      },
      isLoadBearing: true,
      canModify: false,
      restrictions: [
        'Corner structural element',
        'Critical for building stability',
        'Cannot be removed or modified'
      ]
    };

    structuralElements.push(cornerElement);
  });

  console.log(`✅ Total structural elements detected: ${structuralElements.length}`);
  return structuralElements;
};

/**
 * Generates layout constraints based on detected features
 */
export const generateLayoutConstraints = (
  detectedFeatures: DetectedWallFeature[],
  clearanceZones: ClearanceZone[],
  dimensions: BuildingDimensions
): LayoutConstraint[] => {
  console.log(`\n🔍 GENERATING LAYOUT CONSTRAINTS`);

  const layoutConstraints: LayoutConstraint[] = [];

  // Feature clearance constraints
  detectedFeatures.forEach((feature, index) => {
    const constraint: LayoutConstraint = {
      id: `clearance-${feature.id}`,
      type: 'clearance',
      description: `${feature.type} requires ${feature.clearanceRequirements.front}ft clearance for proper operation`,
      affectedArea: {
        left: feature.functionalZone.bounds.left,
        right: feature.functionalZone.bounds.right,
        front: feature.clearanceRequirements.front,
        back: 0,
        bottom: feature.functionalZone.bounds.bottom,
        top: feature.functionalZone.bounds.top
      },
      severity: feature.accessRequirements.emergencyAccess ? 'critical' : 'important',
      canOverride: false,
      overrideRequirements: [
        'Professional architectural review required',
        'Building code compliance verification',
        'Alternative access provision'
      ]
    };

    layoutConstraints.push(constraint);
  });

  // Access path constraints
  clearanceZones.forEach((zone, index) => {
    if (zone.type === 'emergency_egress') {
      const constraint: LayoutConstraint = {
        id: `access-${zone.id}`,
        type: 'access',
        description: `Emergency egress path must remain clear and unobstructed`,
        affectedArea: zone.bounds,
        severity: 'critical',
        canOverride: false,
        overrideRequirements: [
          'Building code official approval required',
          'Alternative egress path provision',
          'Fire safety system upgrades'
        ]
      };

      layoutConstraints.push(constraint);
    }
  });

  // Structural constraints
  detectedFeatures.forEach((feature, index) => {
    if (feature.structuralImpact.affectsWallIntegrity) {
      const constraint: LayoutConstraint = {
        id: `structural-${feature.id}`,
        type: 'structural',
        description: `${feature.type} affects wall structural integrity - modifications restricted`,
        affectedArea: {
          left: feature.functionalZone.bounds.left - 2.0,
          right: feature.functionalZone.bounds.right + 2.0,
          front: 2.0,
          back: 2.0,
          bottom: 0,
          top: dimensions.height
        },
        severity: 'critical',
        canOverride: feature.structuralImpact.engineeringRequired ? false : true,
        overrideRequirements: feature.structuralImpact.modificationLimits
      };

      layoutConstraints.push(constraint);
    }
  });

  console.log(`✅ Total layout constraints generated: ${layoutConstraints.length}`);
  console.log(`  - Critical: ${layoutConstraints.filter(c => c.severity === 'critical').length}`);
  console.log(`  - Important: ${layoutConstraints.filter(c => c.severity === 'important').length}`);
  console.log(`  - Advisory: ${layoutConstraints.filter(c => c.severity === 'advisory').length}`);

  return layoutConstraints;
};

/**
 * Validates proposed space modifications against detected layout
 */
export const validateSpaceModification = (
  spaceLayout: SpaceLayoutDetection,
  proposedDimensions: Partial<BuildingDimensions>,
  currentDimensions: BuildingDimensions
): { canModify: boolean; violations: string[]; suggestions: string[] } => {
  console.log(`\n🔍 VALIDATING SPACE MODIFICATION`);
  console.log(`Current: ${currentDimensions.width}ft × ${currentDimensions.length}ft × ${currentDimensions.height}ft`);
  console.log(`Proposed changes:`, proposedDimensions);

  const violations: string[] = [];
  const suggestions: string[] = [];

  // Check each layout constraint
  spaceLayout.layoutConstraints.forEach((constraint, index) => {
    console.log(`\n--- Checking constraint ${index + 1}: ${constraint.type} ---`);

    // Check if proposed dimensions would violate this constraint
    const newDimensions = { ...currentDimensions, ...proposedDimensions };

    // Simplified validation - in practice would be more complex
    if (constraint.severity === 'critical' && !constraint.canOverride) {
      if (proposedDimensions.width && newDimensions.width < currentDimensions.width) {
        if (constraint.affectedArea.right > newDimensions.width) {
          violations.push(`CRITICAL: ${constraint.description} - width reduction would violate constraint`);
        }
      }

      if (proposedDimensions.length && newDimensions.length < currentDimensions.length) {
        if (constraint.affectedArea.front > newDimensions.length) {
          violations.push(`CRITICAL: ${constraint.description} - length reduction would violate constraint`);
        }
      }

      if (proposedDimensions.height && newDimensions.height < currentDimensions.height) {
        if (constraint.affectedArea.top > newDimensions.height) {
          violations.push(`CRITICAL: ${constraint.description} - height reduction would violate constraint`);
        }
      }
    }
  });

  // Check clearance zones
  spaceLayout.clearanceZones.forEach((zone, index) => {
    if (zone.isProtected) {
      const newDimensions = { ...currentDimensions, ...proposedDimensions };

      // Check if modification would affect this clearance zone
      if (proposedDimensions.width && zone.bounds.right > newDimensions.width) {
        violations.push(`Clearance violation: ${zone.purpose} would be compromised by width reduction`);
      }

      if (proposedDimensions.length && zone.bounds.front > newDimensions.length) {
        violations.push(`Clearance violation: ${zone.purpose} would be compromised by length reduction`);
      }
    }
  });

  // Check access paths
  spaceLayout.accessPaths.forEach((path, index) => {
    if (path.pathType === 'emergency' || path.pathType === 'primary') {
      // Simplified check - would need more complex path analysis
      const newDimensions = { ...currentDimensions, ...proposedDimensions };
      const estimatedNewPathWidth = Math.min(newDimensions.width, newDimensions.length) - 4.0;

      if (estimatedNewPathWidth < path.minimumWidth) {
        violations.push(`Access path violation: ${path.pathType} path would be too narrow (${estimatedNewPathWidth.toFixed(1)}ft < ${path.minimumWidth.toFixed(1)}ft required)`);
      }
    }
  });

  // Generate suggestions
  if (violations.length > 0) {
    suggestions.push('Consider relocating or resizing features to allow space modifications');
    suggestions.push('Review clearance requirements and adjust accordingly');
    suggestions.push('Consult with architect for alternative layout solutions');

    if (spaceLayout.layoutConstraints.some(c => c.severity === 'critical')) {
      suggestions.push('Professional review required for critical constraint modifications');
    }
  } else {
    suggestions.push('Proposed modifications appear compatible with current layout');
    suggestions.push('Verify final dimensions maintain all clearance requirements');
  }

  const canModify = violations.length === 0;

  console.log(`\n📊 VALIDATION RESULT: ${canModify ? '✅ CAN MODIFY' : '❌ VIOLATIONS FOUND'}`);
  console.log(`Violations: ${violations.length}`);
  console.log(`Suggestions: ${suggestions.length}`);

  return { canModify, violations, suggestions };
};

/**
 * Gets clearance zones for a specific feature
 */
export const getFeatureClearanceZones = (
  spaceLayout: SpaceLayoutDetection,
  featureId: string
): ClearanceZone[] => {
  return spaceLayout.clearanceZones.filter(zone => zone.featureId === featureId);
};

/**
 * Checks all access paths for obstructions
 */
export const checkAccessPaths = (spaceLayout: SpaceLayoutDetection): AccessPath[] => {
  console.log(`\n🔍 CHECKING ACCESS PATHS for obstructions`);

  const updatedPaths = spaceLayout.accessPaths.map(path => {
    // In a real implementation, this would check for actual obstructions
    // For now, we'll use the existing path data
    console.log(`  Path ${path.fromFeature} → ${path.toFeature}: ${path.isBlocked ? 'BLOCKED' : 'CLEAR'}`);
    return path;
  });

  const blockedPaths = updatedPaths.filter(path => path.isBlocked);
  console.log(`✅ Access path check complete: ${blockedPaths.length} blocked paths found`);

  return updatedPaths;
};

/**
 * Validates ventilation areas for obstructions
 */
export const validateVentilation = (spaceLayout: SpaceLayoutDetection): VentilationArea[] => {
  console.log(`\n🔍 VALIDATING VENTILATION AREAS`);

  const updatedAreas = spaceLayout.ventilationAreas.map(area => {
    // In a real implementation, this would check for actual obstructions
    // For now, we'll use the existing area data
    console.log(`  Window ${area.windowId}: ${area.ventilationCapacity.toFixed(0)} CFM, ${area.isObstructed ? 'OBSTRUCTED' : 'CLEAR'}`);
    return area;
  });

  const obstructedAreas = updatedAreas.filter(area => area.isObstructed);
  console.log(`✅ Ventilation validation complete: ${obstructedAreas.length} obstructed areas found`);

  return updatedAreas;
};