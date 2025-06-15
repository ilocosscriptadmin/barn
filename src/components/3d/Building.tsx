import React from 'react';
import { useFrame } from '@react-three/fiber';
import { useBuildingStore } from '../../store/buildingStore';
import Wall from './Wall';
import Roof from './Roof';
import WallFeature from './WallFeature';
import BaySection from './BaySection';
import InteriorWalls from './InteriorWalls';

const Building: React.FC = () => {
  const { 
    dimensions, 
    features, 
    color, 
    roofColor, 
    skylights, 
    wallProfile, 
    bays, 
    activeBayId,
    wallLayout 
  } = useBuildingStore((state) => ({
    dimensions: state.currentProject.building.dimensions,
    features: state.currentProject.building.features,
    color: state.currentProject.building.color,
    roofColor: state.currentProject.building.roofColor,
    skylights: state.currentProject.building.skylights,
    wallProfile: state.currentProject.building.wallProfile || 'trimdek',
    bays: state.currentProject.building.bays || [],
    activeBayId: state.currentProject.building.activeBayId,
    wallLayout: state.currentProject.building.wallLayout
  }));
  
  const halfWidth = dimensions.width / 2;
  const halfLength = dimensions.length / 2;
  
  // Calculate total height including roof peak
  const roofHeight = (dimensions.width / 2) * (dimensions.roofPitch / 12);
  const totalHeight = dimensions.height + roofHeight;
  
  // Filter features by wall position for collision detection
  const getWallFeatures = (wallPosition: string) => {
    const wallFeatures = features.filter(feature => feature.position.wallPosition === wallPosition);
    return wallFeatures;
  };
  
  return (
    <group>
      {/* Enhanced Foundation with better materials */}
      <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
        <boxGeometry args={[dimensions.width, 0.2, dimensions.length]} />
        <meshStandardMaterial 
          color="#8B7355" 
          metalness={0.1}
          roughness={0.9}
          envMapIntensity={0.2}
        />
      </mesh>
      
      {/* Main Building */}
      <group>
        {/* Front wall */}
        <Wall 
          position={[0, dimensions.height/2, halfLength]} 
          width={dimensions.width}
          height={dimensions.height}
          color={color}
          wallPosition="front"
          roofPitch={dimensions.roofPitch}
          wallFeatures={getWallFeatures('front')}
          wallProfile={wallProfile}
        />
        
        {/* Back wall */}
        <Wall 
          position={[0, dimensions.height/2, -halfLength]} 
          width={dimensions.width}
          height={dimensions.height}
          color={color}
          wallPosition="back"
          roofPitch={dimensions.roofPitch}
          rotation={[0, Math.PI, 0]}
          wallFeatures={getWallFeatures('back')}
          wallProfile={wallProfile}
        />
        
        {/* Left wall */}
        <Wall 
          position={[-halfWidth, dimensions.height/2, 0]} 
          width={dimensions.length}
          height={dimensions.height}
          color={color}
          wallPosition="left"
          rotation={[0, Math.PI / 2, 0]}
          wallFeatures={getWallFeatures('left')}
          wallProfile={wallProfile}
        />
        
        {/* Right wall */}
        <Wall 
          position={[halfWidth, dimensions.height/2, 0]} 
          width={dimensions.length}
          height={dimensions.height}
          color={color}
          wallPosition="right"
          rotation={[0, -Math.PI / 2, 0]}
          wallFeatures={getWallFeatures('right')}
          wallProfile={wallProfile}
        />
        
        {/* Roof with profile-specific textures */}
        <Roof
          width={dimensions.width}
          length={dimensions.length}
          height={dimensions.height}
          pitch={dimensions.roofPitch}
          color={roofColor}
          skylights={skylights}
          wallProfile={wallProfile}
        />
        
        {/* Wall Features (doors, windows, etc.) */}
        {features.map((feature) => (
          <WallFeature
            key={feature.id}
            feature={feature}
            buildingDimensions={dimensions}
          />
        ))}

        {/* Interior Walls from Wall Layout Design */}
        {wallLayout && wallLayout.wallSegments && (
          <InteriorWalls
            wallSegments={wallLayout.wallSegments}
            roomHeight={dimensions.height}
            roomLength={dimensions.length}
          />
        )}
      </group>

      {/* Additional Bay Sections */}
      {bays.map((bay) => (
        bay.isActive && (
          <BaySection
            key={bay.id}
            bay={bay}
            isActive={bay.id === activeBayId}
            mainBuildingDimensions={dimensions}
          />
        )
      ))}
    </group>
  );
};

export default Building;