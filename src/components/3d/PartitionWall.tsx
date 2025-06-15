import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { PartitionWall, PartitionFeature, PartitionMaterialProperties } from '../../types/partitions';
import PartitionFeature3D from './PartitionFeature3D';

interface PartitionWallProps {
  partition: PartitionWall;
  buildingHeight: number;
  onWallClick?: (wallId: string) => void;
  isSelected?: boolean;
}

const PARTITION_MATERIALS: Record<string, PartitionMaterialProperties> = {
  wood_planks: {
    name: 'Wood Planks',
    color: '#8B4513',
    texture: 'wood',
    durability: 7,
    cost: 1.0,
    maintenance: 'medium',
    suitability: ['horse_stalls', 'tack_rooms', 'offices']
  },
  metal_panels: {
    name: 'Metal Panels',
    color: '#708090',
    texture: 'metal',
    durability: 9,
    cost: 1.2,
    maintenance: 'low',
    suitability: ['cattle_pens', 'feed_rooms', 'storage']
  },
  concrete_block: {
    name: 'Concrete Block',
    color: '#A9A9A9',
    texture: 'concrete',
    durability: 10,
    cost: 0.8,
    maintenance: 'low',
    suitability: ['feed_rooms', 'storage', 'wash_areas']
  },
  steel_mesh: {
    name: 'Steel Mesh',
    color: '#696969',
    texture: 'mesh',
    durability: 8,
    cost: 0.9,
    maintenance: 'low',
    suitability: ['cattle_pens', 'ventilation_areas']
  },
  composite_panels: {
    name: 'Composite Panels',
    color: '#D2B48C',
    texture: 'composite',
    durability: 8,
    cost: 1.5,
    maintenance: 'low',
    suitability: ['horse_stalls', 'offices', 'premium_areas']
  },
  brick: {
    name: 'Brick',
    color: '#B22222',
    texture: 'brick',
    durability: 9,
    cost: 1.3,
    maintenance: 'low',
    suitability: ['offices', 'feed_rooms', 'permanent_structures']
  }
};

