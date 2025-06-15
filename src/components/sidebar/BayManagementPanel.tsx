import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Copy, 
  Trash2, 
  Edit2, 
  Eye, 
  EyeOff, 
  Move, 
  Settings,
  Home,
  Building,
  Layers,
  Grid,
  ChevronDown,
  ChevronRight,
  Link,
  Unlink
} from 'lucide-react';
import { useBuildingStore } from '../../store/buildingStore';
import type { BaySection, BayAccessory } from '../../types';

const BayManagementPanel: React.FC = () => {
  const { 
    building, 
    addBay, 
    removeBay, 
    updateBay, 
    setActiveBay, 
    duplicateBay,
    addBayAccessory,
    removeBayAccessory,
    updateBayAccessory
  } = useBuildingStore((state) => ({
    building: state.currentProject.building,
    addBay: state.addBay,
    removeBay: state.removeBay,
    updateBay: state.updateBay,
    setActiveBay: state.setActiveBay,
    duplicateBay: state.duplicateBay,
    addBayAccessory: state.addBayAccessory,
    removeBayAccessory: state.removeBayAccessory,
    updateBayAccessory: state.updateBayAccessory
  }));

  const [expandedBays, setExpandedBays] = useState<Set<string>>(new Set());
  const [showAddBayForm, setShowAddBayForm] = useState(false);
  const [editingBay, setEditingBay] = useState<string | null>(null);
  const [newBayForm, setNewBayForm] = useState({
    name: '',
    type: 'extension' as BaySection['type'],
    width: 20,
    length: 30,
    height: 12,
    roofType: 'gable' as BaySection['roofType'],
    roofPitch: 4,
    connectionType: 'attached' as BaySection['connectionType'],
    connectionWall: 'right' as BaySection['connectionWall']
  });

  const bays = building.bays || [];
  const activeBayId = building.activeBayId;

  const toggleBayExpansion = (bayId: string) => {
    const newExpanded = new Set(expandedBays);
    if (newExpanded.has(bayId)) {
      newExpanded.delete(bayId);
    } else {
      newExpanded.add(bayId);
    }
    setExpandedBays(newExpanded);
  };

  const handleAddBay = () => {
    const newBay: Omit<BaySection, 'id'> = {
      name: newBayForm.name || `Bay ${bays.length + 1}`,
      type: newBayForm.type,
      dimensions: {
        width: newBayForm.width,
        length: newBayForm.length,
        height: newBayForm.height
      },
      position: {
        x: newBayForm.connectionWall === 'right' ? building.dimensions.width / 2 + newBayForm.width / 2 : 
           newBayForm.connectionWall === 'left' ? -building.dimensions.width / 2 - newBayForm.width / 2 :
           newBayForm.connectionWall === 'front' ? 0 : 0,
        y: newBayForm.connectionWall === 'front' ? building.dimensions.length / 2 + newBayForm.length / 2 :
           newBayForm.connectionWall === 'back' ? -building.dimensions.length / 2 - newBayForm.length / 2 :
           0,
        z: 0
      },
      roofType: newBayForm.roofType,
      roofPitch: newBayForm.roofPitch,
      wallProfile: building.wallProfile,
      color: building.color,
      roofColor: building.roofColor,
      features: [],
      skylights: [],
      accessories: [],
      isActive: true,
      connectionType: newBayForm.connectionType,
      connectionWall: newBayForm.connectionWall
    };

    addBay(newBay);
    setShowAddBayForm(false);
    setNewBayForm({
      name: '',
      type: 'extension',
      width: 20,
      length: 30,
      height: 12,
      roofType: 'gable',
      roofPitch: 4,
      connectionType: 'attached',
      connectionWall: 'right'
    });
  };

  const handleBayVisibilityToggle = (bayId: string) => {
    const bay = bays.find(b => b.id === bayId);
    if (bay) {
      updateBay(bayId, { isActive: !bay.isActive });
    }
  };

  const handleSetActiveBay = (bayId: string) => {
    setActiveBay(activeBayId === bayId ? null : bayId);
  };

  const getBayTypeIcon = (type: BaySection['type']) => {
    switch (type) {
      case 'main': return <Home className="w-4 h-4" />;
      case 'extension': return <Building className="w-4 h-4" />;
      case 'lean-to': return <Layers className="w-4 h-4" />;
      case 'side-bay': return <Grid className="w-4 h-4" />;
      default: return <Building className="w-4 h-4" />;
    }
  };

  const getConnectionIcon = (connectionType?: BaySection['connectionType']) => {
    switch (connectionType) {
      case 'attached': return <Link className="w-3 h-3" />;
      case 'detached': return <Unlink className="w-3 h-3" />;
      case 'lean-to': return <Layers className="w-3 h-3" />;
      default: return <Link className="w-3 h-3" />;
    }
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
            <Building className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Bay Management</span>
          </div>
          <button
            onClick={() => setShowAddBayForm(!showAddBayForm)}
            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded flex items-center space-x-1"
          >
            <Plus className="w-3 h-3" />
            <span>Add Bay</span>
          </button>
        </div>
        <div className="text-xs text-blue-700">
          <div>Total bays: {bays.length}</div>
          <div>Active bay: {activeBayId ? bays.find(b => b.id === activeBayId)?.name || 'None' : 'Main Building'}</div>
        </div>
      </div>

      {/* Add Bay Form */}
      <AnimatePresence>
        {showAddBayForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
          >
            <h3 className="text-sm font-medium text-gray-800">Add New Bay/Extension</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Bay Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Equipment Bay"
                  value={newBayForm.name}
                  onChange={(e) => setNewBayForm({ ...newBayForm, name: e.target.value })}
                />
              </div>
              
              <div>
                <label className="form-label">Bay Type</label>
                <select
                  className="form-input"
                  value={newBayForm.type}
                  onChange={(e) => setNewBayForm({ ...newBayForm, type: e.target.value as BaySection['type'] })}
                >
                  <option value="extension">Extension</option>
                  <option value="lean-to">Lean-to</option>
                  <option value="side-bay">Side Bay</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="form-label">Width (ft)</label>
                <input
                  type="number"
                  className="form-input"
                  min="8"
                  max="60"
                  value={newBayForm.width}
                  onChange={(e) => setNewBayForm({ ...newBayForm, width: parseInt(e.target.value) || 20 })}
                />
              </div>
              
              <div>
                <label className="form-label">Length (ft)</label>
                <input
                  type="number"
                  className="form-input"
                  min="8"
                  max="100"
                  value={newBayForm.length}
                  onChange={(e) => setNewBayForm({ ...newBayForm, length: parseInt(e.target.value) || 30 })}
                />
              </div>
              
              <div>
                <label className="form-label">Height (ft)</label>
                <input
                  type="number"
                  className="form-input"
                  min="8"
                  max="24"
                  value={newBayForm.height}
                  onChange={(e) => setNewBayForm({ ...newBayForm, height: parseInt(e.target.value) || 12 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Connection Type</label>
                <select
                  className="form-input"
                  value={newBayForm.connectionType}
                  onChange={(e) => setNewBayForm({ ...newBayForm, connectionType: e.target.value as BaySection['connectionType'] })}
                >
                  <option value="attached">Attached</option>
                  <option value="detached">Detached</option>
                  <option value="lean-to">Lean-to</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Connect to Wall</label>
                <select
                  className="form-input"
                  value={newBayForm.connectionWall}
                  onChange={(e) => setNewBayForm({ ...newBayForm, connectionWall: e.target.value as BaySection['connectionWall'] })}
                >
                  <option value="front">Front Wall</option>
                  <option value="back">Back Wall</option>
                  <option value="left">Left Wall</option>
                  <option value="right">Right Wall</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Roof Type</label>
                <select
                  className="form-input"
                  value={newBayForm.roofType}
                  onChange={(e) => setNewBayForm({ ...newBayForm, roofType: e.target.value as BaySection['roofType'] })}
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
                  value={newBayForm.roofPitch}
                  onChange={(e) => setNewBayForm({ ...newBayForm, roofPitch: parseFloat(e.target.value) || 4 })}
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleAddBay}
                className="flex-1 btn"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Bay
              </button>
              <button
                onClick={() => setShowAddBayForm(false)}
                className="flex-1 btn-secondary btn"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bay List */}
      <div className="space-y-2">
        {bays.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Building className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No additional bays added</p>
            <p className="text-xs">Add extensions, lean-tos, or side bays to expand your barn</p>
          </div>
        ) : (
          bays.map((bay) => (
            <motion.div
              key={bay.id}
              layout
              className={`border rounded-lg overflow-hidden transition-all duration-200 ${
                activeBayId === bay.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {/* Bay Header */}
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleBayExpansion(bay.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {expandedBays.has(bay.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    
                    {getBayTypeIcon(bay.type)}
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{bay.name}</span>
                        {getConnectionIcon(bay.connectionType)}
                        <span className={`text-xs px-2 py-1 rounded ${
                          bay.type === 'main' ? 'bg-blue-100 text-blue-800' :
                          bay.type === 'extension' ? 'bg-green-100 text-green-800' :
                          bay.type === 'lean-to' ? 'bg-purple-100 text-purple-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {bay.type}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {bay.dimensions.width}' × {bay.dimensions.length}' × {bay.dimensions.height}'
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleBayVisibilityToggle(bay.id)}
                      className={`p-1 rounded ${bay.isActive ? 'text-green-600' : 'text-gray-400'}`}
                      title={bay.isActive ? 'Hide bay' : 'Show bay'}
                    >
                      {bay.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    
                    <button
                      onClick={() => handleSetActiveBay(bay.id)}
                      className={`p-1 rounded ${activeBayId === bay.id ? 'text-blue-600 bg-blue-100' : 'text-gray-400 hover:text-gray-600'}`}
                      title={activeBayId === bay.id ? 'Deselect bay' : 'Select bay for editing'}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => duplicateBay(bay.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      title="Duplicate bay"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => removeBay(bay.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                      title="Remove bay"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Bay Details */}
              <AnimatePresence>
                {expandedBays.has(bay.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-gray-200 p-3 bg-gray-50"
                  >
                    <div className="space-y-3">
                      {/* Bay Properties */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Properties</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Roof: {bay.roofType} ({bay.roofPitch}:12)</div>
                          <div>Connection: {bay.connectionType}</div>
                          <div>Wall Profile: {bay.wallProfile}</div>
                          <div>Features: {bay.features.length}</div>
                          <div>Skylights: {bay.skylights.length}</div>
                          <div>Accessories: {bay.accessories.length}</div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h4>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {/* Add door logic */}}
                            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded"
                          >
                            Add Door
                          </button>
                          <button
                            onClick={() => {/* Add window logic */}}
                            className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded"
                          >
                            Add Window
                          </button>
                          <button
                            onClick={() => {/* Add accessory logic */}}
                            className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 px-2 py-1 rounded"
                          >
                            Add Accessory
                          </button>
                        </div>
                      </div>

                      {/* Accessories List */}
                      {bay.accessories.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Accessories</h4>
                          <div className="space-y-1">
                            {bay.accessories.map((accessory) => (
                              <div key={accessory.id} className="flex items-center justify-between text-xs bg-white p-2 rounded border">
                                <div>
                                  <span className="font-medium capitalize">{accessory.type.replace('-', ' ')}</span>
                                  <span className="text-gray-500 ml-2">({accessory.name})</span>
                                </div>
                                <button
                                  onClick={() => removeBayAccessory(bay.id, accessory.id)}
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
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>

      {/* Bay System Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Bay System</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <div>• Create extensions to expand your barn's functionality</div>
          <div>• Each bay can have independent features and accessories</div>
          <div>• Use lean-tos for covered storage or equipment areas</div>
          <div>• Side bays are perfect for specialized functions</div>
          <div>• Select a bay to edit its specific features and accessories</div>
        </div>
      </div>
    </motion.div>
  );
};

export default BayManagementPanel;