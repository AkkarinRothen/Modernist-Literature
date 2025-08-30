import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import ContentDisplay from './components/ContentDisplay.jsx';
import { fetchModernistInfo, fetchComparativeAnalysis } from './services/geminiService.js';
import { type ModernistInfo, type ComparativeAnalysis } from './types.js';

const App: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [content, setContent] = useState<ModernistInfo | null>(null);
  const [comparisonContent, setComparisonContent] = useState<ComparativeAnalysis | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [comparisonTopics, setComparisonTopics] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const topics = [
    "Stream of Consciousness",
    "Alienation and Disillusionment",
    "Fragmentation in Narrative",
    "The 'New Woman'",
    "Existentialism",
    "James Joyce",
    "Virginia Woolf",
    "T. S. Eliot",
    "Ezra Pound",
    "William Faulkner",
    "The Cat in the Rain",
    "The Glass Menagerie",
    "Kew Gardens",
    "A Good Man Is Hard to Find",
    "Eveline"
  ];

  const handleToggleComparisonMode = () => {
    setIsComparing(prev => !prev);
    setComparisonTopics([]);
    setSelectedTopic(null);
    setContent(null);
    setComparisonContent(null);
    setError(null);
  };

  const handleSelectTopic = useCallback(async (topic: string) => {
    if (isComparing) {
      setComparisonTopics(prev => {
        const newTopics = prev.includes(topic)
          ? prev.filter(t => t !== topic)
          : [...prev, topic];
        
        // Return new state and handle async logic in useEffect
        return newTopics.slice(0, 2);
      });
    } else {
      setSelectedTopic(topic);
      setIsLoading(true);
      setError(null);
      setContent(null);
      setComparisonContent(null);
      
      try {
        const result = await fetchModernistInfo(topic, topics);
        setContent(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    }
  }, [isComparing, topics]);

  useEffect(() => {
    const runComparison = async () => {
      if (isComparing && comparisonTopics.length === 2) {
        setIsLoading(true);
        setError(null);
        setContent(null);
        setComparisonContent(null);

        try {
          const [topic1, topic2] = comparisonTopics;
          const result = await fetchComparativeAnalysis(topic1, topic2);
          setComparisonContent(result);
        } catch (err) {
          setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
          setIsLoading(false);
          setIsComparing(false);
          setComparisonTopics([]);
        }
      }
    };
    runComparison();
  }, [comparisonTopics, isComparing]);


  return (
    <div className="relative min-h-screen lg:flex bg-[#fdfdfc] text-neutral-800">
      <Sidebar 
        topics={topics} 
        selectedTopic={selectedTopic} 
        onSelectTopic={handleSelectTopic}
        isLoading={isLoading}
        isComparing={isComparing}
        toggleComparisonMode={handleToggleComparisonMode}
        comparisonTopics={comparisonTopics}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between p-4 sm:p-6 border-b border-neutral-200 bg-[#fdfdfc]/80 backdrop-blur-sm sticky top-0 z-10">
          <h1 className="text-xl font-bold text-neutral-800 tracking-tight">Modernist Explorer</h1>
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-2 -mr-2 text-neutral-600 hover:text-neutral-900" 
            aria-label="Open menu"
            aria-controls="main-sidebar"
            aria-expanded={isSidebarOpen}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>

        <main id="main-content" className="flex-1 p-4 sm:p-8 lg:p-12 overflow-y-auto" aria-live="polite" aria-busy={isLoading}>
          <ContentDisplay 
            content={content} 
            comparisonContent={comparisonContent}
            isLoading={isLoading} 
            error={error}
            selectedTopic={selectedTopic}
            onSelectTopic={handleSelectTopic}
            isComparing={isComparing}
            comparisonTopics={comparisonTopics}
          />
        </main>
      </div>
    </div>
  );
};

export default App;