import React from 'react';
import { Text } from '@react-three/drei';
import type { StallConfiguration, AccessPath } from '../../types/partitions';

interface StallMarkersProps {
  stalls: StallConfiguration[];
  accessPaths: AccessPath[];
}

const StallMarkers: React.FC<StallMarkersProps> = ({ stalls, accessPaths }) => {
  return (
    <group>
      {stalls.map((stall) => {
        const centerX = (stall.bounds.minX + stall.bounds.maxX) / 2;
        const centerZ = (stall.bounds.minZ + stall.bounds.maxZ) / 2;
        const stallWidth = stall.bounds.maxX - stall.bounds.minX;
        const stallLength = stall.bounds.maxZ - stall.bounds.minZ;
        
        return (
          <group key={stall.id}>
            {/* Stall name label */}
            <Text
              position={[centerX, 8, centerZ]}
              fontSize={1.2}
              color="#2D3748"
              anchorX="center"
              anchorY="middle"
              rotation={[-Math.PI / 2, 0, 0]}
            >
              {stall.name}
            </Text>
            
            {/* Stall purpose label */}
            <Text
              position={[centerX, 7, centerZ]}
              fontSize={0.8}
              color="#4A5568"
              anchorX="center"
              anchorY="middle"
              rotation={[-Math.PI / 2, 0, 0]}
            >
              {formatStallPurpose(stall.purpose)}
            </Text>
            
            {/* Stall dimensions */}
            <Text
              position={[centerX, 6, centerZ]}
              fontSize={0.6}
              color="#718096"
              anchorX="center"
              anchorY="middle"
              rotation={[-Math.PI / 2, 0, 0]}
            >
              {stallWidth.toFixed(1)}' × {stallLength.toFixed(1)}'
            </Text>
            
            {/* Stall features indicators */}
            <group position={[centerX, 5, centerZ]}>
              {stall.drainage && (
                <Text
                  position={[-2, 0, 0]}
                  fontSize={0.4}
                  color="#3182CE"
                  anchorX="center"
                  anchorY="middle"
                  rotation={[-Math.PI / 2, 0, 0]}
                >
                  💧 Drainage
                </Text>
              )}
              
              {stall.lighting && (
                <Text
                  position={[0, 0, 0]}
                  fontSize={0.4}
                  color="#D69E2E"
                  anchorX="center"
                  anchorY="middle"
                  rotation={[-Math.PI / 2, 0, 0]}
                >
                  💡 Lighting
                </Text>
              )}
              
              {stall.ventilation !== 'natural' && (
                <Text
                  position={[2, 0, 0]}
                  fontSize={0.4}
                  color="#38A169"
                  anchorX="center"
                  anchorY="middle"
                  rotation={[-Math.PI / 2, 0, 0]}
                >
                  🌪️ Ventilation
                </Text>
              )}
            </group>
          </group>
        );
      })}
      
      {/* Access path labels */}
      {accessPaths.map((path) => {
        const pathId = `${path.startStall}-${path.endStall}`;
        const startStall = stalls.find(s => s.id === path.startStall);
        const endStall = stalls.find(s => s.id === path.endStall);
        
        if (!startStall || !endStall) return null;
        
        const startX = (startStall.bounds.minX + startStall.bounds.maxX) / 2;
        const startZ = (startStall.bounds.minZ + startStall.bounds.maxZ) / 2;
        const endX = (endStall.bounds.minX + endStall.bounds.maxX) / 2;
        const endZ = (endStall.bounds.minZ + endStall.bounds.maxZ) / 2;
        
        const midX = (startX + endX) / 2;
        const midZ = (startZ + endZ) / 2;
        
        return (
          <group key={pathId}>
            {path.isMainAisle && (
              <Text
                position={[midX, 4, midZ]}
                fontSize={0.8}
                color="#2B6CB0"
                anchorX="center"
                anchorY="middle"
                rotation={[-Math.PI / 2, 0, 0]}
              >
                Main Aisle ({path.width}')
              </Text>
            )}
          </group>
        );
      })}
    </group>
  );
};

const formatStallPurpose = (purpose: string): string => {
  return purpose.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

export default StallMarkers;