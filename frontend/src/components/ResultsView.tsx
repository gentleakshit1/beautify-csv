import React from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';

interface ResultsViewProps {
  results: Record<string, any>;
  onReset: () => void;
}

export default function ResultsView({ results, onReset }: ResultsViewProps) {
  if (!results) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">AI Extraction Complete</h2>
          </div>
          <p className="text-sm text-slate-500">Your messy CSV data has been perfectly structured for the CRM.</p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <RotateCcw size={16} />
          Upload Another
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Successfully Imported</p>
          <p className="text-4xl font-extrabold text-emerald-600">{results.total_imported}</p>
        </div>
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Skipped Records</p>
          <p className="text-4xl font-extrabold text-red-500">{results.total_skipped}</p>
        </div>
      </div>

      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Parsed Records Preview</h3>
      
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse min-w-max">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
            <tr>
              {['Name', 'Email', 'Mobile', 'Company', 'Status'].map(header => (
                <th key={header} className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {results.successfully_parsed?.map((record: any, idx: number) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 text-sm font-medium text-slate-900">{record.name}</td>
                <td className="p-4 text-sm text-slate-600">{record.email}</td>
                <td className="p-4 text-sm text-slate-600">{record.mobile_without_country_code}</td>
                <td className="p-4 text-sm text-slate-600">{record.company}</td>
                <td className="p-4 text-sm">
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md">
                    {record.crm_status}
                  </span>
                </td>
              </tr>
            ))}
            {results.successfully_parsed?.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500 text-sm">
                  No records were successfully parsed.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
