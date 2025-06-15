// Building dimensions and properties
export interface BuildingDimensions {
  width: number;
  length: number;
  height: number;
  roofPitch: number; // in degrees
}

// Bay/Section system
export interface BaySection {
  id: string;
  name: string;
  type: 'main' | 'extension' | 'lean-to' | 'side-bay';
  dimensions: {
    width: number;
    length: number;
    height: number;
  };
  position: {
    x: number; // Offset from main building center
    y: number; // Offset from main building center
    z: number; // Height offset (for different floor levels)
  };
  roofType: 'gable' | 'skillion' | 'shed' | 'hip';
  roofPitch: number;
  wallProfile: WallProfile;
  color: string;
  roofColor: string;
  features: WallFeature[];
  skylights: Skylight[];
  accessories: BayAccessory[];
  isActive: boolean; // Whether this bay is currently selected/visible
  parentBayId?: string; // For extensions attached to other bays
  connectionType?: 'attached' | 'detached' | 'lean-to';
  connectionWall?: WallPosition; // Which wall this bay connects to
}

// Bay accessories (equipment, storage, etc.)
export interface BayAccessory {
  id: string;
  type: 'stall' | 'feed-bin' | 'water-trough' | 'equipment-mount' | 'storage-rack' | 'workbench' | 'electrical-panel' | 'lighting' | 'ventilation-fan';
  name: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  dimensions: {
    width: number;
    length: number;
    height: number;
  };
  rotation: number; // Rotation in degrees
  color?: string;
  specifications: Record<string, any>;
  isMoveable: boolean;
}

// Bay connection details
export interface BayConnection {
  fromBayId: string;
  toBayId: string;
  connectionType: 'wall-shared' | 'wall-opening' | 'separate';
  connectionWall: WallPosition;
  openingWidth?: number; // For wall openings
  openingHeight?: number;
}

// Room design constraints
export interface RoomConstraints {
  minimumWallHeight: number; // feet
  minimumWallLength: number; // feet
  minimumWallWidth: number; // feet
  standardDoorHeight: number; // feet
  standardWindowHeight: number; // feet
  structuralClearance: number; // feet above features
}

// Wall feature types
export type FeatureType = 'door' | 'window' | 'rollupDoor' | 'walkDoor';

// Wall positions
export type WallPosition = 'front' | 'back' | 'left' | 'right';

// Wall profile types - Lysaght profiles
export type WallProfile = 'multiclad' | 'trimdek' | 'customorb' | 'horizontal-customorb';

// Feature positioning
export interface FeaturePosition {
  wallPosition: WallPosition;
  xOffset: number;  // Distance from left edge of wall
  yOffset: number;  // Distance from bottom of wall
  alignment: 'left' | 'center' | 'right';
}

// Wall segment lock status
export interface WallSegmentLock {
  segmentId: string;
  wallPosition: WallPosition;
  startPosition: number; // feet from wall start
  endPosition: number; // feet from wall start
  lockedBy: string[]; // Array of feature IDs that lock this segment
  lockType: 'dimensional' | 'positional' | 'full';
  lockReason: string;
  canModify: boolean;
}

// Wall bounds protection
export interface WallBoundsProtection {
  wallPosition: WallPosition;
  protectedSegments: WallSegmentLock[];
  totalLockedLength: number;
  availableLength: number;
  modificationRestrictions: string[];
  lastModified: Date;
}

// Feature bounds lock information
export interface FeatureBoundsLock {
  featureId: string;
  featureType: FeatureType;
  wallPosition: WallPosition;
  lockedDimensions: {
    width: boolean;
    height: boolean;
    position: boolean;
  };
  affectedWallSegments: string[];
  lockTimestamp: Date;
  lockReason: string;
  canOverride: boolean;
}

// Space layout detection and protection
export interface SpaceLayoutDetection {
  detectedFeatures: DetectedWallFeature[];
  clearanceZones: ClearanceZone[];
  accessPaths: AccessPath[];
  ventilationAreas: VentilationArea[];
  structuralElements: StructuralElement[];
  layoutConstraints: LayoutConstraint[];
  lastScan: Date;
}

