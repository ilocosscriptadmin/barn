import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Edit2, AlertTriangle, CheckCircle, Info, Ruler, Home } from 'lucide-react';
import { useBuildingStore } from '../../store/buildingStore';
import {
  validateWallLayout,
  createDefaultWallLayout,
  optimizeWallLayout,
  addWallSegment,
  removeWallSegment,
  updateWallSegment,
  formatFeetAndInches,
  type WallSegment,
  type WallGap,
  type WallLayout
} from '../../utils/wallLayoutValidation';

const WallLayoutPanel: React.FC = () => {
  const { dimensions, wallLayout, updateWallLayout } = useBuildingStore((state) => ({
    dimensions: state.currentProject.building.dimensions,
    wallLayout: state.currentProject.building.wallLayout,
    updateWallLayout: state.updateWallLayout
  }));

  const [validationResult, setValidationResult] = useState<any>(null);
  const [editingWall, setEditingWall] = useState<string | null>(null);
  const [newWall, setNewWall] = useState({
    name: '',
    width: 0.33, // 4 inches default
    thickness: 0.33,
    position: 0,
    type: 'interior' as 'exterior' | 'interior' | 'partition'
  });

  // Initialize wall layout when dimensions change
  useEffect(() => {
    if (!wallLayout) {
      console.log('🏗️ Creating initial wall layout');
      const layout = createDefaultWallLayout(dimensions.width, dimensions.length);
      updateWallLayout(layout);
      
      const validation = validateWallLayout(
        layout.wallSegments,
        layout.gaps,
        dimensions.width,
        dimensions.length
      );
      setValidationResult(validation);
    } else {
      console.log('🏗️ Validating existing wall layout');
      const validation = validateWallLayout(
        wallLayout.wallSegments,
        wallLayout.gaps,
        dimensions.width,
        dimensions.length
      );
      setValidationResult(validation);
    }
  }, [dimensions.width, dimensions.length, wallLayout, updateWallLayout]);

  const handleAddWall = () => {
    if (!wallLayout) return;

    console.log('🏗️ Adding new wall:', newWall);
    const result = addWallSegment(wallLayout, newWall);
    
    if (result.valid) {
      updateWallLayout(result.layout);
      setValidationResult(result);
      setNewWall({
        name: '',
        width: 0.33,
        thickness: 0.33,
        position: 0,
        type: 'interior'
      });
      console.log('✅ Wall added successfully');
    } else {
      setValidationResult(result);
      console.log('❌ Wall addition failed:', result.errors);
    }
  };

  const handleRemoveWall = (wallId: string) => {
    if (!wallLayout) return;

    console.log('🗑️ Removing wall:', wallId);
    const result = removeWallSegment(wallLayout, wallId);
    updateWallLayout(result.layout);
    setValidationResult(result);
  };

  const handleUpdateWall = (wallId: string, updates: Partial<WallSegment>) => {
    if (!wallLayout) return;

    console.log('✏️ Updating wall:', wallId, updates);
    const result = updateWallSegment(wallLayout, wallId, updates);
    updateWallLayout(result.layout);
    setValidationResult(result);
  };

  const handleOptimizeLayout = () => {
    if (!wallLayout) return;

    console.log('🔧 Optimizing wall layout');
    const optimized = optimizeWallLayout(
      wallLayout.wallSegments,
      wallLayout.gaps,
      dimensions.width,
      dimensions.length
    );
    
    updateWallLayout(optimized);
    
    const validation = validateWallLayout(
      optimized.wallSegments,
      optimized.gaps,
      dimensions.width,
      dimensions.length
    );
    setValidationResult(validation);
  };

  if (!wallLayout || !validationResult) {
    return (
      <div className="p-4">
        <div className="animate-pulse">Loading wall layout...</div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {/* Room Dimensions Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-2">
          <Home className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            Room Dimensions: {formatFeetAndInches(dimensions.width)} × {formatFeetAndInches(dimensions.length)}
          </span>
        </div>
        <div className="text-xs text-blue-700 space-y-1">
          <div>Available width: {formatFeetAndInches(dimensions.width)}</div>
          <div>Used space: {formatFeetAndInches(validationResult.measurements.usedSpace)}</div>
          <div>Remaining space: {formatFeetAndInches(validationResult.measurements.remainingSpace)}</div>
          <div>Utilization: {validationResult.measurements.utilizationPercentage.toFixed(1)}%</div>
        </div>
      </div>

      {/* Important Note */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-2">
          <Info className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">Interior Wall Designer</span>
        </div>
        <div className="text-xs text-green-700">
          Design interior walls that will appear as 3D structures inside your barn. Perfect for creating stalls, rooms, or work areas.
          Switch to 3D view to see your walls in the barn!
        </div>
      </div>

      {/* Validation Status */}
      {validationResult.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">Configuration Errors</span>
          </div>
          <ul className="text-xs text-red-700 space-y-1">
            {validationResult.errors.map((error: string, index: number) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
          <button
            onClick={handleOptimizeLayout}
            className="mt-2 text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded"
          >
            Auto-fix Layout
          </button>
        </div>
      )}

      {validationResult.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Warnings</span>
          </div>
          <ul className="text-xs text-yellow-700 space-y-1">
            {validationResult.warnings.map((warning: string, index: number) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {validationResult.valid && validationResult.errors.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Interior walls are ready! Switch to 3D view to see them in your barn.
            </span>
          </div>
        </div>
      )}

      {/* Add New Wall */}
      <div className="border border-gray-200 rounded-lg p-3">
        <h3 className="text-sm font-medium text-gray-800 mb-3">Add Interior Wall</h3>
        
        <div className="space-y-3">
          <div>
            <label className="form-label">Wall Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Stall Divider, Storage Wall"
              value={newWall.name}
              onChange={(e) => setNewWall({ ...newWall, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Width (ft)</label>
              <input
                type="number"
                className="form-input"
                min="0.25"
                max="2"
                step="0.08" // 1 inch increments
                value={newWall.width}
                onChange={(e) => setNewWall({ ...newWall, width: parseFloat(e.target.value) || 0.33 })}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formatFeetAndInches(newWall.width)}
              </p>
            </div>

            <div>
              <label className="form-label">Position (ft)</label>
              <input
                type="number"
                className="form-input"
                min="0"
                max={dimensions.width}
                step="0.5"
                value={newWall.position}
                onChange={(e) => setNewWall({ ...newWall, position: parseFloat(e.target.value) || 0 })}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formatFeetAndInches(newWall.position)} from left
              </p>
            </div>
          </div>

          <div>
            <label className="form-label">Wall Type</label>
            <select
              className="form-input"
              value={newWall.type}
              onChange={(e) => setNewWall({ ...newWall, type: e.target.value as any })}
            >
              <option value="interior">Interior Wall</option>
              <option value="partition">Partition Wall</option>
            </select>
          </div>

          <button
            onClick={handleAddWall}
            className="w-full btn"
            disabled={!newWall.name.trim() || newWall.width <= 0}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Interior Wall
          </button>
        </div>
      </div>

      {/* Existing Walls */}
      {wallLayout.wallSegments.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Wall Segments ({wallLayout.wallSegments.length})</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {wallLayout.wallSegments.map((wall) => (
              <div 
                key={wall.id}
                className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{wall.name}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      wall.type === 'exterior' ? 'bg-blue-100 text-blue-800' :
                      wall.type === 'interior' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {wall.type}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Width: {formatFeetAndInches(wall.width)}</div>
                    <div>Position: {formatFeetAndInches(wall.position)} from left</div>
                    <div>End: {formatFeetAndInches(wall.position + wall.width)}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    onClick={() => setEditingWall(editingWall === wall.id ? null : wall.id)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {wall.type !== 'exterior' && (
                    <button
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                      onClick={() => handleRemoveWall(wall.id)}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Layout Representation */}
      <div className="border border-gray-200 rounded-lg p-3">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Layout Visualization</h3>
        <div className="relative bg-gray-100 h-16 rounded border">
          {/* Room outline */}
          <div className="absolute inset-0 border-2 border-gray-400 rounded"></div>
          
          {/* Wall segments */}
          {wallLayout.wallSegments.map((wall) => {
            const leftPercent = (wall.position / dimensions.width) * 100;
            const widthPercent = (wall.width / dimensions.width) * 100;
            
            return (
              <div
                key={wall.id}
                className={`absolute top-1 bottom-1 ${
                  wall.type === 'exterior' ? 'bg-blue-500' :
                  wall.type === 'interior' ? 'bg-green-500' :
                  'bg-gray-500'
                }`}
                style={{
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`
                }}
                title={`${wall.name}: ${formatFeetAndInches(wall.width)} at ${formatFeetAndInches(wall.position)}`}
              ></div>
            );
          })}
          
          {/* Dimension labels */}
          <div className="absolute -bottom-6 left-0 text-xs text-gray-600">0'</div>
          <div className="absolute -bottom-6 right-0 text-xs text-gray-600">
            {formatFeetAndInches(dimensions.width)}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center space-x-4 mt-3 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Exterior</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Interior</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-500 rounded"></div>
            <span>Partition</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WallLayoutPanel;