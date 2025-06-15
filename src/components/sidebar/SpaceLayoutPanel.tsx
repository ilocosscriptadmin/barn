import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  MapPin, 
  Wind, 
  DoorOpen, 
  Home,
  Zap,
  RefreshCw,
  Lock,
  Unlock,
  Navigation
} from 'lucide-react';
import { useBuildingStore } from '../../store/buildingStore';
import type { SpaceLayoutDetection, ClearanceZone, AccessPath, VentilationArea, LayoutConstraint } from '../../types';

const SpaceLayoutPanel: React.FC = () => {
  const { 
    dimensions,
    features,
    scanSpaceLayout,
    validateSpaceModification,
    getFeatureClearanceZones,
    checkAccessPaths,
    validateVentilation
  } = useBuildingStore((state) => ({
    dimensions: state.currentProject.building.dimensions,
    features: state.currentProject.building.features,
    spaceLayout: state.currentProject.building.spaceLayout,
    scanSpaceLayout: state.scanSpaceLayout,
    validateSpaceModification: state.validateSpaceModification,
    getFeatureClearanceZones: state.getFeatureClearanceZones,
    checkAccessPaths: state.checkAccessPaths,
    validateVentilation: state.validateVentilation
  }));

  const [spaceLayout, setSpaceLayout] = useState<SpaceLayoutDetection | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<{
    clearances: boolean;
    access: boolean;
    ventilation: boolean;
    constraints: boolean;
  }>({
    clearances: false,
    access: false,
    ventilation: false,
    constraints: false
  });

  // Perform space layout scan when component mounts or features change
  useEffect(() => {
    if (features.length > 0) {
      performSpaceScan();
    }
  }, [features, dimensions]);

  const performSpaceScan = async () => {
    setIsScanning(true);
    console.log('🔍 Performing space layout scan...');
    
    try {
      const layout = scanSpaceLayout();
      setSpaceLayout(layout);
      console.log('✅ Space layout scan complete');
    } catch (error) {
      console.error('❌ Space layout scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleFeatureSelect = (featureId: string) => {
    setSelectedFeature(selectedFeature === featureId ? null : featureId);
  };

  const getConstraintIcon = (type: string) => {
    switch (type) {
      case 'clearance': return <Shield className="w-4 h-4" />;
      case 'access': return <DoorOpen className="w-4 h-4" />;
      case 'structural': return <Home className="w-4 h-4" />;
      case 'code': return <AlertTriangle className="w-4 h-4" />;
      case 'functional': return <Zap className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'important': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'advisory': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!spaceLayout && features.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="p-4 text-center"
      >
        <Eye className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">No Features to Analyze</h3>
        <p className="text-sm text-gray-600">
          Add doors, windows, or other features to enable space layout detection and analysis.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {/* Space Layout Detection Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Space Layout Detection</span>
          </div>
          <button
            onClick={performSpaceScan}
            disabled={isScanning}
            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded flex items-center space-x-1"
          >
            <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Rescan'}</span>
          </button>
        </div>
        <div className="text-xs text-blue-700">
          <div>Room: {dimensions.width}ft × {dimensions.length}ft × {dimensions.height}ft</div>
          <div>Features: {features.length} architectural elements</div>
          {spaceLayout && (
            <div>Last scan: {spaceLayout.lastScan.toLocaleTimeString()}</div>
          )}
        </div>
      </div>

      {isScanning && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
          <div className="text-sm text-gray-700">Analyzing space layout...</div>
          <div className="text-xs text-gray-500 mt-1">
            Detecting clearances, access paths, and constraints
          </div>
        </div>
      )}

      {spaceLayout && (
        <>
          {/* Space Layout Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Features Detected</span>
              </div>
              <div className="text-lg font-bold text-green-600">
                {spaceLayout.detectedFeatures.length}
              </div>
              <div className="text-xs text-green-700">
                With clearance requirements
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Shield className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Protected Zones</span>
              </div>
              <div className="text-lg font-bold text-orange-600">
                {spaceLayout.clearanceZones.length}
              </div>
              <div className="text-xs text-orange-700">
                Clearance areas mapped
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Navigation className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Access Paths</span>
              </div>
              <div className="text-lg font-bold text-blue-600">
                {spaceLayout.accessPaths.length}
              </div>
              <div className="text-xs text-blue-700">
                Circulation routes
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Constraints</span>
              </div>
              <div className="text-lg font-bold text-purple-600">
                {spaceLayout.layoutConstraints.length}
              </div>
              <div className="text-xs text-purple-700">
                Layout restrictions
              </div>
            </div>
          </div>

          {/* Critical Constraints Alert */}
          {spaceLayout.layoutConstraints.some(c => c.severity === 'critical') && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Critical Layout Constraints</span>
              </div>
              <div className="text-xs text-red-700 space-y-1">
                {spaceLayout.layoutConstraints
                  .filter(c => c.severity === 'critical')
                  .slice(0, 3)
                  .map((constraint, index) => (
                    <div key={index}>• {constraint.description}</div>
                  ))}
                {spaceLayout.layoutConstraints.filter(c => c.severity === 'critical').length > 3 && (
                  <div>• ...and {spaceLayout.layoutConstraints.filter(c => c.severity === 'critical').length - 3} more</div>
                )}
              </div>
            </div>
          )}

          {/* Feature Analysis */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Feature Analysis</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {spaceLayout.detectedFeatures.map((feature, index) => (
                <div 
                  key={feature.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    selectedFeature === feature.id 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleFeatureSelect(feature.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        feature.isProtected ? 'bg-orange-500' : 'bg-green-500'
                      }`} />
                      <span className="text-sm font-medium capitalize">
                        {feature.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({feature.width}ft × {feature.height}ft)
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {feature.accessRequirements?.emergencyAccess && (
                        <AlertTriangle className="w-3 h-3 text-red-500" title="Emergency access required" />
                      )}
                      {feature.structuralImpact?.affectsWallIntegrity && (
                        <Home className="w-3 h-3 text-orange-500" title="Affects structural integrity" />
                      )}
                      {feature.isProtected ? (
                        <Lock className="w-3 h-3 text-orange-500" title="Protected feature" />
                      ) : (
                        <Unlock className="w-3 h-3 text-green-500" title="Unprotected feature" />
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 mt-1">
                    {feature.position.wallPosition} wall • {feature.functionalZone?.purpose}
                  </div>

                  {selectedFeature === feature.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                      {/* Clearance Requirements */}
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-xs font-medium text-gray-700 mb-1">Clearance Requirements</div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div>Front: {feature.clearanceRequirements?.front}ft</div>
                          <div>Sides: {feature.clearanceRequirements?.sides}ft</div>
                          <div>Above: {feature.clearanceRequirements?.above}ft</div>
                          <div>Swing: {feature.clearanceRequirements?.swing}ft</div>
                        </div>
                      </div>

                      {/* Access Requirements */}
                      {feature.accessRequirements && (
                        <div className="bg-blue-50 p-2 rounded">
                          <div className="text-xs font-medium text-blue-700 mb-1">Access Requirements</div>
                          <div className="text-xs text-blue-600 space-y-1">
                            <div>Min size: {feature.accessRequirements.minimumWidth}ft × {feature.accessRequirements.minimumHeight}ft</div>
                            <div className="flex items-center space-x-2">
                              <span>Emergency access:</span>
                              <span className={feature.accessRequirements.emergencyAccess ? 'text-red-600' : 'text-gray-500'}>
                                {feature.accessRequirements.emergencyAccess ? 'Required' : 'Not required'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Structural Impact */}
                      {feature.structuralImpact && (
                        <div className="bg-orange-50 p-2 rounded">
                          <div className="text-xs font-medium text-orange-700 mb-1">Structural Impact</div>
                          <div className="text-xs text-orange-600 space-y-1">
                            <div>Affects wall integrity: {feature.structuralImpact.affectsWallIntegrity ? 'Yes' : 'No'}</div>
                            <div>Requires reinforcement: {feature.structuralImpact.requiresReinforcement ? 'Yes' : 'No'}</div>
                            {feature.structuralImpact.engineeringRequired && (
                              <div className="text-red-600">⚠️ Engineering review required</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Analysis Sections */}
          <div className="space-y-3">
            {/* Clearance Zones */}
            <div>
              <button
                onClick={() => setShowDetails(prev => ({ ...prev, clearances: !prev.clearances }))}
                className="w-full flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium">Clearance Zones ({spaceLayout.clearanceZones.length})</span>
                </div>
                <span className="text-xs text-gray-500">
                  {showDetails.clearances ? 'Hide' : 'Show'}
                </span>
              </button>

              {showDetails.clearances && (
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {spaceLayout.clearanceZones.map((zone, index) => (
                    <div key={zone.id} className="bg-orange-50 border border-orange-200 rounded p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-orange-800 capitalize">
                          {zone.type.replace('_', ' ')}
                        </span>
                        <span className={`text-xs px-1 py-0.5 rounded ${
                          zone.isProtected ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {zone.isProtected ? 'Protected' : 'Flexible'}
                        </span>
                      </div>
                      <div className="text-xs text-orange-700">{zone.purpose}</div>
                      <div className="text-xs text-orange-600 mt-1">
                        Area: {zone.bounds.front}ft × {(zone.bounds.right - zone.bounds.left).toFixed(1)}ft
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Access Paths */}
            <div>
              <button
                onClick={() => setShowDetails(prev => ({ ...prev, access: !prev.access }))}
                className="w-full flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div className="flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Access Paths ({spaceLayout.accessPaths.length})</span>
                </div>
                <span className="text-xs text-gray-500">
                  {showDetails.access ? 'Hide' : 'Show'}
                </span>
              </button>

              {showDetails.access && (
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {spaceLayout.accessPaths.map((path, index) => (
                    <div key={path.id} className="bg-blue-50 border border-blue-200 rounded p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-blue-800 capitalize">
                          {path.pathType} Path
                        </span>
                        <span className={`text-xs px-1 py-0.5 rounded ${
                          path.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {path.isBlocked ? 'Blocked' : 'Clear'}
                        </span>
                      </div>
                      <div className="text-xs text-blue-600">
                        Required: {path.minimumWidth.toFixed(1)}ft • Current: {path.currentWidth.toFixed(1)}ft
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ventilation Areas */}
            {spaceLayout.ventilationAreas.length > 0 && (
              <div>
                <button
                  onClick={() => setShowDetails(prev => ({ ...prev, ventilation: !prev.ventilation }))}
                  className="w-full flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-2">
                    <Wind className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Ventilation Areas ({spaceLayout.ventilationAreas.length})</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {showDetails.ventilation ? 'Hide' : 'Show'}
                  </span>
                </button>

                {showDetails.ventilation && (
                  <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                    {spaceLayout.ventilationAreas.map((area, index) => (
                      <div key={area.id} className="bg-green-50 border border-green-200 rounded p-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-green-800">
                            Window Ventilation
                          </span>
                          <span className={`text-xs px-1 py-0.5 rounded ${
                            area.isObstructed ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {area.isObstructed ? 'Obstructed' : 'Clear'}
                          </span>
                        </div>
                        <div className="text-xs text-green-600">
                          Capacity: {area.ventilationCapacity.toFixed(0)} CFM
                        </div>
                        <div className="text-xs text-green-600">
                          Natural light: {area.naturalLight ? 'Available' : 'Limited'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Layout Constraints */}
            <div>
              <button
                onClick={() => setShowDetails(prev => ({ ...prev, constraints: !prev.constraints }))}
                className="w-full flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">Layout Constraints ({spaceLayout.layoutConstraints.length})</span>
                </div>
                <span className="text-xs text-gray-500">
                  {showDetails.constraints ? 'Hide' : 'Show'}
                </span>
              </button>

              {showDetails.constraints && (
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {spaceLayout.layoutConstraints.map((constraint, index) => (
                    <div key={constraint.id} className={`border rounded p-2 ${getSeverityColor(constraint.severity)}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-1">
                          {getConstraintIcon(constraint.type)}
                          <span className="text-xs font-medium capitalize">
                            {constraint.type}
                          </span>
                        </div>
                        <span className="text-xs font-medium capitalize">
                          {constraint.severity}
                        </span>
                      </div>
                      <div className="text-xs mb-1">{constraint.description}</div>
                      <div className="text-xs opacity-75">
                        Override: {constraint.canOverride ? 'Possible' : 'Not allowed'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Space Layout Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Space Layout Summary</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <div>• {spaceLayout.detectedFeatures.filter(f => f.isProtected).length} protected features require clearance maintenance</div>
              <div>• {spaceLayout.accessPaths.filter(p => p.pathType === 'emergency').length} emergency egress paths must remain clear</div>
              <div>• {spaceLayout.clearanceZones.filter(z => z.isProtected).length} clearance zones restrict modifications</div>
              <div>• {spaceLayout.layoutConstraints.filter(c => c.severity === 'critical').length} critical constraints prevent certain changes</div>
              <div>• {spaceLayout.ventilationAreas.filter(a => !a.isObstructed).length} ventilation areas provide natural airflow</div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default SpaceLayoutPanel;