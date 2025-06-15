import React from 'react';
import * as THREE from 'three';
import type { WallSegment } from '../../utils/wallLayoutValidation';

interface InteriorWallsProps {
  wallSegments: WallSegment[];
  roomHeight: number;
  roomLength: number;
}

const InteriorWalls: React.FC<InteriorWallsProps> = ({ wallSegments, roomHeight, roomLength }) => {
  // Filter out exterior walls - only render interior walls
  const interiorWalls = wallSegments.filter(wall => wall.type === 'interior' || wall.type === 'partition');

  if (interiorWalls.length === 0) {
    return null;
  }

  console.log(`🏗️ Rendering ${interiorWalls.length} interior walls`);

  return (
    <group>
      {interiorWalls.map((wall) => {
        // Calculate wall position - convert from wall layout coordinates to 3D coordinates
        const wallCenterX = wall.position + (wall.width / 2) - (30 / 2); // Assuming 30ft room width
        const wallCenterY = roomHeight / 2;
        const wallCenterZ = 0; // Center along room length

        console.log(`Interior wall "${wall.name}" at x=${wallCenterX.toFixed(2)}, thickness=${wall.thickness}ft`);

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
              />
            </mesh>

            {/* Wall label for identification */}
            <mesh position={[wallCenterX, roomHeight + 1, wallCenterZ]}>
              <planeGeometry args={[wall.width, 0.5]} />
              <meshBasicMaterial color="#FFFFFF" transparent opacity={0.8} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export default InteriorWalls;