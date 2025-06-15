import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Move, Settings, Package, Wrench, Lightbulb, Fan } from 'lucide-react';
import { useBuildingStore } from '../store/buildingStore';
import type { BayAccessory } from '../types';

interface BayAccessoryPanelProps {
  bayId: string;
}

const BayAccessoryPanel: React.FC<BayAccessoryPanelProps> = ({ bayId }) => {
  const { 
    bays, 
    addBayAccessory, 
    removeBayAccessory, 
    updateBayAccessory 
  } = useBuildingStore((state) => ({
    bays: state.currentProject.building.bays,
    addBayAccessory: state.addBayAccessory,
    removeBayAccessory: state.removeBayAccessory,
    updateBayAccessory: state.updateBayAccessory
  }));

  const bay = bays.find(b => b.id === bayId);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState<string | null>(null);
  const [newAccessory, setNewAccessory] = useState({
    type: 'stall' as BayAccessory['type'],
    name: '',
    width: 4,
    length: 4,
    height: 3,
    x: 0,
    y: 0,
    z: 0,
    rotation: 0
  });

  if (!bay) return null;

  const accessoryTypes = [
    { value: 'stall', label: 'Horse Stall', icon: Package, defaultSize: { width: 12, length: 12, height: 8 } },
    { value: 'feed-bin', label: 'Feed Bin', icon: Package, defaultSize: { width: 4, length: 2, height: 3 } },
    { value: 'water-trough', label: 'Water Trough', icon: Package, defaultSize: { width: 6, length: 2, height: 2 } },
    { value: 'equipment-mount', label: 'Equipment Mount', icon: Wrench, defaultSize: { width: 2, length: 2, height: 1 } },
    { value: 'storage-rack', label: 'Storage Rack', icon: Package, defaultSize: { width: 8, length: 2, height: 6 } },
    { value: 'workbench', label: 'Workbench', icon: Wrench, defaultSize: { width: 6, length: 2, height: 3 } },
    { value: 'electrical-panel', label: 'Electrical Panel', icon: Lightbulb, defaultSize: { width: 2, length: 1, height: 4 } },
    { value: 'lighting', label: 'Lighting Fixture', icon: Lightbulb, defaultSize: { width: 2, length: 2, height: 1 } },
    { value: 'ventilation-fan', label: 'Ventilation Fan', icon: Fan, defaultSize: { width: 3, length: 3, height: 1 } }
  ];

  const handleAddAccessory = () => {
    const accessoryToAdd: Omit<BayAccessory, 'id'> = {
      type: newAccessory.type,
      name: newAccessory.name || getDefaultAccessoryName(newAccessory.type),
      position: {
        x: newAccessory.x,
        y: newAccessory.y,
        z: newAccessory.z
      },
      dimensions: {
        width: newAccessory.width,
        length: newAccessory.length,
        height: newAccessory.height
      },
      rotation: newAccessory.rotation,
      specifications: {},
      isMoveable: true
    };

    addBayAccessory(bayId, accessoryToAdd);
    setShowAddForm(false);
    resetNewAccessory();
  };

  const resetNewAccessory = () => {
    setNewAccessory({
      type: 'stall',
      name: '',
      width: 4,
      length: 4,
      height: 3,
      x: 0,
      y: 0,
      z: 0,
      rotation: 0
    });
  };

  const getDefaultAccessoryName = (type: BayAccessory['type']): string => {
    const typeInfo = accessoryTypes.find(t => t.value === type);
    return typeInfo ? typeInfo.label : 'Accessory';
  };

  const getAccessoryIcon = (type: BayAccessory['type']) => {
    const typeInfo = accessoryTypes.find(t => t.value === type);
    const IconComponent = typeInfo?.icon || Package;
    return <IconComponent className="w-4 h-4" />;
  };

  const handleTypeChange = (type: BayAccessory['type']) => {
    const typeInfo = accessoryTypes.find(t => t.value === type);
    if (typeInfo) {
      setNewAccessory({
        ...newAccessory,
        type,
        width: typeInfo.defaultSize.width,
        length: typeInfo.defaultSize.length,
        height: typeInfo.defaultSize.height
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">
          Bay Accessories ({bay.accessories.length})
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn text-xs px-3 py-1"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Accessory
        </button>
      </div>

      {/* Accessories List */}
      <div className="space-y-2">
        {bay.accessories.map((accessory) => (
          <div
            key={accessory.id}
            className="border border-gray-200 rounded-lg p-3 bg-white"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getAccessoryIcon(accessory.type)}
                <span className="font-medium text-sm">{accessory.name}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {accessory.type.replace('-', ' ')}
                </span>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setEditingAccessory(editingAccessory === accessory.id ? null : accessory.id)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => removeBayAccessory(bayId, accessory.id)}
                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="text-xs text-gray-600 space-y-1">
              <div>Size: {accessory.dimensions.width}ft × {accessory.dimensions.length}ft × {accessory.dimensions.height}ft</div>
              <div>Position: ({accessory.position.x}, {accessory.position.y}, {accessory.position.z})</div>
              {accessory.rotation !== 0 && (
                <div>Rotation: {accessory.rotation}°</div>
              )}
            </div>

            {editingAccessory === accessory.id && (
              <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-gray-600">X Position</label>
                    <input
                      type="number"
                      className="form-input text-xs"
                      value={accessory.position.x}
                      onChange={(e) => updateBayAccessory(bayId, accessory.id, {
                        position: { ...accessory.position, x: parseFloat(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Y Position</label>
                    <input
                      type="number"
                      className="form-input text-xs"
                      value={accessory.position.y}
                      onChange={(e) => updateBayAccessory(bayId, accessory.id, {
                        position: { ...accessory.position, y: parseFloat(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Rotation</label>
                    <input
                      type="number"
                      className="form-input text-xs"
                      min="0"
                      max="360"
                      step="15"
                      value={accessory.rotation}
                      onChange={(e) => updateBayAccessory(bayId, accessory.id, {
                        rotation: parseFloat(e.target.value)
                      })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {bay.accessories.length === 0 && !showAddForm && (
        <div className="text-center py-6 text-gray-500">
          <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No accessories added yet</p>
          <p className="text-xs">Add equipment, storage, or utilities</p>
        </div>
      )}

      {/* Add Accessory Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border border-gray-300 rounded-lg p-4 bg-gray-50"
        >
          <h4 className="text-sm font-medium text-gray-800 mb-3">Add Accessory</h4>
          
          <div className="space-y-3">
            <div>
              <label className="form-label">Accessory Type</label>
              <select
                className="form-input"
                value={newAccessory.type}
                onChange={(e) => handleTypeChange(e.target.value as BayAccessory['type'])}
              >
                {accessoryTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-input"
                placeholder={getDefaultAccessoryName(newAccessory.type)}
                value={newAccessory.name}
                onChange={(e) => setNewAccessory({ ...newAccessory, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="form-label">Width (ft)</label>
                <input
                  type="number"
                  className="form-input"
                  min="0.5"
                  step="0.5"
                  value={newAccessory.width}
                  onChange={(e) => setNewAccessory({ ...newAccessory, width: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="form-label">Length (ft)</label>
                <input
                  type="number"
                  className="form-input"
                  min="0.5"
                  step="0.5"
                  value={newAccessory.length}
                  onChange={(e) => setNewAccessory({ ...newAccessory, length: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="form-label">Height (ft)</label>
                <input
                  type="number"
                  className="form-input"
                  min="0.5"
                  step="0.5"
                  value={newAccessory.height}
                  onChange={(e) => setNewAccessory({ ...newAccessory, height: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="form-label">X Position</label>
                <input
                  type="number"
                  className="form-input"
                  step="0.5"
                  value={newAccessory.x}
                  onChange={(e) => setNewAccessory({ ...newAccessory, x: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="form-label">Y Position</label>
                <input
                  type="number"
                  className="form-input"
                  step="0.5"
                  value={newAccessory.y}
                  onChange={(e) => setNewAccessory({ ...newAccessory, y: parseFloat(e.target.value) })}
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
                  onChange={(e) => setNewAccessory({ ...newAccessory, rotation: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={handleAddAccessory}
                className="flex-1 btn"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Accessory
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  resetNewAccessory();
                }}
                className="flex-1 btn-secondary btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default BayAccessoryPanel;