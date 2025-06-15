import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, Home, Ruler, Layout, Grid3X3, Palette, Building, Eye, Layers } from 'lucide-react';
import DimensionsPanel from './DimensionsPanel';
import RoofPanel from './RoofPanel';
import WallFeaturesPanel from './WallFeaturesPanel';
import WallLayoutPanel from './WallLayoutPanel';
import ColorsPanel from './ColorsPanel';
import SpaceLayoutPanel from './SpaceLayoutPanel';
import InteriorPartitionsPanel from './InteriorPartitionsPanel';

type PanelId = 'dimensions' | 'roof' | 'features' | 'layout' | 'colors' | 'spaceLayout' | 'interiorPartitions';

const Sidebar: React.FC = () => {
  const [expandedPanel, setExpandedPanel] = useState<PanelId | null>('dimensions');

  const togglePanel = (panel: PanelId) => {
    setExpandedPanel(expandedPanel === panel ? null : panel);
  };

  const panelConfig = [
    { 
      id: 'dimensions' as PanelId, 
      title: 'Building Dimensions', 
      icon: <Ruler className="w-5 h-5" />,
      component: <DimensionsPanel />
    },
    { 
      id: 'interiorPartitions' as PanelId, 
      title: 'Interior Partitions', 
      icon: <Layers className="w-5 h-5" />,
      component: <InteriorPartitionsPanel />
    },
    { 
      id: 'spaceLayout' as PanelId, 
      title: 'Space Layout Detection', 
      icon: <Eye className="w-5 h-5" />,
      component: <SpaceLayoutPanel />
    }
  ];

  return (
    <motion.div 
      className="w-80 bg-white border-r border-gray-200 shadow-sidebar flex flex-col"
      initial={{ x: -320 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="p-4 border-b border-gray-200 flex items-center">
        <Grid3X3 className="w-6 h-6 text-primary mr-2" />
        <h1 className="text-xl font-semibold">Barn Builder</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {panelConfig.map((panel) => (
          <div key={panel.id} className="border-b border-gray-200">
            <button 
              className="w-full px-4 py-3 flex items-center justify-between focus:outline-none hover:bg-gray-50"
              onClick={() => togglePanel(panel.id)}
            >
              <div className="flex items-center">
                {panel.icon}
                <span className="ml-2 font-medium">{panel.title}</span>
              </div>
              {expandedPanel === panel.id ? 
                <ChevronDown className="w-5 h-5 text-gray-500" /> : 
                <ChevronRight className="w-5 h-5 text-gray-500" />
              }
            </button>
            
            <AnimatePresence>
              {expandedPanel === panel.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 py-3">
                    {panel.component}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Sidebar;