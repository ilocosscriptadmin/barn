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
  VentilationArea,
  BaySection,
  BayAccessory,
  BayConnection
} from '../types';

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
  bays: [] as BaySection[], // Initialize empty bay system
  activeBayId: undefined as string | undefined,
  bayConnections: [] as BayConnection[]
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
    name: 'New Barn',
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
      console.log(`\n🏗️ SETTING COMPLETE BUILDING STATE WITH BAY SYSTEM`);
      
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

      // Initialize bay system if not present
      if (!building.bays) {
        building.bays = [];
      }
      if (!building.bayConnections) {
        building.bayConnections = [];
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

      console.log(`✅ Building state validation passed with bay system`);
      console.log(`🛡️ ${wallBoundsProtection.size} protected walls`);
      console.log(`🏗️ ${building.bays.length} bay sections`);
      console.log(`🔍 ${spaceLayout.layoutConstraints.filter(c => c.severity === 'critical').length} critical layout constraints`);

      return {
        currentProject: {
          ...state.currentProject,
          lastModified: new Date(),
          building: {
            ...building,
            features: featuresWithEnhancements,
            wallBoundsProtection,
            spaceLayout
          },
        },
      };
    }),

  // Update building dimensions with comprehensive validation and space layout checking
  updateDimensions: (dimensions: Partial<BuildingDimensions>) => 
    set((state) => {
      console.log(`\n🏗️ UPDATING DIMENSIONS WITH BAY SYSTEM PROTECTION`);
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
          
          return state;
        }
      }
      
      // 🔒 CHECK WALL BOUNDS LOCKS for each affected wall
      const wallPositions: WallPosition[] = ['front', 'back', 'left', 'right'];
      const lockViolations: string[] = [];
      
      wallPositions.forEach(wallPosition => {
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
          }
        }
      });
      
      if (lockViolations.length > 0) {
        console.log(`\n🚫 DIMENSION UPDATE BLOCKED - WALL BOUNDS PROTECTION ACTIVE`);
        return state;
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
        
        if (roomValidation.adjustedDimensions) {
          Object.assign(enforcedDimensions, roomValidation.adjustedDimensions);
        }
      }

      // 🔍 UPDATE SPACE LAYOUT after successful dimension change
      const updatedSpaceLayout = scanSpaceLayout(state.currentProject.building.features, enforcedDimensions);

      // 🔒 UPDATE WALL BOUNDS PROTECTION after successful dimension change
      const updatedWallBoundsProtection = new Map<WallPosition, WallBoundsProtection>();
      
      wallPositions.forEach(wallPosition => {
        const protection = getWallProtectionStatus(wallPosition, state.currentProject.building.features, enforcedDimensions);
        if (protection) {
          updatedWallBoundsProtection.set(wallPosition, protection);
        }
      });

      console.log(`✅ Final dimensions: ${enforcedDimensions.width}ft × ${enforcedDimensions.length}ft × ${enforcedDimensions.height}ft`);

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

  // Remove a wall feature and update space layout
  removeFeature: (id: string) => 
    set((state) => {
      const remainingFeatures = state.currentProject.building.features.filter(
        (feature) => feature.id !== id
      );

      // 🔍 UPDATE SPACE LAYOUT after feature removal
      const updatedSpaceLayout = scanSpaceLayout(remainingFeatures, state.currentProject.building.dimensions);

      // 🔒 UPDATE WALL BOUNDS PROTECTION after feature removal
      const wallBoundsProtection = new Map<WallPosition, WallBoundsProtection>();
      const wallPositions: WallPosition[] = ['front', 'back', 'left', 'right'];
      
      wallPositions.forEach(wallPosition => {
        const protection = getWallProtectionStatus(wallPosition, remainingFeatures, state.currentProject.building.dimensions);
        if (protection) {
          wallBoundsProtection.set(wallPosition, protection);
        }
      });

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

      // 🔒 UPDATE WALL BOUNDS PROTECTION
      const wallBoundsProtection = new Map<WallPosition, WallBoundsProtection>();
      const wallPositions: WallPosition[] = ['front', 'back', 'left', 'right'];
      
      wallPositions.forEach(wallPosition => {
        const protection = getWallProtectionStatus(wallPosition, updatedFeatures, state.currentProject.building.dimensions);
        if (protection) {
          wallBoundsProtection.set(wallPosition, protection);
        }
      });

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
  createNewProject: (name = 'New Barn') => 
    set(() => {
      const newProject = createDefaultProject();
      newProject.name = name;
      
      console.log(`\n🏠 CREATING NEW BARN PROJECT: ${name}`);
      console.log(`Dimensions: ${newProject.building.dimensions.width}ft × ${newProject.building.dimensions.length}ft × ${newProject.building.dimensions.height}ft`);
      console.log(`Bay system initialized: ${newProject.building.bays.length} bays`);
      
      return {
        currentProject: newProject,
      };
    }),

  // 🏗️ BAY SYSTEM METHODS

  // Add a new bay/section
  addBay: (bay: Omit<BaySection, 'id'>) =>
    set((state) => {
      const newBay: BaySection = {
        ...bay,
        id: uuidv4()
      };

      console.log(`🏗️ Adding new bay: ${newBay.name} (${newBay.type})`);
      console.log(`Dimensions: ${newBay.dimensions.width}ft × ${newBay.dimensions.length}ft × ${newBay.dimensions.height}ft`);
      console.log(`Position: (${newBay.position.x}, ${newBay.position.y}, ${newBay.position.z})`);

      return {
        currentProject: {
          ...state.currentProject,
          lastModified: new Date(),
          building: {
            ...state.currentProject.building,
            bays: [...state.currentProject.building.bays, newBay],
            activeBayId: newBay.id // Set new bay as active
          },
        },
      };
    }),

  // Remove a bay/section
  removeBay: (bayId: string) =>
    set((state) => {
      const bayToRemove = state.currentProject.building.bays.find(b => b.id === bayId);
      if (bayToRemove) {
        console.log(`🗑️ Removing bay: ${bayToRemove.name}`);
      }

      const updatedBays = state.currentProject.building.bays.filter(bay => bay.id !== bayId);
      const updatedConnections = state.currentProject.building.bayConnections.filter(
        conn => conn.fromBayId !== bayId && conn.toBayId !== bayId
      );

      return {
        currentProject: {
          ...state.currentProject,
          lastModified: new Date(),
          building: {
            ...state.currentProject.building,
            bays: updatedBays,
            bayConnections: updatedConnections,
            activeBayId: state.currentProject.building.activeBayId === bayId ? undefined : state.currentProject.building.activeBayId
          },
        },
      };
    }),

  // Update a bay/section
  updateBay: (bayId: string, updates: Partial<BaySection>) =>
    set((state) => {
      const updatedBays = state.currentProject.building.bays.map(bay =>
        bay.id === bayId ? { ...bay, ...updates } : bay
      );

      return {
        currentProject: {
          ...state.currentProject,
          lastModified: new Date(),
          building: {
            ...state.currentProject.building,
            bays: updatedBays,
          },
        },
      };
    }),

  // Set active bay for editing
  setActiveBay: (bayId: string | null) =>
    set((state) => {
      console.log(`🎯 Setting active bay: ${bayId || 'Main Building'}`);
      
      return {
        currentProject: {
          ...state.currentProject,
          building: {
            ...state.currentProject.building,
            activeBayId: bayId || undefined,
          },
        },
      };
    }),

  // Duplicate a bay
  duplicateBay: (bayId: string) =>
    set((state) => {
      const originalBay = state.currentProject.building.bays.find(b => b.id === bayId);
      if (!originalBay) {
        console.error('Bay not found for duplication:', bayId);
        return state;
      }

      const duplicatedBay: BaySection = {
        ...originalBay,
        id: uuidv4(),
        name: `${originalBay.name} Copy`,
        position: {
          ...originalBay.position,
          x: originalBay.position.x + originalBay.dimensions.width + 2 // Offset by width + 2ft gap
        },
        features: originalBay.features.map(feature => ({
          ...feature,
          id: uuidv4()
        })),
        accessories: originalBay.accessories.map(accessory => ({
          ...accessory,
          id: uuidv4()
        }))
      };

      console.log(`📋 Duplicating bay: ${originalBay.name} → ${duplicatedBay.name}`);

      return {
        currentProject: {
          ...state.currentProject,
          lastModified: new Date(),
          building: {
            ...state.currentProject.building,
            bays: [...state.currentProject.building.bays, duplicatedBay],
          },
        },
      };
    }),

  // Add accessory to a bay
  addBayAccessory: (bayId: string, accessory: Omit<BayAccessory, 'id'>) =>
    set((state) => {
      const newAccessory: BayAccessory = {
        ...accessory,
        id: uuidv4()
      };

      const updatedBays = state.currentProject.building.bays.map(bay =>
        bay.id === bayId 
          ? { ...bay, accessories: [...bay.accessories, newAccessory] }
          : bay
      );

      console.log(`🔧 Adding accessory to bay ${bayId}: ${newAccessory.type} (${newAccessory.name})`);

      return {
        currentProject: {
          ...state.currentProject,
          lastModified: new Date(),
          building: {
            ...state.currentProject.building,
            bays: updatedBays,
          },
        },
      };
    }),

  // Remove accessory from a bay
  removeBayAccessory: (bayId: string, accessoryId: string) =>
    set((state) => {
      const updatedBays = state.currentProject.building.bays.map(bay =>
        bay.id === bayId 
          ? { ...bay, accessories: bay.accessories.filter(acc => acc.id !== accessoryId) }
          : bay
      );

      console.log(`🗑️ Removing accessory ${accessoryId} from bay ${bayId}`);

      return {
        currentProject: {
          ...state.currentProject,
          lastModified: new Date(),
          building: {
            ...state.currentProject.building,
            bays: updatedBays,
          },
        },
      };
    }),

  // Update accessory in a bay
  updateBayAccessory: (bayId: string, accessoryId: string, updates: Partial<BayAccessory>) =>
    set((state) => {
      const updatedBays = state.currentProject.building.bays.map(bay =>
        bay.id === bayId 
          ? { 
              ...bay, 
              accessories: bay.accessories.map(acc =>
                acc.id === accessoryId ? { ...acc, ...updates } : acc
              )
            }
          : bay
      );

      return {
        currentProject: {
          ...state.currentProject,
          lastModified: new Date(),
          building: {
            ...state.currentProject.building,
            bays: updatedBays,
          },
        },
      };
    }),

  // Connect two bays
  connectBays: (connection: BayConnection) =>
    set((state) => {
      const existingConnection = state.currentProject.building.bayConnections.find(
        conn => (conn.fromBayId === connection.fromBayId && conn.toBayId === connection.toBayId) ||
                (conn.fromBayId === connection.toBayId && conn.toBayId === connection.fromBayId)
      );

      if (existingConnection) {
        console.log(`🔗 Connection already exists between bays ${connection.fromBayId} and ${connection.toBayId}`);
        return state;
      }

      console.log(`🔗 Connecting bays: ${connection.fromBayId} → ${connection.toBayId} (${connection.connectionType})`);

      return {
        currentProject: {
          ...state.currentProject,
          lastModified: new Date(),
          building: {
            ...state.currentProject.building,
            bayConnections: [...state.currentProject.building.bayConnections, connection],
          },
        },
      };
    }),

  // Disconnect two bays
  disconnectBays: (fromBayId: string, toBayId: string) =>
    set((state) => {
      const updatedConnections = state.currentProject.building.bayConnections.filter(
        conn => !((conn.fromBayId === fromBayId && conn.toBayId === toBayId) ||
                  (conn.fromBayId === toBayId && conn.toBayId === fromBayId))
      );

      console.log(`🔗 Disconnecting bays: ${fromBayId} ↔ ${toBayId}`);

      return {
        currentProject: {
          ...state.currentProject,
          lastModified: new Date(),
          building: {
            ...state.currentProject.building,
            bayConnections: updatedConnections,
          },
        },
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