import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Grid, Home, Ruler, Settings, Download, Eye, EyeOff, Move, Trash2 } from 'lucide-react';

// Types for structural bay system
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

const StructuralBayDesigner: React.FC = () => {
  const [barnLayout, setBarnLayout] = useState<BarnLayout>({
    totalLength: 48, // 4 bays × 12 feet
    totalWidth: 24,
    totalHeight: 14,
    numberOfBays: 4,
    baySpacing: 12,
    bays: [],
    roofStructure: {
      type: 'gable',
      pitch: 4,
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
  const [viewMode, setViewMode] = useState<'plan' | '3d' | 'elevation'>('plan');
  const [showStructural, setShowStructural] = useState(true);
  const [addingFeature, setAddingFeature] = useState<string | null>(null);

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
  }, [barnLayout.numberOfBays, barnLayout.totalLength, barnLayout.totalWidth, barnLayout.totalHeight]);

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

  const exportSpecifications = () => {
    const specs = {
      barnLayout,
      structuralRequirements: {
        foundationFootings: barnLayout.numberOfBays + 1,
        structuralColumns: (barnLayout.numberOfBays + 1) * 2,
        roofTrusses: barnLayout.bays.reduce((sum, bay) => sum + bay.structuralElements.trusses, 0),
        totalSquareFootage: barnLayout.totalLength * barnLayout.totalWidth,
        bayConfiguration: barnLayout.bays.map(bay => ({
          bayNumber: bay.index + 1,
          dimensions: `${bay.length}' × ${bay.width}' × ${bay.height}'`,
          features: bay.features.length,
          wallConfiguration: bay.wallType,
          floorType: bay.floorType
        }))
      },
      materialEstimates: {
        concretePads: `${barnLayout.numberOfBays + 1} pads @ 24" × 24"`,
        structuralSteel: `${(barnLayout.numberOfBays + 1) * 2} columns @ ${barnLayout.totalHeight}'`,
        roofing: `${barnLayout.totalLength * (barnLayout.totalWidth + 4)} sq ft`,
        siding: `${(barnLayout.totalLength * barnLayout.totalHeight * 2) + (barnLayout.totalWidth * barnLayout.totalHeight * 2)} sq ft`
      }
    };
    
    const blob = new Blob([JSON.stringify(specs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `barn-layout-${barnLayout.numberOfBays}-bays.json`;
    a.click();
  };

  const selectedBayData = barnLayout.bays.find(bay => bay.id === selectedBay);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <Home className="w-8 h-8 mr-3 text-blue-600" />
                Structural Bay Barn Designer
              </h1>
              <p className="text-gray-600 mt-2">
                Design uniform structural bays with proper engineering specifications
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowStructural(!showStructural)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  showStructural ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {showStructural ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>Structural</span>
              </button>
              <button
                onClick={exportSpecifications}
                className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center space-x-2 hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                <span>Export Specs</span>
              </button>
            </div>
          </div>

          {/* Main Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Length */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Length (ft)
              </label>
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-center"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bay Spacing (ft)
              </label>
              <select
                value={barnLayout.baySpacing}
                onChange={(e) => updateBarnDimensions('baySpacing', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value={8}>8 feet</option>
                <option value={10}>10 feet</option>
                <option value={12}>12 feet</option>
                <option value={16}>16 feet</option>
              </select>
            </div>

            {/* Width */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Width (ft)
              </label>
              <input
                type="number"
                value={barnLayout.totalWidth}
                onChange={(e) => updateBarnDimensions('totalWidth', parseInt(e.target.value) || 24)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="16"
                max="60"
              />
            </div>

            {/* Height */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height (ft)
              </label>
              <input
                type="number"
                value={barnLayout.totalHeight}
                onChange={(e) => updateBarnDimensions('totalHeight', parseInt(e.target.value) || 12)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="10"
                max="24"
              />
            </div>
          </div>

          {/* Layout Summary */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Layout Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Bays:</span>
                <span className="ml-2 text-blue-600">{barnLayout.numberOfBays}</span>
              </div>
              <div>
                <span className="font-medium">Bay Size:</span>
                <span className="ml-2 text-blue-600">
                  {(barnLayout.totalLength / barnLayout.numberOfBays).toFixed(1)}' × {barnLayout.totalWidth}'
                </span>
              </div>
              <div>
                <span className="font-medium">Total Area:</span>
                <span className="ml-2 text-blue-600">
                  {(barnLayout.totalLength * barnLayout.totalWidth).toLocaleString()} sq ft
                </span>
              </div>
              <div>
                <span className="font-medium">Structural Posts:</span>
                <span className="ml-2 text-blue-600">{(barnLayout.numberOfBays + 1) * 2}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bay Layout Visualization */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Bay Layout</h2>
              <div className="flex space-x-2">
                {['plan', '3d', 'elevation'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode as any)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      viewMode === mode
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Plan View */}
            {viewMode === 'plan' && (
              <div className="relative bg-gray-100 rounded-lg p-4 min-h-96">
                <svg
                  viewBox={`0 0 ${barnLayout.totalLength * 10} ${barnLayout.totalWidth * 10}`}
                  className="w-full h-full"
                  style={{ maxHeight: '400px' }}
                >
                  {/* Barn outline */}
                  <rect
                    x="0"
                    y="0"
                    width={barnLayout.totalLength * 10}
                    height={barnLayout.totalWidth * 10}
                    fill="none"
                    stroke="#374151"
                    strokeWidth="3"
                  />

                  {/* Bay divisions */}
                  {barnLayout.bays.map((bay, index) => {
                    const x = index * bay.length * 10;
                    const isSelected = selectedBay === bay.id;
                    
                    return (
                      <g key={bay.id}>
                        {/* Bay area */}
                        <rect
                          x={x}
                          y="0"
                          width={bay.length * 10}
                          height={bay.width * 10}
                          fill={isSelected ? '#DBEAFE' : '#F9FAFB'}
                          stroke="#6B7280"
                          strokeWidth="1"
                          className="cursor-pointer hover:fill-blue-50"
                          onClick={() => setSelectedBay(isSelected ? null : bay.id)}
                        />

                        {/* Bay label */}
                        <text
                          x={x + (bay.length * 5)}
                          y={bay.width * 5}
                          textAnchor="middle"
                          className="text-xs font-medium fill-gray-700"
                        >
                          Bay {bay.index + 1}
                        </text>

                        {/* Structural columns */}
                        {showStructural && (
                          <>
                            {/* Front columns */}
                            <circle
                              cx={x}
                              cy="0"
                              r="8"
                              fill="#DC2626"
                              stroke="#FFFFFF"
                              strokeWidth="2"
                            />
                            {/* Back columns */}
                            <circle
                              cx={x}
                              cy={bay.width * 10}
                              r="8"
                              fill="#DC2626"
                              stroke="#FFFFFF"
                              strokeWidth="2"
                            />
                            {/* End bay columns */}
                            {index === barnLayout.numberOfBays - 1 && (
                              <>
                                <circle
                                  cx={x + bay.length * 10}
                                  cy="0"
                                  r="8"
                                  fill="#DC2626"
                                  stroke="#FFFFFF"
                                  strokeWidth="2"
                                />
                                <circle
                                  cx={x + bay.length * 10}
                                  cy={bay.width * 10}
                                  r="8"
                                  fill="#DC2626"
                                  stroke="#FFFFFF"
                                  strokeWidth="2"
                                />
                              </>
                            )}
                          </>
                        )}

                        {/* Features */}
                        {bay.features.map((feature) => (
                          <g key={feature.id}>
                            <rect
                              x={x + feature.position.x * 10}
                              y={feature.position.y * 10}
                              width={feature.dimensions.width * 10}
                              height={feature.dimensions.height * 10}
                              fill="#3B82F6"
                              stroke="#1E40AF"
                              strokeWidth="1"
                              opacity="0.7"
                            />
                            <text
                              x={x + feature.position.x * 10 + (feature.dimensions.width * 5)}
                              y={feature.position.y * 10 + (feature.dimensions.height * 5)}
                              textAnchor="middle"
                              className="text-xs fill-white font-medium"
                            >
                              {feature.type}
                            </text>
                          </g>
                        ))}

                        {/* Bay division lines */}
                        {index < barnLayout.numberOfBays - 1 && (
                          <line
                            x1={x + bay.length * 10}
                            y1="0"
                            x2={x + bay.length * 10}
                            y2={bay.width * 10}
                            stroke="#374151"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                          />
                        )}
                      </g>
                    );
                  })}

                  {/* Dimensions */}
                  <g className="text-xs fill-gray-600">
                    {/* Length dimension */}
                    <line
                      x1="0"
                      y1={barnLayout.totalWidth * 10 + 20}
                      x2={barnLayout.totalLength * 10}
                      y2={barnLayout.totalWidth * 10 + 20}
                      stroke="#6B7280"
                      strokeWidth="1"
                    />
                    <text
                      x={barnLayout.totalLength * 5}
                      y={barnLayout.totalWidth * 10 + 35}
                      textAnchor="middle"
                      className="text-sm font-medium"
                    >
                      {barnLayout.totalLength}'
                    </text>

                    {/* Width dimension */}
                    <line
                      x1={barnLayout.totalLength * 10 + 20}
                      y1="0"
                      x2={barnLayout.totalLength * 10 + 20}
                      y2={barnLayout.totalWidth * 10}
                      stroke="#6B7280"
                      strokeWidth="1"
                    />
                    <text
                      x={barnLayout.totalLength * 10 + 35}
                      y={barnLayout.totalWidth * 5}
                      textAnchor="middle"
                      className="text-sm font-medium"
                      transform={`rotate(90, ${barnLayout.totalLength * 10 + 35}, ${barnLayout.totalWidth * 5})`}
                    >
                      {barnLayout.totalWidth}'
                    </text>
                  </g>
                </svg>

                {/* Legend */}
                {showStructural && (
                  <div className="mt-4 flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-600 rounded-full border-2 border-white"></div>
                      <span>Structural Columns</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-600 opacity-70"></div>
                      <span>Features</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-1 bg-gray-700" style={{ borderStyle: 'dashed' }}></div>
                      <span>Bay Divisions</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3D View Placeholder */}
            {viewMode === '3d' && (
              <div className="bg-gray-100 rounded-lg p-8 min-h-96 flex items-center justify-center">
                <div className="text-center">
                  <Grid className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">3D View</h3>
                  <p className="text-gray-500">
                    Interactive 3D visualization of the structural bay layout
                  </p>
                </div>
              </div>
            )}

            {/* Elevation View */}
            {viewMode === 'elevation' && (
              <div className="bg-gray-100 rounded-lg p-4 min-h-96">
                <svg
                  viewBox={`0 0 ${barnLayout.totalLength * 10} ${barnLayout.totalHeight * 10}`}
                  className="w-full h-full"
                  style={{ maxHeight: '300px' }}
                >
                  {/* Ground line */}
                  <line
                    x1="0"
                    y1={barnLayout.totalHeight * 10}
                    x2={barnLayout.totalLength * 10}
                    y2={barnLayout.totalHeight * 10}
                    stroke="#8B5CF6"
                    strokeWidth="3"
                  />

                  {/* Barn outline */}
                  <rect
                    x="0"
                    y="0"
                    width={barnLayout.totalLength * 10}
                    height={barnLayout.totalHeight * 10}
                    fill="none"
                    stroke="#374151"
                    strokeWidth="2"
                  />

                  {/* Roof line */}
                  <polygon
                    points={`0,0 ${barnLayout.totalLength * 5},${-20} ${barnLayout.totalLength * 10},0`}
                    fill="#6B7280"
                    stroke="#374151"
                    strokeWidth="2"
                  />

                  {/* Structural columns */}
                  {showStructural && barnLayout.bays.map((bay, index) => {
                    const x = index * bay.length * 10;
                    return (
                      <g key={`column-${index}`}>
                        <rect
                          x={x - 2}
                          y="0"
                          width="4"
                          height={barnLayout.totalHeight * 10}
                          fill="#DC2626"
                        />
                        {index === barnLayout.numberOfBays - 1 && (
                          <rect
                            x={x + bay.length * 10 - 2}
                            y="0"
                            width="4"
                            height={barnLayout.totalHeight * 10}
                            fill="#DC2626"
                          />
                        )}
                      </g>
                    );
                  })}

                  {/* Bay divisions */}
                  {barnLayout.bays.map((bay, index) => {
                    if (index === barnLayout.numberOfBays - 1) return null;
                    const x = (index + 1) * bay.length * 10;
                    return (
                      <line
                        key={`division-${index}`}
                        x1={x}
                        y1="0"
                        x2={x}
                        y2={barnLayout.totalHeight * 10}
                        stroke="#6B7280"
                        strokeWidth="1"
                        strokeDasharray="5,5"
                      />
                    );
                  })}
                </svg>
              </div>
            )}
          </div>

          {/* Bay Configuration Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {selectedBayData ? `Bay ${selectedBayData.index + 1} Configuration` : 'Bay Configuration'}
            </h2>

            {selectedBayData ? (
              <div className="space-y-6">
                {/* Bay Details */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">Bay Specifications</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Dimensions:</span>
                      <span className="font-medium">
                        {selectedBayData.length}' × {selectedBayData.width}' × {selectedBayData.height}'
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wall Configuration
                  </label>
                  <select
                    value={selectedBayData.wallType}
                    onChange={(e) => updateBay(selectedBayData.id, { wallType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="open">Open Bay (No Interior Walls)</option>
                    <option value="partial">Partial Walls (8ft high)</option>
                    <option value="full">Full Height Walls</option>
                  </select>
                </div>

                {/* Floor Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Floor Type
                  </label>
                  <select
                    value={selectedBayData.floorType}
                    onChange={(e) => updateBay(selectedBayData.id, { floorType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="concrete">Concrete Slab</option>
                    <option value="gravel">Gravel Base</option>
                    <option value="dirt">Dirt Floor</option>
                    <option value="wood">Wood Decking</option>
                  </select>
                </div>

                {/* Features */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-800">Features</h3>
                    <div className="flex space-x-2">
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
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">Structural Elements</h3>
                  <div className="space-y-2 text-sm">
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
              <div className="text-center py-8">
                <Grid className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Select a bay to configure its specifications</p>
                <p className="text-sm text-gray-500 mt-1">Click on any bay in the layout above</p>
              </div>
            )}
          </div>
        </div>

        {/* Structural Requirements Summary */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Structural Requirements Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Foundation */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-3">Foundation Requirements</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Concrete Pads:</span>
                  <span className="font-medium">{(barnLayout.numberOfBays + 1) * 2}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pad Size:</span>
                  <span className="font-medium">{barnLayout.foundationRequirements.footingSize}</span>
                </div>
                <div className="flex justify-between">
                  <span>Depth:</span>
                  <span className="font-medium">{barnLayout.foundationRequirements.depth} feet</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Concrete:</span>
                  <span className="font-medium">
                    {((barnLayout.numberOfBays + 1) * 2 * 2 * 2 * (barnLayout.foundationRequirements.depth / 12)).toFixed(1)} cu yd
                  </span>
                </div>
              </div>
            </div>

            {/* Structural Steel */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-3">Structural Steel</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Columns:</span>
                  <span className="font-medium">{(barnLayout.numberOfBays + 1) * 2}</span>
                </div>
                <div className="flex justify-between">
                  <span>Column Height:</span>
                  <span className="font-medium">{barnLayout.totalHeight} feet</span>
                </div>
                <div className="flex justify-between">
                  <span>Roof Trusses:</span>
                  <span className="font-medium">
                    {barnLayout.bays.reduce((sum, bay) => sum + bay.structuralElements.trusses, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Truss Span:</span>
                  <span className="font-medium">{barnLayout.totalWidth} feet</span>
                </div>
              </div>
            </div>

            {/* Materials */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-3">Material Estimates</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Roofing:</span>
                  <span className="font-medium">
                    {(barnLayout.totalLength * (barnLayout.totalWidth + barnLayout.roofStructure.overhang * 2)).toLocaleString()} sq ft
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Siding:</span>
                  <span className="font-medium">
                    {((barnLayout.totalLength * barnLayout.totalHeight * 2) + 
                      (barnLayout.totalWidth * barnLayout.totalHeight * 2)).toLocaleString()} sq ft
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Concrete Floor:</span>
                  <span className="font-medium">
                    {(barnLayout.totalLength * barnLayout.totalWidth).toLocaleString()} sq ft
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Value:</span>
                  <span className="font-medium text-green-600">
                    ${((barnLayout.totalLength * barnLayout.totalWidth * 45) + 
                       (barnLayout.numberOfBays * 2500)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StructuralBayDesigner;