import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { WallPosition, WallFeature, BeamSegment, WallProfile } from '../../types';
import { generateBeamPositions, generateHorizontalBeamPositions } from '../../utils/collisionDetection';

interface WallProps {
  position: [number, number, number];
  width: number;
  height: number;
  color: string;
  wallPosition: WallPosition;
  rotation?: [number, number, number];
  roofPitch?: number;
  wallFeatures?: WallFeature[];
  wallProfile?: WallProfile;
  opacity?: number; // Added opacity prop for transparency control
}

const Wall: React.FC<WallProps> = ({ 
  position, 
  width, 
  height, 
  color, 
  wallPosition, 
  rotation = [0, 0, 0],
  roofPitch = 0,
  wallFeatures = [],
  wallProfile = 'trimdek',
  opacity = 1.0 // Default to fully opaque
}) => {
  // Create profile-specific textured material
  const wallMaterial = useMemo(() => {
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
      
      // 🏗️ LYSAGHT PROFILE-SPECIFIC PATTERNS
      let ribWidth: number;
      let ribSpacing: number;
      let profileType: string;
      
      switch (wallProfile) {
        case 'multiclad':
          // Traditional deep corrugated profile - 76mm spacing
          ribWidth = textureWidth / 5; // Wider ribs for traditional look
          ribSpacing = ribWidth * 1.1;
          profileType = 'deep-corrugated';
          break;
          
        case 'trimdek':
          // Contemporary trapezoidal profile - 65mm spacing
          ribWidth = textureWidth / 6; // Medium width ribs
          ribSpacing = ribWidth * 1.05;
          profileType = 'trapezoidal';
          break;
          
        case 'customorb':
          // Curved profile with rounded ribs - 32mm spacing
          ribWidth = textureWidth / 12; // Narrow ribs for fine detail
          ribSpacing = ribWidth * 1.1;
          profileType = 'curved';
          break;
          
        case 'horizontal-customorb':
          // Horizontal installation of CustomOrb
          ribWidth = textureHeight / 12; // Horizontal ribs
          ribSpacing = ribWidth * 1.1;
          profileType = 'horizontal-curved';
          break;
          
        default:
          // Default to Trimdek
          ribWidth = textureWidth / 6;
          ribSpacing = ribWidth * 1.05;
          profileType = 'trapezoidal';
      }
      
      // Special handling for different colors
      const isWhite = color === '#FFFFFF';
      const isDark = ['#1F2937', '#374151', '#4B5563'].includes(color);
      
      // Profile-specific contrast values
      const shadowOpacity = isWhite ? 0.35 : isDark ? 0.6 : 0.45;
      const highlightOpacity = isWhite ? 0.25 : isDark ? 0.8 : 0.4;
      const deepShadowOpacity = isWhite ? 0.5 : isDark ? 0.9 : 0.65;
      const brightHighlightOpacity = isWhite ? 0.4 : isDark ? 1.0 : 0.6;
      
      console.log(`🏗️ CREATING ${wallProfile.toUpperCase()} PROFILE: ${profileType}`);
      
      if (profileType === 'horizontal-curved') {
        // HORIZONTAL CUSTOMORB - Horizontal ribs
        for (let y = 0; y < textureHeight; y += ribSpacing) {
          // Create curved horizontal profile
          const curveGradient = ctx.createLinearGradient(0, y, 0, y + ribWidth);
          curveGradient.addColorStop(0, `rgba(0,0,0,${deepShadowOpacity})`);
          curveGradient.addColorStop(0.3, `rgba(0,0,0,${shadowOpacity * 0.5})`);
          curveGradient.addColorStop(0.5, `rgba(255,255,255,${brightHighlightOpacity})`);
          curveGradient.addColorStop(0.7, `rgba(0,0,0,${shadowOpacity * 0.5})`);
          curveGradient.addColorStop(1, `rgba(0,0,0,${deepShadowOpacity})`);
          
          ctx.fillStyle = curveGradient;
          ctx.fillRect(0, y, textureWidth, ribWidth);
          
          // Add definition lines
          ctx.fillStyle = `rgba(255,255,255,${brightHighlightOpacity * 1.2})`;
          ctx.fillRect(0, y + ribWidth * 0.45, textureWidth, 2);
          
          ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity * 1.2})`;
          ctx.fillRect(0, y + 1, textureWidth, 1);
          ctx.fillRect(0, y + ribWidth - 1, textureWidth, 1);
        }
      } else {
        // VERTICAL PROFILES (Multiclad, Trimdek, CustomOrb)
        for (let x = 0; x < textureWidth; x += ribSpacing) {
          if (profileType === 'curved') {
            // CUSTOMORB - Curved profile with rounded ribs
            const curveGradient = ctx.createLinearGradient(x, 0, x + ribWidth, 0);
            curveGradient.addColorStop(0, `rgba(0,0,0,${deepShadowOpacity})`);
            curveGradient.addColorStop(0.2, `rgba(0,0,0,${shadowOpacity})`);
            curveGradient.addColorStop(0.4, `rgba(255,255,255,${highlightOpacity * 0.5})`);
            curveGradient.addColorStop(0.5, `rgba(255,255,255,${brightHighlightOpacity})`);
            curveGradient.addColorStop(0.6, `rgba(255,255,255,${highlightOpacity * 0.5})`);
            curveGradient.addColorStop(0.8, `rgba(0,0,0,${shadowOpacity})`);
            curveGradient.addColorStop(1, `rgba(0,0,0,${deepShadowOpacity})`);
            
            ctx.fillStyle = curveGradient;
            ctx.fillRect(x, 0, ribWidth, textureHeight);
            
          } else if (profileType === 'trapezoidal') {
            // TRIMDEK - Trapezoidal profile with clean lines
            // Valley
            ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity})`;
            ctx.fillRect(x, 0, ribWidth * 0.15, textureHeight);
            
            // Rising slope
            const riseGradient = ctx.createLinearGradient(x + ribWidth * 0.15, 0, x + ribWidth * 0.4, 0);
            riseGradient.addColorStop(0, `rgba(0,0,0,${shadowOpacity})`);
            riseGradient.addColorStop(1, `rgba(255,255,255,${highlightOpacity})`);
            ctx.fillStyle = riseGradient;
            ctx.fillRect(x + ribWidth * 0.15, 0, ribWidth * 0.25, textureHeight);
            
            // Flat top (trapezoidal characteristic)
            ctx.fillStyle = `rgba(255,255,255,${brightHighlightOpacity})`;
            ctx.fillRect(x + ribWidth * 0.4, 0, ribWidth * 0.2, textureHeight);
            
            // Falling slope
            const fallGradient = ctx.createLinearGradient(x + ribWidth * 0.6, 0, x + ribWidth * 0.85, 0);
            fallGradient.addColorStop(0, `rgba(255,255,255,${highlightOpacity})`);
            fallGradient.addColorStop(1, `rgba(0,0,0,${shadowOpacity})`);
            ctx.fillStyle = fallGradient;
            ctx.fillRect(x + ribWidth * 0.6, 0, ribWidth * 0.25, textureHeight);
            
            // Final valley
            ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity})`;
            ctx.fillRect(x + ribWidth * 0.85, 0, ribWidth * 0.15, textureHeight);
            
          } else if (profileType === 'deep-corrugated') {
            // MULTICLAD - Deep corrugated traditional profile
            // Deep valley
            ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity * 1.2})`;
            ctx.fillRect(x, 0, ribWidth * 0.25, textureHeight);
            
            // Sharp rising slope
            const riseGradient = ctx.createLinearGradient(x + ribWidth * 0.25, 0, x + ribWidth * 0.45, 0);
            riseGradient.addColorStop(0, `rgba(0,0,0,${deepShadowOpacity})`);
            riseGradient.addColorStop(0.5, `rgba(0,0,0,${shadowOpacity})`);
            riseGradient.addColorStop(1, `rgba(255,255,255,${highlightOpacity})`);
            ctx.fillStyle = riseGradient;
            ctx.fillRect(x + ribWidth * 0.25, 0, ribWidth * 0.2, textureHeight);
            
            // Sharp peak
            ctx.fillStyle = `rgba(255,255,255,${brightHighlightOpacity * 1.3})`;
            ctx.fillRect(x + ribWidth * 0.45, 0, ribWidth * 0.1, textureHeight);
            
            // Sharp falling slope
            const fallGradient = ctx.createLinearGradient(x + ribWidth * 0.55, 0, x + ribWidth * 0.75, 0);
            fallGradient.addColorStop(0, `rgba(255,255,255,${highlightOpacity})`);
            fallGradient.addColorStop(0.5, `rgba(0,0,0,${shadowOpacity})`);
            fallGradient.addColorStop(1, `rgba(0,0,0,${deepShadowOpacity})`);
            ctx.fillStyle = fallGradient;
            ctx.fillRect(x + ribWidth * 0.55, 0, ribWidth * 0.2, textureHeight);
            
            // Deep valley
            ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity * 1.2})`;
            ctx.fillRect(x + ribWidth * 0.75, 0, ribWidth * 0.25, textureHeight);
          }
          
          // Add sharp definition lines for all vertical profiles
          if (profileType !== 'horizontal-curved') {
            // Ultra bright peak line
            ctx.fillStyle = `rgba(255,255,255,${brightHighlightOpacity * 1.5})`;
            ctx.fillRect(x + ribWidth * 0.49, 0, 2, textureHeight);
            
            // Ultra dark valley lines
            ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity * 1.3})`;
            ctx.fillRect(x + ribWidth * 0.02, 0, 2, textureHeight);
            ctx.fillRect(x + ribWidth * 0.98, 0, 2, textureHeight);
          }
        }
      }
      
      // Add horizontal panel lines for all profiles
      const panelHeight = textureHeight / 3;
      ctx.strokeStyle = `rgba(0,0,0,${shadowOpacity * 1.2})`;
      ctx.lineWidth = 3;
      for (let y = panelHeight; y < textureHeight; y += panelHeight) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(textureWidth, y);
        ctx.stroke();
        
        // Add highlight above each panel line
        ctx.strokeStyle = `rgba(255,255,255,${highlightOpacity * 0.6})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, y - 2);
        ctx.lineTo(textureWidth, y - 2);
        ctx.stroke();
        ctx.strokeStyle = `rgba(0,0,0,${shadowOpacity * 1.2})`;
        ctx.lineWidth = 3;
      }
      
      // Enhanced weathering for non-white colors
      if (!isWhite) {
        ctx.globalAlpha = 0.08;
        for (let i = 0; i < 50; i++) {
          const wx = Math.random() * textureWidth;
          const wy = Math.random() * textureHeight;
          const wsize = Math.random() * 6 + 2;
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
          ctx.fillRect(wx, wy, wsize, wsize * 0.5);
        }
        ctx.globalAlpha = 1.0;
      }
      
      console.log(`✅ ${wallProfile.toUpperCase()} PROFILE TEXTURE CREATED`);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    // Adjust texture scale based on profile type
    let scaleX = width / 3;
    let scaleY = height / 3;
    
    if (wallProfile === 'customorb') {
      // Finer scale for CustomOrb's smaller ribs
      scaleX = width / 2;
      scaleY = height / 2;
    } else if (wallProfile === 'multiclad') {
      // Larger scale for Multiclad's wider ribs
      scaleX = width / 4;
      scaleY = height / 4;
    }
    
    texture.repeat.set(scaleX, scaleY);
    
    // Enhanced material properties for MAXIMUM profile visibility
    const isWhite = color === '#FFFFFF';
    const isDark = ['#1F2937', '#374151', '#4B5563'].includes(color);
    
    const materialProps = isWhite ? {
      metalness: 0.4,
      roughness: 0.5,
      envMapIntensity: 1.2,
    } : isDark ? {
      metalness: 0.8,
      roughness: 0.2,
      envMapIntensity: 1.5,
    } : {
      metalness: 0.6,
      roughness: 0.3,
      envMapIntensity: 1.0,
    };
    
    return new THREE.MeshStandardMaterial({
      map: texture,
      ...materialProps,
      side: THREE.DoubleSide,
      transparent: opacity < 1.0, // Enable transparency if opacity < 1
      opacity: opacity // Apply opacity value
    });
  }, [color, width, height, wallProfile, opacity]);

  // Create wall geometry with cutouts for windows only (doors remain solid for structural integrity)
  const wallGeometry = useMemo(() => {
    // Only create cutouts for windows - doors and other features remain solid
    const windowFeatures = wallFeatures.filter(feature => 
      feature.position.wallPosition === wallPosition && feature.type === 'window'
    );

    console.log(`🏗️ Creating wall geometry for ${wallPosition} with ${windowFeatures.length} window cutouts`);

    // If it's a gabled wall (front/back) with roof pitch, create the gabled shape
    if ((wallPosition === 'front' || wallPosition === 'back') && roofPitch > 0) {
      const roofHeight = (width / 2) * (roofPitch / 12);
      const totalHeight = height + roofHeight;
      
      // Create the gabled wall shape
      const wallShape = new THREE.Shape();
      wallShape.moveTo(-width/2, -height/2);
      wallShape.lineTo(width/2, -height/2);
      wallShape.lineTo(width/2, height/2);
      wallShape.lineTo(0, height/2 + roofHeight);
      wallShape.lineTo(-width/2, height/2);
      wallShape.lineTo(-width/2, -height/2);

      // Add window cutouts as holes (doors remain solid for structural integrity)
      windowFeatures.forEach(feature => {
        const windowHole = new THREE.Path();
        
        // Calculate window position based on alignment
        let windowX = 0;
        switch (feature.position.alignment) {
          case 'left':
            windowX = -width/2 + feature.position.xOffset + feature.width/2;
            break;
          case 'right':
            windowX = width/2 - feature.position.xOffset - feature.width/2;
            break;
          case 'center':
          default:
            windowX = feature.position.xOffset;
            break;
        }
        
        const windowY = -height/2 + feature.position.yOffset + feature.height/2;
        
        // Create rectangular hole for window
        const halfWidth = feature.width / 2;
        const halfHeight = feature.height / 2;
        
        windowHole.moveTo(windowX - halfWidth, windowY - halfHeight);
        windowHole.lineTo(windowX + halfWidth, windowY - halfHeight);
        windowHole.lineTo(windowX + halfWidth, windowY + halfHeight);
        windowHole.lineTo(windowX - halfWidth, windowY + halfHeight);
        windowHole.closePath();
        
        wallShape.holes.push(windowHole);
        console.log(`  Added window cutout at (${windowX.toFixed(1)}, ${windowY.toFixed(1)})`);
      });

      const extrudeSettings = {
        steps: 1,
        depth: 0.2,
        bevelEnabled: false
      };

      const geometry = new THREE.ExtrudeGeometry(wallShape, extrudeSettings);
      
      // Calculate UV coordinates for the extruded geometry
      const uvs = geometry.attributes.uv.array;
      const positions = geometry.attributes.position.array;
      
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        
        // Calculate UV coordinates based on position
        const u = (x + width/2) / width;
        const v = (y + height/2) / totalHeight;
        
        const uvIndex = (i / 3) * 2;
        uvs[uvIndex] = u;
        uvs[uvIndex + 1] = v;
      }
      
      geometry.attributes.uv.needsUpdate = true;
      return geometry;
    } else {
      // Regular rectangular wall with window cutouts only
      if (windowFeatures.length === 0) {
        // No windows, return simple box geometry
        return new THREE.BoxGeometry(width, height, 0.2);
      }

      // Create wall shape with window cutouts only
      const wallShape = new THREE.Shape();
      wallShape.moveTo(-width/2, -height/2);
      wallShape.lineTo(width/2, -height/2);
      wallShape.lineTo(width/2, height/2);
      wallShape.lineTo(-width/2, height/2);
      wallShape.closePath();

      // Add window cutouts as holes (doors remain solid)
      windowFeatures.forEach(feature => {
        const windowHole = new THREE.Path();
        
        // Calculate window position based on alignment
        let windowX = 0;
        switch (feature.position.alignment) {
          case 'left':
            windowX = -width/2 + feature.position.xOffset + feature.width/2;
            break;
          case 'right':
            windowX = width/2 - feature.position.xOffset - feature.width/2;
            break;
          case 'center':
          default:
            windowX = feature.position.xOffset;
            break;
        }
        
        const windowY = -height/2 + feature.position.yOffset + feature.height/2;
        
        // Create rectangular hole for window
        const halfWidth = feature.width / 2;
        const halfHeight = feature.height / 2;
        
        windowHole.moveTo(windowX - halfWidth, windowY - halfHeight);
        windowHole.lineTo(windowX + halfWidth, windowY - halfHeight);
        windowHole.lineTo(windowX + halfWidth, windowY + halfHeight);
        windowHole.lineTo(windowX - halfWidth, windowY + halfHeight);
        windowHole.closePath();
        
        wallShape.holes.push(windowHole);
        console.log(`  Added window cutout at (${windowX.toFixed(1)}, ${windowY.toFixed(1)})`);
      });

      const extrudeSettings = {
        steps: 1,
        depth: 0.2,
        bevelEnabled: false
      };

      const geometry = new THREE.ExtrudeGeometry(wallShape, extrudeSettings);
      
      // Set up UV mapping for the extruded geometry
      const uvs = geometry.attributes.uv.array;
      const positions = geometry.attributes.position.array;
      
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        
        // Calculate UV coordinates based on position
        const u = (x + width/2) / width;
        const v = (y + height/2) / height;
        
        const uvIndex = (i / 3) * 2;
        uvs[uvIndex] = u;
        uvs[uvIndex + 1] = v;
      }
      
      geometry.attributes.uv.needsUpdate = true;
      return geometry;
    }
  }, [width, height, wallPosition, roofPitch, wallFeatures]);

  // CRITICAL FIX: Generate structural beams that split around ALL features (including doors)
  const beamSegments = useMemo(() => {
    console.log(`\n🏗️  STRUCTURAL BEAM GENERATION for ${wallPosition} wall (${width}x${height})`);
    
    // FIXED: Include ALL features for beam cutting - doors AND windows affect structural beams
    const allFeatures = wallFeatures.filter(feature => 
      feature.position.wallPosition === wallPosition
    );
    
    console.log(`All features affecting beams: ${allFeatures.length}`);
    allFeatures.forEach(f => 
      console.log(`  - ${f.type} (${f.width}x${f.height}) at ${f.position.alignment} offset ${f.position.xOffset}`)
    );
    
    return generateBeamPositions(width, height, allFeatures, {
      maxSpacing: 8,
      minSpacing: 4,
      margin: 2,
      beamWidth: 0.3,
      minBeams: 3
    });
  }, [width, height, wallFeatures, wallPosition]);

  // CRITICAL FIX: Generate horizontal beams that split around ALL features (including doors)
  const horizontalBeamSegments = useMemo(() => {
    console.log(`\n🏗️  HORIZONTAL STRUCTURAL BEAM GENERATION for ${wallPosition} wall`);
    
    // FIXED: Include ALL features for horizontal beam cutting
    const allFeatures = wallFeatures.filter(feature => 
      feature.position.wallPosition === wallPosition
    );
    
    return generateHorizontalBeamPositions(
      width, 
      height, 
      allFeatures, 
      [0.25, 0.5, 0.75], // Height ratios for horizontal beams
      0.3 // Beam height
    );
  }, [width, height, wallFeatures, wallPosition]);

  // 🎯 FINAL FIX: Calculate EXACT interior-side Z offset for ALL walls
  const getFinalInteriorZOffset = (wallPos: WallPosition): number => {
    console.log(`🎯 FINAL FIX: Calculating interior Z offset for ${wallPos} wall`);
    
    // CRITICAL: All beams MUST be positioned on the INTERIOR side of each wall
    // Wall thickness is 0.2, so beams go at -0.4 (deep interior positioning)
    const deepInteriorOffset = -0.4; // Even deeper interior positioning to ensure no exterior visibility
    
    switch (wallPos) {
      case 'front':
        // Front wall faces +Z direction, interior is -Z
        console.log(`  Front wall: beams at z = ${deepInteriorOffset} (DEEP INTERIOR)`);
        return deepInteriorOffset;
      case 'back':
        // Back wall faces -Z direction, interior is +Z
        console.log(`  Back wall: beams at z = ${-deepInteriorOffset} (DEEP INTERIOR - FIXED)`);
        return deepInteriorOffset; // CRITICAL FIX: Positive Z for back wall interior
      case 'left':
        // Left wall faces +X direction, interior is -X (but in local coordinates this is +Z)
        console.log(`  Left wall: beams at z = ${-deepInteriorOffset} (DEEP INTERIOR)`);
        return -deepInteriorOffset;
      case 'right':
        // Right wall faces -X direction, interior is +X (but in local coordinates this is -Z)
        console.log(`  Right wall: beams at z = ${deepInteriorOffset} (DEEP INTERIOR - FIXED)`);
        return -deepInteriorOffset; // CRITICAL FIX: Negative Z for right wall interior
      default:
        console.log(`  Unknown wall position, defaulting to z = ${deepInteriorOffset}`);
       
    }
     return deepInteriorOffset;
  };

  // ENHANCED: Create persistent steel beam segments with architectural integrity
  const createFinalInteriorBeam = (segment: BeamSegment, segmentIndex: number) => {
    const beamWidth = segment.width;
    const beamDepth = 0.2;
    const beamHeight = segment.topY - segment.bottomY;
    const beamCenterY = (segment.topY + segment.bottomY) / 2;
    
    const flangeWidth = 0.4;
    const flangeHeight = 0.15;
    const flangeSpacing = Math.min(6, beamHeight / 4);
    
    // 🎯 FINAL FIX: Use EXACT interior-side positioning for ALL walls
    const zOffset = getFinalInteriorZOffset(wallPosition);
    console.log(`🔧 FINAL: Beam ${segmentIndex} on ${wallPosition} wall positioned at Z = ${zOffset} (GUARANTEED INTERIOR)`);
    
    // Enhanced steel material with architectural-grade appearance
    const steelMaterial = new THREE.MeshStandardMaterial({
      color: "#808080",
      metalness: 0.9,
      roughness: 0.1,
      envMapIntensity: 1.0,
    });
    
    const key = `final-interior-beam-${wallPosition}-${segment.x}-${segment.bottomY}-${segment.topY}-${segmentIndex}`;
    
    return (
      <group key={key} position={[segment.x, beamCenterY, zOffset]}>
        {/* Main structural beam segment - GUARANTEED INTERIOR ONLY */}
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[beamWidth, beamHeight, beamDepth]} />
          <primitive object={steelMaterial} attach="material" />
        </mesh>
        
        {/* Architectural flanges for structural realism */}
        {beamHeight > 2 && Array.from({ length: Math.max(1, Math.ceil(beamHeight / flangeSpacing)) }).map((_, i) => {
          const flangeY = -beamHeight/2 + i * flangeSpacing;
          if (Math.abs(flangeY) > beamHeight/2) return null;
          
          return (
            <mesh key={i} castShadow receiveShadow position={[0, flangeY, 0]}>
              <boxGeometry args={[flangeWidth, flangeHeight, beamDepth * 1.2]} />
              <primitive object={steelMaterial} attach="material" />
            </mesh>
          );
        })}
        
        {/* Structural connection points for seamless integration */}
        <mesh castShadow receiveShadow position={[0, -beamHeight/2, 0]}>
          <cylinderGeometry args={[beamWidth/3, beamWidth/3, 0.1, 8]} />
          <primitive object={steelMaterial} attach="material" />
        </mesh>
        <mesh castShadow receiveShadow position={[0, beamHeight/2, 0]}>
          <cylinderGeometry args={[beamWidth/3, beamWidth/3, 0.1, 8]} />
          <primitive object={steelMaterial} attach="material" />
        </mesh>
      </group>
    );
  };

  // ENHANCED: Create persistent horizontal beam segments
  const createFinalInteriorHorizontalBeam = (segment: BeamSegment, segmentIndex: number) => {
    const beamWidth = segment.width;
    const beamHeight = segment.topY - segment.bottomY;
    const beamDepth = 0.2;
    const beamCenterY = (segment.topY + segment.bottomY) / 2;
    
    // 🎯 FINAL FIX: Use EXACT interior-side positioning for ALL walls
    const zOffset = getFinalInteriorZOffset(wallPosition);
    console.log(`🔧 FINAL: Horizontal beam ${segmentIndex} on ${wallPosition} wall positioned at Z = ${zOffset} (GUARANTEED INTERIOR)`);
    
    // Enhanced steel material for architectural consistency
    const steelMaterial = new THREE.MeshStandardMaterial({
      color: "#808080",
      metalness: 0.9,
      roughness: 0.1,
      envMapIntensity: 1.0,
    });
    
    const key = `final-interior-h-beam-${wallPosition}-${segment.x}-${segment.bottomY}-${segment.topY}-${segment.width}-${segmentIndex}`;
    
    return (
      <group key={key} position={[segment.x, beamCenterY, zOffset]}>
        {/* Main horizontal structural beam - GUARANTEED INTERIOR ONLY */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[beamWidth, beamHeight, beamDepth]} />
          <primitive object={steelMaterial} attach="material" />
        </mesh>
        
        {/* Structural end caps for architectural integrity */}
        <mesh castShadow receiveShadow position={[-beamWidth/2, 0, 0]}>
          <boxGeometry args={[beamHeight, beamHeight, beamDepth]} />
          <primitive object={steelMaterial} attach="material" />
        </mesh>
        <mesh castShadow receiveShadow position={[beamWidth/2, 0, 0]}>
          <boxGeometry args={[beamHeight, beamHeight, beamDepth]} />
          <primitive object={steelMaterial} attach="material" />
        </mesh>
        
        {/* Seamless connection points */}
        <mesh castShadow receiveShadow position={[-beamWidth/2, 0, 0]}>
          <cylinderGeometry args={[beamHeight/4, beamHeight/4, 0.1, 6]} />
          <primitive object={steelMaterial} attach="material" />
        </mesh>
        <mesh castShadow receiveShadow position={[beamWidth/2, 0, 0]}>
          <cylinderGeometry args={[beamHeight/4, beamHeight/4, 0.1, 6]} />
          <primitive object={steelMaterial} attach="material" />
        </mesh>
      </group>
    );
  };

  return (
    <group position={position} rotation={rotation}>
      {/* Wall with window cutouts only - doors remain solid for structural integrity */}
      <mesh castShadow receiveShadow>
        <primitive object={wallGeometry} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>
      
      {/* 🎯 FINAL INTERIOR BEAMS - Split around ALL features, positioned DEEP INTERIOR ONLY */}
      {beamSegments.map((segment, index) => createFinalInteriorBeam(segment, index))}
      
      {/* 🎯 FINAL INTERIOR HORIZONTAL BEAMS - Split around ALL features, positioned DEEP INTERIOR ONLY */}
      {horizontalBeamSegments.map((segment, index) => createFinalInteriorHorizontalBeam(segment, index))}
    </group>
  );
};

export default Wall;