const PartitionWall3D: React.FC<PartitionWallProps> = ({ 
  partition, 
  buildingHeight, 
  onWallClick, 
  isSelected = false 
}) => {
  console.log("Rendering partition wall:", partition.name);
  
  // Calculate wall geometry
  const wallGeometry = useMemo(() => {
    const startX = partition.startPoint.x;
    const startZ = partition.startPoint.z;
    const endX = partition.endPoint.x;
    const endZ = partition.endPoint.z;
    
    // Calculate wall length and angle
    const wallLength = Math.sqrt(
      Math.pow(endX - startX, 2) + Math.pow(endZ - startZ, 2)
    );
    const wallAngle = Math.atan2(endZ - startZ, endX - startX);
    
    // Calculate wall height
    const actualHeight = partition.extendToRoof ? buildingHeight : partition.height;
    
    console.log(`Creating partition wall: ${wallLength.toFixed(2)}ft long, ${actualHeight.toFixed(2)}ft high, angle: ${(wallAngle * 180 / Math.PI).toFixed(2)}°`);
    
    // Create wall geometry
    const geometry = new THREE.BoxGeometry(wallLength, actualHeight, partition.thickness);
    
    // Position and rotate the wall
    const centerX = (startX + endX) / 2;
    const centerZ = (startZ + endZ) / 2;
    
    // Create a transformation matrix
    const matrix = new THREE.Matrix4();
    
    // First translate to origin
    matrix.makeTranslation(-wallLength/2, -actualHeight/2, -partition.thickness/2);
    
    // Apply rotation around Y axis
    const rotationMatrix = new THREE.Matrix4();
    rotationMatrix.makeRotationY(wallAngle);
    matrix.multiply(rotationMatrix);
    
    // Translate to final position
    const translationMatrix = new THREE.Matrix4();
    translationMatrix.makeTranslation(centerX, actualHeight/2, centerZ);
    matrix.multiply(translationMatrix);
    
    // Apply transformation
    geometry.applyMatrix4(matrix);
    
    return geometry;
  }, [partition, buildingHeight]);
  
  // Create material for the wall
  const wallMaterial = useMemo(() => {
    const materialProps = PARTITION_MATERIALS[partition.material] || PARTITION_MATERIALS.wood_planks;
    
    // Create material-specific texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Base color
      ctx.fillStyle = partition.color || materialProps.color;
      ctx.fillRect(0, 0, 512, 512);
      
      // Add material-specific patterns
      switch (partition.material) {
        case 'wood_planks':
          // Wood grain pattern
          ctx.strokeStyle = 'rgba(0,0,0,0.1)';
          ctx.lineWidth = 2;
          for (let i = 0; i < 512; i += 64) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(512, i);
            ctx.stroke();
          }
          break;
          
        case 'metal_panels':
          // Metal panel seams
          ctx.strokeStyle = 'rgba(0,0,0,0.2)';
          ctx.lineWidth = 1;
          for (let i = 0; i < 512; i += 128) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(512, i);
            ctx.stroke();
          }
          break;
          
        case 'concrete_block':
          // Block pattern
          ctx.strokeStyle = 'rgba(0,0,0,0.15)';
          ctx.lineWidth = 2;
          for (let y = 0; y < 512; y += 64) {
            for (let x = 0; x < 512; x += 128) {
              ctx.strokeRect(x, y, 128, 64);
            }
          }
          break;
          
        case 'steel_mesh':
          // Mesh pattern
          ctx.strokeStyle = 'rgba(0,0,0,0.3)';
          ctx.lineWidth = 1;
          for (let i = 0; i < 512; i += 16) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 512);
            ctx.moveTo(0, i);
            ctx.lineTo(512, i);
            ctx.stroke();
          }
          break;
          
        case 'brick':
          // Brick pattern
          ctx.strokeStyle = 'rgba(0,0,0,0.2)';
          ctx.lineWidth = 2;
          for (let y = 0; y < 512; y += 32) {
            const offset = (y / 32) % 2 === 0 ? 0 : 64;
            for (let x = offset; x < 512; x += 128) {
              ctx.strokeRect(x, y, 128, 32);
            }
          }
          break;
      }
      
      // Add wear and weathering for realism
      ctx.globalAlpha = 0.05;
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 10 + 5;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
        ctx.fillRect(x, y, size, size);
      }
      ctx.globalAlpha = 1.0;
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    
    return new THREE.MeshStandardMaterial({
      map: texture,
      color: partition.color || materialProps.color,
      metalness: partition.material === 'metal_panels' || partition.material === 'steel_mesh' ? 0.7 : 0.1,
      roughness: partition.material === 'metal_panels' ? 0.3 : 0.8,
      side: THREE.DoubleSide,
      transparent: partition.material === 'steel_mesh',
      opacity: partition.material === 'steel_mesh' ? 0.8 : 1.0
    });
  }, [partition.material, partition.color]);
  
  const handleClick = (event: any) => {
    event.stopPropagation();
    onWallClick?.(partition.id);
  };
  
  // Calculate wall position and dimensions for features
  const wallInfo = useMemo(() => {
    const startX = partition.startPoint.x;
    const startZ = partition.startPoint.z;
    const endX = partition.endPoint.x;
    const endZ = partition.endPoint.z;
    
    const wallLength = Math.sqrt(
      Math.pow(endX - startX, 2) + Math.pow(endZ - startZ, 2)
    );
    const wallAngle = Math.atan2(endZ - startZ, endX - startX);
    const centerX = (startX + endX) / 2;
    const centerZ = (startZ + endZ) / 2;
    
    return {
      length: wallLength,
      angle: wallAngle,
      centerX,
      centerZ
    };
  }, [partition.startPoint, partition.endPoint]);
  
  return (
    <group>
      {/* Main wall structure */}
      <mesh
        geometry={wallGeometry}
        material={wallMaterial}
        castShadow
        receiveShadow
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'default';
        }}
      />
      
      {/* Selection highlight */}
      {isSelected && (
        <mesh geometry={wallGeometry}>
          <meshBasicMaterial 
            color="#00ff00" 
            transparent 
            opacity={0.2} 
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Wall features (doors, windows) */}
      {partition.features.map((feature) => (
        <PartitionFeature3D
          key={feature.id}
          feature={feature}
          partition={partition}
          buildingHeight={buildingHeight}
        />
      ))}
      
      {/* Wall label for identification */}
      <group position={[
        wallInfo.centerX,
        (partition.extendToRoof ? buildingHeight : partition.height) / 2,
        wallInfo.centerZ
      ]}>
        <mesh rotation={[0, wallInfo.angle, 0]}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshBasicMaterial color="#ff0000" opacity={0.5} transparent />
        </mesh>
      </group>
    </group>
  );
};

export default PartitionWall3D;