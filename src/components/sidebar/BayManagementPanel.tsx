import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Copy, Trash2, Eye, EyeOff, Home, Building2, Layers, Settings } from 'lucide-react';
import { useBuildingStore } from '../../store/buildingStore';
import type { BaySection, WallPosition } from '../../types';

const BayManagementPanel: React.FC = () => {
  const { 
    bays, 
    activeBayId, 
    addBay, 
    removeBay, 
    updateBay, 
    setActiveBay, 
    duplicateBay,
    dimensions 
  } = useBuildingStore((state) => ({
    bays: state.currentProject.building.bays,
    activeBayId: state.currentProject.building.activeBayId,
    addBay: state.addBay,
    removeBay: state.removeBay,
    updateBay: state.updateBay,
    setActiveBay: state.setActiveBay,
    duplicateBay: state.duplicateBay,
    dimensions: state.currentProject.building.dimensions
  }));

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBay, setEditingBay] = useState<string | null>(null);
  const [newBay, setNewBay] = useState({
    name: '',
    type: 'extension' as 'main' | 'extension' | 'lean-to' | 'side-bay',
    width: 20,
    length: 30,
    height: 12,
    connectionWall: 'right' as WallPosition,
    roofType: 'gable' as 'gable' | 'skillion' | 'shed' | 'hip',
    roofPitch: 4
  });

  const handleAddBay = () => {
    const bayToAdd: Omit<BaySection, 'id'> = {
      name: newBay.name || `${newBay.type.charAt(0).toUpperCase() + newBay.type.slice(1)} Bay`,
      type: newBay.type,
      dimensions: {
        width: newBay.width,
        length: newBay.length,
        height: newBay.height
      },
      position: calculateBayPosition(newBay.connectionWall, newBay.width),
      roofType: newBay.roofType,
      roofPitch: newBay.roofPitch,
      wallProfile: 'trimdek',
      color: '#E5E7EB',
      roofColor: '#9CA3AF',
      features: [],
      skylights: [],
      accessories: [],
      isActive: true,
      connectionType: 'attached',
      connectionWall: newBay.connectionWall
    };

    addBay(bayToAdd);
    setShowAddForm(false);
    setNewBay({
      name: '',
      type: 'extension',
      width: 20,
      length: 30,
      height: 12,
      connectionWall: 'right',
      roofType: 'gable',
      roofPitch: 4
    });
  };

  const calculateBayPosition = (connectionWall: WallPosition, bayWidth: number) => {
    const mainWidth = dimensions.width;
    const mainLength = dimensions.length;
    
    switch (connectionWall) {
      case 'right':
        return { x: mainWidth / 2 + bayWidth / 2, y: 0, z: 0 };
      case 'left':
        return { x: -mainWidth / 2 - bayWidth / 2, y: 0, z: 0 };
      case 'front':
        return { x: 0, y: mainLength / 2 + bayWidth / 2, z: 0 };
      case 'back':
        return { x: 0, y: -mainLength / 2 - bayWidth / 2, z: 0 };
      default:
        return { x: mainWidth / 2 + bayWidth / 2, y: 0, z: 0 };
    }
  };

  const handleToggleBayVisibility = (bayId: string) => {
    const bay = bays.find(b => b.id === bayId);
    if (bay) {
      updateBay(bayId, { isActive: !bay.isActive });
    }
  };

  const handleEditBay = (bayId: string) => {
    if (editingBay === bayId) {
      setEditingBay(null);
    } else {
      setEditingBay(bayId);
      setActiveBay(bayId);
    }
  };

  const getBayTypeIcon = (type: string) => {
    switch (type) {
      case 'extension': return <Building2 className="w-4 h-4" />;
      case 'lean-to': return <Home className="w-4 h-4" />;
      case 'side-bay': return <Layers className="w-4 h-4" />;
      default: return <Building2 className="w-4 h-4" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {/* Main Building Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-2">
          <Home className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Main Building</span>
          <button
            onClick={() => setActiveBay(null)}
            className={`text-xs px-2 py-1 rounded ${
              activeBayId === null || activeBayId === undefined
                ? 'bg-blue-200 text-blue-800'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {activeBayId === null || activeBayId === undefined ? 'Active' : 'Select'}
          </button>
        </div>
        <div className="text-xs text-blue-700">
          {dimensions.width}ft × {dimensions.length}ft × {dimensions.height}ft
        </div>
      </div>

      {/* Bay List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Bay Sections ({bays.length})</h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn text-xs px-3 py-1"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Bay
          </button>
        </div>

        {bays.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No bay sections added yet</p>
            <p className="text-xs">Add extensions, lean-tos, or side bays</p>
          </div>
        )}

        <div className="space-y-2">
          {bays.map((bay) => (
            <div
              key={bay.id}
              className={`border rounded-lg p-3 transition-all duration-200 ${
                activeBayId === bay.id
                  ? 'border-blue-500 bg-blue-50'
                  : bay.isActive
                    ? 'border-gray-300 bg-white'
                    : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getBayTypeIcon(bay.type)}
                  <span className="font-medium text-sm">{bay.name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    bay.type === 'extension' ? 'bg-green-100 text-green-700' :
                    bay.type === 'lean-to' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {bay.type}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleToggleBayVisibility(bay.id)}
                    className={`p-1 rounded ${
                      bay.isActive ? 'text-green-600 hover:bg-green-100' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={bay.isActive ? 'Hide bay' : 'Show bay'}
                  >
                    {bay.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </button>
                  
                  <button
                    onClick={() => handleEditBay(bay.id)}
                    className={`p-1 rounded ${
                      editingBay === bay.id ? 'text-blue-600 bg-blue-100' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title="Edit bay"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  
                  <button
                    onClick={() => duplicateBay(bay.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                    title="Duplicate bay"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  
                  <button
                    onClick={() => removeBay(bay.id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded"
                    title="Remove bay"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-600 space-y-1">
                <div>Dimensions: {bay.dimensions.width}ft × {bay.dimensions.length}ft × {bay.dimensions.height}ft</div>
                <div>Connected to: {bay.connectionWall} wall</div>
                <div>Roof: {bay.roofType} ({bay.roofPitch}:12 pitch)</div>
                {bay.accessories.length > 0 && (
                  <div>Accessories: {bay.accessories.length} items</div>
                )}
              </div>

              {activeBayId === bay.id && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="text-xs text-blue-700 font-medium mb-2">Active Bay Controls</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {/* Add feature logic */}}
                      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
                    >
                      Add Feature
                    </button>
                    <button
                      onClick={() => {/* Add accessory logic */}}
                      className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded"
                    >
                      Add Accessory
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Bay Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border border-gray-300 rounded-lg p-4 bg-gray-50"
        >
          <h4 className="text-sm font-medium text-gray-800 mb-3">Add New Bay Section</h4>
          
          <div className="space-y-3">
            <div>
              <label className="form-label">Bay Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Equipment Storage, Horse Stalls"
                value={newBay.name}
                onChange={(e) => setNewBay({ ...newBay, name: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">Bay Type</label>
              <select
                className="form-input"
                value={newBay.type}
                onChange={(e) => setNewBay({ ...newBay, type: e.target.value as any })}
              >
                <option value="extension">Extension - Full height addition</option>
                <option value="lean-to">Lean-to - Sloped roof addition</option>
                <option value="side-bay">Side Bay - Partial height section</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="form-label">Width (ft)</label>
                <input
                  type="number"
                  className="form-input"
                  min="8"
                  max="40"
                  value={newBay.width}
                  onChange={(e) => setNewBay({ ...newBay, width: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="form-label">Length (ft)</label>
                <input
                  type="number"
                  className="form-input"
                  min="10"
                  max="60"
                  value={newBay.length}
                  onChange={(e) => setNewBay({ ...newBay, length: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="form-label">Height (ft)</label>
                <input
                  type="number"
                  className="form-input"
                  min="8"
                  max="20"
                  value={newBay.height}
                  onChange={(e) => setNewBay({ ...newBay, height: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Connect to Wall</label>
              <select
                className="form-input"
                value={newBay.connectionWall}
                onChange={(e) => setNewBay({ ...newBay, connectionWall: e.target.value as WallPosition })}
              >
                <option value="right">Right Wall</option>
                <option value="left">Left Wall</option>
                <option value="front">Front Wall</option>
                <option value="back">Back Wall</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="form-label">Roof Type</label>
                <select
                  className="form-input"
                  value={newBay.roofType}
                  onChange={(e) => setNewBay({ ...newBay, roofType: e.target.value as any })}
                >
                  <option value="gable">Gable</option>
                  <option value="skillion">Skillion</option>
                  <option value="shed">Shed</option>
                  <option value="hip">Hip</option>
                </select>
              </div>
              <div>
                <label className="form-label">Roof Pitch</label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  max="12"
                  step="0.5"
                  value={newBay.roofPitch}
                  onChange={(e) => setNewBay({ ...newBay, roofPitch: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={handleAddBay}
                className="flex-1 btn"
                disabled={!newBay.name.trim()}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Bay
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 btn-secondary btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Bay Statistics */}
      {bays.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Bay Statistics</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>Total bays: {bays.length}</div>
            <div>Active bays: {bays.filter(b => b.isActive).length}</div>
            <div>Total accessories: {bays.reduce((sum, bay) => sum + bay.accessories.length, 0)}</div>
            <div>Connected walls: {new Set(bays.map(b => b.connectionWall)).size}</div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BayManagementPanel;