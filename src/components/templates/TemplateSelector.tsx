import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, Car, Warehouse, Home, ArrowRight, Check, Star } from 'lucide-react';
import { buildingTemplates, getTemplatesByCategory } from '../../data/buildingTemplates';
import { useBuildingStore } from '../../store/buildingStore';
import type { BuildingTemplate, TemplateCategory } from '../../types/templates';

interface TemplateSelectorProps {
  onTemplateSelect: (template: BuildingTemplate) => void;
  onClose: () => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onTemplateSelect, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const categories = [
    { id: 'all' as TemplateCategory, name: 'All Templates', icon: Building, count: buildingTemplates.length },
    { id: 'garage' as TemplateCategory, name: 'Garages', icon: Car, count: buildingTemplates.filter(t => t.category === 'garage').length },
    { id: 'barn' as TemplateCategory, name: 'Barns', icon: Warehouse, count: buildingTemplates.filter(t => t.category === 'barn').length }
  ];

  const filteredTemplates = getTemplatesByCategory(selectedCategory);

  const handleTemplateSelect = (template: BuildingTemplate) => {
    setSelectedTemplate(template.id);
    setTimeout(() => {
      onTemplateSelect(template);
      onClose();
    }, 300);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'garage': return <Car className="w-4 h-4" />;
      case 'barn': return <Warehouse className="w-4 h-4" />;
      default: return <Building className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Choose a Building Template</h2>
              <p className="text-blue-100">Select from our professionally designed barn and garage templates</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Category Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      selectedCategory === category.id
                        ? 'bg-blue-200 text-blue-700'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {category.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Template Stats */}
            <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Template Features</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Professional designs</li>
                <li>• Australian standards</li>
                <li>• Cost estimates included</li>
                <li>• Customizable dimensions</li>
                <li>• COLORBOND® colors</li>
              </ul>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {selectedCategory === 'all' ? 'All Templates' : 
                 selectedCategory === 'garage' ? 'Garage Templates' : 'Barn Templates'}
              </h3>
              <p className="text-sm text-gray-600">
                {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="wait">
                {filteredTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`bg-white rounded-lg border-2 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      selectedTemplate === template.id
                        ? 'border-green-500 ring-2 ring-green-200'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    {/* Template Image Placeholder */}
                    <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                      {getCategoryIcon(template.category)}
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          template.category === 'garage' 
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                        </span>
                      </div>
                      {selectedTemplate === template.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center"
                        >
                          <div className="bg-green-500 rounded-full p-2">
                            <Check className="w-6 h-6 text-white" />
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Template Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-800 text-lg">{template.name}</h4>
                        {template.estimatedCost && (
                          <div className="text-right">
                            <div className="text-xs text-gray-500">From</div>
                            <div className="text-sm font-semibold text-green-600">
                              ${template.estimatedCost.min.toLocaleString()} {template.estimatedCost.currency}
                            </div>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>

                      {/* Dimensions */}
                      <div className="flex items-center space-x-4 mb-3 text-xs text-gray-500">
                        <span>{template.defaultDimensions.width}' × {template.defaultDimensions.length}'</span>
                        <span>•</span>
                        <span>{template.defaultDimensions.height}' high</span>
                        <span>•</span>
                        <span>{template.defaultDimensions.roofPitch}:12 pitch</span>
                      </div>

                      {/* Key Features */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {template.characteristics.slice(0, 2).map((char, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                            >
                              {char}
                            </span>
                          ))}
                        </div>

                        {/* Suitable For */}
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Suitable for:</span> {template.suitableFor.slice(0, 2).join(', ')}
                          {template.suitableFor.length > 2 && '...'}
                        </div>
                      </div>

                      {/* Select Button */}
                      <button
                        className={`w-full mt-4 py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                          selectedTemplate === template.id
                            ? 'bg-green-500 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {selectedTemplate === template.id ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Selected</span>
                          </>
                        ) : (
                          <>
                            <span>Select Template</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TemplateSelector;