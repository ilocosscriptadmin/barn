import React from 'react';
import * as THREE from 'three';
import type { WallSegment } from '../../utils/wallLayoutValidation';

interface InteriorWallsProps {
  wallSegments: WallSegment[];
  roomHeight: number;
  roomLength: number;
  roomWidth: number;
}

const InteriorWalls: React.FC<InteriorWallsProps> = ({ wallSegments, roomHeight, roomLength, roomWidth }) => {
  // Filter out exterior walls - only render interior walls
  const interiorWalls = wallSegments.filter(wall => wall.type === 'interior' || wall.type === 'partition');

  if (interiorWalls.length === 0) {
    return null;
  }

  console.log(`🏗️ Rendering ${interiorWalls.length} interior walls in room ${roomWidth}ft × ${roomLength}ft × ${roomHeight}ft`);

  return (
    <group>
      {interiorWalls.map((wall) => {
        // Calculate wall position - convert from wall layout coordinates to 3D coordinates
        // Wall layout uses 0 = left edge, so we need to convert to center-based coordinates
        const wallCenterX = wall.position + (wall.width / 2) - (roomWidth / 2);
        const wallCenterY = roomHeight / 2;
        const wallCenterZ = 0; // Center along room length

        console.log(`Interior wall "${wall.name}": position=${wall.position}ft, width=${wall.width}ft, 3D center=(${wallCenterX.toFixed(2)}, ${wallCenterY.toFixed(2)}, ${wallCenterZ})`);

        return (
          <group key={wall.id}>
            {/* Main wall structure */}
            <mesh 
              position={[wallCenterX, wallCenterY, wallCenterZ]} 
              castShadow 
              receiveShadow
            >
              <boxGeometry args={[wall.width, roomHeight, wall.thickness]} />
              <meshStandardMaterial 
                color="#D1D5DB" 
                metalness={0.1}
                roughness={0.8}
                transparent={false}
              />
            </mesh>

            {/* Wall top cap for better visibility */}
            <mesh position={[wallCenterX, roomHeight + 0.05, wallCenterZ]}>
              <boxGeometry args={[wall.width, 0.1, wall.thickness]} />
              <meshStandardMaterial 
                color="#9CA3AF" 
                metalness={0.2}
                roughness={0.6}
              />
            </mesh>

            {/* Wall identification label (floating above) */}
            <mesh position={[wallCenterX, roomHeight + 1.5, wallCenterZ]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[Math.min(wall.width, 4), 0.5]} />
              <meshBasicMaterial color="#FFFFFF" transparent opacity={0.9} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export default InteriorWalls;