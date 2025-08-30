import React from 'react';
import type { ComparativeAnalysis } from '../types';

interface ComparisonDisplayProps {
  data: ComparativeAnalysis;
}

const ComparisonDisplay: React.FC<ComparisonDisplayProps> = ({ data }) => {
  const { topics, introduction, similarities, differences, conclusion } = data;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-12">
      <header className="pb-4 border-b border-neutral-200 text-center">
        <p className="text-lg text-neutral-500 mb-1">Comparative Analysis</p>
        <h2 className="text-5xl font-bold text-neutral-900 tracking-tighter">
          {topics[0]} <span className="text-neutral-400 font-light">&</span> {topics[1]}
        </h2>
      </header>

      <section>
        <h3 className="text-3xl font-semibold text-neutral-800 mb-4">Introduction</h3>
        <p className="text-lg text-neutral-600 leading-relaxed whitespace-pre-wrap">{introduction}</p>
      </section>

      <section>
        <h3 className="text-3xl font-semibold text-neutral-800 mb-6">Key Similarities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {similarities.map((item, index) => (
            <div key={index} className="bg-green-50/70 border border-green-200 p-6 rounded-lg">
              <div className="flex items-start">
                 <div className="flex-shrink-0 h-8 w-8 bg-green-800 text-white flex items-center justify-center rounded-full font-bold mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                 </div>
                 <div>
                    <h4 className="text-xl font-bold text-green-900 mb-1">{item.point}</h4>
                    <p className="text-green-800/90">{item.explanation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

       <section>
        <h3 className="text-3xl font-semibold text-neutral-800 mb-6">Key Differences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {differences.map((item, index) => (
            <div key={index} className="bg-red-50/60 border border-red-200 p-6 rounded-lg">
              <div className="flex items-start">
                 <div className="flex-shrink-0 h-8 w-8 bg-red-800 text-white flex items-center justify-center rounded-full font-bold mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clipRule="evenodd" />
                    </svg>
                 </div>
                 <div>
                    <h4 className="text-xl font-bold text-red-900 mb-1">{item.point}</h4>
                    <p className="text-red-800/90">{item.explanation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-3xl font-semibold text-neutral-800 mb-4">Conclusion</h3>
        <p className="text-lg text-neutral-600 leading-relaxed whitespace-pre-wrap bg-neutral-50/80 border border-neutral-200 p-6 rounded-lg">{conclusion}</p>
      </section>
    </div>
  );
};

export default ComparisonDisplay;