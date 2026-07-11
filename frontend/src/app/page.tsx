'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import axios from 'axios';
import { UploadCloud, X } from 'lucide-react';
import UploadCSV from '@/components/UploadCSV';
import PreviewTable from '@/components/PreviewTable';
import ResultsView from '@/components/ResultsView';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement> | any) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        preview: 10,
        complete: (results) => {
          if (results.data.length > 0) {
            setPreviewHeaders(Object.keys(results.data[0] as any));
            setPreviewData(results.data);
            setShowModal(true); // Pop-up the preview!
          }
        },
      });
    }
  };

  const handleConfirmImport = async () => {
    if (!file) return;
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/api/upload-csv/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResults(response.data);
      setShowModal(false); // Close modal on success
    } catch (error) {
      console.error("Error uploading file", error);
      alert("Failed to upload and process CSV.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setFile(null);
    setPreviewData([]);
    setPreviewHeaders([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative overflow-x-hidden">
      {/* Floating Rounded Navbar */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-7xl">
        <nav className="bg-white/80 backdrop-blur-lg border border-slate-200/50 rounded-full px-6 py-3 flex items-center shadow-md">
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white mr-3 shadow-inner">
            <UploadCloud size={16} />
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">
            GrowEasy CRM
          </span>
        </nav>
      </div>

      <main className="flex-1 w-11/12 max-w-[80%] mx-auto p-6 md:p-10 pt-56 space-y-8">
        <div className="text-center mt-32 mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Import Leads via CSV</h1>
          <p className="text-slate-500 max-w-lg mx-auto">Upload a CSV file to bulk import leads into your system. Our AI will intelligently extract the CRM fields.</p>
        </div>

        {!results ? (
          <UploadCSV onFileUpload={handleFileUpload} fileName={file?.name} />
        ) : (
          <ResultsView results={results} onReset={handleReset} />
        )}
      </main>

      {/* Modal for Preview */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Preview Data</h2>
                <p className="text-sm text-slate-500">Review before confirming import</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto bg-slate-50 p-6">
              <PreviewTable 
                previewHeaders={previewHeaders} 
                previewData={previewData} 
                isUploading={isUploading} 
                onConfirmImport={handleConfirmImport} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
