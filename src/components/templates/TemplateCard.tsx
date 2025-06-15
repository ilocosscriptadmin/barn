import React from 'react';
import { motion } from 'framer-motion';
import { Car, Warehouse, ArrowRight, Star, DollarSign } from 'lucide-react';
import type { BuildingTemplate } from '../../types/templates';

interface TemplateCardProps {
  template: BuildingTemplate;
  onSelect: (template: BuildingTemplate) => void;
  isSelected?: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect, isSelected = false }) => {
  const getCategoryIcon = () => {
    switch (template.category) {
      case 'garage':
        return <Car className="w-6 h-6" />;
      case 'barn':
        return <Warehouse className="w-6 h-6" />;
      default:
        return <Car className="w-6 h-6" />;
    }
  };

  const getCategoryColor = () => {
    switch (template.category) {
      case 'garage':
        return 'from-blue-500 to-blue-600';
      case 'barn':
        return 'from-green-500 to-green-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:shadow-xl'
      }`}
      onClick={() => onSelect(template)}
    >
      {/* Header with gradient background */}
      <div className={`h-32 bg-gradient-to-br ${getCategoryColor()} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="absolute top-4 left-4 text-white">
          {getCategoryIcon()}
        </div>
        <div className="absolute top-4 right-4">
          <span className="bg-white bg-opacity-20 text-white text-xs font-medium px-2 py-1 rounded-full">
            {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-lg font-bold">{template.name}</h3>
          <p className="text-sm opacity-90">
            {template.defaultDimensions.width}' × {template.defaultDimensions.length}'
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{template.description}</p>

        {/* Features */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-xs text-gray-500">
            <span className="font-medium">Height:</span>
            <span className="ml-1">{template.defaultDimensions.height}ft</span>
            <span className="mx-2">•</span>
            <span className="font-medium">Pitch:</span>
            <span className="ml-1">{template.defaultDimensions.roofPitch}:12</span>
          </div>
          
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
        </div>

        {/* Price and Action */}
        <div className="flex items-center justify-between">
          {template.estimatedCost ? (
            <div className="flex items-center text-green-600">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {template.estimatedCost.min.toLocaleString()} {template.estimatedCost.currency}
              </span>
            </div>
          ) : (
            <div className="flex items-center text-gray-400">
              <Star className="w-4 h-4" />
              <span className="text-sm">Custom Quote</span>
            </div>
          )}

          <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium text-sm">
            <span>Select</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TemplateCard;