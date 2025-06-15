import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Move, Edit2, AlertTriangle, CheckCircle, Info, MapPin, Ruler, Lock, Unlock } from 'lucide-react';
import { useBuildingStore } from '../../store/buildingStore';
import { 
  validateNewFeature, 
  validateWallHeights, 
  getMaxAllowedHeight,
  suggestValidPosition 
} from '../../utils/wallHeightValidation';
import {
  validateAllFeaturesWithinWallBounds,
  validateFeatureWithinWallBounds,
  suggestValidFeaturePosition,
  getMaxAllowedFeatureDimensions,
  getAvailableSpace,
  isValidFeaturePosition
} from '../../utils/wallBoundsValidation';
import { generateLockStatusMessage } from '../../utils/wallBoundsLockSystem';
import type { FeatureType, WallPosition } from '../../types';

const WallFeaturesPanel: React.FC = () => {
  const { 
    dimensions, 
    features, 
    addFeature, 
    removeFeature, 
    updateFeature,
    getWallProtectionStatus 
  } = useBuildingStore((state) => ({
    dimensions: state.currentProject.building.dimensions,
    features: state.currentProject.building.features,
    addFeature: state.addFeature,
    removeFeature: state.removeFeature,
    updateFeature: state.updateFeature,
    getWallProtectionStatus: state.getWallProtectionStatus
  }));
  
  const [editingFeature, setEditingFeature] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [boundsValidation, setBoundsValidation] = useState<any>(null);
  const [wallLockStatus, setWallLockStatus] = useState<Map<WallPosition, any>>(new Map());
  const [newFeature, setNewFeature] = useState({
    type: 'door' as FeatureType,
    width: 3,
    height: 7,
    wallPosition: 'front' as WallPosition,
    xOffset: 0,
    alignment: 'center' as 'left' | 'center' | 'right',
    yOffset: 0
  });

  // Update wall protection status
  const updateWallLockStatus = () => {
    const wallPositions: WallPosition[] = ['front', 'back', 'left', 'right'];
    const lockStatus = new Map();
    
    wallPositions.forEach(wallPosition => {
      const protection = getWallProtectionStatus(wallPosition);
      lockStatus.set(wallPosition, protection);
    });
    
    setWallLockStatus(lockStatus);
  };

  // Validate all existing features whenever dimensions or features change
  useEffect(() => {
    const heightValidation = validateWallHeights(dimensions, features);
    const boundsValidationResult = validateAllFeaturesWithinWallBounds(features, dimensions);
    
    setValidationErrors([...heightValidation.errors, ...boundsValidationResult.errors]);
    setValidationWarnings([...heightValidation.warnings, ...boundsValidationResult.warnings]);
    setBoundsValidation(boundsValidationResult);
    
    // Update wall lock status
    updateWallLockStatus();
  }, [dimensions, features]);

  // Get maximum allowed dimensions for current position
  const maxAllowedDimensions = getMaxAllowedFeatureDimensions(
    newFeature.wallPosition,
    newFeature.alignment,
    newFeature.xOffset,
    newFeature.yOffset,
    dimensions
  );

  // Get available space around current position
  const availableSpace = getAvailableSpace(
    newFeature.wallPosition,
    newFeature.alignment,
    newFeature.xOffset,
    newFeature.yOffset,
    dimensions
  );

  const handleAddFeature = () => {
    // Validate the new feature before adding
    const heightValidation = validateNewFeature(
      {
        type: newFeature.type,
        width: newFeature.width,
        height: newFeature.height,
        position: {
          wallPosition: newFeature.wallPosition,
          xOffset: newFeature.xOffset,
          yOffset: newFeature.yOffset,
          alignment: newFeature.alignment
        }
      },
      features,
      dimensions.height
    );

    // Validate bounds
    const boundsValid = isValidFeaturePosition(
      {
        type: newFeature.type,
        width: newFeature.width,
        height: newFeature.height,
        position: {
          wallPosition: newFeature.wallPosition,
          xOffset: newFeature.xOffset,
          yOffset: newFeature.yOffset,
          alignment: newFeature.alignment
        }
      },
      dimensions
    );

    if (!heightValidation.valid || !boundsValid) {
      setValidationErrors([
        ...heightValidation.errors,
        ...(boundsValid ? [] : ['Feature extends beyond wall boundaries'])
      ]);
      return;
    }

    // Clear validation errors and add the feature
    setValidationErrors([]);
    addFeature({
      type: newFeature.type,
      width: newFeature.width,
      height: newFeature.height,
      position: {
        wallPosition: newFeature.wallPosition,
        xOffset: newFeature.xOffset,
        yOffset: newFeature.yOffset,
        alignment: newFeature.alignment
      }
    });
    
    setNewFeature({
      ...newFeature,
      xOffset: 0,
      yOffset: 0
    });
  };

  const handleUpdateFeature = (id: string) => {
    const feature = features.find(f => f.id === id);
    if (!feature) return;

    // Check if feature is locked
    if (feature.isLocked && feature.boundsLock) {
      const lockedDimensions = feature.boundsLock.lockedDimensions;
      const violations: string[] = [];
      
      if (newFeature.width !== feature.width && lockedDimensions.width) {
        violations.push('Feature width is locked to maintain wall dimensional integrity');
      }
      
      if (newFeature.height !== feature.height && lockedDimensions.height) {
        violations.push('Feature height is locked to maintain wall dimensional integrity');
      }
      
      if ((newFeature.xOffset !== feature.position.xOffset || 
           newFeature.yOffset !== feature.position.yOffset ||
           newFeature.alignment !== feature.position.alignment) && lockedDimensions.position) {
        violations.push('Feature position is locked to maintain structural integrity');
      }
      
      if (violations.length > 0) {
        setValidationErrors([
          'Cannot modify locked feature:',
          ...violations,
          'Remove feature first to make changes, then re-add with new dimensions'
        ]);
        return;
      }
    }

    // Validate the updated feature
    const heightValidation = validateNewFeature(
      {
        type: newFeature.type,
        width: newFeature.width,
        height: newFeature.height,
        position: {
          wallPosition: newFeature.wallPosition,
          xOffset: newFeature.xOffset,
          yOffset: newFeature.yOffset,
          alignment: newFeature.alignment
        }
      },
      features.filter(f => f.id !== id), // Exclude the feature being updated
      dimensions.height
    );

    const boundsValid = isValidFeaturePosition(
      {
        type: newFeature.type,
        width: newFeature.width,
        height: newFeature.height,
        position: {
          wallPosition: newFeature.wallPosition,
          xOffset: newFeature.xOffset,
          yOffset: newFeature.yOffset,
          alignment: newFeature.alignment
        }
      },
      dimensions
    );

    if (!heightValidation.valid || !boundsValid) {
      setValidationErrors([
        ...heightValidation.errors,
        ...(boundsValid ? [] : ['Feature extends beyond wall boundaries'])
      ]);
      return;
    }

    setValidationErrors([]);
    updateFeature(id, {
      type: newFeature.type,
      width: newFeature.width,
      height: newFeature.height,
      position: {
        wallPosition: newFeature.wallPosition,
        xOffset: newFeature.xOffset,
        yOffset: newFeature.yOffset,
        alignment: newFeature.alignment
      }
    });
    setEditingFeature(null);
  };

  const startEditing = (id: string) => {
    const feature = features.find(f => f.id === id);
    if (!feature) return;

    setNewFeature({
      type: feature.type,
      width: feature.width,
      height: feature.height,
      wallPosition: feature.position.wallPosition,
      xOffset: feature.position.xOffset,
      yOffset: feature.position.yOffset,
      alignment: feature.position.alignment
    });
    setEditingFeature(id);
    setValidationErrors([]); // Clear errors when starting to edit
  };

  const handleSuggestValidPosition = () => {
    const suggestion = suggestValidFeaturePosition(
      {
        id: 'temp',
        type: newFeature.type,
        width: newFeature.width,
        height: newFeature.height,
        position: {
          wallPosition: newFeature.wallPosition,
          xOffset: newFeature.xOffset,
          yOffset: newFeature.yOffset,
          alignment: newFeature.alignment
        }
      },
      dimensions
    );

    setNewFeature({
      ...newFeature,
      width: suggestion.suggestedWidth,
      height: suggestion.suggestedHeight,
      xOffset: suggestion.suggestedXOffset,
      yOffset: suggestion.suggestedYOffset
    });
    setValidationErrors([]);
  };

  // Check if current feature configuration is valid
  const isCurrentFeatureValid = () => {
    return isValidFeaturePosition(
      {
        type: newFeature.type,
        width: newFeature.width,
        height: newFeature.height,
        position: {
          wallPosition: newFeature.wallPosition,
          xOffset: newFeature.xOffset,
          yOffset: newFeature.yOffset,
          alignment: newFeature.alignment
        }
      },
      dimensions
    );
  };

  // Get wall dimensions for current wall position
  const getCurrentWallDimensions = () => {
    switch (newFeature.wallPosition) {
      case 'front':
      case 'back':
        return { width: dimensions.width, height: dimensions.height };
      case 'left':
      case 'right':
        return { width: dimensions.length, height: dimensions.height };
      default:
        return { width: dimensions.width, height: dimensions.height };
    }
  };

  const currentWallDimensions = getCurrentWallDimensions();
  const currentWallProtection = wallLockStatus.get(newFeature.wallPosition);
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {/* Wall Bounds Protection Warning */}
      {currentWallProtection && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Lock className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Wall Protection Active</span>
          </div>
          <p className="text-xs text-orange-700">
            {generateLockStatusMessage(newFeature.wallPosition, currentWallProtection)}
          </p>
          <p className="text-xs text-orange-600 mt-1">
            ⚠️ Adding features will further restrict wall dimension changes
          </p>
        </div>
      )}

      {/* Wall Dimensions Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-2">
          <Info className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            {newFeature.wallPosition.charAt(0).toUpperCase() + newFeature.wallPosition.slice(1)} Wall: {currentWallDimensions.width}ft × {currentWallDimensions.height}ft
          </span>
        </div>
        <p className="text-xs text-blue-700">
          All doors and windows must be positioned within these wall boundaries.
        </p>
      </div>

      {/* Position Information */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-2">
          <MapPin className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-800">Available Space at Current Position</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
          <div>Left space:</div>
          <div className="font-medium">{availableSpace.leftSpace.toFixed(1)}ft</div>
          <div>Right space:</div>
          <div className="font-medium">{availableSpace.rightSpace.toFixed(1)}ft</div>
          <div>Bottom space:</div>
          <div className="font-medium">{availableSpace.bottomSpace.toFixed(1)}ft</div>
          <div>Top space:</div>
          <div className="font-medium">{availableSpace.topSpace.toFixed(1)}ft</div>
        </div>
      </div>

      {/* Global Validation Status */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">Validation Errors</span>
          </div>
          <ul className="text-xs text-red-700 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {validationWarnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Warnings</span>
          </div>
          <ul className="text-xs text-yellow-700 space-y-1">
            {validationWarnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {validationErrors.length === 0 && validationWarnings.length === 0 && features.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">All features are positioned within wall bounds</span>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="featureType" className="form-label">Feature Type</label>
        <select
          id="featureType"
          className="form-input"
          value={newFeature.type}
          onChange={(e) => setNewFeature({ ...newFeature, type: e.target.value as FeatureType })}
        >
          <option value="door">Standard Door</option>
          <option value="window">Window</option>
          <option value="rollupDoor">Roll-up Door</option>
          <option value="walkDoor">Walk Door</option>
        </select>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="featureWidth" className="form-label">
            Width (ft)
            <span className="text-xs text-gray-500 ml-1">
              (max: {maxAllowedDimensions.maxWidth.toFixed(1)}ft)
            </span>
          </label>
          <input
            type="number"
            id="featureWidth"
            className={`form-input ${newFeature.width > maxAllowedDimensions.maxWidth ? 'border-red-300 bg-red-50' : ''}`}
            min="1"
            max={maxAllowedDimensions.maxWidth}
            step="0.5"
            value={newFeature.width}
            onChange={(e) => setNewFeature({ ...newFeature, width: parseFloat(e.target.value) })}
          />
          {newFeature.width > maxAllowedDimensions.maxWidth && (
            <p className="text-xs text-red-600 mt-1">
              Width exceeds available space at this position
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="featureHeight" className="form-label">
            Height (ft)
            <span className="text-xs text-gray-500 ml-1">
              (max: {maxAllowedDimensions.maxHeight.toFixed(1)}ft)
            </span>
          </label>
          <input
            type="number"
            id="featureHeight"
            className={`form-input ${newFeature.height > maxAllowedDimensions.maxHeight ? 'border-red-300 bg-red-50' : ''}`}
            min="1"
            max={maxAllowedDimensions.maxHeight}
            step="0.5"
            value={newFeature.height}
            onChange={(e) => setNewFeature({ ...newFeature, height: parseFloat(e.target.value) })}
          />
          {newFeature.height > maxAllowedDimensions.maxHeight && (
            <p className="text-xs text-red-600 mt-1">
              Height exceeds available space at this position
            </p>
          )}
        </div>
      </div>
      
      <div>
        <label htmlFor="wallPosition" className="form-label">Wall</label>
        <select
          id="wallPosition"
          className="form-input"
          value={newFeature.wallPosition}
          onChange={(e) => setNewFeature({ ...newFeature, wallPosition: e.target.value as WallPosition })}
        >
          <option value="front">Front ({dimensions.width}ft wide)</option>
          <option value="back">Back ({dimensions.width}ft wide)</option>
          <option value="left">Left ({dimensions.length}ft wide)</option>
          <option value="right">Right ({dimensions.length}ft wide)</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="alignment" className="form-label">Alignment</label>
        <select
          id="alignment"
          className="form-input"
          value={newFeature.alignment}
          onChange={(e) => setNewFeature({ ...newFeature, alignment: e.target.value as 'left' | 'center' | 'right' })}
        >
          <option value="left">Left Edge</option>
          <option value="center">Center</option>
          <option value="right">Right Edge</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="xOffset" className="form-label">
          Position Offset (ft)
          <span className="text-xs text-gray-500 ml-1">
            ({newFeature.alignment} alignment)
          </span>
        </label>
        <input
          type="number"
          id="xOffset"
          className="form-input"
          min="0"
          step="0.5"
          value={newFeature.xOffset}
          onChange={(e) => setNewFeature({ ...newFeature, xOffset: parseFloat(e.target.value) })}
        />
        <p className="text-xs text-gray-500 mt-1">
          Distance from {newFeature.alignment} edge of wall
        </p>
      </div>
      
      <div>
        <label htmlFor="yOffset" className="form-label">
          Height From Bottom (ft)
          <span className="text-xs text-gray-500 ml-1">
            (max: {(dimensions.height - newFeature.height).toFixed(1)}ft)
          </span>
        </label>
        <input
          type="number"
          id="yOffset"
          className={`form-input ${newFeature.yOffset + newFeature.height > dimensions.height ? 'border-red-300 bg-red-50' : ''}`}
          min="0"
          max={dimensions.height - newFeature.height}
          step="0.5"
          value={newFeature.yOffset}
          onChange={(e) => setNewFeature({ ...newFeature, yOffset: parseFloat(e.target.value) })}
        />
        {newFeature.yOffset + newFeature.height > dimensions.height && (
          <p className="text-xs text-red-600 mt-1">
            Feature extends beyond wall height
          </p>
        )}
      </div>

      {/* Auto-fix suggestion button */}
      {!isCurrentFeatureValid() && (
        <button
          className="w-full btn-secondary btn text-sm"
          onClick={handleSuggestValidPosition}
        >
          <AlertTriangle className="w-4 h-4 mr-1" />
          Auto-fix Position & Size to Fit Wall Bounds
        </button>
      )}
      
      <button
        className={`w-full btn ${!isCurrentFeatureValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={editingFeature ? () => handleUpdateFeature(editingFeature) : handleAddFeature}
        disabled={!isCurrentFeatureValid()}
      >
        {editingFeature ? (
          <>
            <Edit2 className="w-4 h-4 mr-1" />
            Update Feature
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-1" />
            Add Feature (Will Lock Wall Dimensions)
          </>
        )}
      </button>
      
      {features.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Existing Features</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {features.map((feature) => {
              const heightValid = feature.height <= dimensions.height && 
                                 feature.position.yOffset + feature.height <= dimensions.height &&
                                 feature.position.yOffset >= 0;
              
              const boundsValid = boundsValidation?.featureValidations?.get(feature.id)?.valid ?? true;
              const isValid = heightValid && boundsValid;
              
              return (
                <div 
                  key={feature.id} 
                  className={`flex items-center justify-between p-2 rounded border ${
                    editingFeature === feature.id 
                      ? 'bg-blue-50 border-blue-200' 
                      : isValid
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center">
                    <Move className="w-4 h-4 text-gray-400 mr-2" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium capitalize">
                          {feature.type}
                        </p>
                        {feature.isLocked && (
                          <Lock className="w-3 h-3 text-orange-500" title="Feature locks wall dimensions" />
                        )}
                        {!isValid && (
                          <AlertTriangle className="w-3 h-3 text-red-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {feature.position.wallPosition} wall, {feature.width}x{feature.height}ft
                        {!heightValid && (
                          <span className="text-red-600 ml-1">(Invalid height)</span>
                        )}
                        {!boundsValid && (
                          <span className="text-red-600 ml-1">(Out of bounds)</span>
                        )}
                        {feature.isLocked && (
                          <span className="text-orange-600 ml-1">(Locked)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className={`p-1 rounded-full hover:bg-gray-100 ${
                        editingFeature === feature.id ? 'text-blue-500' : 'text-gray-400'
                      } ${feature.isLocked ? 'opacity-50' : ''}`}
                      onClick={() => {
                        if (editingFeature === feature.id) {
                          setEditingFeature(null);
                          setValidationErrors([]);
                        } else {
                          startEditing(feature.id);
                        }
                      }}
                      title={feature.isLocked ? 'Feature is locked - remove to modify' : 'Edit feature'}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 text-gray-400 hover:text-error rounded-full hover:bg-gray-100"
                      onClick={() => removeFeature(feature.id)}
                      title="Remove feature and unlock wall dimensions"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Feature Locking Information */}
      {features.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Lock className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Wall Dimension Protection</span>
          </div>
          <div className="text-xs text-yellow-700 space-y-1">
            <div>• {features.length} feature(s) currently lock wall dimensions</div>
            <div>• Remove features to unlock wall dimension changes</div>
            <div>• Locked features prevent wall resizing that would affect their placement</div>
            <div>• This ensures architectural integrity and prevents feature overflow</div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default WallFeaturesPanel;