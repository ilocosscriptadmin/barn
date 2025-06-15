import React, { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBuildingStore } from '../../store/buildingStore';
import Wall from './Wall';
import Roof from './Roof';
import WallFeature from './WallFeature';
import StructuralBays from './StructuralBays';

const Building: React.FC = () => {
  const { dimensions, features, color, roofColor, skylights, wallProfile } = useBuildingStore((state) => ({
    dimensions: state.currentProject.building.dimensions,
    features: state.currentProject.building.features,
    color: state.currentProject.building.color,
    roofColor: state.currentProject.building.roofColor,
    skylights: state.currentProject.building.skylights,
    wallProfile: state.currentProject.building.wallProfile || 'trimdek'
  }));

  const [selectedBay, setSelectedBay] = useState<number | null>(null);
  const [showStructural, setShowStructural] = useState(true);
  
  const halfWidth = dimensions.width / 2;
  const halfLength = dimensions.length / 2;
  
  // Calculate total height including roof peak
  const roofHeight = (dimensions.width / 2) * (dimensions.roofPitch / 12);
  const totalHeight = dimensions.height + roofHeight;
  
  // Calculate number of structural bays (12ft spacing by default)
  const baySpacing = 12;
  const numberOfBays = Math.max(2, Math.floor(dimensions.length / baySpacing));
  
  // Filter features by wall position for collision detection
  const getWallFeatures = (wallPosition: string) => {
    const wallFeatures = features.filter(feature => feature.position.wallPosition === wallPosition);
    console.log(`Wall ${wallPosition} has ${wallFeatures.length} features:`, wallFeatures.map(f => `${f.type} ${f.width}x${f.height} at ${f.position.alignment} ${f.position.xOffset}`));
    return wallFeatures;
  };

  const handleBayClick = (bayIndex: number) => {
    setSelectedBay(selectedBay === bayIndex ? null : bayIndex);
    console.log(`Selected bay: ${bayIndex + 1}`);
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

      {/* Structural Bay System */}
      <StructuralBays
        length={dimensions.length}
        width={dimensions.width}
        height={dimensions.height}
        numberOfBays={numberOfBays}
        baySpacing={baySpacing}
        showStructural={showStructural}
        onBayClick={handleBayClick}
        selectedBay={selectedBay}
      />
      
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

      {/* Bay Information Display */}
      {selectedBay !== null && (
        <group>
          {/* Selected bay highlight is handled in StructuralBays component */}
          
          {/* Bay information text (floating above the selected bay) */}
          <mesh position={[
            -dimensions.length/2 + (selectedBay * (dimensions.length / numberOfBays)) + (dimensions.length / numberOfBays / 2),
            dimensions.height + 4,
            0
          ]}>
            <planeGeometry args={[6, 2]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.9} />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default Building;