import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Move, Eye, EyeOff, Settings, Grid, Home, DoorOpen, Lock, Unlock, AlertTriangle, ArrowUp, ArrowDown, Pause, Play } from 'lucide-react';
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
    currentHeight: 8,
    targetHeight: 8,
    thickness: 0.5,
    material: 'wood_planks' as PartitionMaterial,
    extendToRoof: false,
    isLocked: false,
    speed: 5,
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
      currentHeight: 8,
      targetHeight: 8,
      thickness: 0.5,
      material: 'wood_planks',
      extendToRoof: false,
      isLocked: false,
      speed: 5,
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

  const handleWallHeightChange = (wall: PartitionWall, newTargetHeight: number) => {
    if (wall.isLocked) return;
    
    updatePartitionWall(wall.id, {
      targetHeight: newTargetHeight
    });
  };

  const handleWallSpeedChange = (wall: PartitionWall, newSpeed: number) => {
    updatePartitionWall(wall.id, {
      speed: newSpeed
    });
  };

  const toggleWallLock = (wall: PartitionWall) => {
    updatePartitionWall(wall.id, {
      isLocked: !wall.isLocked
    });
  };

  const handleEmergencyStop = () => {
    // Stop all moving walls by setting their target height to current height
    if (!interiorLayout?.partitionWalls) return;
    
    interiorLayout.partitionWalls.forEach(wall => {
      if (!wall.isLocked && wall.currentHeight !== wall.targetHeight) {
        updatePartitionWall(wall.id, {
          targetHeight: wall.currentHeight
        });
      }
    });
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
      currentHeight: 0, // Start at ground level
      targetHeight: 8, // Target full height
      thickness: 0.5,
      material: 'wood_planks',
      extendToRoof: false,
      isLocked: false,
      speed: 5,
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

      {/* Emergency Stop Button */}
      <button
        onClick={handleEmergencyStop}
        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
      >
        <Pause className="w-4 h-4" />
        <span>EMERGENCY STOP</span>
      </button>

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
                    onChange={(e) => {
                      const height = parseFloat(e.target.value) || 8;
                      setNewWall({ 
                        ...newWall, 
                        height, 
                        currentHeight: height,
                        targetHeight: height
                      });
                    }}
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
                    {wall.isLocked && (
                      <Lock className="w-3 h-3 text-red-500" />
                    )}
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
                  {wall.currentHeight.toFixed(1)}ft / {wall.targetHeight.toFixed(1)}ft • 
                  {wall.extendToRoof ? 'Extends to roof' : 'Partial height'}
                </div>
                
                {/* Wall Controls */}
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!wall.isLocked) {
                        handleWallHeightChange(wall, Math.min(wall.targetHeight + 1, dimensions.height));
                      }
                    }}
                    disabled={wall.isLocked || wall.targetHeight >= dimensions.height}
                    className={`text-xs px-2 py-1 rounded flex items-center justify-center space-x-1 ${
                      wall.isLocked || wall.targetHeight >= dimensions.height
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <ArrowUp className="w-3 h-3" />
                    <span>Raise</span>
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!wall.isLocked) {
                        handleWallHeightChange(wall, Math.max(wall.targetHeight - 1, 0));
                      }
                    }}
                    disabled={wall.isLocked || wall.targetHeight <= 0}
                    className={`text-xs px-2 py-1 rounded flex items-center justify-center space-x-1 ${
                      wall.isLocked || wall.targetHeight <= 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <ArrowDown className="w-3 h-3" />
                    <span>Lower</span>
                  </button>
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
          
          {/* Wall Height Controls */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-700">Wall Height</label>
              <div className="flex items-center space-x-1">
                <span className="text-xs font-medium">{selectedWallData.currentHeight.toFixed(1)}ft</span>
                <span className="text-xs text-gray-500">/ {selectedWallData.targetHeight.toFixed(1)}ft</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max={dimensions.height}
                step="0.5"
                value={selectedWallData.targetHeight}
                onChange={(e) => handleWallHeightChange(selectedWallData, parseFloat(e.target.value))}
                disabled={selectedWallData.isLocked}
                className={`flex-1 ${selectedWallData.isLocked ? 'opacity-50' : ''}`}
              />
              <input
                type="number"
                min="0"
                max={dimensions.height}
                step="0.5"
                value={selectedWallData.targetHeight}
                onChange={(e) => handleWallHeightChange(selectedWallData, parseFloat(e.target.value) || 0)}
                disabled={selectedWallData.isLocked}
                className={`w-16 form-input text-xs ${selectedWallData.isLocked ? 'bg-gray-100' : ''}`}
              />
            </div>
            
            {selectedWallData.isLocked && (
              <div className="mt-1 text-xs text-red-600 flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>Wall height is locked</span>
              </div>
            )}
          </div>
          
          {/* Wall Speed Controls */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-700">Movement Speed</label>
              <span className="text-xs font-medium">{selectedWallData.speed}/10</span>
            </div>
            
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={selectedWallData.speed}
              onChange={(e) => handleWallSpeedChange(selectedWallData, parseInt(e.target.value))}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Slow</span>
              <span>Fast</span>
            </div>
          </div>
          
          {/* Wall Lock Control */}
          <div className="mb-3">
            <button
              onClick={() => toggleWallLock(selectedWallData)}
              className={`w-full py-2 px-4 rounded-lg flex items-center justify-center space-x-2 ${
                selectedWallData.isLocked
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {selectedWallData.isLocked ? (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Wall</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Lock Wall</span>
                </>
              )}
            </button>
          </div>
          
          {/* Preset Height Buttons */}
          <div className="mb-3">
            <label className="text-xs text-gray-700 block mb-2">Preset Heights</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleWallHeightChange(selectedWallData, 0)}
                disabled={selectedWallData.isLocked}
                className={`text-xs px-2 py-1 rounded ${
                  selectedWallData.isLocked
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Floor (0ft)
              </button>
              <button
                onClick={() => handleWallHeightChange(selectedWallData, dimensions.height / 2)}
                disabled={selectedWallData.isLocked}
                className={`text-xs px-2 py-1 rounded ${
                  selectedWallData.isLocked
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Half ({(dimensions.height / 2).toFixed(1)}ft)
              </button>
              <button
                onClick={() => handleWallHeightChange(selectedWallData, dimensions.height)}
                disabled={selectedWallData.isLocked}
                className={`text-xs px-2 py-1 rounded ${
                  selectedWallData.isLocked
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Full ({dimensions.height.toFixed(1)}ft)
              </button>
            </div>
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

      {/* Control Panel Information */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <h4 className="text-sm font-medium text-gray-800 mb-2">Wall Control Panel</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div>• Select a wall to access detailed controls</div>
          <div>• Use the sliders to set precise wall heights</div>
          <div>• Lock walls to prevent accidental movement</div>
          <div>• Adjust speed for smooth or rapid transitions</div>
          <div>• Use Emergency Stop to halt all wall movement</div>
        </div>
      </div>

      {/* Safety Information */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-yellow-600" />
          <h4 className="text-sm font-medium text-yellow-800">Safety Information</h4>
        </div>
        <div className="text-xs text-yellow-700 space-y-1">
          <div>• Ensure area is clear before raising or lowering walls</div>
          <div>• Use Emergency Stop for immediate halt of all movement</div>
          <div>• Lock walls when in final position for safety</div>
          <div>• Slower speeds recommended for occupied areas</div>
        </div>
      </div>
    </motion.div>
  );
};

export default InteriorPartitionsPanel;