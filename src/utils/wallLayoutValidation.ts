import type { BuildingDimensions } from '../types';

export interface WallSegment {
  id: string;
  name: string;
  width: number; // in feet
  thickness: number; // in feet
  position: number; // distance from left edge in feet
  type: 'exterior' | 'interior' | 'partition';
}

export interface WallGap {
  id: string;
  width: number; // in feet
  position: number; // distance from left edge in feet
  purpose: 'doorway' | 'passage' | 'spacing';
}

export interface WallLayout {
  roomWidth: number; // total available width in feet
  roomLength: number; // total available length in feet
  wallSegments: WallSegment[];
  gaps: WallGap[];
  totalUsedWidth: number;
  remainingSpace: number;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface WallLayoutValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  layout: WallLayout;
  measurements: {
    totalWallWidth: number;
    totalGapWidth: number;
    usedSpace: number;
    remainingSpace: number;
    utilizationPercentage: number;
  };
}

/**
 * Converts feet to feet and inches display format
 */
export const formatFeetAndInches = (feet: number): string => {
  const wholeFeet = Math.floor(feet);
  const inches = Math.round((feet - wholeFeet) * 12);
  
  if (inches === 0) {
    return `${wholeFeet}'`;
  } else if (inches === 12) {
    return `${wholeFeet + 1}'`;
  } else {
    return `${wholeFeet}' ${inches}"`;
  }
};

/**
 * Calculates the total width used by wall segments and gaps
 */
export const calculateTotalUsedWidth = (
  wallSegments: WallSegment[],
  gaps: WallGap[]
): number => {
  const wallWidth = wallSegments.reduce((sum, wall) => sum + wall.width, 0);
  const gapWidth = gaps.reduce((sum, gap) => sum + gap.width, 0);
  return wallWidth + gapWidth;
};

/**
 * Validates wall segment positioning and spacing
 */
export const validateWallPositioning = (
  wallSegments: WallSegment[],
  gaps: WallGap[],
  roomWidth: number
): { valid: boolean; errors: string[]; warnings: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Sort segments and gaps by position
  const sortedSegments = [...wallSegments].sort((a, b) => a.position - b.position);
  const sortedGaps = [...gaps].sort((a, b) => a.position - b.position);

  // Check for overlapping wall segments
  for (let i = 0; i < sortedSegments.length - 1; i++) {
    const current = sortedSegments[i];
    const next = sortedSegments[i + 1];
    const currentEnd = current.position + current.width;
    
    if (currentEnd > next.position) {
      errors.push(`Wall segments "${current.name}" and "${next.name}" overlap by ${formatFeetAndInches(currentEnd - next.position)}`);
    }
  }

  // Check if any wall extends beyond room width
  sortedSegments.forEach(segment => {
    if (segment.position < 0) {
      errors.push(`Wall segment "${segment.name}" extends ${formatFeetAndInches(Math.abs(segment.position))} beyond left edge`);
    }
    
    const segmentEnd = segment.position + segment.width;
    if (segmentEnd > roomWidth) {
      errors.push(`Wall segment "${segment.name}" extends ${formatFeetAndInches(segmentEnd - roomWidth)} beyond right edge`);
    }
  });

  // Check gap positioning
  sortedGaps.forEach(gap => {
    if (gap.position < 0) {
      errors.push(`Gap "${gap.id}" extends ${formatFeetAndInches(Math.abs(gap.position))} beyond left edge`);
    }
    
    const gapEnd = gap.position + gap.width;
    if (gapEnd > roomWidth) {
      errors.push(`Gap "${gap.id}" extends ${formatFeetAndInches(gapEnd - roomWidth)} beyond right edge`);
    }
  });

  // Warning for tight spacing
  const totalUsed = calculateTotalUsedWidth(wallSegments, gaps);
  const utilizationPercentage = (totalUsed / roomWidth) * 100;
  
  if (utilizationPercentage > 90) {
    warnings.push(`High space utilization (${utilizationPercentage.toFixed(1)}%) - consider reducing wall count or widths`);
  }

  return { valid: errors.length === 0, errors, warnings };
};

/**
 * Creates a default wall layout for a room
 */
