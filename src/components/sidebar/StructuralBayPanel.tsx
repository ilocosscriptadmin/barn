import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Grid, Home, Ruler, Settings, Download, Eye, EyeOff, Move, Trash2, Building } from 'lucide-react';
import { useBuildingStore } from '../../store/buildingStore';

interface StructuralBay {
  id: string;
  index: number;
  length: number; // Bay length (typically 8-12 feet)
  width: number; // Full barn width
  height: number; // Bay height
  wallType: 'open' | 'partial' | 'full';
  floorType: 'concrete' | 'gravel' | 'dirt' | 'wood';
  roofSection: {
    type: 'gable' | 'shed' | 'monitor';
    pitch: number;
    materials: string;
  };
  features: BayFeature[];
  structuralElements: {
    frontColumn: boolean;
    backColumn: boolean;
    leftColumn: boolean;
    rightColumn: boolean;
    beams: string[];
    trusses: number;
  };
}

interface BayFeature {
  id: string;
  type: 'door' | 'window' | 'equipment' | 'ventilation' | 'storage';
  wall: 'front' | 'back' | 'left' | 'right';
  position: { x: number; y: number }; // Position within bay
  dimensions: { width: number; height: number };
  specifications: Record<string, any>;
}

interface BarnLayout {
  totalLength: number;
  totalWidth: number;
  totalHeight: number;
  numberOfBays: number;
  baySpacing: number; // Standard spacing between structural supports
  bays: StructuralBay[];
  roofStructure: {
    type: 'gable' | 'shed' | 'monitor' | 'gambrel';
    pitch: number;
    overhang: number;
    materials: string;
  };
  foundationRequirements: {
    type: 'concrete' | 'gravel' | 'pier';
    depth: number;
    footingSize: string;
  };
}

