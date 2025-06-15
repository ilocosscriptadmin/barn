import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface StructuralBaysProps {
  length: number;
  width: number;
  height: number;
  numberOfBays: number;
  baySpacing: number;
  showStructural?: boolean;
  onBayClick?: (bayIndex: number) => void;
  selectedBay?: number | null;
}

const StructuralBays: React.FC<StructuralBaysProps> = ({
  length,
  width,
  height,
  numberOfBays,
  baySpacing,
  showStructural = true,
  onBayClick,
  selectedBay
}) => {
  // Calculate bay dimensions
  const bayLength = length / numberOfBays;
  
  // Generate structural columns
  const columns = useMemo(() => {
    const columnPositions = [];
    
    // Generate columns at each bay division
    for (let i = 0; i <= numberOfBays; i++) {
      const x = -length/2 + (i * bayLength);
      
      // Front columns
      columnPositions.push({
        position: [x, height/2, width/2],
        key: `front-${i}`
      });
      
      // Back columns
      columnPositions.push({
        position: [x, height/2, -width/2],
        key: `back-${i}`
      });
    }
    
    return columnPositions;
  }, [length, width, height, numberOfBays, bayLength]);

  // Generate bay divisions
  const bayDivisions = useMemo(() => {
    const divisions = [];
    
    for (let i = 1; i < numberOfBays; i++) {
      const x = -length/2 + (i * bayLength);
      divisions.push({
        position: [x, height/2, 0],
        key: `division-${i}`
      });
    }
    
    return divisions;
  }, [length, height, numberOfBays, bayLength]);

  // Generate clickable bay areas
  const bayAreas = useMemo(() => {
    const areas = [];
    
    for (let i = 0; i < numberOfBays; i++) {
      const x = -length/2 + (i * bayLength) + bayLength/2;
      areas.push({
        position: [x, height/2, 0],
        dimensions: [bayLength, height, width],
        index: i,
        key: `bay-${i}`
      });
    }
    
    return areas;
  }, [length, width, height, numberOfBays, bayLength]);

  // Steel material for structural elements
  const steelMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#808080',
    metalness: 0.9,
    roughness: 0.1,
    envMapIntensity: 1.0,
  }), []);

  // Bay area material (transparent for clicking)
  const bayAreaMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#3B82F6',
    transparent: true,
    opacity: 0.1,
    side: THREE.DoubleSide,
  }), []);

  // Selected bay material
  const selectedBayMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#10B981',
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide,
  }), []);

  return (
    <group>
      {/* Structural Columns */}
      {showStructural && columns.map((column) => (
        <mesh
          key={column.key}
          position={column.position as [number, number, number]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.3, 0.3, height, 8]} />
          <primitive object={steelMaterial} attach="material" />
        </mesh>
      ))}

      {/* Bay Division Lines (visual guides) */}
      {showStructural && bayDivisions.map((division) => (
        <group key={division.key}>
          {/* Vertical division line */}
          <mesh
            position={division.position as [number, number, number]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.1, height, width]} />
            <meshStandardMaterial 
              color="#4B5563" 
              transparent 
              opacity={0.3}
            />
          </mesh>
          
          {/* Ridge beam connection */}
          <mesh
            position={[division.position[0], height, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.4, 0.4, width]} />
            <primitive object={steelMaterial} attach="material" />
          </mesh>
        </group>
      ))}

      {/* Structural Beams */}
      {showStructural && (
        <group>
          {/* Ridge beam */}
          <mesh
            position={[0, height, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[length, 0.4, 0.4]} />
            <primitive object={steelMaterial} attach="material" />
          </mesh>
          
          {/* Front eave beam */}
          <mesh
            position={[0, height * 0.8, width/2]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[length, 0.3, 0.3]} />
            <primitive object={steelMaterial} attach="material" />
          </mesh>
          
          {/* Back eave beam */}
          <mesh
            position={[0, height * 0.8, -width/2]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[length, 0.3, 0.3]} />
            <primitive object={steelMaterial} attach="material" />
          </mesh>
        </group>
      )}

      {/* Clickable Bay Areas */}
      {bayAreas.map((bay) => (
        <mesh
          key={bay.key}
          position={bay.position as [number, number, number]}
          onClick={(e) => {
            e.stopPropagation();
            onBayClick?.(bay.index);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'default';
          }}
        >
          <boxGeometry args={bay.dimensions as [number, number, number]} />
          <primitive 
            object={selectedBay === bay.index ? selectedBayMaterial : bayAreaMaterial} 
            attach="material" 
          />
        </mesh>
      ))}

      {/* Bay Labels */}
      {bayAreas.map((bay) => (
        <group key={`label-${bay.key}`}>
          {/* Bay number label */}
          <mesh position={[bay.position[0], height + 2, 0]}>
            <planeGeometry args={[2, 1]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.9} />
          </mesh>
          
          {/* Foundation markers */}
          <mesh position={[bay.position[0] - bayLength/2, -0.5, width/2]}>
            <boxGeometry args={[2, 1, 2]} />
            <meshStandardMaterial color="#8B7355" />
          </mesh>
          <mesh position={[bay.position[0] - bayLength/2, -0.5, -width/2]}>
            <boxGeometry args={[2, 1, 2]} />
            <meshStandardMaterial color="#8B7355" />
          </mesh>
          
          {/* End bay foundation markers */}
          {bay.index === numberOfBays - 1 && (
            <>
              <mesh position={[bay.position[0] + bayLength/2, -0.5, width/2]}>
                <boxGeometry args={[2, 1, 2]} />
                <meshStandardMaterial color="#8B7355" />
              </mesh>
              <mesh position={[bay.position[0] + bayLength/2, -0.5, -width/2]}>
                <boxGeometry args={[2, 1, 2]} />
                <meshStandardMaterial color="#8B7355" />
              </mesh>
            </>
          )}
        </group>
      ))}

      {/* Roof Trusses */}
      {showStructural && bayAreas.map((bay) => {
        const trussCount = Math.ceil(bayLength / 4); // Truss every 4 feet
        const trusses = [];
        
        for (let t = 0; t < trussCount; t++) {
          const trussX = bay.position[0] - bayLength/2 + (t * (bayLength / (trussCount - 1 || 1)));
          
          trusses.push(
            <group key={`truss-${bay.index}-${t}`}>
              {/* Truss peak */}
              <mesh position={[trussX, height + 2, 0]}>
                <boxGeometry args={[0.2, 0.2, 0.2]} />
                <primitive object={steelMaterial} attach="material" />
              </mesh>
              
              {/* Left truss member */}
              <mesh 
                position={[trussX, height + 1, -width/4]}
                rotation={[0, 0, Math.PI/6]}
              >
                <boxGeometry args={[0.15, width/2, 0.15]} />
                <primitive object={steelMaterial} attach="material" />
              </mesh>
              
              {/* Right truss member */}
              <mesh 
                position={[trussX, height + 1, width/4]}
                rotation={[0, 0, -Math.PI/6]}
              >
                <boxGeometry args={[0.15, width/2, 0.15]} />
                <primitive object={steelMaterial} attach="material" />
              </mesh>
            </group>
          );
        }
        
        return trusses;
      })}
    </group>
  );
};

export default StructuralBays;