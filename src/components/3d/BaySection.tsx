import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import Wall from './Wall';
import Roof from './Roof';
import WallFeature from './WallFeature';
import type { BaySection as BaySectionType, BuildingDimensions } from '../../types';

interface BaySectionProps {
  bay: BaySectionType;
  isActive: boolean;
  mainBuildingDimensions: BuildingDimensions;
}

const BaySection: React.FC<BaySectionProps> = ({ bay, isActive, mainBuildingDimensions }) => {
  // Calculate bay dimensions
  const halfWidth = bay.dimensions.width / 2;
  const halfLength = bay.dimensions.length / 2;
  
  // Calculate roof height based on roof type and pitch
  const roofHeight = bay.roofType === 'gable' || bay.roofType === 'hip'
    ? (bay.dimensions.width / 2) * (bay.roofPitch / 12)
    : bay.dimensions.width * (bay.roofPitch / 12); // For skillion/shed roofs
  
  const totalHeight = bay.dimensions.height + roofHeight;
  
  // Filter features by wall position for collision detection
  const getWallFeatures = (wallPosition: string) => {
    return bay.features.filter(feature => feature.position.wallPosition === wallPosition);
  };
  
  // Highlight material for active bay
  const highlightMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x3b82f6),
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });
  }, []);
  
  return (
    <group position={[bay.position.x, bay.position.z, bay.position.y]}>
      {/* Bay Foundation */}
      <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
        <boxGeometry args={[bay.dimensions.width, 0.2, bay.dimensions.length]} />
        <meshStandardMaterial 
          color="#8B7355" 
          metalness={0.1}
          roughness={0.9}
          envMapIntensity={0.2}
        />
      </mesh>
      
      {/* Bay Walls */}
      <Wall 
        position={[0, bay.dimensions.height/2, halfLength]} 
        width={bay.dimensions.width}
        height={bay.dimensions.height}
        color={bay.color}
        wallPosition="front"
        roofPitch={bay.roofPitch}
        wallFeatures={getWallFeatures('front')}
        wallProfile={bay.wallProfile}
      />
      
      <Wall 
        position={[0, bay.dimensions.height/2, -halfLength]} 
        width={bay.dimensions.width}
        height={bay.dimensions.height}
        color={bay.color}
        wallPosition="back"
        roofPitch={bay.roofPitch}
        rotation={[0, Math.PI, 0]}
        wallFeatures={getWallFeatures('back')}
        wallProfile={bay.wallProfile}
      />
      
      <Wall 
        position={[-halfWidth, bay.dimensions.height/2, 0]} 
        width={bay.dimensions.length}
        height={bay.dimensions.height}
        color={bay.color}
        wallPosition="left"
        rotation={[0, Math.PI / 2, 0]}
        wallFeatures={getWallFeatures('left')}
        wallProfile={bay.wallProfile}
      />
      
      <Wall 
        position={[halfWidth, bay.dimensions.height/2, 0]} 
        width={bay.dimensions.length}
        height={bay.dimensions.height}
        color={bay.color}
        wallPosition="right"
        rotation={[0, -Math.PI / 2, 0]}
        wallFeatures={getWallFeatures('right')}
        wallProfile={bay.wallProfile}
      />
      
      {/* Bay Roof */}
      <Roof
        width={bay.dimensions.width}
        length={bay.dimensions.length}
        height={bay.dimensions.height}
        pitch={bay.roofPitch}
        color={bay.roofColor}
        skylights={bay.skylights}
        wallProfile={bay.wallProfile}
      />
      
      {/* Bay Features */}
      {bay.features.map((feature) => (
        <WallFeature
          key={feature.id}
          feature={feature}
          buildingDimensions={{
            width: bay.dimensions.width,
            length: bay.dimensions.length,
            height: bay.dimensions.height,
            roofPitch: bay.roofPitch
          }}
        />
      ))}
      
      {/* Bay Accessories */}
      {bay.accessories.map((accessory) => (
        <group 
          key={accessory.id}
          position={[accessory.position.x, accessory.position.z, accessory.position.y]}
          rotation={[0, accessory.rotation * Math.PI / 180, 0]}
        >
          <mesh castShadow receiveShadow>
            <boxGeometry args={[
              accessory.dimensions.width, 
              accessory.dimensions.height, 
              accessory.dimensions.length
            ]} />
            <meshStandardMaterial 
              color={accessory.color || '#6B7280'} 
              metalness={0.2}
              roughness={0.7}
            />
          </mesh>
          
          {/* Accessory label */}
          <group position={[0, accessory.dimensions.height / 2 + 0.5, 0]}>
            <mesh>
              <planeGeometry args={[accessory.dimensions.width, 0.5]} />
              <meshBasicMaterial color="#FFFFFF" transparent opacity={0.8} />
            </mesh>
          </group>
        </group>
      ))}
      
      {/* Highlight for active bay */}
      {isActive && (
        <mesh position={[0, bay.dimensions.height / 2, 0]}>
          <boxGeometry args={[
            bay.dimensions.width + 0.1, 
            bay.dimensions.height + 0.1, 
            bay.dimensions.length + 0.1
          ]} />
          <primitive object={highlightMaterial} attach="material" />
        </mesh>
      )}
      
      {/* Connection visualization */}
      {bay.connectionType === 'attached' && bay.connectionWall && (
        <mesh position={[
          bay.connectionWall === 'left' ? -halfWidth - 0.1 : 
          bay.connectionWall === 'right' ? halfWidth + 0.1 : 0,
          bay.dimensions.height / 4,
          bay.connectionWall === 'front' ? halfLength + 0.1 : 
          bay.connectionWall === 'back' ? -halfLength - 0.1 : 0
        ]}>
          <boxGeometry args={[
            bay.connectionWall === 'left' || bay.connectionWall === 'right' ? 0.2 : bay.dimensions.width / 3,
            bay.dimensions.height / 2,
            bay.connectionWall === 'front' || bay.connectionWall === 'back' ? 0.2 : bay.dimensions.length / 3
          ]} />
          <meshStandardMaterial color="#4ADE80" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
};

export default BaySection;