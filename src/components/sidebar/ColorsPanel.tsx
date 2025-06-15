import React from 'react';
import { motion } from 'framer-motion';
import { useBuildingStore } from '../../store/buildingStore';

// 🇳🇿🇦🇺 NEW ZEALAND & AUSTRALIA POPULAR COLORBOND® COLORS
const colorOptions = [
  // Classic Whites & Creams - Very popular in rural areas
  { name: 'Surfmist', value: '#F5F5F0' },
  { name: 'Classic Cream', value: '#F2F0E6' },
  { name: 'Paperbark', value: '#E8E4D6' },
  { name: 'Shale Grey', value: '#D4D1C7' },
  
  // Popular Greys - Modern rural choice
  { name: 'Windspray', value: '#C7C1B7' },
  { name: 'Dune', value: '#A39080' },
  { name: 'Basalt', value: '#6D6C6A' },
  { name: 'Monument', value: '#3E3E3C' },
  
  // Traditional Greens - Classic rural/farm colors
  { name: 'Pale Eucalypt', value: '#C7C5A6' },
  { name: 'Eucalypt', value: '#7A8471' },
  { name: 'Cottage Green', value: '#5A6B47' },
  { name: 'Deep Ocean', value: '#2F4538' },
  
  // Popular Blues - Coastal and modern rural
  { name: 'Evening Haze', value: '#A5A8B0' },
  { name: 'Cadet', value: '#6B7B8C' },
  { name: 'Deep Ocean', value: '#2C4F64' },
  { name: 'Night Sky', value: '#1E2A3A' },
  
  // Traditional Reds & Earth Tones - Classic barn colors
  { name: 'Terrain', value: '#B5967A' },
  { name: 'Jasper', value: '#8B4A2B' },
  { name: 'Manor Red', value: '#7A2E2E' },
  { name: 'Ironstone', value: '#4A3C32' },
  
  // Modern Neutrals - Contemporary rural buildings
  { name: 'Wallaby', value: '#A0927D' },
  { name: 'Woodland Grey', value: '#6B6B5D' },
  { name: 'Gully', value: '#4A453E' },
  { name: 'Cove', value: '#2E2B26' },
];

// 🏠 NEW ZEALAND & AUSTRALIA POPULAR ROOF COLORS
const roofColorOptions = [
  // Classic Roof Colors - Most popular choices
  { name: 'Surfmist', value: '#F5F5F0' },
  { name: 'Shale Grey', value: '#D4D1C7' },
  { name: 'Windspray', value: '#C7C1B7' },
  { name: 'Monument', value: '#3E3E3C' },
  { name: 'Basalt', value: '#6D6C6A' },
  
  // Traditional Roof Colors - Rural heritage
  { name: 'Cottage Green', value: '#5A6B47' },
  { name: 'Manor Red', value: '#7A2E2E' },
  { name: 'Jasper', value: '#8B4A2B' },
  { name: 'Ironstone', value: '#4A3C32' },
  { name: 'Deep Ocean', value: '#2C4F64' },
  
  // Modern Roof Colors - Contemporary choices
  { name: 'Woodland Grey', value: '#6B6B5D' },
  { name: 'Gully', value: '#4A453E' },
  { name: 'Night Sky', value: '#1E2A3A' },
  { name: 'Cove', value: '#2E2B26' },
  { name: 'ZINCALUME', value: '#A8A8A8' },
];

// 🏗️ LYSAGHT WALL PROFILES - Based on https://lysaght.com/profiles
const wallProfileOptions = [
  {
    name: 'MULTICLAD®',
    value: 'multiclad',
    description: 'Traditional deep corrugated profile - 76mm spacing',
    ribWidth: 76, // 76mm rib spacing
    ribDepth: 'deep',
    popularity: 'Very popular for rural/farm buildings'
  },
  {
    name: 'TRIMDEK®',
    value: 'trimdek',
    description: 'Contemporary trapezoidal profile - 65mm spacing',
    ribWidth: 65, // 65mm rib spacing
    ribDepth: 'medium',
    popularity: 'Most popular modern choice'
  },
  {
    name: 'CUSTOM ORB®',
    value: 'customorb',
    description: 'Curved profile with rounded ribs - 32mm spacing',
    ribWidth: 32, // 32mm rib spacing
    ribDepth: 'shallow',
    popularity: 'Premium residential/commercial'
  },
  {
    name: 'CUSTOM ORB® Horizontal',
    value: 'horizontal-customorb',
    description: 'Horizontal installation of CUSTOM ORB®',
    ribWidth: 32,
    ribDepth: 'shallow',
    popularity: 'Modern architectural applications'
  }
];