export const createDefaultWallLayout = (
  roomWidth: number,
  roomLength: number
): WallLayout => {
  const exteriorWallThickness = 0.67; // 8 inches
  const interiorWallThickness = 0.33; // 4 inches
  
  // Create basic wall segments with proper spacing
  const wallSegments: WallSegment[] = [
    {
      id: 'exterior-left',
      name: 'Left Exterior Wall',
      width: exteriorWallThickness,
      thickness: exteriorWallThickness,
      position: 0,
      type: 'exterior'
    },
    {
      id: 'interior-1',
      name: 'Interior Wall 1',
      width: interiorWallThickness,
      thickness: interiorWallThickness,
      position: roomWidth * 0.25,
      type: 'interior'
    },
    {
      id: 'interior-2',
      name: 'Interior Wall 2',
      width: interiorWallThickness,
      thickness: interiorWallThickness,
      position: roomWidth * 0.5,
      type: 'interior'
    },
    {
      id: 'interior-3',
      name: 'Interior Wall 3',
      width: interiorWallThickness,
      thickness: interiorWallThickness,
      position: roomWidth * 0.75,
      type: 'interior'
    },
    {
      id: 'exterior-right',
      name: 'Right Exterior Wall',
      width: exteriorWallThickness,
      thickness: exteriorWallThickness,
      position: roomWidth - exteriorWallThickness,
      type: 'exterior'
    }
  ];

  // Create gaps between walls
  const gaps: WallGap[] = [
    {
      id: 'gap-1',
      width: roomWidth * 0.25 - exteriorWallThickness,
      position: exteriorWallThickness,
      purpose: 'spacing'
    },
    {
      id: 'gap-2',
      width: roomWidth * 0.25 - interiorWallThickness,
      position: roomWidth * 0.25 + interiorWallThickness,
      purpose: 'spacing'
    },
    {
      id: 'gap-3',
      width: roomWidth * 0.25 - interiorWallThickness,
      position: roomWidth * 0.5 + interiorWallThickness,
      purpose: 'spacing'
    },
    {
      id: 'gap-4',
      width: roomWidth * 0.25 - interiorWallThickness - exteriorWallThickness,
      position: roomWidth * 0.75 + interiorWallThickness,
      purpose: 'spacing'
    }
  ];

  const totalUsedWidth = calculateTotalUsedWidth(wallSegments, gaps);
  const remainingSpace = roomWidth - totalUsedWidth;

  return {
    roomWidth,
    roomLength,
    wallSegments,
    gaps,
    totalUsedWidth,
    remainingSpace,
    valid: remainingSpace >= 0,
    errors: remainingSpace < 0 ? ['Wall configuration exceeds room width'] : [],
    warnings: []
  };
};

/**
 * Validates a complete wall layout configuration
 */
export const validateWallLayout = (
  wallSegments: WallSegment[],
  gaps: WallGap[],
  roomWidth: number,
  roomLength: number
): WallLayoutValidationResult => {
  console.log(`\n🏗️ WALL LAYOUT VALIDATION`);
  console.log(`Room dimensions: ${formatFeetAndInches(roomWidth)} × ${formatFeetAndInches(roomLength)}`);
  console.log(`Wall segments: ${wallSegments.length}`);
  console.log(`Gaps: ${gaps.length}`);

  const errors: string[] = [];
  const warnings: string[] = [];

  // Calculate total widths
  const totalWallWidth = wallSegments.reduce((sum, wall) => sum + wall.width, 0);
  const totalGapWidth = gaps.reduce((sum, gap) => sum + gap.width, 0);
  const usedSpace = totalWallWidth + totalGapWidth;
  const remainingSpace = roomWidth - usedSpace;
  const utilizationPercentage = (usedSpace / roomWidth) * 100;

  console.log(`Total wall width: ${formatFeetAndInches(totalWallWidth)}`);
  console.log(`Total gap width: ${formatFeetAndInches(totalGapWidth)}`);
  console.log(`Used space: ${formatFeetAndInches(usedSpace)}`);
  console.log(`Remaining space: ${formatFeetAndInches(remainingSpace)}`);

  // Primary validation: Check if total width exceeds room width
  if (usedSpace > roomWidth) {
    errors.push(`Error: Wall configuration exceeds room width by ${formatFeetAndInches(usedSpace - roomWidth)}`);
    errors.push(`Total wall width (${formatFeetAndInches(totalWallWidth)}) + gaps (${formatFeetAndInches(totalGapWidth)}) = ${formatFeetAndInches(usedSpace)} > room width (${formatFeetAndInches(roomWidth)})`);
  }

  // Validate individual wall segments
  wallSegments.forEach((wall, index) => {
    if (wall.width <= 0) {
      errors.push(`Error: Wall segment "${wall.name}" has invalid width (${formatFeetAndInches(wall.width)})`);
    }
    
    if (wall.width < 0.25) { // Minimum 3 inches
      warnings.push(`Warning: Wall segment "${wall.name}" is very thin (${formatFeetAndInches(wall.width)})`);
    }
    
    if (wall.width > roomWidth * 0.5) {
      warnings.push(`Warning: Wall segment "${wall.name}" is very wide (${formatFeetAndInches(wall.width)}) - ${((wall.width / roomWidth) * 100).toFixed(1)}% of room width`);
    }
  });

  // Validate gaps
  gaps.forEach((gap, index) => {
    if (gap.width <= 0) {
      errors.push(`Error: Gap "${gap.id}" has invalid width (${formatFeetAndInches(gap.width)})`);
    }
    
    if (gap.width < 2 && gap.purpose === 'doorway') {
      warnings.push(`Warning: Doorway gap "${gap.id}" is narrow (${formatFeetAndInches(gap.width)}) - minimum 2' recommended`);
    }
  });

  // Validate positioning
  const positionValidation = validateWallPositioning(wallSegments, gaps, roomWidth);
  errors.push(...positionValidation.errors);
  warnings.push(...positionValidation.warnings);

  // Structural warnings
  if (wallSegments.length > 8) {
    warnings.push(`Warning: High number of wall segments (${wallSegments.length}) may complicate construction`);
  }

  if (utilizationPercentage < 60) {
    warnings.push(`Warning: Low space utilization (${utilizationPercentage.toFixed(1)}%) - consider adding more walls or increasing widths`);
  }

  // Create layout object
  const layout: WallLayout = {
    roomWidth,
    roomLength,
    wallSegments,
    gaps,
    totalUsedWidth: usedSpace,
    remainingSpace,
    valid: errors.length === 0,
    errors,
    warnings
  };

  const measurements = {
    totalWallWidth,
    totalGapWidth,
    usedSpace,
    remainingSpace,
    utilizationPercentage
  };

  console.log(`Validation result: ${errors.length === 0 ? 'VALID' : 'INVALID'}`);
  console.log(`Errors: ${errors.length}, Warnings: ${warnings.length}`);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    layout,
    measurements
  };
};