const StructuralBayPanel: React.FC = () => {
  const { dimensions, updateDimensions } = useBuildingStore((state) => ({
    dimensions: state.currentProject.building.dimensions,
    updateDimensions: state.updateDimensions
  }));

  const [barnLayout, setBarnLayout] = useState<BarnLayout>({
    totalLength: dimensions.length,
    totalWidth: dimensions.width,
    totalHeight: dimensions.height,
    numberOfBays: Math.max(2, Math.floor(dimensions.length / 12)),
    baySpacing: 12,
    bays: [],
    roofStructure: {
      type: 'gable',
      pitch: dimensions.roofPitch,
      overhang: 2,
      materials: 'Metal roofing on engineered trusses'
    },
    foundationRequirements: {
      type: 'concrete',
      depth: 4,
      footingSize: '24" × 24" × 8" deep'
    }
  });

  const [selectedBay, setSelectedBay] = useState<string | null>(null);
  const [showStructural, setShowStructural] = useState(true);

  // Sync with building store dimensions
  useEffect(() => {
    setBarnLayout(prev => ({
      ...prev,
      totalLength: dimensions.length,
      totalWidth: dimensions.width,
      totalHeight: dimensions.height,
      numberOfBays: Math.max(2, Math.floor(dimensions.length / prev.baySpacing)),
      roofStructure: {
        ...prev.roofStructure,
        pitch: dimensions.roofPitch
      }
    }));
  }, [dimensions]);

  // Initialize bays when layout changes
  useEffect(() => {
    const newBays: StructuralBay[] = [];
    const bayLength = barnLayout.totalLength / barnLayout.numberOfBays;
    
    for (let i = 0; i < barnLayout.numberOfBays; i++) {
      newBays.push({
        id: `bay-${i + 1}`,
        index: i,
        length: bayLength,
        width: barnLayout.totalWidth,
        height: barnLayout.totalHeight,
        wallType: 'open',
        floorType: 'concrete',
        roofSection: {
          type: 'gable',
          pitch: barnLayout.roofStructure.pitch,
          materials: 'Metal roofing'
        },
        features: [],
        structuralElements: {
          frontColumn: true,
          backColumn: true,
          leftColumn: i === 0,
          rightColumn: i === barnLayout.numberOfBays - 1,
          beams: ['ridge', 'eave'],
          trusses: Math.ceil(bayLength / 4) // Truss every 4 feet
        }
      });
    }
    
    setBarnLayout(prev => ({ ...prev, bays: newBays }));
  }, [barnLayout.numberOfBays, barnLayout.totalLength, barnLayout.totalWidth, barnLayout.totalHeight, barnLayout.roofStructure.pitch]);

  const updateBarnDimensions = (field: keyof BarnLayout, value: number) => {
    setBarnLayout(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate number of bays based on length and spacing
      if (field === 'totalLength' || field === 'baySpacing') {
        updated.numberOfBays = Math.max(2, Math.floor(updated.totalLength / updated.baySpacing));
        updated.totalLength = updated.numberOfBays * updated.baySpacing; // Ensure exact fit
      }
      
      return updated;
    });

    // Update the main building store
    if (field === 'totalLength') {
      updateDimensions({ length: value });
    } else if (field === 'totalWidth') {
      updateDimensions({ width: value });
    } else if (field === 'totalHeight') {
      updateDimensions({ height: value });
    }
  };

  const updateBay = (bayId: string, updates: Partial<StructuralBay>) => {
    setBarnLayout(prev => ({
      ...prev,
      bays: prev.bays.map(bay => 
        bay.id === bayId ? { ...bay, ...updates } : bay
      )
    }));
  };

  const addFeatureToBay = (bayId: string, feature: Omit<BayFeature, 'id'>) => {
    const newFeature: BayFeature = {
      ...feature,
      id: `feature-${Date.now()}`
    };
    
    setBarnLayout(prev => ({
      ...prev,
      bays: prev.bays.map(bay => 
        bay.id === bayId 
          ? { ...bay, features: [...bay.features, newFeature] }
          : bay
      )
    }));
  };

  const removeFeature = (bayId: string, featureId: string) => {
    setBarnLayout(prev => ({
      ...prev,
      bays: prev.bays.map(bay => 
        bay.id === bayId 
          ? { ...bay, features: bay.features.filter(f => f.id !== featureId) }
          : bay
      )
    }));
  };

  const selectedBayData = barnLayout.bays.find(bay => bay.id === selectedBay);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-2">
          <Grid className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Structural Bay System</span>
        </div>
        <div className="text-xs text-blue-700">
          Design uniform structural bays with proper engineering specifications
        </div>
      </div>

      {/* Main Controls */}
      <div className="space-y-4">
        {/* Total Length */}
        <div>
          <label className="form-label">Total Length (ft)</label>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => updateBarnDimensions('totalLength', Math.max(24, barnLayout.totalLength - barnLayout.baySpacing))}
              className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              value={barnLayout.totalLength}
              onChange={(e) => updateBarnDimensions('totalLength', parseInt(e.target.value) || 24)}
              className="flex-1 form-input text-center"
              min="24"
              step={barnLayout.baySpacing}
            />
            <button
              onClick={() => updateBarnDimensions('totalLength', barnLayout.totalLength + barnLayout.baySpacing)}
              className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bay Spacing */}
        <div>
          <label className="form-label">Bay Spacing (ft)</label>
          <select
            value={barnLayout.baySpacing}
            onChange={(e) => updateBarnDimensions('baySpacing', parseInt(e.target.value))}
            className="form-input"
          >
            <option value={8}>8 feet</option>
            <option value={10}>10 feet</option>
            <option value={12}>12 feet</option>
            <option value={16}>16 feet</option>
          </select>
        </div>

        {/* Width */}
        <div>
          <label className="form-label">Width (ft)</label>
          <input
            type="number"
            value={barnLayout.totalWidth}
            onChange={(e) => updateBarnDimensions('totalWidth', parseInt(e.target.value) || 24)}
            className="form-input"
            min="16"
            max="60"
          />
        </div>

        {/* Height */}
        <div>
          <label className="form-label">Height (ft)</label>
          <input
            type="number"
            value={barnLayout.totalHeight}
            onChange={(e) => updateBarnDimensions('totalHeight', parseInt(e.target.value) || 12)}
            className="form-input"
            min="10"
            max="24"
          />
        </div>
      </div>

      {/* Layout Summary */}
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Layout Summary</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="font-medium">Total Bays:</span>
            <span className="ml-1 text-blue-600">{barnLayout.numberOfBays}</span>
          </div>
          <div>
            <span className="font-medium">Bay Size:</span>
            <span className="ml-1 text-blue-600">
              {(barnLayout.totalLength / barnLayout.numberOfBays).toFixed(1)}' × {barnLayout.totalWidth}'
            </span>
          </div>
          <div>
            <span className="font-medium">Total Area:</span>
            <span className="ml-1 text-blue-600">
              {(barnLayout.totalLength * barnLayout.totalWidth).toLocaleString()} sq ft
            </span>
          </div>
          <div>
            <span className="font-medium">Structural Posts:</span>
            <span className="ml-1 text-blue-600">{(barnLayout.numberOfBays + 1) * 2}</span>
          </div>
        </div>
      </div>

      {/* Bay Configuration */}
      {selectedBayData ? (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">
            Bay {selectedBayData.index + 1} Configuration
          </h3>
          
          {/* Bay Details */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Bay Specifications</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Dimensions:</span>
                <span className="font-medium">
                  {selectedBayData.length.toFixed(1)}' × {selectedBayData.width}' × {selectedBayData.height}'
                </span>
              </div>
              <div className="flex justify-between">
                <span>Floor Area:</span>
                <span className="font-medium">
                  {(selectedBayData.length * selectedBayData.width).toLocaleString()} sq ft
                </span>
              </div>
              <div className="flex justify-between">
                <span>Volume:</span>
                <span className="font-medium">
                  {(selectedBayData.length * selectedBayData.width * selectedBayData.height).toLocaleString()} cu ft
                </span>
              </div>
            </div>
          </div>

          {/* Wall Configuration */}
          <div>
            <label className="form-label">Wall Configuration</label>
            <select
              value={selectedBayData.wallType}
              onChange={(e) => updateBay(selectedBayData.id, { wallType: e.target.value as any })}
              className="form-input"
            >
              <option value="open">Open Bay (No Interior Walls)</option>
              <option value="partial">Partial Walls (8ft high)</option>
              <option value="full">Full Height Walls</option>
            </select>
          </div>

          {/* Floor Type */}
          <div>
            <label className="form-label">Floor Type</label>
            <select
              value={selectedBayData.floorType}
              onChange={(e) => updateBay(selectedBayData.id, { floorType: e.target.value as any })}
              className="form-input"
            >
              <option value="concrete">Concrete Slab</option>
              <option value="gravel">Gravel Base</option>
              <option value="dirt">Dirt Floor</option>
              <option value="wood">Wood Decking</option>
            </select>
          </div>

          {/* Features */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-800">Features</h4>
              <div className="flex space-x-1">
                {['door', 'window', 'equipment', 'ventilation'].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      addFeatureToBay(selectedBayData.id, {
                        type: type as any,
                        wall: 'front',
                        position: { x: 2, y: 2 },
                        dimensions: { width: 3, height: 7 },
                        specifications: {}
                      });
                    }}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    + {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {selectedBayData.features.map((feature) => (
                <div key={feature.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium capitalize">{feature.type}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      ({feature.dimensions.width}' × {feature.dimensions.height}')
                    </span>
                  </div>
                  <button
                    onClick={() => removeFeature(selectedBayData.id, feature.id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {selectedBayData.features.length === 0 && (
                <p className="text-sm text-gray-500 italic">No features added</p>
              )}
            </div>
          </div>

          {/* Structural Elements */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Structural Elements</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Roof Trusses:</span>
                <span className="font-medium">{selectedBayData.structuralElements.trusses}</span>
              </div>
              <div className="flex justify-between">
                <span>Support Columns:</span>
                <span className="font-medium">
                  {[
                    selectedBayData.structuralElements.frontColumn && 'Front',
                    selectedBayData.structuralElements.backColumn && 'Back',
                    selectedBayData.structuralElements.leftColumn && 'Left',
                    selectedBayData.structuralElements.rightColumn && 'Right'
                  ].filter(Boolean).join(', ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Beams:</span>
                <span className="font-medium">{selectedBayData.structuralElements.beams.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <Grid className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Select a bay in the 3D view to configure</p>
          <p className="text-sm text-gray-500 mt-1">Click on any bay to see its specifications</p>
        </div>
      )}

      {/* Structural Requirements Summary */}
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Structural Requirements</h3>
        
        <div className="space-y-2 text-xs">
          {/* Foundation */}
          <div>
            <h4 className="font-medium text-gray-800">Foundation</h4>
            <div className="text-gray-600 space-y-1">
              <div>Concrete Pads: {(barnLayout.numberOfBays + 1) * 2}</div>
              <div>Pad Size: {barnLayout.foundationRequirements.footingSize}</div>
              <div>Depth: {barnLayout.foundationRequirements.depth} feet</div>
            </div>
          </div>

          {/* Structural Steel */}
          <div>
            <h4 className="font-medium text-gray-800">Structural Steel</h4>
            <div className="text-gray-600 space-y-1">
              <div>Columns: {(barnLayout.numberOfBays + 1) * 2}</div>
              <div>Column Height: {barnLayout.totalHeight} feet</div>
              <div>Roof Trusses: {barnLayout.bays.reduce((sum, bay) => sum + bay.structuralElements.trusses, 0)}</div>
              <div>Truss Span: {barnLayout.totalWidth} feet</div>
            </div>
          </div>

          {/* Materials */}
          <div>
            <h4 className="font-medium text-gray-800">Material Estimates</h4>
            <div className="text-gray-600 space-y-1">
              <div>Roofing: {(barnLayout.totalLength * (barnLayout.totalWidth + barnLayout.roofStructure.overhang * 2)).toLocaleString()} sq ft</div>
              <div>Siding: {((barnLayout.totalLength * barnLayout.totalHeight * 2) + (barnLayout.totalWidth * barnLayout.totalHeight * 2)).toLocaleString()} sq ft</div>
              <div>Concrete Floor: {(barnLayout.totalLength * barnLayout.totalWidth).toLocaleString()} sq ft</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bay Selection Instructions */}
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="text-sm font-medium text-yellow-800 mb-1">3D Bay Selection</h4>
        <p className="text-xs text-yellow-700">
          The 3D view will show structural columns and bay divisions. Click on any bay section to configure its specific settings, features, and structural requirements.
        </p>
      </div>
    </motion.div>
  );
};

export default StructuralBayPanel;