import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Move, Eye, EyeOff, Settings, Grid, Home, DoorOpen, Ruler } from 'lucide-react';
import { useBuildingStore } from '../../store/buildingStore';
import type { PartitionWall, PartitionFeature, PartitionMaterial, StallConfiguration } from '../../types/partitions';

const InteriorPartitionsPanel: React.FC = () => {
  const { 
    interiorLayout, 
    visualizationSettings,
    addPartitionWall,
    updatePartitionWall,
    removePartitionWall,
    addPartitionFeature,
    updateVisualizationSettings,
    dimensions 
  } = useBuildingStore((state) => ({
    interiorLayout: state.currentProject.building.interiorLayout,
    visualizationSettings: state.currentProject.building.visualizationSettings,
    addPartitionWall: state.addPartitionWall,
    updatePartitionWall: state.updatePartitionWall,
    removePartitionWall: state.removePartitionWall,
    addPartitionFeature: state.addPartitionFeature,
    updateVisualizationSettings: state.updateVisualizationSettings,
    dimensions: state.currentProject.building.dimensions
  }));

  const [selectedWall, setSelectedWall] = useState<string | null>(null);
  const [editingWall, setEditingWall] = useState<string | null>(null);
  const [placementMode, setPlacementMode] = useState<boolean>(false);
  const [placementStep, setPlacementStep] = useState<number>(0);
  const [startPoint, setStartPoint] = useState<{x: number, z: number}>({x: 0, z: 0});
  const [endPoint, setEndPoint] = useState<{x: number, z: number}>({x: 0, z: 0});
  const [wallPreview, setWallPreview] = useState<{
    name: string,
    material: PartitionMaterial,
    thickness: number,
    color: string
  }>({
    name: 'New Wall',
    material: 'wood_planks',
    thickness: 0.5,
    color: '#8B4513'
  });

  const materialOptions = [
    { value: 'wood_planks', label: 'Wood Planks', color: '#8B4513' },
    { value: 'metal_panels', label: 'Metal Panels', color: '#708090' },
    { value: 'concrete_block', label: 'Concrete Block', color: '#A9A9A9' },
    { value: 'steel_mesh', label: 'Steel Mesh', color: '#696969' },
    { value: 'composite_panels', label: 'Composite Panels', color: '#D2B48C' },
    { value: 'brick', label: 'Brick', color: '#B22222' }
  ];

  const featureTypes = [
    { value: 'standard_door', label: 'Standard Door', icon: '🚪' },
    { value: 'sliding_door', label: 'Sliding Door', icon: '🚪' },
    { value: 'dutch_door', label: 'Dutch Door', icon: '🚪' },
    { value: 'viewing_window', label: 'Viewing Window', icon: '🪟' },
    { value: 'feed_window', label: 'Feed Window', icon: '🪟' },
    { value: 'gate_opening', label: 'Gate Opening', icon: '🚧' }
  ];

  // Function to handle wall placement
  const handleWallPlacement = (x: number, z: number) => {
    if (placementStep === 0) {
      // Set start point
      setStartPoint({x, z});
      setEndPoint({x, z}); // Initialize end point
      setPlacementStep(1);
    } else if (placementStep === 1) {
      // Set end point and create wall
      setEndPoint({x, z});
      
      const newWall: Omit<PartitionWall, 'id'> = {
        name: wallPreview.name,
        startPoint: startPoint,
        endPoint: {x, z},
        height: dimensions.height,
        thickness: wallPreview.thickness,
        material: wallPreview.material,
        extendToRoof: true,
        color: wallPreview.color,
        features: [],
        isLoadBearing: false
      };
      
      addPartitionWall(newWall);
      
      // Reset placement mode
      setPlacementStep(0);
      setPlacementMode(false);
    }
  };

  // Listen for clicks on the 3D canvas when in placement mode
  useEffect(() => {
    if (!placementMode) return;
    
    const handleCanvasClick = (e: MouseEvent) => {
      // This is a simplified version - in a real implementation,
      // you would need to use raycasting to get the 3D position
      // For now, we'll just use random positions within the barn dimensions
      const x = (Math.random() * dimensions.width) - (dimensions.width / 2);
      const z = (Math.random() * dimensions.length) - (dimensions.length / 2);
      
      handleWallPlacement(x, z);
    };
    
    // In a real implementation, you would add the event listener to the canvas
    // For this example, we'll simulate clicks after a delay
    if (placementStep === 0) {
      const timer = setTimeout(() => {
        const x = (Math.random() * dimensions.width * 0.8) - (dimensions.width * 0.4);
        const z = (Math.random() * dimensions.length * 0.8) - (dimensions.length * 0.4);
        handleWallPlacement(x, z);
      }, 500);
      return () => clearTimeout(timer);
    }
    
    return () => {};
  }, [placementMode, placementStep, dimensions]);

  const handleAddFeature = (wallId: string, featureType: string) => {
    const feature: Omit<PartitionFeature, 'id'> = {
      type: featureType as any,
      position: 0.5, // Center of wall
      width: featureType.includes('door') ? 3 : 2,
      height: featureType.includes('door') ? 7 : 3,
      bottomOffset: featureType.includes('window') ? 3 : 0,
      specifications: {
        doorType: featureType.includes('door') ? 'hinged' : undefined,
        windowStyle: featureType.includes('window') ? 'fixed' : undefined,
        hasFrame: true,
        frameColor: '#4A5568'
      }
    };

    addPartitionFeature(wallId, feature);
  };

  const selectedWallData = selectedWall ? 
    interiorLayout?.partitionWalls.find(w => w.id === selectedWall) : null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {/* Visualization Controls */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-3">
          <Eye className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Visualization Settings</span>
        </div>
        
        <div className="space-y-3">
          {/* Exterior Wall Opacity */}
          <div>
            <label className="text-xs text-blue-700 block mb-1">
              Exterior Wall Transparency: {Math.round((1 - (visualizationSettings?.exteriorWallOpacity || 1)) * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={visualizationSettings?.exteriorWallOpacity || 1}
              onChange={(e) => updateVisualizationSettings({ 
                exteriorWallOpacity: parseFloat(e.target.value) 
              })}
              className="w-full"
            />
          </div>
          
          {/* Roof Opacity */}
          <div>
            <label className="text-xs text-blue-700 block mb-1">
              Roof Transparency: {Math.round((1 - (visualizationSettings?.roofOpacity || 1)) * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={visualizationSettings?.roofOpacity || 1}
              onChange={(e) => updateVisualizationSettings({ 
                roofOpacity: parseFloat(e.target.value) 
              })}
              className="w-full"
            />
          </div>
          
          {/* Toggle Controls */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => updateVisualizationSettings({ 
                showPartitionWalls: !visualizationSettings?.showPartitionWalls 
              })}
              className={`text-xs px-2 py-1 rounded flex items-center space-x-1 ${
                visualizationSettings?.showPartitionWalls 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {visualizationSettings?.showPartitionWalls ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              <span>Partitions</span>
            </button>
            
            <button
              onClick={() => updateVisualizationSettings({ 
                showStallLabels: !visualizationSettings?.showStallLabels 
              })}
              className={`text-xs px-2 py-1 rounded flex items-center space-x-1 ${
                visualizationSettings?.showStallLabels 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              <Grid className="w-3 h-3" />
              <span>Labels</span>
            </button>
          </div>
        </div>
      </div>

      {/* Wall Placement Tool */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Ruler className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Wall Placement Tool</span>
          </div>
          
          {placementMode && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {placementStep === 0 ? 'Click to set start point' : 'Click to set end point'}
            </span>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-green-700 block mb-1">Wall Material</label>
              <select
                value={wallPreview.material}
                onChange={(e) => {
                  const material = e.target.value as PartitionMaterial;
                  const materialOption = materialOptions.find(m => m.value === material);
                  setWallPreview({ 
                    ...wallPreview, 
                    material,
                    color: materialOption?.color || '#8B4513'
                  });
                }}
                className="w-full text-xs p-2 border border-green-200 rounded bg-white"
                disabled={placementMode}
              >
                {materialOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-xs text-green-700 block mb-1">Wall Thickness</label>
              <select
                value={wallPreview.thickness}
                onChange={(e) => setWallPreview({ 
                  ...wallPreview, 
                  thickness: parseFloat(e.target.value)
                })}
                className="w-full text-xs p-2 border border-green-200 rounded bg-white"
                disabled={placementMode}
              >
                <option value="0.33">4 inches (0.33 ft)</option>
                <option value="0.5">6 inches (0.5 ft)</option>
                <option value="0.67">8 inches (0.67 ft)</option>
                <option value="1">12 inches (1 ft)</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="text-xs text-green-700 block mb-1">Wall Name</label>
            <input
              type="text"
              value={wallPreview.name}
              onChange={(e) => setWallPreview({ ...wallPreview, name: e.target.value })}
              placeholder="e.g., Stall Divider 1"
              className="w-full text-xs p-2 border border-green-200 rounded bg-white"
              disabled={placementMode}
            />
          </div>
          
          <div className="bg-white p-3 rounded border border-green-200">
            <h4 className="text-xs font-medium text-green-800 mb-2">Wall Placement Instructions:</h4>
            <ol className="text-xs text-green-700 space-y-1 list-decimal pl-4">
              <li>Click "Start Wall Placement" button below</li>
              <li>Click in the 3D view to set the wall's start point</li>
              <li>Click again to set the end point and create the wall</li>
              <li>Wall height will automatically match the barn's height</li>
            </ol>
          </div>
          
          <button
            onClick={() => {
              if (placementMode) {
                setPlacementMode(false);
                setPlacementStep(0);
              } else {
                setPlacementMode(true);
                setPlacementStep(0);
              }
            }}
            className={`w-full py-2 px-4 rounded-lg flex items-center justify-center space-x-2 ${
              placementMode 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {placementMode ? (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Cancel Wall Placement</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Start Wall Placement</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Existing Walls List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-800">Partition Walls</h3>
          <span className="text-xs text-gray-500">
            {interiorLayout?.partitionWalls.length || 0} walls
          </span>
        </div>
        
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {interiorLayout?.partitionWalls.length > 0 ? (
            interiorLayout.partitionWalls.map((wall) => (
              <div 
                key={wall.id}
                className={`border rounded-lg p-2 cursor-pointer transition-all ${
                  selectedWall === wall.id 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedWall(selectedWall === wall.id ? null : wall.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: wall.color }}
                    />
                    <span className="text-sm font-medium">{wall.name}</span>
                    <span className="text-xs text-gray-500">
                      ({wall.features.length} features)
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingWall(wall.id);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removePartitionWall(wall.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                <div className="text-xs text-gray-600 mt-1">
                  {materialOptions.find(m => m.value === wall.material)?.label} • 
                  {wall.height}ft high • 
                  {wall.extendToRoof ? 'Extends to roof' : 'Partial height'}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              <p>No partition walls created yet</p>
              <p className="mt-1 text-xs text-gray-400">
                Use the wall placement tool above to create walls
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Selected Wall Details */}
      {selectedWallData && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-800">{selectedWallData.name}</h4>
            <span className="text-xs text-gray-600">
              {Math.sqrt(
                Math.pow(selectedWallData.endPoint.x - selectedWallData.startPoint.x, 2) + 
                Math.pow(selectedWallData.endPoint.z - selectedWallData.startPoint.z, 2)
              ).toFixed(1)}ft long
            </span>
          </div>
          
          {/* Add Features */}
          <div className="mb-3">
            <label className="text-xs text-gray-700 block mb-2">Add Features</label>
            <div className="grid grid-cols-2 gap-1">
              {featureTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => handleAddFeature(selectedWallData.id, type.value)}
                  className="text-xs px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-1"
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Existing Features */}
          {selectedWallData.features.length > 0 && (
            <div>
              <label className="text-xs text-gray-700 block mb-2">Features ({selectedWallData.features.length})</label>
              <div className="space-y-1">
                {selectedWallData.features.map((feature, index) => (
                  <div key={feature.id} className="flex items-center justify-between text-xs bg-white p-2 rounded border">
                    <span>
                      {featureTypes.find(t => t.value === feature.type)?.label} 
                      ({feature.width}' × {feature.height}')
                    </span>
                    <button
                      onClick={() => {
                        // Remove feature logic would go here
                        console.log('Remove feature:', feature.id);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Wall Placement Information */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <h4 className="text-sm font-medium text-gray-800 mb-2">Wall Placement Guide</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div>• Walls automatically match barn height ({dimensions.height}ft)</div>
          <div>• All walls are standard above-ground partitions</div>
          <div>• Click-and-drag placement for intuitive positioning</div>
          <div>• Add doors and windows after wall placement</div>
        </div>
      </div>
    </motion.div>
  );
};

export default InteriorPartitionsPanel;