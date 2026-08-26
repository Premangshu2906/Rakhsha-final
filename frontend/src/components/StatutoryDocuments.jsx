import React, { useState } from 'react';
import { BookOpen, Search, Download, FileText, ExternalLink, ShieldCheck, Scale, Award } from 'lucide-react';
import { NHAA_DOCUMENTS } from '../data/documents';
import DocumentViewerModal from './DocumentViewerModal';

const CATEGORIES = [
  'All',
  'Acts & Legislations',
  'Amendments & Gazettes',
  'Relief Norms & Slabs',
  'Operational Manuals & SOPs',
  'Forms & Templates'
];

export default function StatutoryDocuments() {
  const [selectedCat, setSelectedCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalDoc, setActiveModalDoc] = useState(null);

  const filteredDocs = NHAA_DOCUMENTS.filter(doc => {
    const matchesCat = selectedCat === 'All' || doc.category.toLowerCase().includes(selectedCat.toLowerCase());
    const matchesQuery = searchQuery === '' || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.hindiTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.actNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleDownload = (doc) => {
    const blob = new Blob([
      `========================================================================\n` +
      `GOVERNMENT OF INDIA - MINISTRY OF SOCIAL JUSTICE AND EMPOWERMENT\n` +
      `NATIONAL HELPLINE AGAINST ATROCITIES (NHAA - 14566)\n` +
      `OFFICIAL STATUTORY DOCUMENT / GAZETTE REPOSITORY\n` +
      `========================================================================\n\n` +
      `Title: ${doc.title}\n` +
      `Hindi Title: ${doc.hindiTitle}\n` +
      `Act / Gazette Ref: ${doc.actNo}\n` +
      `Date: ${doc.date}\n` +
      `Issuing Authority: ${doc.ministry}\n\n` +
      `SUMMARY:\n${doc.summary}\n\n` +
      `KEY PROVISIONS:\n` +
      doc.keyProvisions.map(p => `- ${p.sec}: ${p.desc}`).join('\n') + `\n\n` +
      `========================================================================\n` +
      `FULL OFFICIAL TEXT:\n` +
      `========================================================================\n\n` +
      doc.fullText + `\n\n` +
      `Official Gazette Certified by NHAA Platform\n`
    ], { type: 'text/plain;charset=utf-8' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.pdfName.replace('.pdf', '')}_Certified.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-soft-sm relative overflow-hidden" id="statutoryDocuments">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full text-xs font-bold text-blue-700 mb-2">
            <Scale className="w-3.5 h-3.5 text-blue-600" />
            <span>Ministry of Social Justice and Empowerment</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            NHAA Statutory Acts, Gazettes &amp; Compensation Slabs
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Official legal publications, mandatory relief compensation norms, standard operating procedures, and claim forms under the SC/ST (Prevention of Atrocities) Act.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-xl font-mono border border-slate-200">
            {filteredDocs.length} Documents Available
          </span>
        </div>
      </div>

      {/* Filter Pills & Search Bar */}
      <div className="my-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCat === cat
                  ? 'bg-blue-600 text-white shadow-soft-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Section 18A, Relief slabs..."
            className="w-full bg-slate-50 text-xs p-2.5 pl-8 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocs.map(doc => (
          <div
            key={doc.id}
            className="bg-slate-50/70 border border-slate-200 hover:border-blue-200 hover:bg-white rounded-2xl p-5 flex flex-col justify-between transition-all hover:-translate-y-0.5 hover:shadow-soft-md group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  {doc.category}
                </span>
                <span className="text-[11px] font-mono text-slate-400">{doc.fileSize}</span>
              </div>

              <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-blue-700 transition line-clamp-2 mb-1">
                {doc.title}
              </h3>
              <p className="text-xs text-amber-700 font-medium mb-3 line-clamp-1">
                {doc.hindiTitle}
              </p>

              <div className="text-[11px] text-slate-500 mb-3 space-y-0.5">
                <div><strong className="text-slate-700">Ref:</strong> {doc.actNo}</div>
                <div><strong className="text-slate-700">Date:</strong> {doc.date}</div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4 font-sans">
                {doc.summary}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200/80 flex items-center gap-2">
              <button
                onClick={() => setActiveModalDoc(doc)}
                className="flex-1 py-2 px-3 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 flex items-center justify-center space-x-1.5 transition shadow-soft-sm"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Read Full Act</span>
              </button>
              <button
                onClick={() => handleDownload(doc)}
                title="Download Certified Text / Slip"
                className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1 transition shadow-soft-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Document Reader Modal */}
      <DocumentViewerModal
        document={activeModalDoc}
        isOpen={!!activeModalDoc}
        onClose={() => setActiveModalDoc(null)}
      />
    </section>
  );
}