// Detected wall feature with enhanced properties
export interface DetectedWallFeature {
  id: string;
  type: FeatureType;
  width: number;
  height: number;
  position: FeaturePosition;
  clearanceRequirements: ClearanceRequirement;
  functionalZone: FunctionalZone;
  accessRequirements: AccessRequirement;
  structuralImpact: StructuralImpact;
  isProtected: boolean;
  protectionReason: string;
}

// Clearance requirements for features
export interface ClearanceRequirement {
  front: number; // feet in front of feature
  sides: number; // feet on each side
  above: number; // feet above feature
  swing: number; // feet for door swing clearance
  emergency: number; // feet for emergency access
}

// Functional zones around features
export interface FunctionalZone {
  type: 'entry' | 'exit' | 'window' | 'ventilation' | 'access';
  bounds: {
    left: number;
    right: number;
    front: number;
    back: number;
    bottom: number;
    top: number;
  };
  purpose: string;
  restrictions: string[];
  canModify: boolean;
}

// Access requirements for features
export interface AccessRequirement {
  minimumWidth: number; // feet
  minimumHeight: number; // feet
  clearPath: boolean; // must maintain clear path
  emergencyAccess: boolean; // required for emergency egress
  dailyUse: boolean; // used for daily operations
  restrictions: string[];
}

// Structural impact assessment
export interface StructuralImpact {
  loadBearing: boolean;
  affectsWallIntegrity: boolean;
  requiresReinforcement: boolean;
  modificationLimits: string[];
  engineeringRequired: boolean;
}

// Clearance zones around features
export interface ClearanceZone {
  id: string;
  featureId: string;
  type: 'door_swing' | 'window_operation' | 'emergency_egress' | 'ventilation' | 'access';
  bounds: {
    left: number;
    right: number;
    front: number;
    back: number;
    bottom: number;
    top: number;
  };
  isProtected: boolean;
  restrictions: string[];
  purpose: string;
}

// Access paths between features
export interface AccessPath {
  id: string;
  fromFeature: string;
  toFeature: string;
  pathType: 'primary' | 'secondary' | 'emergency';
  minimumWidth: number;
  currentWidth: number;
  isBlocked: boolean;
  restrictions: string[];
}

// Ventilation areas for windows
export interface VentilationArea {
  id: string;
  windowId: string;
  airflowZone: {
    left: number;
    right: number;
    front: number;
    back: number;
    bottom: number;
    top: number;
  };
  naturalLight: boolean;
  ventilationCapacity: number; // CFM
  isObstructed: boolean;
  restrictions: string[];
}

// Structural elements that affect layout
export interface StructuralElement {
  id: string;
  type: 'beam' | 'column' | 'header' | 'foundation';
  position: {
    x: number;
    y: number;
    z: number;
  };
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  isLoadBearing: boolean;
  canModify: boolean;
  restrictions: string[];
}

// Layout constraints based on detected features
export interface LayoutConstraint {
  id: string;
  type: 'clearance' | 'access' | 'structural' | 'code' | 'functional';
  description: string;
  affectedArea: {
    left: number;
    right: number;
    front: number;
    back: number;
    bottom: number;
    top: number;
  };
  severity: 'critical' | 'important' | 'advisory';
  canOverride: boolean;
  overrideRequirements: string[];
}

// Wall feature (door, window, etc.)
export interface WallFeature {
  id: string;
  type: FeatureType;
  width: number;
  height: number;
  position: FeaturePosition;
  color?: string;
  boundsLock?: FeatureBoundsLock;
  isLocked?: boolean;
  clearanceRequirements?: ClearanceRequirement;
  functionalZone?: FunctionalZone;
  accessRequirements?: AccessRequirement;
  structuralImpact?: StructuralImpact;
}

// Roof panel types
export type RoofPanel = 'left' | 'right';

// Skylight feature with panel selection
export interface Skylight {
  width: number;
  length: number;
  xOffset: number; // Distance from panel center (not roof center)
  yOffset: number; // Distance from ridge
  panel: RoofPanel; // Which roof panel the skylight is on
}

// View modes
export type ViewMode = '3d' | 'plan' | 'floor';

// Building Code Requirements
export interface ElectricalRequirement {
  minimumOutletHeight: number; // feet from floor
  minimumSwitchHeight: number; // feet from floor
  minimumCeilingClearance: number; // feet from ceiling
  minimumServicePanelClearance: number; // feet around electrical panel
}

