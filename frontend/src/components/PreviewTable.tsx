import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface PreviewTableProps {
  previewHeaders: string[];
  previewData: any[];
  isUploading: boolean;
  onConfirmImport: () => void;
}

export default function PreviewTable({ previewHeaders, previewData, isUploading, onConfirmImport }: PreviewTableProps) {
  if (previewData.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Preview Data</h2>
          <p className="text-sm text-slate-500">Review the extracted columns before processing with AI.</p>
        </div>
        <button
          onClick={onConfirmImport}
          disabled={isUploading}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-sm transition-all ${
            isUploading 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
              : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:-translate-y-0.5 border border-emerald-700'
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="animate-spin w-4 h-4" />
              Processing with AI...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Confirm & Extract CRM Fields
            </>
          )}
        </button>
      </div>

      <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar bg-white">
        <table className="w-full text-left border-collapse min-w-max">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              {previewHeaders.map(header => (
                <th key={header} className="p-4 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {previewData.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                {previewHeaders.map(header => (
                  <td key={header} className="p-4 text-sm text-slate-700 max-w-xs truncate">
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
