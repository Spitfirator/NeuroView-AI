import React from 'react';
import { ZoomIn, ZoomOut, Move, Maximize2, RotateCcw } from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import GradCAMViewer from './GradCAMViewer';

export default function ImageViewer() {
  const { analysis } = useAnalysis();

  // determine which image source to use
  const imageSrc = analysis.imageUrl || 
                  (analysis.originalImageBase64 ? analysis.originalImageBase64 : null);

  if (!imageSrc) {
    return null;
  }
// will implement in future 
  return (
    <div className="card overflow-hidden">
      <div className="relative bg-gray-900">
        <div className="aspect-square w-full">
          <img
            src={imageSrc}
            alt="Brain MRI Scan"
            className="w-full h-full object-contain"
          />
        </div>
        
        <div className="image-controls">
          <button className="image-control-btn">
            <ZoomIn className="h-4 w-4" />
          </button>
          <button className="image-control-btn">
            <ZoomOut className="h-4 w-4" />
          </button>
          <button className="image-control-btn">
            <Move className="h-4 w-4" />
          </button>
          <button className="image-control-btn">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button className="image-control-btn">
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/90 to-transparent p-4">
          <h3 className="text-white font-medium">MRI Scan</h3>
          <p className="text-gray-300 text-sm">Uploaded Image</p>
        </div>
      </div>
    </div>
  );
}