import React from 'react';
import { motion } from 'framer-motion';
import { X, Download, Edit, Share2 } from 'lucide-react';
import type { BuildingTemplate } from '../../types/templates';

interface TemplatePreviewProps {
  template: BuildingTemplate;
  onClose: () => void;
  onApply: (template: BuildingTemplate) => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, onClose, onApply }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{template.name}</h2>
              <p className="text-blue-100 mt-1">{template.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 p-2 rounded-full hover:bg-white hover:bg-opacity-10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Preview Area */}
          <div className="flex-1 bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-64 h-48 bg-white rounded-lg shadow-lg mb-4 flex items-center justify-center">
                <span className="text-gray-400">3D Preview Coming Soon</span>
              </div>
              <p className="text-gray-600">Interactive 3D preview will be available here</p>
            </div>
          </div>

          {/* Details Panel */}
          <div className="w-80 bg-white p-6 overflow-y-auto border-l border-gray-200">
            {/* Dimensions */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Dimensions</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-gray-500">Width</div>
                  <div className="font-semibold">{template.defaultDimensions.width} ft</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-gray-500">Length</div>
                  <div className="font-semibold">{template.defaultDimensions.length} ft</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-gray-500">Height</div>
                  <div className="font-semibold">{template.defaultDimensions.height} ft</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-gray-500">Roof Pitch</div>
                  <div className="font-semibold">{template.defaultDimensions.roofPitch}:12</div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Features</h3>
              <div className="space-y-2">
                {template.features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{feature.type.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="text-gray-500">{feature.width}' × {feature.height}'</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Characteristics */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Characteristics</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                {template.characteristics.map((char, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    {char}
                  </li>
                ))}
              </ul>
            </div>

            {/* Suitable For */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Suitable For</h3>
              <div className="flex flex-wrap gap-2">
                {template.suitableFor.map((use, index) => (
                  <span
                    key={index}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                  >
                    {use}
                  </span>
                ))}
              </div>
            </div>

            {/* Cost Estimate */}
            {template.estimatedCost && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Estimated Cost</h3>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ${template.estimatedCost.min.toLocaleString()} - ${template.estimatedCost.max.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-700">{template.estimatedCost.currency}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    *Estimate includes materials and basic installation
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => onApply(template)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Use This Template</span>
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center space-x-1 text-gray-600 hover:text-gray-800 py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Export</span>
                </button>
                <button className="flex items-center justify-center space-x-1 text-gray-600 hover:text-gray-800 py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm">Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TemplatePreview;