/**
 * Optimizes wall layout to fit within room constraints
 */
export const optimizeWallLayout = (
  wallSegments: WallSegment[],
  gaps: WallGap[],
  roomWidth: number,
  roomLength: number
): WallLayout => {
  const totalUsed = calculateTotalUsedWidth(wallSegments, gaps);
  
  if (totalUsed <= roomWidth) {
    // Already fits, return as-is
    return {
      roomWidth,
      roomLength,
      wallSegments,
      gaps,
      totalUsedWidth: totalUsed,
      remainingSpace: roomWidth - totalUsed,
      valid: true,
      errors: [],
      warnings: []
    };
  }

  // Need to optimize - reduce wall widths proportionally
  const scaleFactor = (roomWidth * 0.95) / totalUsed; // Use 95% to leave some margin
  
  const optimizedWalls = wallSegments.map(wall => ({
    ...wall,
    width: wall.width * scaleFactor
  }));

  const optimizedGaps = gaps.map(gap => ({
    ...gap,
    width: gap.width * scaleFactor
  }));

  const newTotalUsed = calculateTotalUsedWidth(optimizedWalls, optimizedGaps);

  return {
    roomWidth,
    roomLength,
    wallSegments: optimizedWalls,
    gaps: optimizedGaps,
    totalUsedWidth: newTotalUsed,
    remainingSpace: roomWidth - newTotalUsed,
    valid: true,
    errors: [],
    warnings: [`Layout was automatically scaled by ${(scaleFactor * 100).toFixed(1)}% to fit room width`]
  };
};

/**
 * Adds a new wall segment to the layout with validation
 */
export const addWallSegment = (
  layout: WallLayout,
  newWall: Omit<WallSegment, 'id'>
): WallLayoutValidationResult => {
  const wallWithId: WallSegment = {
    ...newWall,
    id: `wall-${Date.now()}`
  };

  const updatedSegments = [...layout.wallSegments, wallWithId];
  
  return validateWallLayout(
    updatedSegments,
    layout.gaps,
    layout.roomWidth,
    layout.roomLength
  );
};

/**
 * Removes a wall segment from the layout
 */
export const removeWallSegment = (
  layout: WallLayout,
  wallId: string
): WallLayoutValidationResult => {
  const updatedSegments = layout.wallSegments.filter(wall => wall.id !== wallId);
  
  return validateWallLayout(
    updatedSegments,
    layout.gaps,
    layout.roomWidth,
    layout.roomLength
  );
};

/**
 * Updates a wall segment in the layout
 */
export const updateWallSegment = (
  layout: WallLayout,
  wallId: string,
  updates: Partial<WallSegment>
): WallLayoutValidationResult => {
  const updatedSegments = layout.wallSegments.map(wall =>
    wall.id === wallId ? { ...wall, ...updates } : wall
  );
  
  return validateWallLayout(
    updatedSegments,
    layout.gaps,
    layout.roomWidth,
    layout.roomLength
  );
};