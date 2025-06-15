import React from 'react';
import { useBuildingStore } from '../../store/buildingStore';
import PartitionWall3D from './PartitionWall';
import StallMarkers from './StallMarkers';
import type { InteriorLayout as InteriorLayoutType, VisualizationSettings } from '../../types/partitions';
import * as THREE from 'three';

interface InteriorLayoutProps {
  interiorLayout: InteriorLayoutType;
  buildingDimensions: any;
  visualizationSettings: VisualizationSettings;
  selectedPartition?: string;
  onPartitionClick?: (partitionId: string) => void;
}

const InteriorLayout: React.FC<InteriorLayoutProps> = ({
  interiorLayout,
  buildingDimensions,
  visualizationSettings,
  selectedPartition,
  onPartitionClick
}) => {
  // If partition walls are hidden in visualization settings, don't render anything
  if (!visualizationSettings.showPartitionWalls) {
    console.log("Partition walls are hidden in visualization settings");
    return null;
  }

  console.log("Rendering interior layout with", interiorLayout.partitionWalls.length, "partition walls");

  return (
    <group>
      {/* Partition walls */}
      {interiorLayout.partitionWalls.map((partition) => (
        <PartitionWall3D
          key={partition.id}
          partition={partition}
          buildingHeight={buildingDimensions.height}
          onWallClick={onPartitionClick}
          isSelected={selectedPartition === partition.id}
        />
      ))}
      
      {/* Stall markers and labels */}
      {visualizationSettings.showStallLabels && interiorLayout.stallConfiguration.length > 0 && (
        <StallMarkers 
          stalls={interiorLayout.stallConfiguration}
          accessPaths={interiorLayout.accessPaths}
        />
      )}
      
      {/* Floor markings for different areas */}
      {interiorLayout.stallConfiguration.map((stall) => (
        <group key={stall.id}>
          {/* Stall floor area */}
          <mesh 
            position={[
              (stall.bounds.minX + stall.bounds.maxX) / 2,
              0.01,
              (stall.bounds.minZ + stall.bounds.maxZ) / 2
            ]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <planeGeometry 
              args={[
                stall.bounds.maxX - stall.bounds.minX,
                stall.bounds.maxZ - stall.bounds.minZ
              ]} 
            />
            <meshStandardMaterial 
              color={getStallFloorColor(stall.floorType)}
              transparent
              opacity={0.3}
            />
          </mesh>
          
          {/* Stall boundary lines */}
          <lineSegments>
            <edgesGeometry 
              args={[
                new THREE.BoxGeometry(
                  stall.bounds.maxX - stall.bounds.minX,
                  0.01,
                  stall.bounds.maxZ - stall.bounds.minZ
                )
              ]} 
            />
            <lineBasicMaterial color="#666666" linewidth={2} />
          </lineSegments>
        </group>
      ))}
      
      {/* Access paths */}
      {interiorLayout.accessPaths.map((path) => {
        const startStall = interiorLayout.stallConfiguration.find(s => s.id === path.startStall);
        const endStall = interiorLayout.stallConfiguration.find(s => s.id === path.endStall);
        
        if (!startStall || !endStall) return null;
        
        const startX = (startStall.bounds.minX + startStall.bounds.maxX) / 2;
        const startZ = (startStall.bounds.minZ + startStall.bounds.maxZ) / 2;
        const endX = (endStall.bounds.minX + endStall.bounds.maxX) / 2;
        const endZ = (endStall.bounds.minZ + endStall.bounds.maxZ) / 2;
        
        const pathLength = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endZ - startZ, 2));
        const pathAngle = Math.atan2(endZ - startZ, endX - startX);
        
        return (
          <group key={path.id}>
            <mesh
              position={[(startX + endX) / 2, 0.02, (startZ + endZ) / 2]}
              rotation={[-Math.PI / 2, 0, pathAngle]}
              receiveShadow
            >
              <planeGeometry args={[pathLength, path.width]} />
              <meshStandardMaterial 
                color={path.isMainAisle ? "#8B7355" : "#A0927D"}
                transparent
                opacity={0.4}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

const getStallFloorColor = (floorType: string): string => {
  switch (floorType) {
    case 'concrete': return '#C0C0C0';
    case 'rubber_mats': return '#2F4F4F';
    case 'dirt': return '#8B4513';
    case 'gravel': return '#A9A9A9';
    case 'wood': return '#DEB887';
    default: return '#C0C0C0';
  }
};

export default InteriorLayout;