export interface PlumbingRequirement {
  minimumFixtureHeight: number; // feet from floor
  minimumCeilingClearance: number; // feet from ceiling
  minimumAccessClearance: number; // feet for maintenance access
  minimumVentClearance: number; // feet for plumbing vents
}

export interface BuildingCodeRequirements {
  minimumCeilingHeight: number; // feet - absolute minimum ceiling height
  minimumDoorClearance: number; // feet above door height
  minimumWindowClearance: number; // feet above window height
  structuralLoadBearing: number; // feet for load-bearing requirements
  fireCodeClearance: number; // feet for fire safety clearances
  electrical: ElectricalRequirement;
  plumbing: PlumbingRequirement;
  ventilationClearance: number; // feet for HVAC systems
  insulationSpace: number; // feet for insulation thickness
}

// Building state
export interface Building {
  dimensions: BuildingDimensions;
  features: WallFeature[];
  skylights: Skylight[];
  color: string;
  roofColor: string;
  wallProfile: WallProfile;
  wallBoundsProtection?: Map<WallPosition, WallBoundsProtection>;
  spaceLayout?: SpaceLayoutDetection;
  bays: BaySection[]; // New bay system
  activeBayId?: string; // Currently selected bay
  bayConnections: BayConnection[]; // Connections between bays
}

// Project info
export interface Project {
  id: string;
  name: string;
  created: Date;
  lastModified: Date;
  building: Building;
}

// Collision detection utilities
export interface CollisionBounds {
  left: number;
  right: number;
  bottom: number;
  top: number;
}

export interface BeamCollisionData {
  x: number;
  width: number;
  height: number;
  bounds: CollisionBounds;
}

// Beam segment for split beams
export interface BeamSegment {
  x: number;
  bottomY: number;
  topY: number;
  width: number;
}

// Store state
export interface BuildingStore {
  currentProject: Project;
  savedProjects: Project[];
  currentView: ViewMode;
  
  // Actions
  setBuilding: (building: Building) => void;
  updateDimensions: (dimensions: Partial<BuildingDimensions>) => void;
  addFeature: (feature: Omit<WallFeature, 'id'>) => void;
  removeFeature: (id: string) => void;
  updateFeature: (id: string, updates: Partial<Omit<WallFeature, 'id'>>) => void;
  addSkylight: (skylight: Skylight) => void;
  removeSkylight: (index: number) => void;
  updateSkylight: (index: number, updates: Partial<Skylight>) => void;
  setColor: (color: string) => void;
  setRoofColor: (color: string) => void;
  setWallProfile: (profile: WallProfile) => void;
  setCurrentView: (view: ViewMode) => void;
  saveProject: () => void;
  loadProject: (id: string) => void;
  createNewProject: (name?: string) => void;
  
  // Bay system actions
  addBay: (bay: Omit<BaySection, 'id'>) => void;
  removeBay: (bayId: string) => void;
  updateBay: (bayId: string, updates: Partial<BaySection>) => void;
  setActiveBay: (bayId: string | null) => void;
  duplicateBay: (bayId: string) => void;
  addBayAccessory: (bayId: string, accessory: Omit<BayAccessory, 'id'>) => void;
  removeBayAccessory: (bayId: string, accessoryId: string) => void;
  updateBayAccessory: (bayId: string, accessoryId: string, updates: Partial<BayAccessory>) => void;
  connectBays: (connection: BayConnection) => void;
  disconnectBays: (fromBayId: string, toBayId: string) => void;
  
  // Wall bounds protection actions
  checkWallBoundsLock: (wallPosition: WallPosition, proposedDimensions: Partial<BuildingDimensions>) => { canModify: boolean; restrictions: string[] };
  getWallProtectionStatus: (wallPosition: WallPosition) => WallBoundsProtection | null;
  overrideWallLock: (wallPosition: WallPosition, reason: string) => boolean;
  
  // Space layout detection actions
  scanSpaceLayout: () => SpaceLayoutDetection;
  validateSpaceModification: (proposedDimensions: Partial<BuildingDimensions>) => { canModify: boolean; violations: string[]; suggestions: string[] };
  getFeatureClearanceZones: (featureId: string) => ClearanceZone[];
  checkAccessPaths: () => AccessPath[];
  validateVentilation: () => VentilationArea[];
}