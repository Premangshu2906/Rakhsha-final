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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-900">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {document.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">{document.fileSize}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                {document.title}
              </h3>
              <p className="text-xs text-amber-800 font-medium">
                {document.hindiTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Act / Gazette Reference</span>
              <strong className="text-blue-700">{document.actNo}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Notification Date</span>
              <strong className="text-slate-800">{document.date}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Issuing Authority</span>
              <strong className="text-slate-800">{document.ministry}</strong>
            </div>
          </div>

          {/* Executive Summary */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Statutory Executive Summary</span>
            </h4>
            <p className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-slate-700 leading-relaxed font-sans">
              {document.summary}
            </p>
          </div>

          {/* Key Provisions */}
          <div>
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Key Legal Sections &amp; Safeguards</span>
            </h4>
            <div className="space-y-2">
              {document.keyProvisions.map((prov, i) => (
                <div key={i} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-start space-x-2.5">
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-mono font-bold flex-shrink-0">
                    {prov.sec}
                  </span>
                  <span className="text-slate-700 text-xs leading-relaxed">{prov.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Full Official Gazette Text */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Official Gazette Full Legal Text</span>
            </h4>
            <pre className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-800 font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
              {document.fullText}
            </pre>
          </div>
        </div>

        {/* Modal Footer Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 font-medium">
            Certified Gazette &bull; Ministry of Social Justice and Empowerment
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl flex items-center space-x-1.5 transition border border-slate-200 shadow-soft-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={handleDownloadSlip}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition shadow-md"
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
