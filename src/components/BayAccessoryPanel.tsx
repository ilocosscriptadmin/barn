import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Edit2, 
  Move, 
  RotateCw, 
  Settings,
  Layers,
  Grid,
  Box,
  Wrench,
  Lightbulb,
  Fan,
  Warehouse
} from 'lucide-react';
import { useBuildingStore } from '../store/buildingStore';
import type { BayAccessory } from '../types';

interface BayAccessoryPanelProps {
  bayId: string;
}

const BayAccessoryPanel: React.FC<BayAccessoryPanelProps> = ({ bayId }) => {
  const { building, addBayAccessory, removeBayAccessory, updateBayAccessory } = useBuildingStore((state) => ({
    building: state.currentProject.building,
    addBayAccessory: state.addBayAccessory,
    removeBayAccessory: state.removeBayAccessory,
    updateBayAccessory: state.updateBayAccessory
  }));

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState<string | null>(null);
  const [newAccessory, setNewAccessory] = useState<Omit<BayAccessory, 'id'>>({
    type: 'stall',
    name: '',
    position: { x: 0, y: 0, z: 0 },
    dimensions: { width: 8, length: 10, height: 8 },
    rotation: 0,
    specifications: {},
    isMoveable: true
  });

  const bay = building.bays.find(b => b.id === bayId);
  if (!bay) {
    return <div className="p-4 text-gray-500">Bay not found</div>;
  }

  const accessories = bay.accessories || [];

  const getAccessoryIcon = (type: BayAccessory['type']) => {
    switch (type) {
      case 'stall': return <Warehouse className="w-4 h-4" />;
      case 'feed-bin': return <Box className="w-4 h-4" />;
      case 'water-trough': return <Layers className="w-4 h-4" />;
      case 'equipment-mount': return <Wrench className="w-4 h-4" />;
      case 'storage-rack': return <Grid className="w-4 h-4" />;
      case 'workbench': return <Settings className="w-4 h-4" />;
      case 'electrical-panel': return <Settings className="w-4 h-4" />;
      case 'lighting': return <Lightbulb className="w-4 h-4" />;
      case 'ventilation-fan': return <Fan className="w-4 h-4" />;
      default: return <Box className="w-4 h-4" />;
    }
  };

  const handleAddAccessory = () => {
    addBayAccessory(bayId, newAccessory);
    setShowAddForm(false);
    setNewAccessory({
      type: 'stall',
      name: '',
      position: { x: 0, y: 0, z: 0 },
      dimensions: { width: 8, length: 10, height: 8 },
      rotation: 0,
      specifications: {},
      isMoveable: true
    });
  };

  const handleUpdateAccessory = (accessoryId: string) => {
    if (editingAccessory) {
      updateBayAccessory(bayId, accessoryId, newAccessory);
      setEditingAccessory(null);
    }
  };

  const startEditing = (accessory: BayAccessory) => {
    setEditingAccessory(accessory.id);
    setNewAccessory({
      type: accessory.type,
      name: accessory.name,
      position: { ...accessory.position },
      dimensions: { ...accessory.dimensions },
      rotation: accessory.rotation,
      specifications: { ...accessory.specifications },
      isMoveable: accessory.isMoveable
    });
    setShowAddForm(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Warehouse className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Bay Accessories</span>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded flex items-center space-x-1"
          >
            {showAddForm ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            <span>{showAddForm ? 'Cancel' : 'Add Accessory'}</span>
          </button>
        </div>
        <div className="text-xs text-blue-700">
          <div>Bay: {bay.name}</div>
          <div>Dimensions: {bay.dimensions.width}' × {bay.dimensions.length}' × {bay.dimensions.height}'</div>
          <div>Accessories: {accessories.length}</div>
        </div>
      </div>

      {/* Add/Edit Accessory Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-medium text-gray-800">
            {editingAccessory ? 'Edit Accessory' : 'Add New Accessory'}
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Accessory Type</label>
              <select
                className="form-input"
                value={newAccessory.type}
                onChange={(e) => setNewAccessory({ ...newAccessory, type: e.target.value as BayAccessory['type'] })}
              >
                <option value="stall">Horse Stall</option>
                <option value="feed-bin">Feed Bin</option>
                <option value="water-trough">Water Trough</option>
                <option value="equipment-mount">Equipment Mount</option>
                <option value="storage-rack">Storage Rack</option>
                <option value="workbench">Workbench</option>
                <option value="electrical-panel">Electrical Panel</option>
                <option value="lighting">Lighting</option>
                <option value="ventilation-fan">Ventilation Fan</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Corner Stall"
                value={newAccessory.name}
                onChange={(e) => setNewAccessory({ ...newAccessory, name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="form-label">Width (ft)</label>
              <input
                type="number"
                className="form-input"
                min="1"
                max={bay.dimensions.width}
                value={newAccessory.dimensions.width}
                onChange={(e) => setNewAccessory({ 
                  ...newAccessory, 
                  dimensions: { 
                    ...newAccessory.dimensions, 
                    width: parseFloat(e.target.value) || 1 
                  } 
                })}
              />
            </div>
            
            <div>
              <label className="form-label">Length (ft)</label>
              <input
                type="number"
                className="form-input"
                min="1"
                max={bay.dimensions.length}
                value={newAccessory.dimensions.length}
                onChange={(e) => setNewAccessory({ 
                  ...newAccessory, 
                  dimensions: { 
                    ...newAccessory.dimensions, 
                    length: parseFloat(e.target.value) || 1 
                  } 
                })}
              />
            </div>
            
            <div>
              <label className="form-label">Height (ft)</label>
              <input
                type="number"
                className="form-input"
                min="1"
                max={bay.dimensions.height}
                value={newAccessory.dimensions.height}
                onChange={(e) => setNewAccessory({ 
                  ...newAccessory, 
                  dimensions: { 
                    ...newAccessory.dimensions, 
                    height: parseFloat(e.target.value) || 1 
                  } 
                })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="form-label">X Position (ft)</label>
              <input
                type="number"
                className="form-input"
                min={-bay.dimensions.width/2}
                max={bay.dimensions.width/2}
                step="0.5"
                value={newAccessory.position.x}
                onChange={(e) => setNewAccessory({ 
                  ...newAccessory, 
                  position: { 
                    ...newAccessory.position, 
                    x: parseFloat(e.target.value) || 0 
                  } 
                })}
              />
            </div>
            
            <div>
              <label className="form-label">Y Position (ft)</label>
              <input
                type="number"
                className="form-input"
                min={-bay.dimensions.length/2}
                max={bay.dimensions.length/2}
                step="0.5"
                value={newAccessory.position.y}
                onChange={(e) => setNewAccessory({ 
                  ...newAccessory, 
                  position: { 
                    ...newAccessory.position, 
                    y: parseFloat(e.target.value) || 0 
                  } 
                })}
              />
            </div>
            
            <div>
              <label className="form-label">Rotation (°)</label>
              <input
                type="number"
                className="form-input"
                min="0"
                max="360"
                step="15"
                value={newAccessory.rotation}
                onChange={(e) => setNewAccessory({ 
                  ...newAccessory, 
                  rotation: parseFloat(e.target.value) || 0 
                })}
              />
            </div>
          </div>

          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="isMoveable"
              checked={newAccessory.isMoveable}
              onChange={(e) => setNewAccessory({ ...newAccessory, isMoveable: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="isMoveable" className="text-sm text-gray-700">
              Accessory can be moved/repositioned
            </label>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={editingAccessory ? () => handleUpdateAccessory(editingAccessory) : handleAddAccessory}
              className="flex-1 btn"
            >
              {editingAccessory ? (
                <>
                  <Edit2 className="w-4 h-4 mr-1" />
                  Update Accessory
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Accessory
                </>
              )}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingAccessory(null);
              }}
              className="flex-1 btn-secondary btn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Accessory List */}
      <div className="space-y-2">
        {accessories.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
            <Box className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-500">No accessories added to this bay</p>
            <p className="text-xs text-gray-400 mt-1">Add stalls, equipment, or other features</p>
          </div>
        ) : (
          accessories.map((accessory) => (
            <div
              key={accessory.id}
              className="bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getAccessoryIcon(accessory.type)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{accessory.name || accessory.type.replace('-', ' ')}</span>
                      {accessory.isMoveable && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                          Moveable
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {accessory.dimensions.width}' × {accessory.dimensions.length}' × {accessory.dimensions.height}'
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => startEditing(accessory)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    title="Edit accessory"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => removeBayAccessory(bayId, accessory.id)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                    title="Remove accessory"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Position info */}
              <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
                <div>
                  Position: ({accessory.position.x}, {accessory.position.y}, {accessory.position.z})
                </div>
                <div>
                  Rotation: {accessory.rotation}°
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Accessory Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Bay Accessory Types</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex items-center space-x-2">
            <Warehouse className="w-3 h-3" />
            <span>Stalls - For housing horses or livestock</span>
          </div>
          <div className="flex items-center space-x-2">
            <Box className="w-3 h-3" />
            <span>Storage - Feed bins, equipment racks, etc.</span>
          </div>
          <div className="flex items-center space-x-2">
            <Wrench className="w-3 h-3" />
            <span>Equipment - Workbenches, mounting points</span>
          </div>
          <div className="flex items-center space-x-2">
            <Fan className="w-3 h-3" />
            <span>Utilities - Lighting, ventilation, electrical</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BayAccessoryPanel;