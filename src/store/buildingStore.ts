// Update the default building to have better proportions for bay extensions
const defaultBuilding = {
  dimensions: {
    width: 40,    // Increased width for better proportions with bays
    length: 60,   // Increased length for main barn
    height: 14,   // Increased height for barn-like proportions
    roofPitch: 4, // 4:12 pitch
  },
  features: [],
  skylights: [],
  color: '#5A6B47', // Cottage Green - classic barn color
  roofColor: '#4A3C32', // Ironstone - traditional roof color
  wallProfile: 'multiclad' as WallProfile, // Traditional barn profile
  wallBoundsProtection: new Map<WallPosition, WallBoundsProtection>(),
  spaceLayout: undefined as SpaceLayoutDetection | undefined,
  bays: [] as BaySection[], // Initialize empty bay system
  activeBayId: undefined as string | undefined,
  bayConnections: [] as BayConnection[],
  wallLayout: undefined as WallLayout | undefined // Add wall layout
};