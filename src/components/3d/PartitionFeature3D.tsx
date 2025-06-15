import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { PartitionFeature, PartitionWall } from '../../types/partitions';

interface PartitionFeature3DProps {
  feature: PartitionFeature;
  partition: PartitionWall;
  buildingHeight: number;
}

const PartitionFeature3D: React.FC<PartitionFeature3DProps> = ({ 
  feature, 
  partition, 
  buildingHeight 
}) => {
  const featureGeometry = useMemo(() => {
    const startX = partition.startPoint.x;
    const startZ = partition.startPoint.z;
    const endX = partition.endPoint.x;
    const endZ = partition.endPoint.z;
    
    const wallLength = Math.sqrt(
      Math.pow(endX - startX, 2) + Math.pow(endZ - startZ, 2)
    );
    const wallAngle = Math.atan2(endZ - startZ, endX - startX);
    
    // Calculate feature position along wall
    const featureX = feature.position * wallLength;
    const featureY = feature.bottomOffset + feature.height / 2;
    
    // Position relative to wall start
    const localX = featureX - wallLength / 2;
    const localZ = 0;
    
    // Transform to world coordinates
    const worldX = (startX + endX) / 2 + localX * Math.cos(wallAngle) - localZ * Math.sin(wallAngle);
    const worldZ = (startZ + endZ) / 2 + localX * Math.sin(wallAngle) + localZ * Math.cos(wallAngle);
    
    return {
      position: [worldX, featureY, worldZ] as [number, number, number],
      rotation: [0, wallAngle, 0] as [number, number, number],
      dimensions: [feature.width, feature.height, partition.thickness + 0.1] as [number, number, number]
    };
  }, [feature, partition, buildingHeight]);
  
  const featureMaterial = useMemo(() => {
    switch (feature.type) {
      case 'standard_door':
      case 'sliding_door':
        return new THREE.MeshStandardMaterial({
          color: '#8B4513', // Wood brown
          metalness: 0.1,
          roughness: 0.8,
          side: THREE.DoubleSide
        });
        
      case 'dutch_door':
        return new THREE.MeshStandardMaterial({
          color: '#654321', // Darker wood
          metalness: 0.1,
          roughness: 0.8,
          side: THREE.DoubleSide
        });
        
      case 'viewing_window':
      case 'feed_window':
        return new THREE.MeshPhysicalMaterial({
          color: '#ffffff',
          metalness: 0.1,
          roughness: 0.05,
          transmission: 0.9,
          transparent: true,
          opacity: 0.7,
          side: THREE.DoubleSide
        });
        
      case 'gate_opening':
        return new THREE.MeshStandardMaterial({
          color: '#696969', // Steel gray
          metalness: 0.8,
          roughness: 0.2,
          side: THREE.DoubleSide
        });
        
      default:
        return new THREE.MeshStandardMaterial({
          color: '#8B4513',
          side: THREE.DoubleSide
        });
    }
  }, [feature.type]);
  
  const renderFeature = () => {
    switch (feature.type) {
      case 'standard_door':
        return (
          <group>
            {/* Door panel */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={featureGeometry.dimensions} />
              <primitive object={featureMaterial} attach="material" />
            </mesh>
            
            {/* Door handle */}
            <mesh position={[featureGeometry.dimensions[0] * 0.3, 0, featureGeometry.dimensions[2] * 0.6]} castShadow>
              <sphereGeometry args={[0.1]} />
              <meshStandardMaterial color="#B7791F" metalness={0.8} roughness={0.2} />
            </mesh>
            
            {/* Door frame */}
            <group>
              {/* Top frame */}
              <mesh position={[0, featureGeometry.dimensions[1] * 0.6, 0]} castShadow receiveShadow>
                <boxGeometry args={[featureGeometry.dimensions[0] + 0.2, 0.2, featureGeometry.dimensions[2]]} />
                <meshStandardMaterial color="#4A5568" />
              </mesh>
              {/* Side frames */}
              <mesh position={[-featureGeometry.dimensions[0] * 0.6, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.2, featureGeometry.dimensions[1], featureGeometry.dimensions[2]]} />
                <meshStandardMaterial color="#4A5568" />
              </mesh>
              <mesh position={[featureGeometry.dimensions[0] * 0.6, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.2, featureGeometry.dimensions[1], featureGeometry.dimensions[2]]} />
                <meshStandardMaterial color="#4A5568" />
              </mesh>
            </group>
          </group>
        );
        
      case 'dutch_door':
        return (
          <group>
            {/* Top half */}
            <mesh position={[0, featureGeometry.dimensions[1] * 0.25, 0]} castShadow receiveShadow>
              <boxGeometry args={[featureGeometry.dimensions[0], featureGeometry.dimensions[1] * 0.5, featureGeometry.dimensions[2]]} />
              <primitive object={featureMaterial} attach="material" />
            </mesh>
            
            {/* Bottom half */}
            <mesh position={[0, -featureGeometry.dimensions[1] * 0.25, 0]} castShadow receiveShadow>
              <boxGeometry args={[featureGeometry.dimensions[0], featureGeometry.dimensions[1] * 0.5, featureGeometry.dimensions[2]]} />
              <primitive object={featureMaterial} attach="material" />
            </mesh>
            
            {/* Handles for both halves */}
            <mesh position={[featureGeometry.dimensions[0] * 0.3, featureGeometry.dimensions[1] * 0.15, featureGeometry.dimensions[2] * 0.6]} castShadow>
              <sphereGeometry args={[0.08]} />
              <meshStandardMaterial color="#B7791F" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[featureGeometry.dimensions[0] * 0.3, -featureGeometry.dimensions[1] * 0.15, featureGeometry.dimensions[2] * 0.6]} castShadow>
              <sphereGeometry args={[0.08]} />
              <meshStandardMaterial color="#B7791F" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        );
        
      case 'sliding_door':
        return (
          <group>
            {/* Door panel */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={featureGeometry.dimensions} />
              <primitive object={featureMaterial} attach="material" />
            </mesh>
            
            {/* Sliding track */}
            <mesh position={[0, featureGeometry.dimensions[1] * 0.6, 0]} castShadow receiveShadow>
              <boxGeometry args={[featureGeometry.dimensions[0] + 1, 0.1, 0.2]} />
              <meshStandardMaterial color="#696969" metalness={0.8} roughness={0.2} />
            </mesh>
            
            {/* Door handle */}
            <mesh position={[0, 0, featureGeometry.dimensions[2] * 0.6]} castShadow>
              <boxGeometry args={[0.4, 0.1, 0.1]} />
              <meshStandardMaterial color="#B7791F" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        );
        
      case 'viewing_window':
      case 'feed_window':
        return (
          <group>
            {/* Glass panel */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={featureGeometry.dimensions} />
              <primitive object={featureMaterial} attach="material" />
            </mesh>
            
            {/* Window frame */}
            <group>
              {/* Top frame */}
              <mesh position={[0, featureGeometry.dimensions[1] * 0.6, 0]} castShadow receiveShadow>
                <boxGeometry args={[featureGeometry.dimensions[0] + 0.2, 0.2, featureGeometry.dimensions[2] + 0.1]} />
                <meshStandardMaterial color="#4A5568" />
              </mesh>
              {/* Bottom frame */}
              <mesh position={[0, -featureGeometry.dimensions[1] * 0.6, 0]} castShadow receiveShadow>
                <boxGeometry args={[featureGeometry.dimensions[0] + 0.2, 0.2, featureGeometry.dimensions[2] + 0.1]} />
                <meshStandardMaterial color="#4A5568" />
              </mesh>
              {/* Side frames */}
              <mesh position={[-featureGeometry.dimensions[0] * 0.6, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.2, featureGeometry.dimensions[1] + 0.2, featureGeometry.dimensions[2] + 0.1]} />
                <meshStandardMaterial color="#4A5568" />
              </mesh>
              <mesh position={[featureGeometry.dimensions[0] * 0.6, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.2, featureGeometry.dimensions[1] + 0.2, featureGeometry.dimensions[2] + 0.1]} />
                <meshStandardMaterial color="#4A5568" />
              </mesh>
            </group>
            
            {/* Window cross divider for viewing windows */}
            {feature.type === 'viewing_window' && (
              <group>
                <mesh position={[0, 0, 0]} castShadow receiveShadow>
                  <boxGeometry args={[featureGeometry.dimensions[0], 0.1, featureGeometry.dimensions[2]]} />
                  <meshStandardMaterial color="#4A5568" />
                </mesh>
                <mesh position={[0, 0, 0]} castShadow receiveShadow>
                  <boxGeometry args={[0.1, featureGeometry.dimensions[1], featureGeometry.dimensions[2]]} />
                  <meshStandardMaterial color="#4A5568" />
                </mesh>
              </group>
            )}
          </group>
        );
        
      case 'gate_opening':
        return (
          <group>
            {/* Gate bars */}
            {Array.from({ length: 5 }).map((_, i) => (
              <mesh 
                key={i}
                position={[
                  -featureGeometry.dimensions[0] * 0.4 + i * (featureGeometry.dimensions[0] * 0.2), 
                  0, 
                  0
                ]} 
                castShadow 
                receiveShadow
              >
                <boxGeometry args={[0.1, featureGeometry.dimensions[1], 0.1]} />
                <primitive object={featureMaterial} attach="material" />
              </mesh>
            ))}
            
            {/* Gate frame */}
            <mesh position={[0, featureGeometry.dimensions[1] * 0.6, 0]} castShadow receiveShadow>
              <boxGeometry args={[featureGeometry.dimensions[0] + 0.2, 0.2, 0.2]} />
              <primitive object={featureMaterial} attach="material" />
            </mesh>
            
            {/* Gate latch */}
            <mesh position={[featureGeometry.dimensions[0] * 0.4, 0, 0]} castShadow>
              <boxGeometry args={[0.2, 0.3, 0.1]} />
              <meshStandardMaterial color="#B7791F" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        );
        
      default:
        return (
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={featureGeometry.dimensions} />
            <primitive object={featureMaterial} attach="material" />
          </mesh>
        );
    }
  };
  
  return (
    <group 
      position={featureGeometry.position} 
      rotation={featureGeometry.rotation}
    >
      {renderFeature()}
    </group>
  );
};

export default PartitionFeature3D;