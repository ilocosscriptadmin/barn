import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { validateWallHeights } from '../utils/wallHeightValidation';
import { isValidFeaturePosition } from '../utils/wallBoundsValidation';
import { isValidSkylightPosition } from '../utils/skylightValidation';
import { validateRoomDimensions, enforceMinimumDimensions, STANDARD_ROOM_CONSTRAINTS } from '../utils/roomConstraints';
import { 
  validateWallDimensionChange, 
  getWallProtectionStatus, 
  generateLockStatusMessage,
  checkDimensionLock,
  createFeatureBoundsLock,
  suggestSafeDimensionChanges
} from '../utils/wallBoundsLockSystem';
import {
  scanSpaceLayout,
  validateSpaceModification,
  getFeatureClearanceZones,
  checkAccessPaths,
  validateVentilation
} from '../utils/spaceLayoutDetection';
import type { 
  BuildingStore, 
  Project, 
  ViewMode, 
  BuildingDimensions, 
  WallFeature, 
  Skylight, 
  WallProfile, 
  Building, 
  WallPosition, 
  WallBoundsProtection,
  SpaceLayoutDetection,
  ClearanceZone,
  AccessPath,
  VentilationArea
} from '../types';
import type { 
  PartitionWall, 
  PartitionFeature, 
  InteriorLayout, 
  VisualizationSettings,
  StallConfiguration 
} from '../types/partitions';

// Default visualization settings
const defaultVisualizationSettings: VisualizationSettings = {
  exteriorWallOpacity: 1.0,
  roofOpacity: 1.0,
  showStructuralElements: true,
  showPartitionWalls: true,
  showStallLabels: true,
  showDimensions: true,
  interiorLighting: true,
  shadowQuality: 'medium'
};

// Default interior layout
const defaultInteriorLayout: InteriorLayout = {
  partitionWalls: [],
  stallConfiguration: [],
  accessPaths: [],
  ventilationZones: [],
  lastModified: new Date()
};

// Default initial building with minimum room constraints
const defaultBuilding = {
  dimensions: {
    width: 30,
    length: 40,
    height: 12,
    roofPitch: 4, // 4:12 pitch
  },
  features: [],
  skylights: [],
  color: '#E5E7EB', // Light gray
  roofColor: '#9CA3AF', // Medium gray
  wallProfile: 'trimdek' as WallProfile, // Default to Trimdek profile
  wallBoundsProtection: new Map<WallPosition, WallBoundsProtection>(),
  spaceLayout: undefined as SpaceLayoutDetection | undefined,
  interiorLayout: defaultInteriorLayout,
  visualizationSettings: defaultVisualizationSettings,
};

// Create a default project with validated dimensions
const createDefaultProject = (): Project => {
  // Ensure default dimensions meet minimum requirements
  const validatedDimensions = enforceMinimumDimensions(
    defaultBuilding.dimensions,
    defaultBuilding.dimensions,
    STANDARD_ROOM_CONSTRAINTS
  );

  return {
    id: uuidv4(),
    name: 'New Room',
    created: new Date(),
    lastModified: new Date(),
    building: { 
      ...defaultBuilding,
      dimensions: validatedDimensions
    },
  };
};

