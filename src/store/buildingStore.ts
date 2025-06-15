import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { 
  BuildingStore, 
  Building, 
  WallFeature, 
  Skylight, 
  WallPosition, 
  WallProfile,
  WallBoundsProtection,
  SpaceLayoutDetection,
  BaySection,
  BayConnection,
  WallLayout,
  Project
} from '../types/index';

// Update the default building to have better proportions for bay extensions
const defaultBuilding: Building = {
  dimensions: {
    width: 40,    // Increased width for better proportions with bays
    length: 60,   // Increased length for main barn
    height: 14,   // Increased height for barn-like proportions
    roofPitch: 4, // 4:12 pitch
  },
  features: [],
  skylights: [],
  color: '#5A6B47', // Cottage Green - classic barn color
  roofColor: '#4A3C32', // Ironstone - traditional roof color
  wallProfile: 'multiclad' as WallProfile, // Traditional barn profile
  wallBoundsProtection: new Map<WallPosition, WallBoundsProtection>(),
  spaceLayout: undefined as SpaceLayoutDetection | undefined,
  bays: [] as BaySection[], // Initialize empty bay system
  activeBayId: undefined as string | undefined,
  bayConnections: [] as BayConnection[],
  wallLayout: undefined as WallLayout | undefined // Add wall layout
};

const initialProject: Project = {
  id: uuidv4(),
  name: 'New Building Project',
  building: defaultBuilding,
  createdAt: new Date(),
  updatedAt: new Date()
};

