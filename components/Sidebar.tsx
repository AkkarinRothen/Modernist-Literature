import React from 'react';

interface SidebarProps {
  topics: string[];
  selectedTopic: string | null;
  onSelectTopic: (topic: string) => void;
  isLoading: boolean;
  isComparing: boolean;
  toggleComparisonMode: () => void;
  comparisonTopics: string[];
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  topics, 
  selectedTopic, 
  onSelectTopic, 
  isLoading,
  isComparing,
  toggleComparisonMode,
  comparisonTopics,
  isOpen,
  onClose
}) => {
  const handleTopicClick = (topic: string) => {
    onSelectTopic(topic);
    onClose();
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>

      <aside className={`fixed inset-y-0 left-0 z-30 w-full max-w-xs bg-neutral-100/95 backdrop-blur-sm border-r border-neutral-200 p-6 flex flex-col transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-1/4 lg:max-w-xs
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <header className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-neutral-800 tracking-tight">Modernist Literature</h1>
            <p className="text-neutral-500 mt-1">An AI-Powered Explorer</p>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 -mt-1 -mr-1 text-neutral-500 hover:text-neutral-800" aria-label="Close menu">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        
        <div className="mb-4">
          <button
            onClick={() => {
              toggleComparisonMode();
              onClose();
            }}
            disabled={isLoading}
            className={`w-full text-center px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 border-2
              ${isComparing
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-transparent text-neutral-600 border-neutral-300 hover:bg-neutral-200/80 hover:border-neutral-400'
              }
              ${isLoading ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            {isComparing ? 'Cancel Comparison' : 'Compare Topics'}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto -mr-3 pr-3">
          <ul>
            {topics.map((topic) => {
              const isSelected = selectedTopic === topic;
              const isComparisonSelected = comparisonTopics.includes(topic);
              let buttonClass = 'text-neutral-600 hover:bg-neutral-200/80';
              
              if (isComparing) {
                if (isComparisonSelected) {
                  buttonClass = 'bg-blue-200/60 text-blue-800 font-semibold border border-blue-400';
                } else {
                   buttonClass = 'text-neutral-600 hover:bg-blue-100/70';
                }
              } else if (isSelected) {
                buttonClass = 'bg-neutral-800 text-white font-semibold shadow-sm';
              }

              return (
                <li key={topic} className="mb-2">
                  <button
                    onClick={() => handleTopicClick(topic)}
                    disabled={isLoading}
                    className={`w-full text-left px-4 py-2 rounded-md text-base transition-all duration-200 
                      ${buttonClass} 
                      ${isLoading ? 'cursor-not-allowed opacity-60' : ''}`}
                  >
                    {topic}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
         <footer className="mt-6 text-xs text-neutral-400">
          <p>&copy; {new Date().getFullYear()} AI Literary Studies. All rights reserved.</p>
        </footer>
      </aside>
    </>
  );
};

export default Sidebar;