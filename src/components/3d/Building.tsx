import React, { useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBuildingStore } from '../../store/buildingStore';
import Wall from './Wall';
import Roof from './Roof';
import WallFeature from './WallFeature';
import InteriorLayout from './InteriorLayout';

const Building: React.FC = () => {
  const { dimensions, features, color, roofColor, skylights, wallProfile, interiorLayout, visualizationSettings } = useBuildingStore((state) => ({
    dimensions: state.currentProject.building.dimensions,
    features: state.currentProject.building.features,
    color: state.currentProject.building.color,
    roofColor: state.currentProject.building.roofColor,
    skylights: state.currentProject.building.skylights,
    wallProfile: state.currentProject.building.wallProfile || 'trimdek',
    interiorLayout: state.currentProject.building.interiorLayout,
    visualizationSettings: state.currentProject.building.visualizationSettings
  }));
  
  const halfWidth = dimensions.width / 2;
  const halfLength = dimensions.length / 2;
  
  // Calculate total height including roof peak
  const roofHeight = (dimensions.width / 2) * (dimensions.roofPitch / 12);
  const totalHeight = dimensions.height + roofHeight;
  
  // Filter features by wall position for collision detection
  const getWallFeatures = (wallPosition: string) => {
    const wallFeatures = features.filter(feature => feature.position.wallPosition === wallPosition);
    console.log(`Wall ${wallPosition} has ${wallFeatures.length} features:`, wallFeatures.map(f => `${f.type} ${f.width}x${f.height} at ${f.position.alignment} ${f.position.xOffset}`));
    return wallFeatures;
  };
  
  // Get exterior wall opacity from visualization settings
  const exteriorWallOpacity = visualizationSettings?.exteriorWallOpacity || 1.0;
  const roofOpacity = visualizationSettings?.roofOpacity || 1.0;
  
  // Animate partition walls
  useFrame(() => {
    if (!interiorLayout) return;
    
    // Check if any walls need height updates
    let needsUpdate = false;
    
    interiorLayout.partitionWalls.forEach(wall => {
      if (!wall.isLocked && wall.currentHeight !== wall.targetHeight) {
        needsUpdate = true;
        
        // Update the wall's current height in the store
        // This would normally be done in the PartitionWall3D component
        // but we're simulating it here for demonstration
        const newHeight = wall.currentHeight + (wall.targetHeight > wall.currentHeight ? 0.1 : -0.1);
        
        // Check if we're close enough to snap to target
        if (Math.abs(newHeight - wall.targetHeight) < 0.1) {
          useBuildingStore.getState().updatePartitionWall(wall.id, {
            currentHeight: wall.targetHeight
          });
        } else {
          useBuildingStore.getState().updatePartitionWall(wall.id, {
            currentHeight: newHeight
          });
        }
      }
    });
  });
  
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
        opacity={exteriorWallOpacity}
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
        opacity={exteriorWallOpacity}
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
        opacity={exteriorWallOpacity}
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
        opacity={exteriorWallOpacity}
      />
      
      {/* Roof with profile-specific textures and opacity control */}
      <Roof
        width={dimensions.width}
        length={dimensions.length}
        height={dimensions.height}
        pitch={dimensions.roofPitch}
        color={roofColor}
        skylights={skylights}
        wallProfile={wallProfile}
        opacity={roofOpacity}
      />
      
      {/* Wall Features (doors, windows, etc.) */}
      {features.map((feature) => (
        <WallFeature
          key={feature.id}
          feature={feature}
          buildingDimensions={dimensions}
        />
      ))}
      
      {/* Interior Layout with partition walls */}
      {interiorLayout && (
        <InteriorLayout
          interiorLayout={interiorLayout}
          buildingDimensions={dimensions}
          visualizationSettings={visualizationSettings || {}}
        />
      )}
    </group>
  );
};

export default Building;