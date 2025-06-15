import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { BuildingTemplate } from '../types/templates';
import type { Building } from '../types';
import { useBuildingStore } from './buildingStore';

interface TemplateStore {
  selectedTemplate: BuildingTemplate | null;
  isTemplateModalOpen: boolean;
  
  // Actions
  setSelectedTemplate: (template: BuildingTemplate | null) => void;
  openTemplateModal: () => void;
  closeTemplateModal: () => void;
  applyTemplate: (template: BuildingTemplate) => void;
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  selectedTemplate: null,
  isTemplateModalOpen: false,

  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
  
  openTemplateModal: () => set({ isTemplateModalOpen: true }),
  
  closeTemplateModal: () => set({ isTemplateModalOpen: false }),
  
  applyTemplate: (template) => {
    const buildingStore = useBuildingStore.getState();
    
    // Construct the complete building object from the template
    const newBuilding: Building = {
      dimensions: {
        width: template.defaultDimensions.width,
        length: template.defaultDimensions.length,
        height: template.defaultDimensions.height,
        roofPitch: template.defaultDimensions.roofPitch
      },
      color: template.defaultColor,
      roofColor: template.defaultRoofColor,
      wallProfile: template.wallProfile,
      features: template.features.map(feature => ({
        ...feature,
        id: uuidv4() // Ensure each feature has a unique ID
      })),
      skylights: template.skylights || []
    };
    
    // Apply the complete building state atomically
    buildingStore.setBuilding(newBuilding);
    
    // Update project name to reflect template
    buildingStore.currentProject.name = template.name;
    
    set({ 
      selectedTemplate: template,
      isTemplateModalOpen: false 
    });
  }
}));