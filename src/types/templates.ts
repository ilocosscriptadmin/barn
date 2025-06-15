export interface BuildingTemplate {
  id: string;
  name: string;
  category: 'barn' | 'garage';
  description: string;
  image?: string;
  defaultDimensions: {
    width: number;
    length: number;
    height: number;
    roofPitch: number;
  };
  roofType: 'gable' | 'skillion' | 'double-skillion' | 'hip';
  wallProfile: 'trimdek' | 'customorb' | 'multiclad';
  defaultColor: string;
  defaultRoofColor: string;
  features: Array<{
    type: 'door' | 'window' | 'rollupDoor' | 'walkDoor';
    width: number;
    height: number;
    position: {
      wallPosition: 'front' | 'back' | 'left' | 'right';
      xOffset: number;
      yOffset: number;
      alignment: 'left' | 'center' | 'right';
    };
  }>;
  skylights?: Array<{
    width: number;
    length: number;
    xOffset: number;
    yOffset: number;
    panel: 'left' | 'right';
  }>;
  characteristics: string[];
  suitableFor: string[];
  estimatedCost?: {
    min: number;
    max: number;
    currency: 'AUD' | 'USD';
  };
}

export type TemplateCategory = 'all' | 'barn' | 'garage';