import React, { useState } from 'react';
import { IoCloudUploadOutline, IoDocumentTextOutline } from 'react-icons/io5';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isUploading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isUploading }) => {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    if (pdfFile) {
      onFileUpload(pdfFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onFileUpload(file);
    }
  };

  return (
    <div className="mb-6">
      <div
        className={`relative p-8 border-2 border-dashed rounded-2xl transition-all duration-300 backdrop-blur-sm ${
          dragOver
            ? 'border-gray-400 bg-gray-50/80 shadow-lg shadow-gray-500/20'
            : 'border-gray-200 bg-white/50 hover:border-gray-300 hover:bg-gray-50/60'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            {isUploading ? (
              <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-500 rounded-full animate-spin"></div>
            ) : (
              <IoCloudUploadOutline className={`w-12 h-12 transition-colors ${
                dragOver 
                  ? 'text-gray-500' 
                  : 'text-gray-400'
              }`} />
            )}
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isUploading ? 'Uploading Document...' : 'Upload Psychology Documents'}
          </h3>
          
          <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
            Upload psychology research papers, textbooks, or clinical guidelines (PDF format) to enhance Dr. Chen's knowledge base for your session.
          </p>

          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          
          <label
            htmlFor="file-upload"
            className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-200 cursor-pointer font-medium ${
              isUploading
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg shadow-gray-500/25 hover:shadow-gray-500/40 hover:scale-105'
            }`}
          >
            <IoDocumentTextOutline className="w-5 h-5" />
            {isUploading ? 'Processing...' : 'Choose PDF File'}
          </label>
          
          <p className="mt-4 text-xs text-gray-500">
            Or drag and drop a PDF file here • Max size: 50MB
          </p>
        </div>
      </div>
    </div>
  );
};
