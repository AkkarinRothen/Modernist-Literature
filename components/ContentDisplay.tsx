
import React, { useState, useEffect } from 'react';
import type { ModernistInfo, AuthorDetails, ComparativeAnalysis } from '../types.ts';
import { fetchAuthorBiography } from '../services/geminiService.ts';
import CharacterRelationshipDiagram from './CharacterRelationshipDiagram.tsx';
import ComparisonDisplay from './ComparisonDisplay.tsx';

interface ContentDisplayProps {
  content: ModernistInfo | null;
  comparisonContent: ComparativeAnalysis | null;
  isLoading: boolean;
  error: string | null;
  selectedTopic: string | null;
  onSelectTopic: (topic: string) => void;
  isComparing: boolean;
  comparisonTopics: string[];
}

const LoadingIndicator: React.FC<{ topicName: string | null, comparisonTopics: string[] }> = ({ topicName, comparisonTopics }) => {
    const isComparing = comparisonTopics.length > 0;
    const title = isComparing 
        ? `Comparing "${comparisonTopics[0]}" and "${comparisonTopics[1]}"`
        : `Analyzing "${topicName}"`;

    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-full max-w-lg">
                <svg className="animate-spin h-8 w-8 text-neutral-500 mx-auto mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <h2 className="text-3xl font-semibold text-neutral-700 tracking-tight">
                    {title}
                </h2>
                <p className="text-neutral-500 mt-3">The AI is delving into the literary archives...</p>
                <div className="animate-pulse space-y-4 mt-12 opacity-60">
                    <div className="h-6 bg-neutral-200 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-neutral-200 rounded w-full mx-auto"></div>
                    <div className="h-4 bg-neutral-200 rounded w-5/6 mx-auto"></div>
                </div>
            </div>
        </div>
    )
};


const InitialState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-9-5.747h18" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />
        </svg>
        <h2 className="text-4xl font-semibold text-neutral-700">Explore Modernism</h2>
        <p className="mt-2 max-w-lg">
            Select a theme, concept, or author from the panel on the left to begin your journey into one of literature's most revolutionary periods.
        </p>
  </div>
);

const ComparisonInitialState: React.FC<{ selectionCount: number }> = ({ selectionCount }) => (
    <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h2 className="text-4xl font-semibold text-neutral-700">Comparative Analysis</h2>
        <p className="mt-2 max-w-lg">
            {selectionCount < 2 
                ? `Select ${2 - selectionCount} more topic${2 - selectionCount > 1 ? 's' : ''} from the sidebar to generate a comparison.`
                : 'Generating comparison...'}
        </p>
    </div>
);


const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-full text-center text-red-700 bg-red-50 p-8 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-2xl font-bold">Analysis Failed</h2>
        <p className="mt-2">{message}</p>
    </div>
);


