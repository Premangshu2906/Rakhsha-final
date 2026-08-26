import React from 'react';
import { X, Printer, Download, BookOpen, Shield, FileText, CheckCircle } from 'lucide-react';

export default function DocumentViewerModal({ document, isOpen, onClose }) {
  if (!isOpen || !document) return null;

  const handleDownloadSlip = () => {
    const slipText = 
`========================================================================
GOVERNMENT OF INDIA - MINISTRY OF SOCIAL JUSTICE AND EMPOWERMENT
NATIONAL HELPLINE AGAINST ATROCITIES (NHAA - 14566)
OFFICIAL STATUTORY DOCUMENT / GAZETTE REPOSITORY
========================================================================

Title: ${document.title}
Hindi Title: ${document.hindiTitle}
Act / Gazette Ref: ${document.actNo}
Date of Notification: ${document.date}
Issuing Authority: ${document.ministry}
Category: ${document.category}

SUMMARY:
${document.summary}

KEY STATUTORY PROVISIONS:
${document.keyProvisions.map(p => `- ${p.sec}: ${p.desc}`).join('\n')}

========================================================================
FULL OFFICIAL TEXT:
========================================================================

${document.fullText}

========================================================================
Official Gazette Certified by NHAA Platform &bull; Digital India
========================================================================`;

    const blob = new Blob([slipText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${document.pdfName.replace('.pdf', '')}_Certified.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-600/30 border border-indigo-400/30 rounded-2xl text-indigo-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  {document.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">{document.fileSize}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white mt-1">
                {document.title}
              </h3>
              <p className="text-xs text-amber-400 font-medium">
                {document.hindiTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Act / Gazette Reference</span>
              <strong className="text-indigo-300">{document.actNo}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Notification Date</span>
              <strong className="text-slate-200">{document.date}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Issuing Authority</span>
              <strong className="text-slate-200">{document.ministry}</strong>
            </div>
          </div>

          {/* Executive Summary */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Statutory Executive Summary</span>
            </h4>
            <p className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 text-slate-300 leading-relaxed font-sans">
              {document.summary}
            </p>
          </div>

          {/* Key Provisions */}
          <div>
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4" />
              <span>Key Legal Sections & Safeguards</span>
            </h4>
            <div className="space-y-2">
              {document.keyProvisions.map((prov, i) => (
                <div key={i} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-start space-x-2.5">
                  <span className="bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded text-[11px] font-mono font-bold border border-indigo-700/50 flex-shrink-0">
                    {prov.sec}
                  </span>
                  <span className="text-slate-200 text-xs leading-relaxed">{prov.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Full Official Gazette Text */}
          <div>
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <FileText className="w-4 h-4" />
              <span>Official Gazette Full Legal Text</span>
            </h4>
            <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-slate-300 font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
              {document.fullText}
            </pre>
          </div>
        </div>

        {/* Modal Footer Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            Digitally certified copy &bull; Ministry of Social Justice and Empowerment
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center space-x-1.5 transition border border-slate-700"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={handleDownloadSlip}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>Download Certified Gazette</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
