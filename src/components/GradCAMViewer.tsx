import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';

export default function GradCAMViewer() {
  const { analysis } = useAnalysis();
  const [showHeatmap, setShowHeatmap] = useState(true);

  // Check for gradcam data in either format
  const hasGradcam = analysis.gradcam || analysis.gradcamUrl;
  
  if (!hasGradcam) {
    return null;
  }

  // Determine the image source based on what's available
  let imageSrc;
  if (analysis.gradcam) {
    // Handle the gradcam object with base64 data
    imageSrc = `data:image/png;base64,${showHeatmap ? analysis.gradcam.superimposed : analysis.gradcam.heatmap}`;
  } else if (analysis.gradcamUrl) {
    // Handle direct URL (though note that blob URLs won't persist across sessions)
    imageSrc = analysis.gradcamUrl;
  }

  return (
    <div className="card overflow-hidden">
      <div className="relative bg-gray-900">
        <div className="aspect-square w-full">
          <img
            src={imageSrc}
            alt="GradCAM visualization"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/90 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Region of Interest Analysis</h3>
              <p className="text-gray-300 text-sm">AI-generated heatmap</p>
            </div>
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className="text-white hover:text-gray-200"
            >
              {showHeatmap ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 