export const useBuildingStore = create<BuildingStore>((set, get) => ({
  // State
  currentProject: initialProject,
  projects: [initialProject],
  selectedWall: null,
  viewMode: '3d',
  showTechnicalDrawings: false,

  // Actions
  updateDimensions: (dimensions) => set((state) => ({
    currentProject: {
      ...state.currentProject,
      building: {
        ...state.currentProject.building,
        dimensions: { ...state.currentProject.building.dimensions, ...dimensions }
      },
      updatedAt: new Date()
    }
  })),

  addFeature: (feature) => set((state) => ({
    currentProject: {
      ...state.currentProject,
      building: {
        ...state.currentProject.building,
        features: [...state.currentProject.building.features, { ...feature, id: uuidv4() }]
      },
      updatedAt: new Date()
    }
  })),

  removeFeature: (featureId) => set((state) => ({
    currentProject: {
      ...state.currentProject,
      building: {
        ...state.currentProject.building,
        features: state.currentProject.building.features.filter(f => f.id !== featureId)
      },
      updatedAt: new Date()
    }
  })),

  updateFeature: (featureId, updates) => set((state) => ({
    currentProject: {
      ...state.currentProject,
      building: {
        ...state.currentProject.building,
        features: state.currentProject.building.features.map(f => 
          f.id === featureId ? { ...f, ...updates } : f
        )
      },
      updatedAt: new Date()
    }
  })),

  addSkylight: (skylight) => set((state) => ({
    currentProject: {
      ...state.currentProject,
      building: {
        ...state.currentProject.building,
        skylights: [...state.currentProject.building.skylights, { ...skylight, id: uuidv4() }]
      },
      updatedAt: new Date()
    }
  })),

  removeSkylight: (skylightId) => set((state) => ({
    currentProject: {
      ...state.currentProject,
      building: {
        ...state.currentProject.building,
        skylights: state.currentProject.building.skylights.filter(s => s.id !== skylightId)
      },
      updatedAt: new Date()
    }
  })),

  updateSkylight: (skylightId, updates) => set((state) => ({
    currentProject: {
      ...state.currentProject,
      building: {
        ...state.currentProject.building,
        skylights: state.currentProject.building.skylights.map(s => 
          s.id === skylightId ? { ...s, ...updates } : s
        )
      },
      updatedAt: new Date()
    }
  })),

  updateColors: (colors) => set((state) => ({
    currentProject: {
      ...state.currentProject,
      building: {
        ...state.currentProject.building,
        ...colors
      },
      updatedAt: new Date()
    }
  })),

  updateWallProfile: (profile) => set((state) => ({
    currentProject: {
      ...state.currentProject,
      building: {
        ...state.currentProject.building,
        wallProfile: profile
      },
      updatedAt: new Date()
    }
  })),

  setSelectedWall: (wall) => set({ selectedWall: wall }),

  setViewMode: (mode) => set({ viewMode: mode }),

  toggleTechnicalDrawings: () => set((state) => ({ 
    showTechnicalDrawings: !state.showTechnicalDrawings 
  })),

  createProject: (name) => {
    const newProject: Project = {
      id: uuidv4(),
      name,
      building: { ...defaultBuilding },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    set((state) => ({
      projects: [...state.projects, newProject],
      currentProject: newProject
    }));
    
    return newProject;
  },

  loadProject: (projectId) => set((state) => {
    const project = state.projects.find(p => p.id === projectId);
    return project ? { currentProject: project } : {};
  }),

  saveProject: () => set((state) => ({
    currentProject: {
      ...state.currentProject,
      updatedAt: new Date()
    }
  })),

  deleteProject: (projectId) => set((state) => ({
    projects: state.projects.filter(p => p.id !== projectId),
    currentProject: state.currentProject.id === projectId 
      ? state.projects.find(p => p.id !== projectId) || initialProject
      : state.currentProject
  })),

  updateWallBoundsProtection: (wallPosition, protection) => set((state) => {
    const newProtection = new Map(state.currentProject.building.wallBoundsProtection);
    newProtection.set(wallPosition, protection);
    
    return {
      currentProject: {
        ...state.currentProject,
        building: {
          ...state.currentProject.building,
          wallBoundsProtection: newProtection
        },
        updatedAt: new Date()
      }
    };
  }),

  updateSpaceLayout: (layout) => set((state) => ({
    currentProject: {
      ...state.currentProject,
      building: {
        ...state.currentProject.building,
        spaceLayout: layout
      },
      updatedAt: new Date()
    }
  })),

  addBay: (bay) => set((state) => ({
    currentProject: {
      ...state.currentProject,
      building: {
        ...state.currentProject.building,
        bays: [...state.currentProject.building.bays, { ...bay, id: uuidv4() }]
      },
      updatedAt: new Date()
    }
  })),

  removeBay: (bayId) => set((state) => ({
    currentProject: {
      ...state.currentProject,
      building: {
        ...state.currentProject.building,
        bays: state.currentProject.building.bays.filter(b => b.id !== bayId),
        activeBayId: state.currentProject.building.activeBayId === bayId 
          ? undefined 
          : state.currentProject.building.activeBayId
      },
      updatedAt: new Date()
    }
  })),

  updateBay: (bayId, updates) => set((state) => ({
    currentProject: {
      ...state.currentProject,
      building: {
        ...state.currentProject.building,
        bays: state.currentProject.building.bays.map(b => 
          b.id === bayId ? { ...b, ...updates } : b
        )
      },
      updatedAt: new Date()
    }
  })),

  setActiveBay: (bayId) => set((state) => ({
    currentProject: {
      ...state.currentProject,
      building: {
        ...state.currentProject.building,
        activeBayId: bayId
      },
      updatedAt: new Date()
    }
  })),

  addBayConnection: (connection) => set((state) => ({
    currentProject: {
      ...state.currentProject,
      building: {
        ...state.currentProject.building,
        bayConnections: [...state.currentProject.building.bayConnections, { ...connection, id: uuidv4() }]
      },
      updatedAt: new Date()
    }
  })),

  removeBayConnection: (connectionId) => set((state) => ({
    currentProject: {
      ...state.currentProject,
      building: {
        ...state.currentProject.building,
        bayConnections: state.currentProject.building.bayConnections.filter(c => c.id !== connectionId)
      },
      updatedAt: new Date()
    }
  })),

  updateWallLayout: (layout) => set((state) => ({
    currentProject: {
      ...state.currentProject,
      building: {
        ...state.currentProject.building,
        wallLayout: layout
      },
      updatedAt: new Date()
    }
  }))
}));