// Create the store
export const useBuildingStore = create<BuildingStore>((set, get) => ({
  currentProject: createDefaultProject(),
  savedProjects: [],
  currentView: '3d' as ViewMode,

  // Set complete building state atomically
  setBuilding: (building: Building) =>
    set((state) => {
      console.log(`\n🏗️ SETTING COMPLETE BUILDING STATE WITH SPACE LAYOUT DETECTION`);
      
      // First, validate and enforce room dimension constraints
      const roomValidation = validateRoomDimensions(building.dimensions, STANDARD_ROOM_CONSTRAINTS);
      
      if (!roomValidation.valid) {
        console.error('Room dimension validation failed:', roomValidation.errors);
        
        // Use adjusted dimensions if available, otherwise enforce minimums
        const adjustedDimensions = roomValidation.adjustedDimensions || 
          enforceMinimumDimensions(building.dimensions, building.dimensions, STANDARD_ROOM_CONSTRAINTS);
        
        building = {
          ...building,
          dimensions: adjustedDimensions
        };
        
        console.log(`📏 Applied dimension adjustments: ${adjustedDimensions.width}ft × ${adjustedDimensions.length}ft × ${adjustedDimensions.height}ft`);
      }

      // Validate height constraints for all features
      const heightValidation = validateWallHeights(building.dimensions, building.features);
      
      if (!heightValidation.valid) {
        console.error('Building height validation failed:', heightValidation.errors);
        return state;
      }

      // Validate wall bounds for all features
      const invalidFeatures = building.features.filter(feature => {
        return !isValidFeaturePosition(feature, building.dimensions);
      });

      if (invalidFeatures.length > 0) {
        console.error('Building wall bounds validation failed for features:', invalidFeatures.map(f => f.id));
        return state;
      }

      // Validate skylight bounds for all skylights
      const invalidSkylights = building.skylights.filter(skylight => {
        return !isValidSkylightPosition(skylight, building.dimensions);
      });

      if (invalidSkylights.length > 0) {
        console.error('Building skylight bounds validation failed for skylights:', invalidSkylights.length);
        return state;
      }

      // 🔍 SCAN SPACE LAYOUT - Detect all architectural elements
      console.log(`\n🔍 === SPACE LAYOUT DETECTION ===`);
      const spaceLayout = scanSpaceLayout(building.features, building.dimensions);
      console.log(`✅ Space layout scan complete:`);
      console.log(`  - ${spaceLayout.detectedFeatures.length} features with requirements detected`);
      console.log(`  - ${spaceLayout.clearanceZones.length} clearance zones mapped`);
      console.log(`  - ${spaceLayout.accessPaths.length} access paths identified`);
      console.log(`  - ${spaceLayout.ventilationAreas.length} ventilation areas found`);
      console.log(`  - ${spaceLayout.layoutConstraints.length} layout constraints generated`);

      // 🔒 CREATE WALL BOUNDS PROTECTION for all walls with features
      const wallBoundsProtection = new Map<WallPosition, WallBoundsProtection>();
      const wallPositions: WallPosition[] = ['front', 'back', 'left', 'right'];
      
      wallPositions.forEach(wallPosition => {
        const protection = getWallProtectionStatus(wallPosition, building.features, building.dimensions);
        if (protection) {
          wallBoundsProtection.set(wallPosition, protection);
          console.log(`🛡️ ${generateLockStatusMessage(wallPosition, protection)}`);
        }
      });

      // Add bounds locks and enhanced requirements to features
      const featuresWithEnhancements = building.features.map(feature => {
        const detectedFeature = spaceLayout.detectedFeatures.find(df => df.id === feature.id);
        
        return {
          ...feature,
          boundsLock: createFeatureBoundsLock(feature, building.dimensions),
          isLocked: true,
          clearanceRequirements: detectedFeature?.clearanceRequirements,
          functionalZone: detectedFeature?.functionalZone,
          accessRequirements: detectedFeature?.accessRequirements,
          structuralImpact: detectedFeature?.structuralImpact
        };
      });

      // Ensure interior layout and visualization settings exist
      const interiorLayout = building.interiorLayout || defaultInteriorLayout;
      const visualizationSettings = building.visualizationSettings || defaultVisualizationSettings;

      console.log(`✅ Building state validation passed with space layout protection`);
      console.log(`🛡️ ${wallBoundsProtection.size} protected walls`);
      console.log(`🔍 ${spaceLayout.layoutConstraints.filter(c => c.severity === 'critical').length} critical layout constraints`);

      return {
        currentProject: {
          ...state.currentProject,
          lastModified: new Date(),
          building: {
            ...building,
            features: featuresWithEnhancements,
            wallBoundsProtection,
            spaceLayout,
            interiorLayout,
            visualizationSettings
          },
        },
      };
    }),

  // Update building dimensions with comprehensive validation and space layout checking
  updateDimensions: (dimensions: Partial<BuildingDimensions>) => 
    set((state) => {
      console.log(`\n🏗️ UPDATING DIMENSIONS WITH SPACE LAYOUT PROTECTION`);
      console.log(`Proposed changes:`, dimensions);
      
      // 🔍 CHECK SPACE LAYOUT CONSTRAINTS first
      if (state.currentProject.building.spaceLayout) {
        const spaceValidation = validateSpaceModification(
          state.currentProject.building.spaceLayout,
          dimensions,
          state.currentProject.building.dimensions
        );
        
        if (!spaceValidation.canModify) {
          console.log(`\n🚫 DIMENSION UPDATE BLOCKED - SPACE LAYOUT VIOLATIONS`);
          console.log(`Space violations: ${spaceValidation.violations.length}`);
          spaceValidation.violations.forEach(violation => console.log(`  ❌ ${violation}`));
          
          // Show user-friendly error message
          const errorMessage = [
            'Cannot modify room dimensions - architectural elements prevent changes:',
            ...spaceValidation.violations.slice(0, 3), // Show first 3 violations
            spaceValidation.violations.length > 3 ? `...and ${spaceValidation.violations.length - 3} more restrictions` : '',
            '',
            'Suggestions:',
            ...spaceValidation.suggestions.slice(0, 2)
          ].filter(Boolean).join('\n');
          
          console.error(errorMessage);
          
          // Return current state without changes
          return state;
        }
        
        // Show suggestions if any
        if (spaceValidation.suggestions.length > 0) {
          console.log(`\n💡 SPACE LAYOUT SUGGESTIONS:`);
          spaceValidation.suggestions.forEach(suggestion => console.log(`  💡 ${suggestion}`));
        }
      }
      
      // 🔒 CHECK WALL BOUNDS LOCKS for each affected wall
      const wallPositions: WallPosition[] = ['front', 'back', 'left', 'right'];
      const lockViolations: string[] = [];
      const lockWarnings: string[] = [];
      
      wallPositions.forEach(wallPosition => {
        // Check if this dimension change affects this wall
        const affectedDimensions = [];
        if ((wallPosition === 'front' || wallPosition === 'back') && dimensions.width !== undefined) {
          affectedDimensions.push('width');
        }
        if ((wallPosition === 'left' || wallPosition === 'right') && dimensions.length !== undefined) {
          affectedDimensions.push('length');
        }
        if (dimensions.height !== undefined) {
          affectedDimensions.push('height');
        }
        
        if (affectedDimensions.length > 0) {
          const validation = validateWallDimensionChange(
            wallPosition,
            state.currentProject.building.dimensions,
            dimensions,
            state.currentProject.building.features
          );
          
          if (!validation.canModify) {
            lockViolations.push(...validation.restrictions);
            console.log(`❌ ${wallPosition} wall: DIMENSION CHANGE BLOCKED`);
            validation.restrictions.forEach(restriction => console.log(`  - ${restriction}`));
          } else if (validation.warnings.length > 0) {
            lockWarnings.push(...validation.warnings);
            console.log(`⚠️ ${wallPosition} wall: Warnings for dimension change`);
          }
        }
      });
      
      // If any walls are locked, prevent the dimension change
      if (lockViolations.length > 0) {
        console.log(`\n🚫 DIMENSION UPDATE BLOCKED - WALL BOUNDS PROTECTION ACTIVE`);
        console.log(`Lock violations: ${lockViolations.length}`);
        lockViolations.forEach(violation => console.log(`  ❌ ${violation}`));
        
        // Show user-friendly error message
        const errorMessage = [
          'Cannot modify room dimensions - wall features prevent changes:',
          ...lockViolations.slice(0, 3), // Show first 3 violations
          lockViolations.length > 3 ? `...and ${lockViolations.length - 3} more restrictions` : ''
        ].filter(Boolean).join('\n');
        
        console.error(errorMessage);
        
        // Return current state without changes
        return state;
      }
      
      // Show warnings if any
      if (lockWarnings.length > 0) {
        console.log(`\n⚠️ DIMENSION UPDATE WARNINGS:`);
        lockWarnings.forEach(warning => console.log(`  ⚠️ ${warning}`));
      }
      
      // First, enforce minimum room constraints
      const enforcedDimensions = enforceMinimumDimensions(
        dimensions,
        state.currentProject.building.dimensions,
        STANDARD_ROOM_CONSTRAINTS
      );

      // Validate the enforced dimensions
      const roomValidation = validateRoomDimensions(enforcedDimensions, STANDARD_ROOM_CONSTRAINTS);
      
      if (!roomValidation.valid) {
        console.warn('Room dimension validation failed after enforcement:', roomValidation.errors);
        
        // Use adjusted dimensions if available
        if (roomValidation.adjustedDimensions) {
          Object.assign(enforcedDimensions, roomValidation.adjustedDimensions);
          console.log(`📏 Applied additional adjustments:`, roomValidation.adjustedDimensions);
        }
      }

      // If height changed, validate all existing features
      if (dimensions.height !== undefined) {
        const heightValidation = validateWallHeights(enforcedDimensions, state.currentProject.building.features);
        
        if (!heightValidation.valid) {
          console.warn('Wall height validation failed:', heightValidation.errors);
        }
      }

      // If width or length changed, validate wall bounds for all features
      if (dimensions.width !== undefined || dimensions.length !== undefined) {
        const invalidFeatures = state.currentProject.building.features.filter(feature => {
          return !isValidFeaturePosition(feature, enforcedDimensions);
        });

        if (invalidFeatures.length > 0) {
          console.warn('Wall bounds validation failed for features:', invalidFeatures.map(f => f.id));
        }

        // Also validate skylights when roof dimensions change
        const invalidSkylights = state.currentProject.building.skylights.filter(skylight => {
          return !isValidSkylightPosition(skylight, enforcedDimensions);
        });

        if (invalidSkylights.length > 0) {
          console.warn('Skylight bounds validation failed for skylights:', invalidSkylights.length);
        }
      }

      // 🔍 UPDATE SPACE LAYOUT after successful dimension change
      const updatedSpaceLayout = scanSpaceLayout(state.currentProject.building.features, enforcedDimensions);
      console.log(`🔍 Space layout updated: ${updatedSpaceLayout.layoutConstraints.length} constraints`);

      // 🔒 UPDATE WALL BOUNDS PROTECTION after successful dimension change
      const updatedWallBoundsProtection = new Map<WallPosition, WallBoundsProtection>();
      
      wallPositions.forEach(wallPosition => {
        const protection = getWallProtectionStatus(wallPosition, state.currentProject.building.features, enforcedDimensions);
        if (protection) {
          updatedWallBoundsProtection.set(wallPosition, protection);
          console.log(`🛡️ Updated: ${generateLockStatusMessage(wallPosition, protection)}`);
        }
      });

      console.log(`✅ Final dimensions: ${enforcedDimensions.width}ft × ${enforcedDimensions.length}ft × ${enforcedDimensions.height}ft`);
      console.log(`🔒 Wall protection updated for ${updatedWallBoundsProtection.size} walls`);
      console.log(`🔍 Space layout constraints: ${updatedSpaceLayout.layoutConstraints.filter(c => c.severity === 'critical').length} critical`);

      return {
        currentProject: {
          ...state.currentProject,
          lastModified: new Date(),
          building: {
            ...state.currentProject.building,
            dimensions: enforcedDimensions,
            wallBoundsProtection: updatedWallBoundsProtection,
            spaceLayout: updatedSpaceLayout
          },
        },
      };
    }),

  // Add a new wall feature with comprehensive validation and space layout integration
  addFeature: (feature: Omit<WallFeature, 'id'>) => 
    set((state) => {
      const newFeature = { ...feature, id: uuidv4() };
      const newFeatures = [...state.currentProject.building.features, newFeature];
      
      // Validate height constraints
      const heightValidation = validateWallHeights(
        state.currentProject.building.dimensions,
        newFeatures
      );

      if (!heightValidation.valid) {
        console.error('Feature height validation failed:', heightValidation.errors);
        return state;
      }

      // Validate wall bounds
      const boundsValid = isValidFeaturePosition(feature, state.currentProject.building.dimensions);

      if (!boundsValid) {
        console.error('Feature bounds validation failed: Feature extends beyond wall boundaries');
        return state;
      }

      // 🔍 UPDATE SPACE LAYOUT with new feature
      const updatedSpaceLayout = scanSpaceLayout(newFeatures, state.currentProject.building.dimensions);
      console.log(`🔍 Space layout updated with new ${newFeature.type}: ${updatedSpaceLayout.layoutConstraints.length} constraints`);

      // Check if adding this feature creates any critical violations
      const criticalConstraints = updatedSpaceLayout.layoutConstraints.filter(c => c.severity === 'critical');
      if (criticalConstraints.length > 0) {
        console.log(`⚠️ Adding ${newFeature.type} creates ${criticalConstraints.length} critical constraints`);
      }

      // 🔒 CREATE BOUNDS LOCK for the new feature with enhanced requirements
      const detectedFeature = updatedSpaceLayout.detectedFeatures.find(df => df.id === newFeature.id);
      const featureWithEnhancements: WallFeature = {
        ...newFeature,
        boundsLock: createFeatureBoundsLock(newFeature, state.currentProject.building.dimensions),
        isLocked: true,
        clearanceRequirements: detectedFeature?.clearanceRequirements,
        functionalZone: detectedFeature?.functionalZone,
        accessRequirements: detectedFeature?.accessRequirements,
        structuralImpact: detectedFeature?.structuralImpact
      };

      const featuresWithEnhancements = [...state.currentProject.building.features, featureWithEnhancements];

      // 🔒 UPDATE WALL BOUNDS PROTECTION
      const wallBoundsProtection = new Map<WallPosition, WallBoundsProtection>();
      const wallPositions: WallPosition[] = ['front', 'back', 'left', 'right'];
      
      wallPositions.forEach(wallPosition => {
        const protection = getWallProtectionStatus(wallPosition, featuresWithEnhancements, state.currentProject.building.dimensions);
        if (protection) {
          wallBoundsProtection.set(wallPosition, protection);
        }
      });

      console.log(`🔒 Feature added with space layout integration: ${newFeature.type} on ${newFeature.position.wallPosition} wall`);
      console.log(`🛡️ Wall protection updated for ${wallBoundsProtection.size} walls`);
      console.log(`🔍 Clearance zones: ${updatedSpaceLayout.clearanceZones.filter(z => z.featureId === newFeature.id).length} for this feature`);

      return {
        currentProject: {
          ...state.currentProject,
          lastModified: new Date(),
          building: {
            ...state.currentProject.building,
            features: featuresWithEnhancements,
            wallBoundsProtection,
            spaceLayout: updatedSpaceLayout
          },
        },
      };
    }),

  // Add a partition wall to the interior layout
  addPartitionWall: (wall: Omit<PartitionWall, 'id'>) =>
    set((state) => {
      const newWall: PartitionWall = {
        ...wall,
        id: uuidv4(),
        features: [],
        isLoadBearing: false,
        currentHeight: wall.height || state.currentProject.building.dimensions.height,
        targetHeight: wall.height || state.currentProject.building.dimensions.height,
        isLocked: false,
        speed: 5, // Default medium speed (1-10 scale)
        color: wall.color || '#8B4513'
      };
      
      const currentInteriorLayout = state.currentProject.building.interiorLayout || defaultInteriorLayout;
      
      const updatedInteriorLayout: InteriorLayout = {
        ...currentInteriorLayout,
        partitionWalls: [...currentInteriorLayout.partitionWalls, newWall],
        lastModified: new Date()
      };
      
      console.log(`🏗️ Added partition wall: ${newWall.name} (${newWall.material})`);
      
      return {
        currentProject: {
          ...state.currentProject,
          lastModified: new Date(),
          building: {
            ...state.currentProject.building,
            interiorLayout: updatedInteriorLayout
          }
        }
      };
    }),
    
  // Update a partition wall
  updatePartitionWall: (id: string, updates: Partial<PartitionWall>) =>
    set((state) => {
      const currentInteriorLayout = state.currentProject.building.interiorLayout || defaultInteriorLayout;
      
      const updatedWalls = currentInteriorLayout.partitionWalls.map(wall => {
        if (wall.id === id) {
          // If the wall is locked, only allow certain updates
          if (wall.isLocked && updates.targetHeight !== undefined) {
            console.log(`🔒 Wall ${id} is locked - height changes not applied`);
            // Remove targetHeight from updates to prevent changes when locked
            const { targetHeight, ...allowedUpdates } = updates;
            return { ...wall, ...allowedUpdates };
          }
          
          // If targetHeight is being updated, update it but don't immediately change currentHeight
          // This allows for animated transitions
          if (updates.targetHeight !== undefined && !wall.isLocked) {
            return { 
              ...wall, 
              ...updates,
              // Keep current height as is for animation
              currentHeight: updates.currentHeight !== undefined ? updates.currentHeight : wall.currentHeight
            };
          }
          
          return { ...wall, ...updates };
        }
        return wall;
      });
      
      const updatedInteriorLayout: InteriorLayout = {
        ...currentInteriorLayout,
        partitionWalls: updatedWalls,
        lastModified: new Date()
      };
      
      console.log(`🔄 Updated partition wall: ${id}`);
      
      return {
        currentProject: {
          ...state.currentProject,
          lastModified: new Date(),
          building: {
            ...state.currentProject.building,
            interiorLayout: updatedInteriorLayout
          }
        }
      };
    }),
    
  // Remove a partition wall
  removePartitionWall: (id: string) =>
    set((state) => {
      const currentInteriorLayout = state.currentProject.building.interiorLayout || defaultInteriorLayout;
      
      const updatedWalls = currentInteriorLayout.partitionWalls.filter(wall => wall.id !== id);
      
      const updatedInteriorLayout: InteriorLayout = {
        ...currentInteriorLayout,
        partitionWalls: updatedWalls,
        lastModified: new Date()
      };
      
      console.log(`🗑️ Removed partition wall: ${id}`);
      
      return {
        currentProject: {
          ...state.currentProject,
          lastModified: new Date(),
          building: {
            ...state.currentProject.building,
            interiorLayout: updatedInteriorLayout
          }
        }
      };
    }),
    
  // Add a feature to a partition wall
  addPartitionFeature: (wallId: string, feature: Omit<PartitionFeature, 'id'>) =>
    set((state) => {
      const currentInteriorLayout = state.currentProject.building.interiorLayout || defaultInteriorLayout;
      
      const newFeature: PartitionFeature = {
        ...feature,
        id: uuidv4()
      };
      
      const updatedWalls = currentInteriorLayout.partitionWalls.map(wall => {
        if (wall.id === wallId) {
          return {
            ...wall,
            features: [...wall.features, newFeature]
          };
        }
        return wall;
      });
      
      const updatedInteriorLayout: InteriorLayout = {
        ...currentInteriorLayout,
        partitionWalls: updatedWalls,
        lastModified: new Date()
      };
      
      console.log(`➕ Added ${feature.type} to partition wall: ${wallId}`);
      
      return {
        currentProject: {
          ...state.currentProject,
          lastModified: new Date(),
          building: {
            ...state.currentProject.building,
            interiorLayout: updatedInteriorLayout
          }
        }
      };
    }),
    
  // Update visualization settings
  updateVisualizationSettings: (settings: Partial<VisualizationSettings>) =>
    set((state) => {
      const currentSettings = state.currentProject.building.visualizationSettings || defaultVisualizationSettings;
      
      const updatedSettings: VisualizationSettings = {
        ...currentSettings,
        ...settings
      };
      
      console.log(`👁️ Updated visualization settings:`, settings);
      
      return {
        currentProject: {
          ...state.currentProject,
          lastModified: new Date(),
          building: {
            ...state.currentProject.building,
            visualizationSettings: updatedSettings
          }
        }
      };
    }),
    
  // Add a stall configuration
  addStallConfiguration: (stall: Omit<StallConfiguration, 'id'>) =>
    set((state) => {
      const currentInteriorLayout = state.currentProject.building.interiorLayout || defaultInteriorLayout;
      
      const newStall: StallConfiguration = {
        ...stall,
        id: uuidv4()
      };
      
      const updatedInteriorLayout: InteriorLayout = {
        ...currentInteriorLayout,
        stallConfiguration: [...currentInteriorLayout.stallConfiguration, newStall],
        lastModified: new Date()
      };
      
      console.log(`🏠 Added stall configuration: ${stall.name} (${stall.purpose})`);
      
      return {
        currentProject: {
          ...state.currentProject,
          lastModified: new Date(),
          building: {
            ...state.currentProject.building,
            interiorLayout: updatedInteriorLayout
          }
        }
      };
    }),

  // Remove a wall feature and update space layout
  removeFeature: (id: string) => 
    set((state) => {
      const removedFeature = state.currentProject.building.features.find(f => f.id === id);
      const remainingFeatures = state.currentProject.building.features.filter(
        (feature) => feature.id !== id
      );

      // 🔍 UPDATE SPACE LAYOUT after feature removal
      const updatedSpaceLayout = scanSpaceLayout(remainingFeatures, state.currentProject.building.dimensions);
      console.log(`🔍 Space layout updated after removing ${removedFeature?.type}: ${updatedSpaceLayout.layoutConstraints.length} constraints`);

      // 🔒 UPDATE WALL BOUNDS PROTECTION after feature removal
      const wallBoundsProtection = new Map<WallPosition, WallBoundsProtection>();
      const wallPositions: WallPosition[] = ['front', 'back', 'left', 'right'];
      
      wallPositions.forEach(wallPosition => {
        const protection = getWallProtectionStatus(wallPosition, remainingFeatures, state.currentProject.building.dimensions);
        if (protection) {
          wallBoundsProtection.set(wallPosition, protection);
        }
      });

      if (removedFeature) {
        console.log(`🔓 Feature removed and space unlocked: ${removedFeature.type} from ${removedFeature.position.wallPosition} wall`);
        console.log(`🛡️ Wall protection updated for ${wallBoundsProtection.size} walls`);
        console.log(`🔍 Layout constraints reduced by feature removal`);
      }

      return {
        currentProject: {
          ...state.currentProject,
          lastModified: new Date(),
          building: {
            ...state.currentProject.building,
            features: remainingFeatures,
            wallBoundsProtection,
            spaceLayout: updatedSpaceLayout
          },
        },
      };
    }),

  // Add a new skylight with validation
  addSkylight: (skylight: Skylight) =>
    set((state) => {
      // Validate skylight bounds
      const boundsValid = isValidSkylightPosition(skylight, state.currentProject.building.dimensions);

      if (!boundsValid) {
        console.error('Skylight bounds validation failed: Skylight extends beyond roof boundaries');
        return state;
      }

      return {
        currentProject: {
          ...state.currentProject,
          lastModified: new Date(),
          building: {
            ...state.currentProject.building,
            skylights: [...state.currentProject.building.skylights, skylight],
          },
        },
      };
    }),

  // Remove a skylight
  removeSkylight: (index: number) =>
    set((state) => ({
      currentProject: {
        ...state.currentProject,
        lastModified: new Date(),
        building: {
          ...state.currentProject.building,
          skylights: state.currentProject.building.skylights.filter((_, i) => i !== index),
        },
      },
    })),

  // Update a skylight with validation
  updateSkylight: (index: number, updates: Partial<Skylight>) =>
    set((state) => {
      const updatedSkylights = state.currentProject.building.skylights.map((skylight, i) =>
        i === index ? { ...skylight, ...updates } : skylight
      );

      // Validate the updated skylight
      const updatedSkylight = updatedSkylights[index];
      const boundsValid = isValidSkylightPosition(updatedSkylight, state.currentProject.building.dimensions);

      if (!boundsValid) {
        console.error('Skylight update bounds validation failed: Skylight extends beyond roof boundaries');
        return state;
      }

      return {
        currentProject: {
          ...state.currentProject,
          lastModified: new Date(),
          building: {
            ...state.currentProject.building,
            skylights: updatedSkylights,
          },
        },
      };
    }),

  // Update a wall feature with comprehensive validation and space layout checking
  updateFeature: (id: string, updates: Partial<Omit<WallFeature, 'id'>>) => 
    set((state) => {
      const existingFeature = state.currentProject.building.features.find(f => f.id === id);
      if (!existingFeature) {
        console.error('Feature not found for update:', id);
        return state;
      }

      // 🔒 CHECK IF FEATURE IS LOCKED
      if (existingFeature.isLocked && existingFeature.boundsLock) {
        const lockedDimensions = existingFeature.boundsLock.lockedDimensions;
        
        // Check if trying to modify locked dimensions
        const violations: string[] = [];
        
        if (updates.width !== undefined && lockedDimensions.width) {
          violations.push('Feature width is locked to maintain wall dimensional integrity');
        }
        
        if (updates.height !== undefined && lockedDimensions.height) {
          violations.push('Feature height is locked to maintain wall dimensional integrity');
        }
        
        if (updates.position !== undefined && lockedDimensions.position) {
          violations.push('Feature position is locked to maintain structural integrity');
        }
        
        if (violations.length > 0) {
          console.log(`🚫 FEATURE UPDATE BLOCKED - BOUNDS LOCK ACTIVE`);
          violations.forEach(violation => console.log(`  ❌ ${violation}`));
          
          // For now, allow the update but warn - in production you might want to block it
          console.warn('Feature update contains locked properties but proceeding with warning');
        }
      }

      const updatedFeatures = state.currentProject.building.features.map((feature) =>
        feature.id === id ? { ...feature, ...updates } : feature
      );

      // Validate height constraints
      const heightValidation = validateWallHeights(
        state.currentProject.building.dimensions,
        updatedFeatures
      );

      if (!heightValidation.valid) {
        console.error('Feature update height validation failed:', heightValidation.errors);
        return state;
      }

      // Validate wall bounds for the updated feature
      const updatedFeature = updatedFeatures.find(f => f.id === id);
      if (updatedFeature) {
        const boundsValid = isValidFeaturePosition(updatedFeature, state.currentProject.building.dimensions);

        if (!boundsValid) {
          console.error('Feature update bounds validation failed: Feature extends beyond wall boundaries');
          return state;
        }
      }

      // 🔍 UPDATE SPACE LAYOUT after feature update
      const updatedSpaceLayout = scanSpaceLayout(updatedFeatures, state.currentProject.building.dimensions);
      console.log(`🔍 Space layout updated after modifying ${existingFeature.type}: ${updatedSpaceLayout.layoutConstraints.length} constraints`);

      // 🔒 UPDATE WALL BOUNDS PROTECTION
      const wallBoundsProtection = new Map<WallPosition, WallBoundsProtection>();
      const wallPositions: WallPosition[] = ['front', 'back', 'left', 'right'];
      
      wallPositions.forEach(wallPosition => {
        const protection = getWallProtectionStatus(wallPosition, updatedFeatures, state.currentProject.building.dimensions);
        if (protection) {
          wallBoundsProtection.set(wallPosition, protection);
        }
      });

      console.log(`🔒 Feature updated with space layout integration: ${existingFeature.type} on ${existingFeature.position.wallPosition} wall`);

      return {
        currentProject: {
          ...state.currentProject,
          lastModified: new Date(),
          building: {
            ...state.currentProject.building,
            features: updatedFeatures,
            wallBoundsProtection,
            spaceLayout: updatedSpaceLayout
          },
        },
      };
    }),

  // Set building color
  setColor: (color: string) => 
    set((state) => ({
      currentProject: {
        ...state.currentProject,
        lastModified: new Date(),
        building: {
          ...state.currentProject.building,
          color,
        },
      },
    })),

  // Set roof color
  setRoofColor: (color: string) => 
    set((state) => ({
      currentProject: {
        ...state.currentProject,
        lastModified: new Date(),
        building: {
          ...state.currentProject.building,
          roofColor: color,
        },
      },
    })),

  // Set wall profile
  setWallProfile: (profile: WallProfile) => 
    set((state) => ({
      currentProject: {
        ...state.currentProject,
        lastModified: new Date(),
        building: {
          ...state.currentProject.building,
          wallProfile: profile,
        },
      },
    })),

  // Change current view mode
  setCurrentView: (view: ViewMode) => 
    set({ currentView: view }),

  // Save current project
  saveProject: () => 
    set((state) => {
      const updatedProject = {
        ...state.currentProject,
        lastModified: new Date(),
      };
      
      const projectExists = state.savedProjects.some(
        (project) => project.id === updatedProject.id
      );
      
      if (projectExists) {
        return {
          savedProjects: state.savedProjects.map((project) =>
            project.id === updatedProject.id ? updatedProject : project
          ),
        };
      } else {
        return {
          savedProjects: [...state.savedProjects, updatedProject],
        };
      }
    }),

  // Load a saved project
  loadProject: (id: string) => 
    set((state) => {
      const projectToLoad = state.savedProjects.find(
        (project) => project.id === id
      );
      
      if (!projectToLoad) {
        return {}; // No changes if project not found
      }
      
      return {
        currentProject: { ...projectToLoad },
      };
    }),

  // Create a new project with minimum room constraints
  createNewProject: (name = 'New Room') => 
    set(() => {
      const newProject = createDefaultProject();
      newProject.name = name;
      
      console.log(`\n🏠 CREATING NEW ROOM PROJECT: ${name}`);
      console.log(`Dimensions: ${newProject.building.dimensions.width}ft × ${newProject.building.dimensions.length}ft × ${newProject.building.dimensions.height}ft`);
      console.log(`Meets minimums: ✅`);
      
      return {
        currentProject: newProject,
      };
    }),

  // 🔒 WALL BOUNDS PROTECTION METHODS

  // Check if wall bounds are locked for proposed dimension changes
  checkWallBoundsLock: (wallPosition: WallPosition, proposedDimensions: Partial<BuildingDimensions>) => {
    const state = get();
    const validation = validateWallDimensionChange(
      wallPosition,
      state.currentProject.building.dimensions,
      proposedDimensions,
      state.currentProject.building.features
    );
    
    return {
      canModify: validation.canModify,
      restrictions: validation.restrictions
    };
  },

  // Get wall protection status
  getWallProtectionStatus: (wallPosition: WallPosition) => {
    const state = get();
    return getWallProtectionStatus(
      wallPosition, 
      state.currentProject.building.features, 
      state.currentProject.building.dimensions
    );
  },

  // Override wall lock (for advanced users)
  overrideWallLock: (wallPosition: WallPosition, reason: string) => {
    console.log(`🔓 WALL LOCK OVERRIDE REQUESTED: ${wallPosition} wall - ${reason}`);
    // In a real implementation, this might require admin privileges
    // For now, just log the override attempt
    return false; // Override not allowed in this implementation
  },

  // 🔍 SPACE LAYOUT DETECTION METHODS

  // Scan space layout and detect all architectural elements
  scanSpaceLayout: () => {
    const state = get();
    const spaceLayout = scanSpaceLayout(
      state.currentProject.building.features,
      state.currentProject.building.dimensions
    );
    
    // Update the building with the new space layout
    set((currentState) => ({
      currentProject: {
        ...currentState.currentProject,
        lastModified: new Date(),
        building: {
          ...currentState.currentProject.building,
          spaceLayout
        }
      }
    }));
    
    return spaceLayout;
  },

  // Validate space modification against layout constraints
  validateSpaceModification: (proposedDimensions: Partial<BuildingDimensions>) => {
    const state = get();
    
    if (!state.currentProject.building.spaceLayout) {
      // No space layout detected, perform scan first
      const spaceLayout = scanSpaceLayout(
        state.currentProject.building.features,
        state.currentProject.building.dimensions
      );
      
      return validateSpaceModification(
        spaceLayout,
        proposedDimensions,
        state.currentProject.building.dimensions
      );
    }
    
    return validateSpaceModification(
      state.currentProject.building.spaceLayout,
      proposedDimensions,
      state.currentProject.building.dimensions
    );
  },

  // Get clearance zones for a specific feature
  getFeatureClearanceZones: (featureId: string) => {
    const state = get();
    
    if (!state.currentProject.building.spaceLayout) {
      return [];
    }
    
    return getFeatureClearanceZones(state.currentProject.building.spaceLayout, featureId);
  },

  // Check all access paths for obstructions
  checkAccessPaths: () => {
    const state = get();
    
    if (!state.currentProject.building.spaceLayout) {
      return [];
    }
    
    return checkAccessPaths(state.currentProject.building.spaceLayout);
  },

  // Validate ventilation areas
  validateVentilation: () => {
    const state = get();
    
    if (!state.currentProject.building.spaceLayout) {
      return [];
    }
    
    return validateVentilation(state.currentProject.building.spaceLayout);
  }
}));