const ColorsPanel: React.FC = () => {
  const { color, roofColor, wallProfile, setColor, setRoofColor, setWallProfile } = useBuildingStore((state) => ({
    color: state.currentProject.building.color,
    roofColor: state.currentProject.building.roofColor,
    wallProfile: state.currentProject.building.wallProfile || 'trimdek',
    setColor: state.setColor,
    setRoofColor: state.setRoofColor,
    setWallProfile: state.setWallProfile
  }));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Wall Profile Selection */}
      <div className="mb-6">
        <label className="form-label text-base font-semibold">Wall Profile</label>
        <p className="text-xs text-gray-600 mb-3">Choose from Lysaght's premium profile collection</p>
        
        <div className="space-y-3">
          {wallProfileOptions.map((profile) => (
            <div key={profile.value} className="relative">
              <button
                className={`w-full p-3 text-left rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                  wallProfile === profile.value 
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                    : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}
                onClick={() => setWallProfile(profile.value)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{profile.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{profile.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {profile.ribWidth}mm spacing • {profile.ribDepth} profile
                    </div>
                    <div className="text-xs text-blue-600 mt-1 font-medium">
                      {profile.popularity}
                    </div>
                  </div>
                  {wallProfile === profile.value && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center ml-3">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                
                {/* Profile Preview Pattern */}
                <div className="mt-2 h-8 bg-gray-100 rounded overflow-hidden relative">
                  <div 
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: profile.value === 'horizontal-customorb' 
                        ? `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)`
                        : profile.value === 'customorb'
                          ? `repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 6px)`
                          : profile.value === 'trimdek'
                            ? `repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.15) 8px, rgba(0,0,0,0.15) 10px, transparent 10px, transparent 18px)`
                            : `repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(0,0,0,0.2) 6px, rgba(0,0,0,0.2) 8px, transparent 8px, transparent 14px)`
                    }}
                  />
                  <div className="absolute bottom-1 right-2 text-xs text-gray-500 font-medium">
                    {profile.name}
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="form-label text-base font-semibold">Wall Color</label>
        <p className="text-xs text-gray-600 mb-3">Popular COLORBOND® colors in New Zealand & Australia</p>
        <div className="grid grid-cols-4 gap-3">
          {colorOptions.map((option) => (
            <div key={option.value} className="relative group">
              <button
                className={`w-full h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 hover:shadow-md ${
                  color === option.value 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: option.value }}
                onClick={() => setColor(option.value)}
                title={option.name}
              >
                {color === option.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                )}
              </button>
              <div className="text-xs text-center text-gray-700 mt-1 font-medium truncate">
                {option.name}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <label className="form-label text-base font-semibold">Roof Color</label>
        <p className="text-xs text-gray-600 mb-3">Popular roofing colors for rural buildings</p>
        <div className="grid grid-cols-4 gap-3">
          {roofColorOptions.map((option) => (
            <div key={option.value} className="relative group">
              <button
                className={`w-full h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 hover:shadow-md ${
                  roofColor === option.value 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: option.value }}
                onClick={() => setRoofColor(option.value)}
                title={option.name}
              >
                {roofColor === option.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                )}
              </button>
              <div className="text-xs text-center text-gray-700 mt-1 font-medium truncate">
                {option.name}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Color Combination Preview */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Preview</h3>
        <div className="space-y-3">
          {/* Profile Preview */}
          <div>
            <div className="text-xs text-gray-600 mb-1">Wall Profile</div>
            <div className="text-sm font-medium text-gray-700">
              {wallProfileOptions.find(p => p.value === wallProfile)?.name || 'TRIMDEK®'}
            </div>
            <div className="text-xs text-gray-500">
              {wallProfileOptions.find(p => p.value === wallProfile)?.description}
            </div>
          </div>
          
          {/* Color Preview */}
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <div className="text-xs text-gray-600 mb-1">Wall Color</div>
              <div 
                className="h-8 rounded border border-gray-300 shadow-sm"
                style={{ backgroundColor: color }}
              ></div>
              <div className="text-xs text-gray-700 mt-1 font-medium">
                {colorOptions.find(c => c.value === color)?.name || 'Custom'}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-600 mb-1">Roof Color</div>
              <div 
                className="h-8 rounded border border-gray-300 shadow-sm"
                style={{ backgroundColor: roofColor }}
              ></div>
              <div className="text-xs text-gray-700 mt-1 font-medium">
                {roofColorOptions.find(c => c.value === roofColor)?.name || 'Custom'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Material Information */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Material Information</h3>
        
        <div className="mb-3">
          <label htmlFor="exteriorMaterial" className="text-xs text-blue-700 block mb-1 font-medium">Exterior Cladding</label>
          <select
            id="exteriorMaterial"
            className="form-input text-sm w-full"
            defaultValue="colorbond"
          >
            <option value="colorbond">COLORBOND® Steel</option>
            <option value="zincalume">ZINCALUME® Steel</option>
            <option value="galvanised">Galvanised Steel</option>
            <option value="timber">Timber Weatherboard</option>
            <option value="fiber">Fiber Cement</option>
          </select>
        </div>
        
        <div className="mb-3">
          <label htmlFor="roofMaterial" className="text-xs text-blue-700 block mb-1 font-medium">Roofing Material</label>
          <select
            id="roofMaterial"
            className="form-input text-sm w-full"
            defaultValue="colorbond"
          >
            <option value="colorbond">COLORBOND® Steel Roofing</option>
            <option value="zincalume">ZINCALUME® Steel Roofing</option>
            <option value="galvanised">Galvanised Iron</option>
            <option value="tile">Concrete Roof Tiles</option>
            <option value="corrugate">Corrugated Iron</option>
          </select>
        </div>
        
        <div className="text-xs text-blue-700">
          <p className="mb-1">• 15-year warranty on COLORBOND® steel</p>
          <p className="mb-1">• UV resistant and fade proof</p>
          <p className="mb-1">• Suitable for coastal environments</p>
          <p>• Made in Australia for local conditions</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ColorsPanel;