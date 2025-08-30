import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ContentDisplay from './components/ContentDisplay';
import { fetchModernistInfo, fetchComparativeAnalysis } from './services/geminiService';
import type { ModernistInfo, ComparativeAnalysis } from './types';

const App: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [content, setContent] = useState<ModernistInfo | null>(null);
  const [comparisonContent, setComparisonContent] = useState<ComparativeAnalysis | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [comparisonTopics, setComparisonTopics] = useState<string[]>([]);

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
    <div className="flex h-screen bg-[#fdfdfc] text-neutral-800">
      <Sidebar 
        topics={topics} 
        selectedTopic={selectedTopic} 
        onSelectTopic={handleSelectTopic}
        isLoading={isLoading}
        isComparing={isComparing}
        toggleComparisonMode={handleToggleComparisonMode}
        comparisonTopics={comparisonTopics}
      />
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
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
  );
};

export default App;