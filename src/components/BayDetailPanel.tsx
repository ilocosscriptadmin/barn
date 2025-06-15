import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
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
  Link,
  Unlink,
  ArrowLeft
} from 'lucide-react';
import { useBuildingStore } from '../store/buildingStore';
import BayAccessoryPanel from './BayAccessoryPanel';
import type { BaySection } from '../types';

interface BayDetailPanelProps {
  bayId: string;
  onBack: () => void;
}

const BayDetailPanel: React.FC<BayDetailPanelProps> = ({ bayId, onBack }) => {
  const { building, updateBay, removeBay } = useBuildingStore((state) => ({
    building: state.currentProject.building,
    updateBay: state.updateBay,
    removeBay: state.removeBay
  }));

  const bay = building.bays.find(b => b.id === bayId);
  if (!bay) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-500 mb-2">Bay not found</div>
        <button 
          onClick={onBack}
          className="btn-secondary btn text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Bay List
        </button>
      </div>
    );
  }

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<BaySection>>({
    name: bay.name,
    dimensions: { ...bay.dimensions },
    roofType: bay.roofType,
    roofPitch: bay.roofPitch,
    connectionType: bay.connectionType,
    connectionWall: bay.connectionWall
  });

  const handleSaveChanges = () => {
    updateBay(bayId, editForm);
    setIsEditing(false);
  };

  const handleRemoveBay = () => {
    if (window.confirm(`Are you sure you want to remove the bay "${bay.name}"?`)) {
      removeBay(bayId);
      onBack();
    }
  };

  const getBayTypeIcon = (type: BaySection['type']) => {
    switch (type) {
      case 'main': return <Home className="w-5 h-5" />;
      case 'extension': return <Building className="w-5 h-5" />;
      case 'lean-to': return <Layers className="w-5 h-5" />;
      case 'side-bay': return <Grid className="w-5 h-5" />;
      default: return <Building className="w-5 h-5" />;
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
            <button
              onClick={onBack}
              className="text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            {getBayTypeIcon(bay.type)}
            <span className="text-sm font-medium text-blue-800">{bay.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`p-1 rounded ${isEditing ? 'text-blue-600 bg-blue-100' : 'text-gray-400 hover:text-gray-600'}`}
              title={isEditing ? 'Cancel editing' : 'Edit bay details'}
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRemoveBay}
              className="p-1 text-gray-400 hover:text-red-600 rounded"
              title="Remove bay"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="text-xs text-blue-700">
          <div>Type: {bay.type}</div>
          <div>Dimensions: {bay.dimensions.width}' × {bay.dimensions.length}' × {bay.dimensions.height}'</div>
          <div>Connection: {bay.connectionType} to {bay.connectionWall} wall</div>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing ? (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-medium text-gray-800">Edit Bay Details</h3>
          
          <div>
            <label className="form-label">Bay Name</label>
            <input
              type="text"
              className="form-input"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="form-label">Width (ft)</label>
              <input
                type="number"
                className="form-input"
                min="8"
                max="60"
                value={editForm.dimensions?.width}
                onChange={(e) => setEditForm({ 
                  ...editForm, 
                  dimensions: { 
                    ...editForm.dimensions!, 
                    width: parseFloat(e.target.value) || 8 
                  } 
                })}
              />
            </div>
            
            <div>
              <label className="form-label">Length (ft)</label>
              <input
                type="number"
                className="form-input"
                min="8"
                max="100"
                value={editForm.dimensions?.length}
                onChange={(e) => setEditForm({ 
                  ...editForm, 
                  dimensions: { 
                    ...editForm.dimensions!, 
                    length: parseFloat(e.target.value) || 8 
                  } 
                })}
              />
            </div>
            
            <div>
              <label className="form-label">Height (ft)</label>
              <input
                type="number"
                className="form-input"
                min="8"
                max="24"
                value={editForm.dimensions?.height}
                onChange={(e) => setEditForm({ 
                  ...editForm, 
                  dimensions: { 
                    ...editForm.dimensions!, 
                    height: parseFloat(e.target.value) || 8 
                  } 
                })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Roof Type</label>
              <select
                className="form-input"
                value={editForm.roofType}
                onChange={(e) => setEditForm({ ...editForm, roofType: e.target.value as BaySection['roofType'] })}
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
                value={editForm.roofPitch}
                onChange={(e) => setEditForm({ ...editForm, roofPitch: parseFloat(e.target.value) || 4 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Connection Type</label>
              <select
                className="form-input"
                value={editForm.connectionType}
                onChange={(e) => setEditForm({ ...editForm, connectionType: e.target.value as BaySection['connectionType'] })}
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
                value={editForm.connectionWall}
                onChange={(e) => setEditForm({ ...editForm, connectionWall: e.target.value as BaySection['connectionWall'] })}
              >
                <option value="front">Front Wall</option>
                <option value="back">Back Wall</option>
                <option value="left">Left Wall</option>
                <option value="right">Right Wall</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleSaveChanges}
              className="flex-1 btn"
            >
              <Save className="w-4 h-4 mr-1" />
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 btn-secondary btn"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Bay Details */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-3">Bay Details</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Dimensions</h4>
                <div className="space-y-1 text-gray-600">
                  <div>Width: {bay.dimensions.width} ft</div>
                  <div>Length: {bay.dimensions.length} ft</div>
                  <div>Height: {bay.dimensions.height} ft</div>
                  <div>Floor Area: {bay.dimensions.width * bay.dimensions.length} sq ft</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Roof</h4>
                <div className="space-y-1 text-gray-600">
                  <div>Type: {bay.roofType}</div>
                  <div>Pitch: {bay.roofPitch}:12</div>
                  <div>Profile: {bay.wallProfile}</div>
                  <div>Skylights: {bay.skylights.length}</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-2">Connection</h4>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                  {bay.connectionType === 'attached' ? <Link className="w-3 h-3 mr-1" /> : 
                   bay.connectionType === 'detached' ? <Unlink className="w-3 h-3 mr-1" /> : 
                   <Layers className="w-3 h-3 mr-1" />}
                  {bay.connectionType}
                </div>
                <span>to</span>
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {bay.connectionWall} wall
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-2">Features</h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-gray-500 text-xs">Doors</div>
                  <div className="font-medium">{bay.features.filter(f => f.type === 'door' || f.type === 'rollupDoor' || f.type === 'walkDoor').length}</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-gray-500 text-xs">Windows</div>
                  <div className="font-medium">{bay.features.filter(f => f.type === 'window').length}</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-gray-500 text-xs">Accessories</div>
                  <div className="font-medium">{bay.accessories.length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bay Accessories */}
          <div>
            <h3 className="text-sm font-medium text-gray-800 mb-2">Bay Accessories</h3>
            <BayAccessoryPanel bayId={bayId} />
          </div>
        </>
      )}
    </motion.div>
  );
};

export default BayDetailPanel;