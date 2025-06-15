import React from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { PartitionWall } from '../../types/partitions';

interface PartitionWallLabelsProps {
  partition: PartitionWall;
  buildingHeight: number;
  isSelected?: boolean;
}

const PartitionWallLabels: React.FC<PartitionWallLabelsProps> = ({ 
  partition, 
  buildingHeight, 
  isSelected = false 
}) => {
  // Calculate wall properties
  const startX = partition.startPoint.x;
  const startZ = partition.startPoint.z;
  const endX = partition.endPoint.x;
  const endZ = partition.endPoint.z;
  
  const wallLength = Math.sqrt(
    Math.pow(endX - startX, 2) + Math.pow(endZ - startZ, 2)
  );
  const wallAngle = Math.atan2(endZ - startZ, endX - startX);
  
  // Determine wall orientation
  const getWallOrientation = () => {
    const angleDegrees = (wallAngle * 180 / Math.PI + 360) % 360;
    
    if (angleDegrees >= 315 || angleDegrees < 45) return 'East-West';
    if (angleDegrees >= 45 && angleDegrees < 135) return 'North-South';
    if (angleDegrees >= 135 && angleDegrees < 225) return 'West-East';
    return 'South-North';
  };
  
  const orientation = getWallOrientation();
  
  // Determine connection points to existing structures
  const getConnectionDescription = (point: 'start' | 'end') => {
    const x = point === 'start' ? startX : endX;
    const z = point === 'start' ? startZ : endZ;
    
    // Check proximity to building edges (assuming building is centered at origin)
    const buildingHalfWidth = 20; // Approximate building half-width
    const buildingHalfLength = 25; // Approximate building half-length
    const tolerance = 2; // 2 feet tolerance for "near" classification
    
    if (Math.abs(x + buildingHalfWidth) < tolerance) return 'Left exterior wall';
    if (Math.abs(x - buildingHalfWidth) < tolerance) return 'Right exterior wall';
    if (Math.abs(z + buildingHalfLength) < tolerance) return 'Back exterior wall';
    if (Math.abs(z - buildingHalfLength) < tolerance) return 'Front exterior wall';
    
    return 'Interior connection';
  };
  
  const startConnection = getConnectionDescription('start');
  const endConnection = getConnectionDescription('end');
  
  return (
    <group>
      {/* Point A (Start Point) Marker and Label */}
      <group position={[startX, 0.5, startZ]}>
        {/* Point A Marker - Red Sphere */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.3]} />
          <meshStandardMaterial 
            color="#FF0000" 
            metalness={0.3}
            roughness={0.7}
            emissive="#330000"
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Point A Vertical Indicator */}
        <mesh position={[0, buildingHeight / 2, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, buildingHeight]} />
          <meshStandardMaterial color="#FF0000" transparent opacity={0.6} />
        </mesh>
        
        {/* Point A Label */}
        <Text
          position={[0, 2, 0]}
          fontSize={1.2}
          color="#FF0000"
          anchorX="center"
          anchorY="bottom"
          rotation={[-Math.PI / 2, 0, 0]}
          fontWeight="bold"
        >
          POINT A
        </Text>
        
        {/* Point A Description */}
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.6}
          color="#8B0000"
          anchorX="center"
          anchorY="bottom"
          rotation={[-Math.PI / 2, 0, 0]}
        >
          START POINT
        </Text>
        
        {/* Connection Description */}
        <Text
          position={[0, 0.6, 0]}
          fontSize={0.5}
          color="#4A5568"
          anchorX="center"
          anchorY="bottom"
          rotation={[-Math.PI / 2, 0, 0]}
        >
          {startConnection}
        </Text>
        
        {/* Coordinates */}
        <Text
          position={[0, 0.2, 0]}
          fontSize={0.4}
          color="#666666"
          anchorX="center"
          anchorY="bottom"
          rotation={[-Math.PI / 2, 0, 0]}
        >
          ({startX.toFixed(1)}, {startZ.toFixed(1)})
        </Text>
      </group>
      
      {/* Point B (End Point) Marker and Label */}
      <group position={[endX, 0.5, endZ]}>
        {/* Point B Marker - Blue Sphere */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.3]} />
          <meshStandardMaterial 
            color="#0066FF" 
            metalness={0.3}
            roughness={0.7}
            emissive="#000033"
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Point B Vertical Indicator */}
        <mesh position={[0, buildingHeight / 2, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, buildingHeight]} />
          <meshStandardMaterial color="#0066FF" transparent opacity={0.6} />
        </mesh>
        
        {/* Point B Label */}
        <Text
          position={[0, 2, 0]}
          fontSize={1.2}
          color="#0066FF"
          anchorX="center"
          anchorY="bottom"
          rotation={[-Math.PI / 2, 0, 0]}
          fontWeight="bold"
        >
          POINT B
        </Text>
        
        {/* Point B Description */}
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.6}
          color="#003D99"
          anchorX="center"
          anchorY="bottom"
          rotation={[-Math.PI / 2, 0, 0]}
        >
          END POINT
        </Text>
        
        {/* Connection Description */}
        <Text
          position={[0, 0.6, 0]}
          fontSize={0.5}
          color="#4A5568"
          anchorX="center"
          anchorY="bottom"
          rotation={[-Math.PI / 2, 0, 0]}
        >
          {endConnection}
        </Text>
        
        {/* Coordinates */}
        <Text
          position={[0, 0.2, 0]}
          fontSize={0.4}
          color="#666666"
          anchorX="center"
          anchorY="bottom"
          rotation={[-Math.PI / 2, 0, 0]}
        >
          ({endX.toFixed(1)}, {endZ.toFixed(1)})
        </Text>
      </group>
      
      {/* Wall Center Information */}
      <group position={[(startX + endX) / 2, buildingHeight + 2, (startZ + endZ) / 2]}>
        {/* Wall Name and Properties */}
        <Text
          position={[0, 0, 0]}
          fontSize={1.0}
          color="#2D3748"
          anchorX="center"
          anchorY="middle"
          rotation={[-Math.PI / 2, 0, wallAngle]}
          fontWeight="bold"
        >
          {partition.name}
        </Text>
        
        {/* Wall Specifications */}
        <Text
          position={[0, -0.8, 0]}
          fontSize={0.6}
          color="#4A5568"
          anchorX="center"
          anchorY="middle"
          rotation={[-Math.PI / 2, 0, wallAngle]}
        >
          Length: {wallLength.toFixed(1)}ft | Height: {partition.currentHeight.toFixed(1)}ft
        </Text>
        
        {/* Wall Orientation */}
        <Text
          position={[0, -1.4, 0]}
          fontSize={0.5}
          color="#718096"
          anchorX="center"
          anchorY="middle"
          rotation={[-Math.PI / 2, 0, wallAngle]}
        >
          Orientation: {orientation}
        </Text>
        
        {/* Material and Status */}
        <Text
          position={[0, -2.0, 0]}
          fontSize={0.5}
          color="#718096"
          anchorX="center"
          anchorY="middle"
          rotation={[-Math.PI / 2, 0, wallAngle]}
        >
          Material: {partition.material.replace('_', ' ')} | {partition.isLocked ? 'LOCKED' : 'UNLOCKED'}
        </Text>
      </group>
      
      {/* Directional Arrow from A to B */}
      <group position={[(startX + endX) / 2, 1, (startZ + endZ) / 2]}>
        {/* Arrow shaft */}
        <mesh rotation={[0, wallAngle, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, wallLength * 0.8]} />
          <meshStandardMaterial color="#10B981" />
        </mesh>
        
        {/* Arrow head pointing toward Point B */}
        <mesh 
          position={[
            Math.cos(wallAngle) * wallLength * 0.4,
            0,
            Math.sin(wallAngle) * wallLength * 0.4
          ]} 
          rotation={[0, wallAngle, 0]} 
          castShadow
        >
          <coneGeometry args={[0.3, 0.8]} />
          <meshStandardMaterial color="#059669" />
        </mesh>
        
        {/* Direction Label */}
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.6}
          color="#10B981"
          anchorX="center"
          anchorY="middle"
          rotation={[-Math.PI / 2, 0, 0]}
          fontWeight="bold"
        >
          A → B
        </Text>
      </group>
      
      {/* Construction Guidelines */}
      {isSelected && (
        <group>
          {/* Foundation markers at ground level */}
          <mesh position={[startX, 0.05, startZ]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.8, 1.2, 16]} />
            <meshBasicMaterial color="#FF6B6B" transparent opacity={0.6} />
          </mesh>
          
          <mesh position={[endX, 0.05, endZ]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.8, 1.2, 16]} />
            <meshBasicMaterial color="#4ECDC4" transparent opacity={0.6} />
          </mesh>
          
          {/* Construction notes */}
          <Text
            position={[(startX + endX) / 2, buildingHeight + 4, (startZ + endZ) / 2]}
            fontSize={0.7}
            color="#E53E3E"
            anchorX="center"
            anchorY="middle"
            rotation={[-Math.PI / 2, 0, 0]}
            fontWeight="bold"
          >
            FULL HEIGHT PARTITION WALL
          </Text>
          
          <Text
            position={[(startX + endX) / 2, buildingHeight + 3.2, (startZ + endZ) / 2]}
            fontSize={0.5}
            color="#2D3748"
            anchorX="center"
            anchorY="middle"
            rotation={[-Math.PI / 2, 0, 0]}
          >
            Extends from floor to ceiling ({buildingHeight}ft)
          </Text>
        </group>
      )}
    </group>
  );
};

export default PartitionWallLabels;