import React, { useState, useRef } from 'react';
import { UploadCloud } from 'lucide-react';

interface UploadCSVProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement> | any) => void;
  fileName?: string;
}

export default function UploadCSV({ onFileUpload, fileName }: UploadCSVProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white p-8 border border-slate-200 rounded-3xl shadow-sm transition-all">
      <h2 className="text-lg font-bold text-slate-900 mb-1">Upload CSV File</h2>
      <p className="text-sm text-slate-500 mb-6">Drag and drop your file here or click to browse.</p>

      <div 
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`block w-full border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors group ${
          isDragActive ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
        }`}
      >
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform ${
          isDragActive ? 'bg-emerald-200' : 'bg-emerald-100'
        }`}>
          <UploadCloud className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">
          {isDragActive ? "Drop the CSV here..." : "Drop your CSV file here"}
        </h3>
        <p className="text-sm text-slate-500 mb-2">or click to browse files</p>
        <span className="text-xs text-slate-400 font-medium px-3 py-1 bg-white border border-slate-200 rounded-full inline-block">
          Supported file: .csv (max 5MB)
        </span>
        <input 
          type="file" 
          accept=".csv,text/csv,application/vnd.ms-excel" 
          className="hidden" 
          ref={fileInputRef}
          onChange={onFileUpload}
        />
      </div>

      {fileName && (
        <div className="mt-6 p-4 border border-emerald-200 bg-emerald-50 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
              <UploadCloud size={16} />
            </div>
            <span className="text-sm font-semibold text-emerald-900">{fileName}</span>
          </div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Ready to process</span>
        </div>
      )}
    </div>
  );
}
