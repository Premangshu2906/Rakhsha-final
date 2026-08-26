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
    <section className="my-10 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-slate-100" id="statutoryDocuments">
      {/* Background Graphic Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Section Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-400/20 px-3 py-1 rounded-full text-xs font-bold text-indigo-400 mb-2">
            <Scale className="w-3.5 h-3.5" />
            <span>Ministry of Social Justice and Empowerment</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            NHAA Statutory Acts, Gazettes &amp; Compensation Slabs
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Complete official repository of the SC/ST (PoA) Act 1989, 2018 Section 18A Amendment, 2016 Relief Norms, PCR Act 1955, and Form-I claim templates.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="bg-slate-800 border border-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-xl font-mono">
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedCat === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700'
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
            className="w-full bg-slate-950 text-xs p-2.5 pl-8 rounded-xl border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocs.map(doc => (
          <div
            key={doc.id}
            className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-xl group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  {doc.category}
                </span>
                <span className="text-[11px] font-mono text-slate-400">{doc.fileSize}</span>
              </div>

              <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-indigo-300 transition line-clamp-2 mb-1">
                {doc.title}
              </h3>
              <p className="text-xs text-amber-400/90 font-medium mb-3 line-clamp-1">
                {doc.hindiTitle}
              </p>

              <div className="text-[11px] text-slate-400 mb-3 space-y-0.5">
                <div><strong className="text-slate-300">Ref:</strong> {doc.actNo}</div>
                <div><strong className="text-slate-300">Date:</strong> {doc.date}</div>
              </div>

              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4">
                {doc.summary}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
              <button
                onClick={() => setActiveModalDoc(doc)}
                className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center space-x-1.5 transition"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>Read Full Act</span>
              </button>
              <button
                onClick={() => handleDownload(doc)}
                title="Download Certified Gazette"
                className="py-2 px-3 bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1 transition"
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
