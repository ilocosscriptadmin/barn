import React from 'react';
import * as THREE from 'three';
import { useBuildingStore } from '../../store/buildingStore';

const BayDividerWalls: React.FC = () => {
  const { dimensions, bays } = useBuildingStore((state) => ({
    dimensions: state.currentProject.building.dimensions,
    bays: state.currentProject.building.bays || []
  }));

  // Only render divider walls for active bays
  const activeBays = bays.filter(bay => bay.isActive);

  if (activeBays.length === 0) {
    return null;
  }

  console.log(`🏗️ Rendering bay divider walls for ${activeBays.length} active bays`);

  return (
    <group>
      {activeBays.map((bay) => {
        // Create divider wall between main building and bay
        const dividerWall = createDividerWall(bay, dimensions);
        
        if (!dividerWall) return null;

        console.log(`Creating divider wall for bay "${bay.name}" on ${bay.connectionWall} wall`);

        return (
          <group key={`divider-${bay.id}`}>
            {/* Main divider wall */}
            <mesh 
              position={dividerWall.position}
              rotation={dividerWall.rotation}
              castShadow 
              receiveShadow
            >
              <boxGeometry args={dividerWall.dimensions} />
              <meshStandardMaterial 
                color="#8B7355" // Darker brown for divider walls
                metalness={0.2}
                roughness={0.7}
                transparent={false}
              />
            </mesh>

            {/* Divider wall cap for better visibility */}
            <mesh 
              position={[
                dividerWall.position[0], 
                dividerWall.position[1] + dividerWall.dimensions[1]/2 + 0.05, 
                dividerWall.position[2]
              ]}
              rotation={dividerWall.rotation}
            >
              <boxGeometry args={[dividerWall.dimensions[0], 0.1, dividerWall.dimensions[2]]} />
              <meshStandardMaterial 
                color="#6B5B47" 
                metalness={0.3}
                roughness={0.6}
              />
            </mesh>

            {/* Bay connection indicator */}
            <mesh 
              position={[
                dividerWall.position[0], 
                dividerWall.position[1] + dividerWall.dimensions[1]/2 + 1.0, 
                dividerWall.position[2]
              ]}
              rotation={[-Math.PI / 2, 0, dividerWall.rotation[1]]}
            >
              <planeGeometry args={[2, 0.5]} />
              <meshBasicMaterial color="#FFFFFF" transparent opacity={0.9} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// Helper function to create divider wall geometry
const createDividerWall = (bay: any, mainDimensions: any) => {
  const wallThickness = 0.5; // 6 inches thick divider wall
  const wallHeight = Math.min(bay.dimensions.height, mainDimensions.height);
  
  switch (bay.connectionWall) {
    case 'right':
      return {
        position: [mainDimensions.width / 2, wallHeight / 2, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        dimensions: [wallThickness, wallHeight, mainDimensions.length] as [number, number, number]
      };
      
    case 'left':
      return {
        position: [-mainDimensions.width / 2, wallHeight / 2, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        dimensions: [wallThickness, wallHeight, mainDimensions.length] as [number, number, number]
      };
      
    case 'front':
      return {
        position: [0, wallHeight / 2, mainDimensions.length / 2] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        dimensions: [mainDimensions.width, wallHeight, wallThickness] as [number, number, number]
      };
      
    case 'back':
      return {
        position: [0, wallHeight / 2, -mainDimensions.length / 2] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        dimensions: [mainDimensions.width, wallHeight, wallThickness] as [number, number, number]
      };
      
    default:
      return null;
  }
};

export default BayDividerWalls;