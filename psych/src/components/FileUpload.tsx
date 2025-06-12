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
    <div className="relative">
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
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer text-xs font-medium border ${
          isUploading
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200'
            : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
      >
        {isUploading ? (
          <>
            <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            Uploading...
          </>
        ) : (
          <>
            <IoCloudUploadOutline className="w-3 h-3" />
            Upload PDF
          </>
        )}
      </label>
    </div>
  );
};