const ContentDisplay: React.FC<ContentDisplayProps> = ({ 
    content, 
    comparisonContent,
    isLoading, 
    error, 
    selectedTopic, 
    onSelectTopic,
    isComparing,
    comparisonTopics
}) => {
  const [authorBios, setAuthorBios] = useState<Record<string, AuthorDetails> | null>(null);
  const [isBiosLoading, setIsBiosLoading] = useState(false);

  useEffect(() => {
    setAuthorBios(null);

    if (content?.works) {
      const fetchBios = async () => {
        setIsBiosLoading(true);
        try {
          const uniqueAuthors = [...new Set(content.works.map(work => work.author))];
          const bioPromises = uniqueAuthors.map(author => 
            fetchAuthorBiography(author).then(details => ({ author, details }))
          );
          const results = await Promise.all(bioPromises);
          const biosMap = results.reduce((acc, { author, details }) => {
            acc[author] = details;
            return acc;
          }, {} as Record<string, AuthorDetails>);
          setAuthorBios(biosMap);
        } catch (err) {
          console.error("Failed to fetch author biographies:", err);
        } finally {
          setIsBiosLoading(false);
        }
      };

      fetchBios();
    }
  }, [content]);

  if (isLoading) {
    return <LoadingIndicator topicName={selectedTopic} comparisonTopics={comparisonTopics} />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }
  
  if (comparisonContent) {
    return <ComparisonDisplay data={comparisonContent} />;
  }

  if (isComparing) {
      return <ComparisonInitialState selectionCount={comparisonTopics.length} />;
  }

  if (!content) {
    return <InitialState />;
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-12">
      <header className="pb-4 border-b border-neutral-200">
        <h2 className="text-5xl font-bold text-neutral-900 tracking-tighter">{content.topic}</h2>
      </header>
      
      <section>
        <h3 className="text-3xl font-semibold text-neutral-800 mb-4">Summary</h3>
        <p className="text-lg text-neutral-600 leading-relaxed whitespace-pre-wrap">{content.summary}</p>
      </section>

      {content.setting && (
        <section>
          <h3 className="text-3xl font-semibold text-neutral-800 mb-4">Setting</h3>
          <p className="text-lg text-neutral-600 leading-relaxed">{content.setting}</p>
        </section>
      )}

      {content.characters && content.characters.length > 0 && (
        <section>
          <h3 className="text-3xl font-semibold text-neutral-800 mb-4">Key Characters</h3>
          <div className="space-y-4">
            {content.characters.map((char, index) => (
              <div key={index} className="bg-neutral-50/70 p-4 rounded-lg border border-neutral-200">
                <h4 className="font-bold text-lg text-neutral-900">{char.name}</h4>
                <p className="text-neutral-600 mt-1">{char.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {content.characterRelationships && content.characterRelationships.length > 0 && (
        <section>
          <h3 className="text-3xl font-semibold text-neutral-800 mb-4">Character Relationships</h3>
           <div className="bg-neutral-50/70 p-4 rounded-lg border border-neutral-200 w-full" style={{ height: '500px' }}>
              <CharacterRelationshipDiagram relationships={content.characterRelationships} />
            </div>
        </section>
      )}


      {content.themes && content.themes.length > 0 && (
          <section>
            <h3 className="text-3xl font-semibold text-neutral-800 mb-6">Major Themes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {content.themes.map((theme, index) => (
                <div key={index} className="bg-neutral-50/70 border border-neutral-200 p-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-neutral-400">
                   <div className="flex items-start">
                      <div className="flex-shrink-0 h-8 w-8 bg-neutral-800 text-white flex items-center justify-center rounded-full text-sm font-bold mr-4">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-neutral-800 mb-1">{theme.name}</h4>
                        <p className="text-neutral-600">{theme.explanation}</p>
                      </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
      )}
      
      {content.symbols && content.symbols.length > 0 && (
        <section>
          <h3 className="text-3xl font-semibold text-neutral-800 mb-4">Symbolism</h3>
          <dl className="space-y-4">
            {content.symbols.map((item, index) => (
              <div key={index} className="bg-neutral-50/70 border-l-4 border-neutral-800 pl-4 py-3">
                <dt className="font-bold text-lg text-neutral-900">{item.name}</dt>
                <dd className="text-neutral-600 mt-1">{item.meaning}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}


      {content.characteristics && content.characteristics.length > 0 && (
        <section>
          <h3 className="text-3xl font-semibold text-neutral-800 mb-6">Key Characteristics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.characteristics.map((char, index) => (
              <div key={index} className="bg-neutral-50/70 border border-neutral-200 p-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-neutral-400">
                 <div className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 bg-neutral-800 text-white flex items-center justify-center rounded-full text-sm font-bold mr-4">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-neutral-800 mb-1">{char.name}</h4>
                      <p className="text-neutral-600">{char.explanation}</p>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="text-3xl font-semibold text-neutral-800 mb-4">Works Cited</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {content.works.map((work, index) => (
            <div key={index} className="bg-neutral-100/80 p-4 rounded-lg border border-neutral-200">
              <p className="font-bold text-neutral-900">{work.title}</p>
              <p className="text-sm text-neutral-500">{work.author}</p>
            </div>
          ))}
        </div>
      </section>

      {isBiosLoading && (
        <div className="text-center py-4">
          <p className="text-neutral-500 animate-pulse">Loading author biographies...</p>
        </div>
      )}

      {authorBios && Object.keys(authorBios).length > 0 && (
        <section>
          <h3 className="text-3xl font-semibold text-neutral-800 mb-4">Author Biographies</h3>
          <div className="space-y-4">
            {Object.entries(authorBios).map(([author, { bio, dates }]) => (
              <div key={author} className="flex items-start bg-neutral-50/70 p-4 rounded-lg border border-neutral-200 space-x-4">
                <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-neutral-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-bold text-lg text-neutral-900">{author}</h4>
                    {dates && <p className="text-sm text-neutral-500 font-mono tracking-tight ml-4">{dates}</p>}
                  </div>
                  <p className="text-neutral-600 mt-1">{bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {content.relatedConcepts && content.relatedConcepts.length > 0 && (
        <section>
          <h3 className="text-3xl font-semibold text-neutral-800 mb-4">Related Concepts</h3>
          <div className="flex flex-wrap gap-3">
            {content.relatedConcepts.map((concept) => (
              <button
                key={concept}
                onClick={() => onSelectTopic(concept)}
                className="bg-neutral-200/70 text-neutral-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-neutral-300/80 transition-colors duration-200 border border-neutral-200"
              >
                {concept}
              </button>
            ))}
          </div>
        </section>
      )}

      {content.glossary && content.glossary.length > 0 && (
        <section>
          <h3 className="text-3xl font-semibold text-neutral-800 mb-4">Glossary of Terms</h3>
          <dl className="space-y-4">
            {content.glossary.map((item, index) => (
              <div key={index} className="bg-neutral-50/70 border-l-4 border-neutral-800 pl-4 py-3">
                <dt className="font-bold text-lg text-neutral-900">{item.term}</dt>
                <dd className="text-neutral-600 mt-1">{item.definition}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
};

export default ContentDisplay;