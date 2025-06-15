import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, RotateCcw, Save, Download, AlertTriangle, CheckCircle, Info, Home, Warehouse } from 'lucide-react';

interface BayConfiguration {
  id: string;
  type: 'standard' | 'garaport';
  width: number;
  depth: number;
  position: number;
  hasEntry: boolean;
  entryType: 'door' | 'rollup' | 'sliding';
  features: string[];
}

interface BarnLayout {
  totalLength: number;
  totalWidth: number;
  height: number;
  numberOfBays: number;
  garaportPosition: 'left' | 'right' | 'none';
  bays: BayConfiguration[];
  structuralPosts: { x: number; z: number }[];
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const BarnBayDesigner: React.FC = () => {
  const [totalLength, setTotalLength] = useState(48); // 4 bays minimum
  const [garaportPosition, setGaraportPosition] = useState<'left' | 'right' | 'none'>('right');
  const [barnHeight, setBarnHeight] = useState(12);
  const [barnLayout, setBarnLayout] = useState<BarnLayout | null>(null);
  const [selectedBay, setSelectedBay] = useState<string | null>(null);

  // Standard dimensions
  const STANDARD_BAY_WIDTH = 12;
  const STANDARD_BAY_DEPTH = 10;
  const GARAPORT_WIDTH = 12;
  const GARAPORT_DEPTH = 20;
  const GARAPORT_OVERHANG = 8;
  const MIN_HEIGHT = 10;
  const MIN_LENGTH = 24; // 2 bays minimum

  // Calculate barn layout based on specifications
  const calculateBarnLayout = (length: number, garaport: 'left' | 'right' | 'none', height: number): BarnLayout => {
    console.log(`\n🏗️ CALCULATING BARN LAYOUT`);
    console.log(`Total length: ${length}ft, Garaport: ${garaport}, Height: ${height}ft`);

    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate minimum requirements
    if (length < MIN_LENGTH) {
      errors.push(`Minimum barn length is ${MIN_LENGTH} feet (2 bays)`);
    }

    if (height < MIN_HEIGHT) {
      errors.push(`Minimum interior clearance is ${MIN_HEIGHT} feet`);
    }

    // Calculate number of bays (excluding garaport)
    const availableForBays = garaport !== 'none' ? length - GARAPORT_WIDTH : length;
    const numberOfBays = Math.floor(availableForBays / STANDARD_BAY_WIDTH);
    const actualBayLength = numberOfBays * STANDARD_BAY_WIDTH;
    const totalCalculatedLength = garaport !== 'none' ? actualBayLength + GARAPORT_WIDTH : actualBayLength;

    console.log(`Available for bays: ${availableForBays}ft`);
    console.log(`Number of bays: ${numberOfBays}`);
    console.log(`Actual bay length: ${actualBayLength}ft`);
    console.log(`Total calculated length: ${totalCalculatedLength}ft`);

    if (numberOfBays < 2) {
      errors.push(`Minimum 2 bays required. Current length allows only ${numberOfBays} bay(s)`);
    }

    // Adjust total length to match bay multiples
    if (totalCalculatedLength !== length) {
      warnings.push(`Length adjusted from ${length}ft to ${totalCalculatedLength}ft to match bay dimensions`);
    }

    // Create bay configurations
    const bays: BayConfiguration[] = [];
    let currentPosition = 0;

    // Add garaport if on left
    if (garaport === 'left') {
      bays.push({
        id: 'garaport',
        type: 'garaport',
        width: GARAPORT_WIDTH,
        depth: GARAPORT_DEPTH,
        position: currentPosition,
        hasEntry: true,
        entryType: 'rollup',
        features: ['overhang', 'concrete_pad', 'drainage']
      });
      currentPosition += GARAPORT_WIDTH;
    }

    // Add standard bays
    for (let i = 0; i < numberOfBays; i++) {
      bays.push({
        id: `bay-${i + 1}`,
        type: 'standard',
        width: STANDARD_BAY_WIDTH,
        depth: STANDARD_BAY_DEPTH,
        position: currentPosition,
        hasEntry: true,
        entryType: i === 0 ? 'door' : 'sliding',
        features: ['ventilation', 'electrical']
      });
      currentPosition += STANDARD_BAY_WIDTH;
    }

    // Add garaport if on right
    if (garaport === 'right') {
      bays.push({
        id: 'garaport',
        type: 'garaport',
        width: GARAPORT_WIDTH,
        depth: GARAPORT_DEPTH,
        position: currentPosition,
        hasEntry: true,
        entryType: 'rollup',
        features: ['overhang', 'concrete_pad', 'drainage']
      });
    }

    // Calculate structural posts (every 12 feet)
    const structuralPosts: { x: number; z: number }[] = [];
    const maxDepth = Math.max(STANDARD_BAY_DEPTH, GARAPORT_DEPTH);
    
    // Posts along the length every 12 feet
    for (let x = 0; x <= totalCalculatedLength; x += 12) {
      structuralPosts.push({ x, z: 0 }); // Front posts
      structuralPosts.push({ x, z: maxDepth }); // Back posts
    }

    // Additional posts for garaport overhang
    if (garaport !== 'none') {
      const garaportBay = bays.find(b => b.type === 'garaport');
      if (garaportBay) {
        const garaportX = garaportBay.position + GARAPORT_WIDTH / 2;
        structuralPosts.push({ x: garaportX, z: GARAPORT_DEPTH + GARAPORT_OVERHANG }); // Overhang support
      }
    }

    console.log(`Generated ${bays.length} bays and ${structuralPosts.length} structural posts`);

    return {
      totalLength: totalCalculatedLength,
      totalWidth: maxDepth + (garaport !== 'none' ? GARAPORT_OVERHANG : 0),
      height,
      numberOfBays,
      garaportPosition: garaport,
      bays,
      structuralPosts,
      valid: errors.length === 0,
      errors,
      warnings
    };
  };

  // Update layout when parameters change
  useEffect(() => {
    const layout = calculateBarnLayout(totalLength, garaportPosition, barnHeight);
    setBarnLayout(layout);
    
    // Auto-adjust total length if needed
    if (layout.totalLength !== totalLength && layout.valid) {
      setTotalLength(layout.totalLength);
    }
  }, [totalLength, garaportPosition, barnHeight]);

  const handleLengthChange = (newLength: number) => {
    // Ensure length is in multiples of 12 feet
    const adjustedLength = Math.max(MIN_LENGTH, Math.round(newLength / 12) * 12);
    setTotalLength(adjustedLength);
  };

  const addBay = () => {
    handleLengthChange(totalLength + STANDARD_BAY_WIDTH);
  };

  const removeBay = () => {
    const minLengthWithGaraport = garaportPosition !== 'none' ? MIN_LENGTH + GARAPORT_WIDTH : MIN_LENGTH;
    if (totalLength > minLengthWithGaraport) {
      handleLengthChange(totalLength - STANDARD_BAY_WIDTH);
    }
  };

  const updateBayFeature = (bayId: string, feature: string, add: boolean) => {
    if (!barnLayout) return;

    const updatedBays = barnLayout.bays.map(bay => {
      if (bay.id === bayId) {
        const features = add 
          ? [...bay.features, feature]
          : bay.features.filter(f => f !== feature);
        return { ...bay, features };
      }
      return bay;
    });

    setBarnLayout({ ...barnLayout, bays: updatedBays });
  };

  const exportBarnSpecs = () => {
    if (!barnLayout) return;

    const specs = {
      barnSpecifications: {
        totalLength: barnLayout.totalLength,
        totalWidth: barnLayout.totalWidth,
        height: barnLayout.height,
        numberOfBays: barnLayout.numberOfBays,
        garaportPosition: barnLayout.garaportPosition
      },
      bays: barnLayout.bays.map(bay => ({
        id: bay.id,
        type: bay.type,
        dimensions: `${bay.width}ft × ${bay.depth}ft`,
        position: `${bay.position}ft from left`,
        entryType: bay.entryType,
        features: bay.features
      })),
      structuralRequirements: {
        posts: barnLayout.structuralPosts.length,
        postSpacing: '12 feet centers',
        foundationFootprint: `${barnLayout.totalLength}ft × ${barnLayout.totalWidth}ft`
      }
    };

    const blob = new Blob([JSON.stringify(specs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'barn-specifications.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!barnLayout) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="animate-pulse">Calculating barn layout...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-lg">
        <div className="flex items-center space-x-3 mb-2">
          <Warehouse className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Customizable Barn Designer</h1>
        </div>
        <p className="text-green-100">Design your barn with customizable bays and garaport following structural specifications</p>
      </div>

      {/* Validation Status */}
      {!barnLayout.valid && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-800">Configuration Errors</span>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {barnLayout.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {barnLayout.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Info className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">Layout Adjustments</span>
          </div>
          <ul className="text-sm text-yellow-700 space-y-1">
            {barnLayout.warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {barnLayout.valid && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">
              Barn layout is valid and meets all structural requirements
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Configuration */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Barn Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Length (ft)
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={removeBay}
                    className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                    disabled={totalLength <= MIN_LENGTH + (garaportPosition !== 'none' ? GARAPORT_WIDTH : 0)}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={totalLength}
                    onChange={(e) => handleLengthChange(parseInt(e.target.value) || MIN_LENGTH)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    min={MIN_LENGTH}
                    step={12}
                  />
                  <button
                    onClick={addBay}
                    className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Length automatically adjusts to 12ft bay multiples
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interior Height (ft)
                </label>
                <input
                  type="number"
                  value={barnHeight}
                  onChange={(e) => setBarnHeight(Math.max(MIN_HEIGHT, parseInt(e.target.value) || MIN_HEIGHT))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min={MIN_HEIGHT}
                  max={20}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum {MIN_HEIGHT}ft clearance required
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Garaport Position
                </label>
                <select
                  value={garaportPosition}
                  onChange={(e) => setGaraportPosition(e.target.value as 'left' | 'right' | 'none')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="none">No Garaport</option>
                  <option value="left">Left End</option>
                  <option value="right">Right End</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Garaport: 12ft × 20ft with 8ft overhang
                </p>
              </div>
            </div>
          </div>

          {/* Barn Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Barn Summary</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Length:</span>
                <span className="font-medium">{barnLayout.totalLength}ft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Width:</span>
                <span className="font-medium">{barnLayout.totalWidth}ft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interior Height:</span>
                <span className="font-medium">{barnLayout.height}ft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Number of Bays:</span>
                <span className="font-medium">{barnLayout.numberOfBays}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Garaport:</span>
                <span className="font-medium capitalize">
                  {barnLayout.garaportPosition === 'none' ? 'None' : `${barnLayout.garaportPosition} End`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Structural Posts:</span>
                <span className="font-medium">{barnLayout.structuralPosts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Foundation Area:</span>
                <span className="font-medium">{(barnLayout.totalLength * barnLayout.totalWidth).toLocaleString()} sq ft</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Actions</h2>
            
            <div className="space-y-3">
              <button
                onClick={exportBarnSpecs}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                <span>Export Specifications</span>
              </button>
              
              <button
                onClick={() => {
                  setTotalLength(48);
                  setGaraportPosition('right');
                  setBarnHeight(12);
                }}
                className="w-full flex items-center justify-center space-x-2 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset to Default</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bay Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* 3D Layout Visualization */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Barn Layout (Top View)</h2>
            
            <div className="relative bg-gray-100 rounded-lg p-4 overflow-x-auto">
              <div 
                className="relative mx-auto"
                style={{ 
                  width: `${Math.max(600, barnLayout.totalLength * 8)}px`,
                  height: `${Math.max(300, barnLayout.totalWidth * 8)}px`
                }}
              >
                {/* Foundation outline */}
                <div 
                  className="absolute border-4 border-gray-800 bg-gray-200"
                  style={{
                    width: `${barnLayout.totalLength * 8}px`,
                    height: `${barnLayout.totalWidth * 8}px`,
                    top: 0,
                    left: 0
                  }}
                />
                
                {/* Bays */}
                {barnLayout.bays.map((bay, index) => (
                  <div
                    key={bay.id}
                    className={`absolute border-2 cursor-pointer transition-all ${
                      selectedBay === bay.id 
                        ? 'border-blue-500 bg-blue-100' 
                        : bay.type === 'garaport'
                          ? 'border-green-500 bg-green-100'
                          : 'border-gray-400 bg-white'
                    } hover:shadow-lg`}
                    style={{
                      left: `${bay.position * 8}px`,
                      top: 0,
                      width: `${bay.width * 8}px`,
                      height: `${bay.depth * 8}px`
                    }}
                    onClick={() => setSelectedBay(selectedBay === bay.id ? null : bay.id)}
                  >
                    <div className="p-2 text-xs font-medium text-center">
                      <div>{bay.type === 'garaport' ? 'Garaport' : `Bay ${index + 1}`}</div>
                      <div className="text-gray-600">{bay.width}' × {bay.depth}'</div>
                      <div className="text-gray-500 capitalize">{bay.entryType}</div>
                    </div>
                  </div>
                ))}
                
                {/* Garaport overhang */}
                {garaportPosition !== 'none' && (
                  <div
                    className="absolute border-2 border-dashed border-green-400 bg-green-50"
                    style={{
                      left: `${barnLayout.bays.find(b => b.type === 'garaport')?.position! * 8}px`,
                      top: `${GARAPORT_DEPTH * 8}px`,
                      width: `${GARAPORT_WIDTH * 8}px`,
                      height: `${GARAPORT_OVERHANG * 8}px`
                    }}
                  >
                    <div className="p-2 text-xs text-center text-green-700">
                      <div>Overhang</div>
                      <div>8ft</div>
                    </div>
                  </div>
                )}
                
                {/* Structural posts */}
                {barnLayout.structuralPosts.map((post, index) => (
                  <div
                    key={index}
                    className="absolute w-2 h-2 bg-red-600 rounded-full"
                    style={{
                      left: `${post.x * 8 - 4}px`,
                      top: `${post.z * 8 - 4}px`
                    }}
                    title={`Post at ${post.x}', ${post.z}'`}
                  />
                ))}
                
                {/* Dimensions */}
                <div className="absolute -top-6 left-0 text-xs font-medium text-gray-700">
                  {barnLayout.totalLength}ft
                </div>
                <div 
                  className="absolute -left-12 top-0 text-xs font-medium text-gray-700 transform -rotate-90 origin-left"
                  style={{ top: `${barnLayout.totalWidth * 4}px` }}
                >
                  {barnLayout.totalWidth}ft
                </div>
              </div>
              
              <div className="mt-4 flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-white border border-gray-400"></div>
                  <span>Standard Bay</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-100 border border-green-500"></div>
                  <span>Garaport</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-50 border border-dashed border-green-400"></div>
                  <span>Overhang</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span>Structural Post</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bay Details */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Bay Configuration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {barnLayout.bays.map((bay, index) => (
                <div
                  key={bay.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedBay === bay.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedBay(selectedBay === bay.id ? null : bay.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">
                      {bay.type === 'garaport' ? 'Garaport' : `Bay ${index + 1}`}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded ${
                      bay.type === 'garaport' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {bay.width}' × {bay.depth}'
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Position:</span>
                      <span>{bay.position}ft from left</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Entry Type:</span>
                      <span className="capitalize">{bay.entryType}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Features:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {bay.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                          >
                            {feature.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {selectedBay === bay.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium mb-2">Add Features:</h4>
                      <div className="flex flex-wrap gap-2">
                        {['windows', 'insulation', 'concrete_floor', 'lighting', 'power_outlets'].map((feature) => (
                          <button
                            key={feature}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateBayFeature(bay.id, feature, !bay.features.includes(feature));
                            }}
                            className={`px-2 py-1 text-xs rounded ${
                              bay.features.includes(feature)
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {feature.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Structural Requirements */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Structural Requirements</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Foundation Specifications</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Concrete slab: {barnLayout.totalLength}' × {barnLayout.totalWidth}'</li>
                  <li>• Minimum 4" thick reinforced concrete</li>
                  <li>• Vapor barrier required</li>
                  <li>• Perimeter footings: 24" deep</li>
                  <li>• Post footings: 36" deep at each structural post</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Structural Framework</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• {barnLayout.structuralPosts.length} structural posts at 12' centers</li>
                  <li>• Steel or engineered lumber posts</li>
                  <li>• Minimum {barnHeight}' interior clearance</li>
                  <li>• Gable roof with 4:12 minimum pitch</li>
                  <li>• Wind and snow load calculations required</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarnBayDesigner;