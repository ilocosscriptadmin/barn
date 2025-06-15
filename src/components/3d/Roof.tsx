import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { Skylight } from '../../types';

interface RoofProps {
  width: number;
  length: number;
  height: number;
  pitch: number;
  color: string;
  skylights?: Skylight[];
  wallProfile?: string; // Add wall profile prop for roof texture
}

const Roof: React.FC<RoofProps> = ({ width, length, height, pitch, color, skylights = [], wallProfile = 'trimdek' }) => {
  const roofHeight = useMemo(() => {
    return (width / 2) * (pitch / 12);
  }, [width, pitch]);
  
  const pitchAngle = Math.atan2(roofHeight, width / 2);
  const panelLength = Math.sqrt(Math.pow(width/2, 2) + Math.pow(roofHeight, 2));

  // Create roof materials and geometries with ENHANCED PROFILE-SPECIFIC TEXTURES
  const { leftRoofGeometry, rightRoofGeometry, leftRoofMaterial, rightRoofMaterial } = useMemo(() => {
    // 🎯 ENHANCED ROOF PROFILE-SPECIFIC TEXTURE GENERATION - MUCH MORE VISIBLE
    const createEnhancedRoofProfileTexture = (panelSide: 'left' | 'right') => {
      const textureWidth = 1024;
      const textureHeight = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = textureWidth;
      canvas.height = textureHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Base color fill
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, textureWidth, textureHeight);
        
        // 🏗️ ENHANCED ROOF PROFILE-SPECIFIC PATTERNS - MUCH LARGER AND MORE VISIBLE
        let ribWidth: number;
        let ribSpacing: number;
        let profileType: string;
        
        switch (wallProfile) {
          case 'trimdek':
            // Contemporary trapezoidal profile - MUCH LARGER for roof visibility
            ribWidth = textureWidth / 3; // DOUBLED from /6 to /3 - MUCH WIDER ribs
            ribSpacing = ribWidth * 1.05;
            profileType = 'trapezoidal';
            break;
            
          case 'customorb':
            // Curved profile with rounded ribs - MUCH LARGER for roof visibility
            ribWidth = textureWidth / 6; // DOUBLED from /12 to /6 - MUCH WIDER ribs
            ribSpacing = ribWidth * 1.1;
            profileType = 'curved';
            break;
            
          default:
            // Default to Trimdek - MUCH LARGER
            ribWidth = textureWidth / 3; // DOUBLED for visibility
            ribSpacing = ribWidth * 1.05;
            profileType = 'trapezoidal';
        }
        
        // ENHANCED contrast for better roof visibility
        const isWhite = color === '#FFFFFF';
        const isDark = ['#1F2937', '#374151', '#4B5563'].includes(color);
        
        // ENHANCED contrast values for roof profiles - MUCH MORE DRAMATIC
        const shadowOpacity = isWhite ? 0.5 : isDark ? 0.8 : 0.65; // INCREASED
        const highlightOpacity = isWhite ? 0.4 : isDark ? 1.0 : 0.6; // INCREASED
        const deepShadowOpacity = isWhite ? 0.7 : isDark ? 1.0 : 0.85; // INCREASED
        const brightHighlightOpacity = isWhite ? 0.6 : isDark ? 1.0 : 0.8; // INCREASED
        
        console.log(`🏗️ CREATING ENHANCED ${wallProfile.toUpperCase()} ROOF PROFILE: ${profileType} for ${panelSide} panel - MUCH MORE VISIBLE`);
        
        // Create ENHANCED profile-specific patterns with DRAMATIC contrast
        for (let x = 0; x < textureWidth; x += ribSpacing) {
          if (profileType === 'curved') {
            // CUSTOMORB - ENHANCED curved profile with DRAMATIC rounded ribs
            const curveGradient = ctx.createLinearGradient(x, 0, x + ribWidth, 0);
            curveGradient.addColorStop(0, `rgba(0,0,0,${deepShadowOpacity})`);
            curveGradient.addColorStop(0.15, `rgba(0,0,0,${shadowOpacity})`);
            curveGradient.addColorStop(0.35, `rgba(255,255,255,${highlightOpacity * 0.5})`);
            curveGradient.addColorStop(0.5, `rgba(255,255,255,${brightHighlightOpacity})`);
            curveGradient.addColorStop(0.65, `rgba(255,255,255,${highlightOpacity * 0.5})`);
            curveGradient.addColorStop(0.85, `rgba(0,0,0,${shadowOpacity})`);
            curveGradient.addColorStop(1, `rgba(0,0,0,${deepShadowOpacity})`);
            
            ctx.fillStyle = curveGradient;
            ctx.fillRect(x, 0, ribWidth, textureHeight);
            
          } else if (profileType === 'trapezoidal') {
            // TRIMDEK - ENHANCED trapezoidal profile with DRAMATIC clean lines
            // DEEP valley
            ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity})`;
            ctx.fillRect(x, 0, ribWidth * 0.15, textureHeight);
            
            // DRAMATIC rising slope
            const riseGradient = ctx.createLinearGradient(x + ribWidth * 0.15, 0, x + ribWidth * 0.4, 0);
            riseGradient.addColorStop(0, `rgba(0,0,0,${shadowOpacity})`);
            riseGradient.addColorStop(0.5, `rgba(0,0,0,${shadowOpacity * 0.5})`);
            riseGradient.addColorStop(1, `rgba(255,255,255,${highlightOpacity})`);
            ctx.fillStyle = riseGradient;
            ctx.fillRect(x + ribWidth * 0.15, 0, ribWidth * 0.25, textureHeight);
            
            // BRIGHT flat top (trapezoidal characteristic)
            ctx.fillStyle = `rgba(255,255,255,${brightHighlightOpacity})`;
            ctx.fillRect(x + ribWidth * 0.4, 0, ribWidth * 0.2, textureHeight);
            
            // DRAMATIC falling slope
            const fallGradient = ctx.createLinearGradient(x + ribWidth * 0.6, 0, x + ribWidth * 0.85, 0);
            fallGradient.addColorStop(0, `rgba(255,255,255,${highlightOpacity})`);
            fallGradient.addColorStop(0.5, `rgba(0,0,0,${shadowOpacity * 0.5})`);
            fallGradient.addColorStop(1, `rgba(0,0,0,${shadowOpacity})`);
            ctx.fillStyle = fallGradient;
            ctx.fillRect(x + ribWidth * 0.6, 0, ribWidth * 0.25, textureHeight);
            
            // DEEP final valley
            ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity})`;
            ctx.fillRect(x + ribWidth * 0.85, 0, ribWidth * 0.15, textureHeight);
          }
          
          // Add ENHANCED sharp definition lines for all profiles - MUCH MORE VISIBLE
          // ULTRA BRIGHT peak line - THICKER
          ctx.fillStyle = `rgba(255,255,255,${brightHighlightOpacity * 1.8})`;
          ctx.fillRect(x + ribWidth * 0.48, 0, 6, textureHeight); // THICKER line
          
          // ULTRA DARK valley lines - THICKER
          ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity * 1.5})`;
          ctx.fillRect(x + ribWidth * 0.02, 0, 4, textureHeight); // THICKER line
          ctx.fillRect(x + ribWidth * 0.98, 0, 4, textureHeight); // THICKER line
          
          // ADDITIONAL DEFINITION for enhanced visibility
          ctx.fillStyle = `rgba(255,255,255,${highlightOpacity * 1.2})`;
          ctx.fillRect(x + ribWidth * 0.44, 0, 3, textureHeight);
          ctx.fillRect(x + ribWidth * 0.54, 0, 3, textureHeight);
          
          ctx.fillStyle = `rgba(0,0,0,${shadowOpacity * 1.3})`;
          ctx.fillRect(x + ribWidth * 0.1, 0, 3, textureHeight);
          ctx.fillRect(x + ribWidth * 0.9, 0, 3, textureHeight);
        }
        
        // Add ENHANCED horizontal panel lines for roofing sheets - MORE VISIBLE
        const panelHeight = textureHeight / 3; // Larger roof sheets
        ctx.strokeStyle = `rgba(0,0,0,${shadowOpacity * 1.5})`;
        ctx.lineWidth = 5; // THICKER lines
        for (let y = panelHeight; y < textureHeight; y += panelHeight) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(textureWidth, y);
          ctx.stroke();
          
          // Add BRIGHT highlight above each panel line - THICKER
          ctx.strokeStyle = `rgba(255,255,255,${highlightOpacity * 0.8})`;
          ctx.lineWidth = 3; // THICKER highlight
          ctx.beginPath();
          ctx.moveTo(0, y - 3);
          ctx.lineTo(textureWidth, y - 3);
          ctx.stroke();
          ctx.strokeStyle = `rgba(0,0,0,${shadowOpacity * 1.5})`;
          ctx.lineWidth = 5;
        }
        
        // Enhanced weathering for non-white colors - MORE VISIBLE
        if (!isWhite) {
          ctx.globalAlpha = 0.12; // INCREASED opacity
          for (let i = 0; i < 75; i++) { // MORE weathering spots
            const wx = Math.random() * textureWidth;
            const wy = Math.random() * textureHeight;
            const wsize = Math.random() * 8 + 3; // LARGER spots
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)';
            ctx.fillRect(wx, wy, wsize, wsize * 0.6);
          }
          ctx.globalAlpha = 1.0;
        }
        
        console.log(`✅ ENHANCED ${wallProfile.toUpperCase()} ROOF PROFILE TEXTURE CREATED for ${panelSide} panel - MUCH MORE VISIBLE`);
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      
      // 🎯 ENHANCED TEXTURE SCALING - Based on actual roof dimensions for proper visibility
      // Use the actual roof panel length and building length for realistic scaling
      let scaleX: number;
      let scaleY: number;
      
      if (wallProfile === 'customorb') {
        // CustomOrb - finer scale but still visible
        scaleX = panelLength / 4; // Use actual panel length
        scaleY = length / 4; // Use actual building length
      } else {
        // Trimdek - larger scale for visibility
        scaleX = panelLength / 3; // Use actual panel length
        scaleY = length / 3; // Use actual building length
      }
      
      console.log(`🎯 ENHANCED TEXTURE SCALING: ${scaleX.toFixed(2)} x ${scaleY.toFixed(2)} (panel: ${panelLength.toFixed(2)}ft, length: ${length}ft)`);
      texture.repeat.set(scaleX, scaleY);
      
      return texture;
    };

    // 🎯 CREATE ENHANCED PROFILE-SPECIFIC TEXTURES for both roof panels
    console.log(`🎯 CREATING ENHANCED ${wallProfile.toUpperCase()} ROOF TEXTURES - MUCH MORE VISIBLE`);
    const leftTexture = createEnhancedRoofProfileTexture('left');
    const rightTexture = createEnhancedRoofProfileTexture('right');
    
    // 🎯 MATTE FINISH MATERIAL PROPERTIES - NO METALLIC SHINE
    const isWhite = color === '#FFFFFF';
    const isDark = ['#1F2937', '#374151', '#4B5563'].includes(color);
    
    const materialProps = isWhite ? {
      metalness: 0.1, // VERY LOW metalness - almost no shine
      roughness: 0.8, // HIGH roughness - matte finish
      envMapIntensity: 0.3, // LOW environment reflection
    } : isDark ? {
      metalness: 0.2, // LOW metalness - minimal shine
      roughness: 0.7, // HIGH roughness - matte finish
      envMapIntensity: 0.4, // LOW environment reflection
    } : {
      metalness: 0.15, // VERY LOW metalness - almost no shine
      roughness: 0.75, // HIGH roughness - matte finish
      envMapIntensity: 0.35, // LOW environment reflection
    };
    
    // 🎯 CREATE MATERIALS WITH MATTE FINISH - NO METALLIC SHINE
    const leftMaterial = new THREE.MeshStandardMaterial({
      map: leftTexture,
      ...materialProps,
      side: THREE.DoubleSide,
    });

    const rightMaterial = new THREE.MeshStandardMaterial({
      map: rightTexture,
      ...materialProps,
      side: THREE.DoubleSide,
    });
    
    console.log(`🎯 ENHANCED ROOF MATERIALS CREATED: ${wallProfile.toUpperCase()} PROFILE WITH MATTE FINISH - MUCH MORE VISIBLE`);

    // Create roof geometries with skylight cutouts ONLY where needed
    const createRoofGeometryWithCutouts = (isLeftPanel: boolean) => {
      // Filter skylights for this specific panel only
      const panelSkylights = skylights.filter(s => 
        s.panel === (isLeftPanel ? 'left' : 'right')
      );

      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel has ${panelSkylights.length} skylights`);

      if (panelSkylights.length === 0) {
        // 🎯 NO SKYLIGHTS: Use simple box geometry - ENHANCED PROFILE TEXTURE ALWAYS VISIBLE
        console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Using simple BoxGeometry - ENHANCED ${wallProfile.toUpperCase()} PROFILE TEXTURE ALWAYS VISIBLE`);
        const geometry = new THREE.BoxGeometry(panelLength, 0.2, length);
        
        // 🔧 CRITICAL: Apply proper UV mapping for enhanced profile texture on simple geometry
        const uvAttribute = geometry.attributes.uv;
        const positionAttribute = geometry.attributes.position;
        const uvArray = uvAttribute.array;
        const positionArray = positionAttribute.array;
        
        // Map UVs to show enhanced profile texture
        for (let i = 0; i < positionArray.length; i += 3) {
          const x = positionArray[i];
          const y = positionArray[i + 1];
          const z = positionArray[i + 2];
          
          const uvIndex = (i / 3) * 2;
          
          // 🎯 ENHANCED PROFILE TEXTURE: Map UV coordinates for roof profile
          uvArray[uvIndex] = (z + length/2) / length * (length/3);
          uvArray[uvIndex + 1] = (x + panelLength/2) / panelLength * (panelLength/3);
        }
        
        uvAttribute.needsUpdate = true;
        console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Applied ENHANCED ${wallProfile} profile UV mapping to BoxGeometry`);
        return geometry;
      }

      // 🎯 HAS SKYLIGHTS: Use extruded geometry with SELECTIVE cutouts - ENHANCED PROFILE TEXTURE PRESERVED
      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Using ExtrudeGeometry with ${panelSkylights.length} skylight cutouts - ENHANCED ${wallProfile.toUpperCase()} PROFILE TEXTURE PRESERVED EXCEPT IN CUTOUTS`);
      
      // Create the roof panel shape in the XY plane (will be rotated later)
      const roofShape = new THREE.Shape();
      roofShape.moveTo(-panelLength/2, -length/2);
      roofShape.lineTo(panelLength/2, -length/2);
      roofShape.lineTo(panelLength/2, length/2);
      roofShape.lineTo(-panelLength/2, length/2);
      roofShape.closePath();

      // 🔪 SELECTIVE CUTTING: Create holes ONLY for skylights on this panel
      panelSkylights.forEach(skylight => {
        const skylightHole = new THREE.Path();
        
        // Convert skylight position to roof panel coordinates
        const localX = skylight.xOffset * (panelLength / (width/2));
        const localY = skylight.yOffset;
        
        const holeWidth = skylight.width * (panelLength / (width/2));
        const holeLength = skylight.length;
        
        // Ensure skylight hole is within panel bounds
        const maxLocalX = panelLength/2 - holeWidth/2;
        const maxLocalY = length/2 - holeLength/2;
        const clampedLocalX = Math.max(-maxLocalX, Math.min(maxLocalX, localX));
        const clampedLocalY = Math.max(-maxLocalY, Math.min(maxLocalY, localY));
        
        console.log(`🔪 SELECTIVE CUT: Creating skylight hole on ${isLeftPanel ? 'left' : 'right'} panel at (${clampedLocalX.toFixed(2)}, ${clampedLocalY.toFixed(2)}) size ${holeWidth.toFixed(2)}x${holeLength.toFixed(2)}`);
        
        // Create rectangular hole ONLY where the skylight is
        skylightHole.moveTo(clampedLocalX - holeWidth/2, clampedLocalY - holeLength/2);
        skylightHole.lineTo(clampedLocalX + holeWidth/2, clampedLocalY - holeLength/2);
        skylightHole.lineTo(clampedLocalX + holeWidth/2, clampedLocalY + holeLength/2);
        skylightHole.lineTo(clampedLocalX - holeWidth/2, clampedLocalY + holeLength/2);
        skylightHole.closePath();
        
        roofShape.holes.push(skylightHole);
        console.log(`  ✂️ Added SELECTIVE hole for skylight - enhanced ${wallProfile} profile texture preserved everywhere else`);
      });

      const extrudeSettings = {
        steps: 1,
        depth: 0.2,
        bevelEnabled: false
      };

      const geometry = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
      
      // 🔧 CRITICAL: Apply proper UV mapping to extruded geometry for PRESERVED enhanced profile texture
      const uvAttribute = geometry.attributes.uv;
      const positionAttribute = geometry.attributes.position;
      const uvArray = uvAttribute.array;
      const positionArray = positionAttribute.array;
      
      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Applying ENHANCED ${wallProfile} profile UV mapping to ExtrudeGeometry with selective cutouts`);
      
      // Apply UV mapping that preserves the enhanced profile texture EVERYWHERE except in the holes
      for (let i = 0; i < positionArray.length; i += 3) {
        const x = positionArray[i];
        const y = positionArray[i + 1];
        const z = positionArray[i + 2];
        
        const uvIndex = (i / 3) * 2;
        
        // 🎯 PRESERVE ENHANCED PROFILE TEXTURE: Map UV coordinates for roof profile
        uvArray[uvIndex] = (y + length/2) / length * (length/3);
        uvArray[uvIndex + 1] = (x + panelLength/2) / panelLength * (panelLength/3);
      }
      
      // Rotate the geometry to align with the roof pitch
      geometry.rotateX(-Math.PI / 2);
      
      uvAttribute.needsUpdate = true;
      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: ENHANCED ${wallProfile} profile texture applied to ExtrudeGeometry with selective skylight cutouts`);
      return geometry;
    };
    
    // Create geometries with SELECTIVE cutouts and PRESERVED enhanced profile texture
    const leftGeometry = createRoofGeometryWithCutouts(true);
    const rightGeometry = createRoofGeometryWithCutouts(false);
    
    return { 
      leftRoofGeometry: leftGeometry,
      rightRoofGeometry: rightGeometry,
      leftRoofMaterial: leftMaterial, 
      rightRoofMaterial: rightMaterial 
    };
  }, [color, length, width, panelLength, skylights, wallProfile]);

  const skylightMaterial = new THREE.MeshPhysicalMaterial({
    color: '#FFFFFF',
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.9,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  });

  const createSkylight = (skylight: Skylight, isLeftPanel: boolean) => {
    // Only create skylight if it belongs to this panel
    if (skylight.panel !== (isLeftPanel ? 'left' : 'right')) {
      return null;
    }

    const skylightWidth = skylight.width;
    const skylightLength = skylight.length;
    
    // Calculate position in roof panel coordinates
    const localX = skylight.xOffset * (panelLength / (width/2));
    const localY = skylight.yOffset;
    
    // Position the skylight to sit flush in the cutout
    const skylightX = localX;
    const skylightY = 0.05; // Slightly above the roof surface to prevent z-fighting
    const skylightZ = localY;
    
    return (
      <mesh
        key={`${isLeftPanel ? 'left' : 'right'}-${skylight.xOffset}-${skylight.yOffset}`}
        position={[skylightX, skylightY, skylightZ]}
        rotation={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[skylightWidth * (panelLength / (width/2)), 0.1, skylightLength]} />
        <primitive object={skylightMaterial} attach="material" />
      </mesh>
    );
  };
  
  return (
    <group position={[0, height, 0]}>
      {/* Left roof panel with ENHANCED PROFILE-SPECIFIC MATTE FINISH */}
      <group 
        position={[-width / 4, roofHeight / 2, 0]}
        rotation={[0, 0, pitchAngle]}
      >
        <mesh castShadow receiveShadow>
          <primitive object={leftRoofGeometry} />
          <primitive object={leftRoofMaterial} attach="material" />
        </mesh>
        
        {/* Skylights positioned in the cutouts for left panel */}
        {skylights
          .filter(s => s.panel === 'left')
          .map(s => createSkylight(s, true))
          .filter(Boolean)
        }
      </group>
      
      {/* Right roof panel with ENHANCED PROFILE-SPECIFIC MATTE FINISH */}
      <group
        position={[width / 4, roofHeight / 2, 0]}
        rotation={[0, 0, -pitchAngle]}
      >
        <mesh castShadow receiveShadow>
          <primitive object={rightRoofGeometry} />
          <primitive object={rightRoofMaterial} attach="material" />
        </mesh>
        
        {/* Skylights positioned in the cutouts for right panel */}
        {skylights
          .filter(s => s.panel === 'right')
          .map(s => createSkylight(s, false))
          .filter(Boolean)
        }
      </group>
      
      {/* Ridge cap with ENHANCED PROFILE-SPECIFIC MATTE FINISH */}
      <mesh 
        position={[0, roofHeight, 0]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[0.4, 0.3, length]} />
        <meshStandardMaterial 
          color={color} 
          metalness={color === '#FFFFFF' ? 0.1 : ['#1F2937', '#374151', '#4B5563'].includes(color) ? 0.2 : 0.15}
          roughness={color === '#FFFFFF' ? 0.8 : ['#1F2937', '#374151', '#4B5563'].includes(color) ? 0.7 : 0.75}
          envMapIntensity={color === '#FFFFFF' ? 0.3 : ['#1F2937', '#374151', '#4B5563'].includes(color) ? 0.4 : 0.35}
        />
      </mesh>
    </group>
  );
};

export default Roof;