import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Move, Eye, EyeOff, Settings, Grid, Home, DoorOpen } from 'lucide-react';
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
  const [showWallCreator, setShowWallCreator] = useState(false);
  const [newWall, setNewWall] = useState({
    name: '',
    startPoint: { x: -dimensions.width/4, z: -dimensions.length/4 },
    endPoint: { x: dimensions.width/4, z: -dimensions.length/4 },
    height: 8,
    thickness: 0.5,
    material: 'wood_planks' as PartitionMaterial,
    extendToRoof: false,
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

  const handleAddWall = () => {
    if (!newWall.name.trim()) return;

    const wall: Omit<PartitionWall, 'id'> = {
      ...newWall,
      features: [],
      isLoadBearing: false
    };

    addPartitionWall(wall);
    setNewWall({
      name: '',
      startPoint: { x: -dimensions.width/4, z: -dimensions.length/4 },
      endPoint: { x: dimensions.width/4, z: -dimensions.length/4 },
      height: 8,
      thickness: 0.5,
      material: 'wood_planks',
      extendToRoof: false,
      color: '#8B4513'
    });
    setShowWallCreator(false);
  };

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

  // Add a sample wall if none exist
  const handleAddSampleWall = () => {
    const sampleWall: Omit<PartitionWall, 'id'> = {
      name: 'Sample Divider Wall',
      startPoint: { x: -dimensions.width/4, z: 0 },
      endPoint: { x: dimensions.width/4, z: 0 },
      height: 8,
      thickness: 0.5,
      material: 'wood_planks',
      extendToRoof: false,
      color: '#8B4513',
      features: [],
      isLoadBearing: false
    };
    
    addPartitionWall(sampleWall);
  };

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

      {/* Partition Walls Management */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-800">Partition Walls</h3>
          <button
            onClick={() => setShowWallCreator(!showWallCreator)}
            className="btn text-xs px-2 py-1"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Wall
          </button>
        </div>

        {/* Wall Creator */}
        {showWallCreator && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
            <h4 className="text-sm font-medium text-gray-800 mb-2">Create New Wall</h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-700 block mb-1">Wall Name</label>
                <input
                  type="text"
                  value={newWall.name}
                  onChange={(e) => setNewWall({ ...newWall, name: e.target.value })}
                  placeholder="e.g., Stall Divider 1"
                  className="form-input text-xs"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-700 block mb-1">Start Point</label>
                  <div className="grid grid-cols-2 gap-1">
                    <input
                      type="number"
                      value={newWall.startPoint.x}
                      onChange={(e) => setNewWall({ 
                        ...newWall, 
                        startPoint: { ...newWall.startPoint, x: parseFloat(e.target.value) || 0 }
                      })}
                      placeholder="X"
                      className="form-input text-xs"
                    />
                    <input
                      type="number"
                      value={newWall.startPoint.z}
                      onChange={(e) => setNewWall({ 
                        ...newWall, 
                        startPoint: { ...newWall.startPoint, z: parseFloat(e.target.value) || 0 }
                      })}
                      placeholder="Z"
                      className="form-input text-xs"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-gray-700 block mb-1">End Point</label>
                  <div className="grid grid-cols-2 gap-1">
                    <input
                      type="number"
                      value={newWall.endPoint.x}
                      onChange={(e) => setNewWall({ 
                        ...newWall, 
                        endPoint: { ...newWall.endPoint, x: parseFloat(e.target.value) || 0 }
                      })}
                      placeholder="X"
                      className="form-input text-xs"
                    />
                    <input
                      type="number"
                      value={newWall.endPoint.z}
                      onChange={(e) => setNewWall({ 
                        ...newWall, 
                        endPoint: { ...newWall.endPoint, z: parseFloat(e.target.value) || 0 }
                      })}
                      placeholder="Z"
                      className="form-input text-xs"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-700 block mb-1">Height (ft)</label>
                  <input
                    type="number"
                    value={newWall.height}
                    onChange={(e) => setNewWall({ ...newWall, height: parseFloat(e.target.value) || 8 })}
                    min="1"
                    max={dimensions.height}
                    step="0.5"
                    className="form-input text-xs"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-700 block mb-1">Thickness (ft)</label>
                  <input
                    type="number"
                    value={newWall.thickness}
                    onChange={(e) => setNewWall({ ...newWall, thickness: parseFloat(e.target.value) || 0.5 })}
                    min="0.25"
                    max="2"
                    step="0.25"
                    className="form-input text-xs"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs text-gray-700 block mb-1">Material</label>
                <select
                  value={newWall.material}
                  onChange={(e) => {
                    const material = e.target.value as PartitionMaterial;
                    const materialOption = materialOptions.find(m => m.value === material);
                    setNewWall({ 
                      ...newWall, 
                      material,
                      color: materialOption?.color || '#8B4513'
                    });
                  }}
                  className="form-input text-xs"
                >
                  {materialOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="extendToRoof"
                  checked={newWall.extendToRoof}
                  onChange={(e) => setNewWall({ ...newWall, extendToRoof: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="extendToRoof" className="text-xs text-gray-700">
                  Extend to roof
                </label>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleAddWall}
                  className="flex-1 btn text-xs"
                  disabled={!newWall.name.trim()}
                >
                  Create Wall
                </button>
                <button
                  onClick={() => setShowWallCreator(false)}
                  className="flex-1 btn-secondary btn text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Existing Walls List */}
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
              <button 
                onClick={handleAddSampleWall}
                className="mt-2 text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Sample Wall
              </button>
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

      {/* Quick Stall Templates */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-3">
          <Home className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">Quick Stall Templates</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <button className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200">
            🐴 Horse Stalls
          </button>
          <button className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200">
            🐄 Cattle Pens
          </button>
          <button className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200">
            📦 Storage Rooms
          </button>
          <button className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200">
            🌾 Feed Rooms
          </button>
        </div>
      </div>

      {/* Interior Layout Summary */}
      {interiorLayout && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-800 mb-2">Layout Summary</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Partition walls: {interiorLayout.partitionWalls.length}</div>
            <div>Stall areas: {interiorLayout.stallConfiguration.length}</div>
            <div>Access paths: {interiorLayout.accessPaths.length}</div>
            <div>Total features: {interiorLayout.partitionWalls.reduce((sum, wall) => sum + wall.features.length, 0)}</div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default InteriorPartitionsPanel;