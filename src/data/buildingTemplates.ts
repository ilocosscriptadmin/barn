import type { BuildingTemplate } from '../types/templates';

export const buildingTemplates: BuildingTemplate[] = [
  // GARAGE TEMPLATES
  {
    id: 'gable-roof-garage',
    name: 'Gable Roof Garage',
    category: 'garage',
    description: 'Traditional gabled garage with classic proportions, perfect for residential properties',
    defaultDimensions: {
      width: 24,
      length: 24,
      height: 10,
      roofPitch: 4.5
    },
    roofType: 'gable',
    wallProfile: 'trimdek',
    defaultColor: '#D4D1C7', // Shale Grey
    defaultRoofColor: '#6D6C6A', // Basalt
    features: [
      {
        type: 'rollupDoor',
        width: 16,
        height: 8,
        position: {
          wallPosition: 'front',
          xOffset: 0,
          yOffset: 0,
          alignment: 'center'
        }
      },
      {
        type: 'walkDoor',
        width: 3,
        height: 7,
        position: {
          wallPosition: 'left',
          xOffset: 4,
          yOffset: 0,
          alignment: 'left'
        }
      },
      {
        type: 'window',
        width: 4,
        height: 3,
        position: {
          wallPosition: 'back',
          xOffset: 0,
          yOffset: 4,
          alignment: 'center'
        }
      }
    ],
    skylights: [
      {
        width: 4,
        length: 4,
        xOffset: 0,
        yOffset: 0,
        panel: 'left'
      }
    ],
    characteristics: [
      'Traditional gabled roof design',
      'Large roller door for vehicle access',
      'Side pedestrian access',
      'Natural lighting via skylight',
      'Suitable for 2-car garage'
    ],
    suitableFor: [
      'Residential properties',
      'Car storage',
      'Workshop space',
      'General storage'
    ],
    estimatedCost: {
      min: 15000,
      max: 25000,
      currency: 'AUD'
    }
  },

  {
    id: 'skillion-roof-garage',
    name: 'Skillion Roof Garage',
    category: 'garage',
    description: 'Modern single-slope roof garage with contemporary styling and efficient design',
    defaultDimensions: {
      width: 20,
      length: 30,
      height: 10,
      roofPitch: 2.5
    },
    roofType: 'skillion',
    wallProfile: 'customorb',
    defaultColor: '#F2F0E6', // Classic Cream
    defaultRoofColor: '#4A3C32', // Ironstone
    features: [
      {
        type: 'rollupDoor',
        width: 12,
        height: 8,
        position: {
          wallPosition: 'front',
          xOffset: -4,
          yOffset: 0,
          alignment: 'center'
        }
      },
      {
        type: 'rollupDoor',
        width: 12,
        height: 8,
        position: {
          wallPosition: 'front',
          xOffset: 4,
          yOffset: 0,
          alignment: 'center'
        }
      },
      {
        type: 'walkDoor',
        width: 3,
        height: 7,
        position: {
          wallPosition: 'right',
          xOffset: 8,
          yOffset: 0,
          alignment: 'left'
        }
      },
      {
        type: 'window',
        width: 6,
        height: 3,
        position: {
          wallPosition: 'back',
          xOffset: 0,
          yOffset: 5,
          alignment: 'center'
        }
      }
    ],
    characteristics: [
      'Contemporary skillion roof design',
      'Dual roller door configuration',
      'Modern CustomOrb profile',
      'Efficient single-slope drainage',
      'Suitable for 2-car garage'
    ],
    suitableFor: [
      'Modern homes',
      'Car storage',
      'Boat storage',
      'Equipment storage',
      'Workshop space'
    ],
    estimatedCost: {
      min: 18000,
      max: 28000,
      currency: 'AUD'
    }
  },

  {
    id: 'double-skillion-garage',
    name: 'Double Skillion Garage',
    category: 'garage',
    description: 'Distinctive butterfly roof design with dual skillion sections for architectural interest',
    defaultDimensions: {
      width: 28,
      length: 32,
      height: 12,
      roofPitch: 3
    },
    roofType: 'double-skillion',
    wallProfile: 'trimdek',
    defaultColor: '#A39080', // Dune
    defaultRoofColor: '#2E2B26', // Cove
    features: [
      {
        type: 'rollupDoor',
        width: 16,
        height: 9,
        position: {
          wallPosition: 'front',
          xOffset: -6,
          yOffset: 0,
          alignment: 'center'
        }
      },
      {
        type: 'rollupDoor',
        width: 10,
        height: 8,
        position: {
          wallPosition: 'front',
          xOffset: 8,
          yOffset: 0,
          alignment: 'center'
        }
      },
      {
        type: 'walkDoor',
        width: 3,
        height: 7,
        position: {
          wallPosition: 'left',
          xOffset: 6,
          yOffset: 0,
          alignment: 'left'
        }
      },
      {
        type: 'window',
        width: 4,
        height: 3,
        position: {
          wallPosition: 'left',
          xOffset: 12,
          yOffset: 6,
          alignment: 'left'
        }
      },
      {
        type: 'window',
        width: 8,
        height: 4,
        position: {
          wallPosition: 'back',
          xOffset: 0,
          yOffset: 6,
          alignment: 'center'
        }
      }
    ],
    skylights: [
      {
        width: 4,
        length: 6,
        xOffset: -4,
        yOffset: 0,
        panel: 'left'
      },
      {
        width: 4,
        length: 6,
        xOffset: 4,
        yOffset: 0,
        panel: 'right'
      }
    ],
    characteristics: [
      'Distinctive butterfly roof design',
      'Dual skillion sections',
      'Multiple vehicle access points',
      'Enhanced natural lighting',
      'Architectural feature roof'
    ],
    suitableFor: [
      'Large residential properties',
      'Multi-vehicle storage',
      'Commercial workshops',
      'Equipment storage',
      'Architectural statement'
    ],
    estimatedCost: {
      min: 25000,
      max: 40000,
      currency: 'AUD'
    }
  },

  // BARN TEMPLATES
  {
    id: 'aussie-barn',
    name: 'Aussie Barn',
    category: 'barn',
    description: 'Classic Australian rural barn with traditional proportions and practical design',
    defaultDimensions: {
      width: 40,
      length: 60,
      height: 14,
      roofPitch: 4
    },
    roofType: 'gable',
    wallProfile: 'multiclad',
    defaultColor: '#5A6B47', // Cottage Green
    defaultRoofColor: '#4A3C32', // Ironstone
    features: [
      {
        type: 'rollupDoor',
        width: 20,
        height: 12,
        position: {
          wallPosition: 'front',
          xOffset: 0,
          yOffset: 0,
          alignment: 'center'
        }
      },
      {
        type: 'walkDoor',
        width: 3,
        height: 7,
        position: {
          wallPosition: 'front',
          xOffset: 15,
          yOffset: 0,
          alignment: 'left'
        }
      },
      {
        type: 'window',
        width: 6,
        height: 4,
        position: {
          wallPosition: 'left',
          xOffset: 10,
          yOffset: 6,
          alignment: 'left'
        }
      },
      {
        type: 'window',
        width: 6,
        height: 4,
        position: {
          wallPosition: 'right',
          xOffset: 10,
          yOffset: 6,
          alignment: 'left'
        }
      },
      {
        type: 'window',
        width: 8,
        height: 5,
        position: {
          wallPosition: 'back',
          xOffset: 0,
          yOffset: 7,
          alignment: 'center'
        }
      }
    ],
    skylights: [
      {
        width: 6,
        length: 8,
        xOffset: -6,
        yOffset: 0,
        panel: 'left'
      },
      {
        width: 6,
        length: 8,
        xOffset: 6,
        yOffset: 0,
        panel: 'right'
      }
    ],
    characteristics: [
      'Traditional Australian barn design',
      'Deep corrugated Multiclad profile',
      'Large central access door',
      'Multiple windows for natural light',
      'Classic rural proportions'
    ],
    suitableFor: [
      'Rural properties',
      'Livestock housing',
      'Hay storage',
      'Farm equipment',
      'Rural workshops'
    ],
    estimatedCost: {
      min: 35000,
      max: 55000,
      currency: 'AUD'
    }
  },

  {
    id: 'american-barn',
    name: 'American Barn',
    category: 'barn',
    description: 'Traditional American-style barn with gambrel roof and classic red barn aesthetics',
    defaultDimensions: {
      width: 36,
      length: 48,
      height: 17,
      roofPitch: 6
    },
    roofType: 'gable',
    wallProfile: 'trimdek',
    defaultColor: '#7A2E2E', // Manor Red
    defaultRoofColor: '#4A3C32', // Ironstone
    features: [
      {
        type: 'rollupDoor',
        width: 16,
        height: 14,
        position: {
          wallPosition: 'front',
          xOffset: 0,
          yOffset: 0,
          alignment: 'center'
        }
      },
      {
        type: 'door',
        width: 4,
        height: 8,
        position: {
          wallPosition: 'front',
          xOffset: 12,
          yOffset: 0,
          alignment: 'left'
        }
      },
      {
        type: 'window',
        width: 5,
        height: 4,
        position: {
          wallPosition: 'left',
          xOffset: 8,
          yOffset: 8,
          alignment: 'left'
        }
      },
      {
        type: 'window',
        width: 5,
        height: 4,
        position: {
          wallPosition: 'right',
          xOffset: 8,
          yOffset: 8,
          alignment: 'left'
        }
      },
      {
        type: 'window',
        width: 6,
        height: 3,
        position: {
          wallPosition: 'back',
          xOffset: -8,
          yOffset: 10,
          alignment: 'center'
        }
      },
      {
        type: 'window',
        width: 6,
        height: 3,
        position: {
          wallPosition: 'back',
          xOffset: 8,
          yOffset: 10,
          alignment: 'center'
        }
      }
    ],
    skylights: [
      {
        width: 4,
        length: 6,
        xOffset: -6,
        yOffset: -10,
        panel: 'left'
      },
      {
        width: 4,
        length: 6,
        xOffset: 6,
        yOffset: -10,
        panel: 'right'
      }
    ],
    characteristics: [
      'Classic American barn styling',
      'Traditional red barn color',
      'High pitched gable roof',
      'Large central bay door',
      'Multiple upper level windows'
    ],
    suitableFor: [
      'Horse stables',
      'Livestock housing',
      'Hay and feed storage',
      'Rural workshops',
      'Heritage-style properties'
    ],
    estimatedCost: {
      min: 40000,
      max: 65000,
      currency: 'AUD'
    }
  },

  {
    id: 'skillion-barn',
    name: 'Skillion Barn',
    category: 'barn',
    description: 'Modern agricultural barn with efficient skillion roof design for contemporary farms',
    defaultDimensions: {
      width: 50,
      length: 80,
      height: 18,
      roofPitch: 2
    },
    roofType: 'skillion',
    wallProfile: 'customorb',
    defaultColor: '#C7C1B7', // Windspray
    defaultRoofColor: '#6B6B5D', // Woodland Grey
    features: [
      {
        type: 'rollupDoor',
        width: 24,
        height: 14,
        position: {
          wallPosition: 'front',
          xOffset: -12,
          yOffset: 0,
          alignment: 'center'
        }
      },
      {
        type: 'rollupDoor',
        width: 20,
        height: 12,
        position: {
          wallPosition: 'front',
          xOffset: 12,
          yOffset: 0,
          alignment: 'center'
        }
      },
      {
        type: 'walkDoor',
        width: 3,
        height: 7,
        position: {
          wallPosition: 'left',
          xOffset: 10,
          yOffset: 0,
          alignment: 'left'
        }
      },
      {
        type: 'window',
        width: 8,
        height: 4,
        position: {
          wallPosition: 'left',
          xOffset: 20,
          yOffset: 8,
          alignment: 'left'
        }
      },
      {
        type: 'window',
        width: 8,
        height: 4,
        position: {
          wallPosition: 'left',
          xOffset: 35,
          yOffset: 8,
          alignment: 'left'
        }
      },
      {
        type: 'window',
        width: 12,
        height: 5,
        position: {
          wallPosition: 'back',
          xOffset: 0,
          yOffset: 9,
          alignment: 'center'
        }
      }
    ],
    characteristics: [
      'Modern skillion roof design',
      'Premium CustomOrb profile',
      'Large equipment access doors',
      'Efficient water drainage',
      'Contemporary agricultural styling'
    ],
    suitableFor: [
      'Modern farms',
      'Large equipment storage',
      'Livestock housing',
      'Hay and grain storage',
      'Agricultural workshops'
    ],
    estimatedCost: {
      min: 45000,
      max: 75000,
      currency: 'AUD'
    }
  }
];

export const getTemplatesByCategory = (category: TemplateCategory): BuildingTemplate[] => {
  if (category === 'all') {
    return buildingTemplates;
  }
  return buildingTemplates.filter(template => template.category === category);
};

export const getTemplateById = (id: string): BuildingTemplate | undefined => {
  return buildingTemplates.find(template => template.id === id);
};