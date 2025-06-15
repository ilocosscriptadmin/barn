import React from 'react';
import * as THREE from 'three';
import type { WallSegment } from '../../utils/wallLayoutValidation';

interface InteriorWallsProps {
  wallSegments: WallSegment[];
  roomHeight: number;
  roomLength: number;
  roomWidth: number;
  wallProfile?: string;
  wallColor?: string;
}

const InteriorWalls: React.FC<InteriorWallsProps> = ({ 
  wallSegments, 
  roomHeight, 
  roomLength, 
  roomWidth,
  wallProfile = 'multiclad',
  wallColor = '#5A6B47'
}) => {
  // Filter out exterior walls - only render interior walls
  const interiorWalls = wallSegments.filter(wall => wall.type === 'interior' || wall.type === 'partition');

  if (interiorWalls.length === 0) {
    return null;
  }

  console.log(`🏗️ Rendering ${interiorWalls.length} interior walls in room ${roomWidth}ft × ${roomLength}ft × ${roomHeight}ft`);

  // Create enhanced material that matches exterior walls
  const createInteriorWallMaterial = () => {
    const textureWidth = 512;
    const textureHeight = 512;
    const canvas = document.createElement('canvas');
    canvas.width = textureWidth;
    canvas.height = textureHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Base color fill
      ctx.fillStyle = wallColor;
      ctx.fillRect(0, 0, textureWidth, textureHeight);
      
      // Profile-specific patterns to match exterior walls
      let ribWidth: number;
      let ribSpacing: number;
      
      switch (wallProfile) {
        case 'multiclad':
          ribWidth = textureWidth / 5;
          ribSpacing = ribWidth * 1.1;
          break;
        case 'trimdek':
          ribWidth = textureWidth / 6;
          ribSpacing = ribWidth * 1.05;
          break;
        case 'customorb':
          ribWidth = textureWidth / 12;
          ribSpacing = ribWidth * 1.1;
          break;
        default:
          ribWidth = textureWidth / 6;
          ribSpacing = ribWidth * 1.05;
      }
      
      // Create vertical ribs to match exterior wall profile
      const shadowOpacity = wallColor === '#FFFFFF' ? 0.35 : 0.45;
      const highlightOpacity = wallColor === '#FFFFFF' ? 0.25 : 0.4;
      
      for (let x = 0; x < textureWidth; x += ribSpacing) {
        // Shadow side
        ctx.fillStyle = `rgba(0,0,0,${shadowOpacity})`;
        ctx.fillRect(x, 0, ribWidth * 0.3, textureHeight);
        
        // Highlight side
        ctx.fillStyle = `rgba(255,255,255,${highlightOpacity})`;
        ctx.fillRect(x + ribWidth * 0.7, 0, ribWidth * 0.3, textureHeight);
      }
      
      // Add horizontal panel lines
      const panelHeight = textureHeight / 3;
      ctx.strokeStyle = `rgba(0,0,0,${shadowOpacity})`;
      ctx.lineWidth = 2;
      for (let y = panelHeight; y < textureHeight; y += panelHeight) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(textureWidth, y);
        ctx.stroke();
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 3); // Scale texture appropriately
    
    return new THREE.MeshStandardMaterial({
      map: texture,
      metalness: 0.6,
      roughness: 0.3,
      envMapIntensity: 1.0,
      side: THREE.DoubleSide,
    });
  };

  const interiorWallMaterial = createInteriorWallMaterial();

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
            {/* Main wall structure with enhanced materials */}
            <mesh 
              position={[wallCenterX, wallCenterY, wallCenterZ]} 
              castShadow 
              receiveShadow
            >
              <boxGeometry args={[wall.width, roomHeight, wall.thickness]} />
              <primitive object={interiorWallMaterial} attach="material" />
            </mesh>

            {/* Wall top cap for better visibility */}
            <mesh position={[wallCenterX, roomHeight + 0.05, wallCenterZ]}>
              <boxGeometry args={[wall.width, 0.1, wall.thickness]} />
              <meshStandardMaterial 
                color="#6B5B47" 
                metalness={0.3}
                roughness={0.6}
              />
            </mesh>

            {/* Wall base for structural appearance */}
            <mesh position={[wallCenterX, 0.05, wallCenterZ]}>
              <boxGeometry args={[wall.width + 0.1, 0.1, wall.thickness + 0.1]} />
              <meshStandardMaterial 
                color="#4A3C32" 
                metalness={0.2}
                roughness={0.8}
              />
            </mesh>

            {/* Wall identification label (floating above) */}
            <mesh position={[wallCenterX, roomHeight + 1.5, wallCenterZ]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[Math.min(wall.width, 4), 0.5]} />
              <meshBasicMaterial color="#FFFFFF" transparent opacity={0.9} />
            </mesh>

            {/* Structural connection points */}
            <mesh position={[wallCenterX, 0, wallCenterZ - wall.thickness/2 - 0.05]} castShadow>
              <boxGeometry args={[wall.width, 0.2, 0.1]} />
              <meshStandardMaterial color="#4A3C32" metalness={0.3} roughness={0.7} />
            </mesh>
            <mesh position={[wallCenterX, 0, wallCenterZ + wall.thickness/2 + 0.05]} castShadow>
              <boxGeometry args={[wall.width, 0.2, 0.1]} />
              <meshStandardMaterial color="#4A3C32" metalness={0.3} roughness={0.7} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export default InteriorWalls;