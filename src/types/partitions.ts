export interface PartitionWall {
  id: string;
  name: string;
  startPoint: { x: number; z: number }; // 3D coordinates within building
  endPoint: { x: number; z: number };
  height: number; // Wall height (can be partial or full)
  thickness: number; // Wall thickness in feet
  material: PartitionMaterial;
  extendToRoof: boolean; // Whether wall extends to roof or stops at specified height
  features: PartitionFeature[]; // Doors, windows, etc.
  isLoadBearing: boolean;
  color: string;
}

export interface PartitionFeature {
  id: string;
  type: PartitionFeatureType;
  position: number; // Position along wall (0-1, where 0 is start, 1 is end)
  width: number;
  height: number;
  bottomOffset: number; // Height from floor
  specifications: PartitionFeatureSpecs;
}

export type PartitionFeatureType = 
  | 'standard_door' 
  | 'sliding_door' 
  | 'dutch_door' 
  | 'viewing_window' 
  | 'feed_window'
  | 'gate_opening';

export interface PartitionFeatureSpecs {
  doorType?: 'hinged' | 'sliding' | 'dutch';
  swingDirection?: 'left' | 'right' | 'both';
  windowStyle?: 'fixed' | 'sliding' | 'hinged';
  hasFrame?: boolean;
  frameColor?: string;
  glassType?: 'clear' | 'frosted' | 'safety';
  hardware?: 'standard' | 'heavy_duty' | 'stainless';
}

export type PartitionMaterial = 
  | 'wood_planks'
  | 'metal_panels' 
  | 'concrete_block'
  | 'steel_mesh'
  | 'composite_panels'
  | 'brick';

export interface PartitionMaterialProperties {
  name: string;
  color: string;
  texture: string;
  durability: number; // 1-10 scale
  cost: number; // Relative cost multiplier
  maintenance: 'low' | 'medium' | 'high';
  suitability: string[]; // Use cases
}

export interface InteriorLayout {
  partitionWalls: PartitionWall[];
  stallConfiguration: StallConfiguration[];
  accessPaths: AccessPath[];
  ventilationZones: VentilationZone[];
  lastModified: Date;
}

export interface StallConfiguration {
  id: string;
  name: string;
  bounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
  purpose: 'horse_stall' | 'cattle_pen' | 'storage' | 'feed_room' | 'tack_room' | 'office';
  floorType: 'concrete' | 'rubber_mats' | 'dirt' | 'gravel' | 'wood';
  drainage: boolean;
  lighting: boolean;
  ventilation: 'natural' | 'mechanical' | 'both';
}

export interface AccessPath {
  id: string;
  startStall: string;
  endStall: string;
  width: number;
  isMainAisle: boolean;
  surfaceType: 'concrete' | 'gravel' | 'dirt' | 'rubber';
}

export interface VentilationZone {
  id: string;
  bounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
  airflowRate: number; // CFM
  type: 'intake' | 'exhaust' | 'circulation';
}

export interface VisualizationSettings {
  exteriorWallOpacity: number; // 0-1 (0 = transparent, 1 = opaque)
  roofOpacity: number; // 0-1
  showStructuralElements: boolean;
  showPartitionWalls: boolean;
  showStallLabels: boolean;
  showDimensions: boolean;
  interiorLighting: boolean;
  shadowQuality: 'low' | 'medium' | 'high';
}