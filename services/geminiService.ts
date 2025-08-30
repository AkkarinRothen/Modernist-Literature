import { GoogleGenAI, Type } from "@google/genai";
import type { ModernistInfo, AuthorDetails, ComparativeAnalysis } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// List of specific literary works to trigger a detailed analysis
const literaryWorks = [
    "The Cat in the Rain",
    "The Glass Menagerie",
    "Kew Gardens",
    "A Good Man Is Hard to Find",
    "Eveline"
];

const schema = {
  type: Type.OBJECT,
  properties: {
    topic: { 
      type: Type.STRING,
      description: 'The topic being analyzed.'
    },
    summary: { 
      type: Type.STRING, 
      description: 'A concise, academic summary (2-3 paragraphs) of the topic.' 
    },
    characteristics: {
      type: Type.ARRAY,
      description: 'For general concepts, 3-5 key characteristics or themes related to the topic.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ["name", "explanation"]
      }
    },
    works: {
      type: Type.ARRAY,
      description: '3-5 representative literary works. If the topic is a work itself, list it here.',
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          author: { type: Type.STRING }
        },
        required: ["title", "author"]
      }
    },
    glossary: {
      type: Type.ARRAY,
      description: '2-4 key literary terms or concepts relevant to the topic, with brief definitions.',
      items: {
        type: Type.OBJECT,
        properties: {
          term: { type: Type.STRING },
          definition: { type: Type.STRING }
        },
        required: ["term", "definition"]
      }
    },
    // Optional fields for specific works
    setting: {
        type: Type.STRING,
        description: "A description of the setting of the literary work."
    },
    characters: {
        type: Type.ARRAY,
        description: "An array of key characters from the literary work.",
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING, description: "A brief description of the character's role and significance."}
            },
            required: ["name", "description"]
        }
    },
    characterRelationships: {
        type: Type.ARRAY,
        description: "An array describing the relationships between key characters.",
        items: {
            type: Type.OBJECT,
            properties: {
                character1: { type: Type.STRING },
                character2: { type: Type.STRING },
                relationship: { type: Type.STRING, description: "A brief description of their relationship (e.g., 'Sisters', 'In love with', 'Rivals')."}
            },
            required: ["character1", "character2", "relationship"]
        }
    },
    themes: {
        type: Type.ARRAY,
        description: "An array of major themes from the literary work.",
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                explanation: { type: Type.STRING, description: "A brief explanation of the theme's relevance in the work."}
            },
            required: ["name", "explanation"]
        }
    },
    symbols: {
        type: Type.ARRAY,
        description: "An array of important symbols from the literary work.",
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                meaning: { type: Type.STRING, description: "The symbolic meaning of the item in the context of the work."}
            },
            required: ["name", "meaning"]
        }
    },
    relatedConcepts: {
        type: Type.ARRAY,
        description: "An array of 3-5 thematically related topics selected ONLY from the provided list of available topics.",
        items: {
            type: Type.STRING
        }
    },
  },
  required: ["topic", "summary", "works", "glossary"]
};

const buildPrompt = (topic: string, allTopics: string[]): string => {
    const availableTopics = allTopics.filter(t => t !== topic).join(', ');
    const relatedConceptsInstruction = `
Also, suggest 3-5 thematically related concepts from the following list of available topics: ${availableTopics}.`;

    if (literaryWorks.includes(topic)) {
        return `Provide a detailed literary analysis of the work "${topic}" in the context of modernism. The analysis must include:
1.  A concise summary.
2.  A description of the setting.
3.  A list of key characters and their significance.
4.  A list of key character relationships, describing how they are connected.
5.  A list of major themes.
6.  An analysis of important symbols.
7.  A glossary of 2-4 relevant literary terms.
8.  The work itself listed under "works".
${relatedConceptsInstruction}`;
    }
    return `Provide a detailed analysis of the concept "${topic}" within the context of modernist literature. Cover its main summary, 3-5 key characteristics, list 3-5 significant representative works, and include a glossary of 2-4 relevant literary terms. ${relatedConceptsInstruction}`;
}


export const fetchModernistInfo = async (topic: string, allTopics: string[]): Promise<ModernistInfo> => {
  const prompt = buildPrompt(topic, allTopics);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert literary critic and historian specializing in the modernist period (roughly 1890-1940). Provide clear, concise, and insightful analysis in the requested JSON format. For specific literary works, provide a deep dive into their components. For broad concepts, provide a general overview with examples. For 'relatedConcepts', ONLY select from the list of topics provided in the prompt.",
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.5,
      },
    });

    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);

    // Basic validation
    if (!parsedData.topic || !parsedData.summary || !Array.isArray(parsedData.works)) {
      throw new Error("Received malformed data from the API.");
    }

    return parsedData as ModernistInfo;
  } catch (error) {
    console.error("Error fetching data from Gemini API:", error);
    throw new Error("Failed to retrieve analysis from the AI. The model may be unavailable or the request failed. Please try again later.");
  }
};

const authorSchema = {
  type: Type.OBJECT,
  properties: {
    bio: {
      type: Type.STRING,
      description: "A concise, one-to-two sentence biography for the author, focusing on their connection to modernism."
    },
    dates: {
      type: Type.STRING,
      description: "The author's birth and death years, formatted as 'YYYY-YYYY'."
    }
  },
  required: ["bio", "dates"]
};

export const fetchAuthorBiography = async (authorName: string): Promise<AuthorDetails> => {
  const prompt = `Provide details for the author: ${authorName}.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a literary historian providing brief author biographies. Respond in JSON format with a concise biography and their birth and death years.",
        responseMimeType: "application/json",
        responseSchema: authorSchema,
        temperature: 0.3,
      },
    });

    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);
    
    if (!parsedData.bio || !parsedData.dates) {
        throw new Error("Malformed author data received.");
    }

    return parsedData as AuthorDetails;

  } catch (error) {
    console.error(`Error fetching biography for ${authorName}:`, error);
    return { 
        bio: `Biography for ${authorName} could not be retrieved.`,
        dates: ""
    };
  }
};

const comparisonSchema = {
    type: Type.OBJECT,
    properties: {
        topics: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
        introduction: {
            type: Type.STRING,
            description: "A brief introduction (1-2 paragraphs) setting the context for the comparison."
        },
        similarities: {
            type: Type.ARRAY,
            description: "A list of 3-4 key similarities between the two topics.",
            items: {
                type: Type.OBJECT,
                properties: {
                    point: { type: Type.STRING, description: "A concise title for the point of similarity (e.g., 'Thematic Focus on Alienation')." },
                    explanation: { type: Type.STRING, description: "A detailed explanation of the similarity." }
                },
                required: ["point", "explanation"]
            }
        },
        differences: {
            type: Type.ARRAY,
            description: "A list of 3-4 key differences between the two topics.",
            items: {
                type: Type.OBJECT,
                properties: {
                    point: { type: Type.STRING, description: "A concise title for the point of difference (e.g., 'Narrative Technique')." },
                    explanation: { type: Type.STRING, description: "A detailed explanation of the difference." }
                },
                required: ["point", "explanation"]
            }
        },
        conclusion: {
            type: Type.STRING,
            description: "A concluding paragraph summarizing the relationship between the two topics and their significance in modernism."
        }
    },
    required: ["topics", "introduction", "similarities", "differences", "conclusion"]
};


export const fetchComparativeAnalysis = async (topic1: string, topic2: string): Promise<ComparativeAnalysis> => {
    const prompt = `Provide a detailed comparative analysis of "${topic1}" and "${topic2}" within the context of modernist literature. Your analysis should highlight their key similarities and differences in terms of style, themes, and impact, and conclude with a summary of their relationship.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: "You are an expert literary critic specializing in comparative analysis of the modernist period. Provide a balanced, insightful comparison in the requested JSON format.",
                responseMimeType: "application/json",
                responseSchema: comparisonSchema,
                temperature: 0.6,
            },
        });
        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText);

        if (!parsedData.topics || !parsedData.introduction || !parsedData.similarities) {
            throw new Error("Received malformed comparative data from the API.");
        }
        
        return parsedData as ComparativeAnalysis;
    } catch (error) {
        console.error("Error fetching comparative data from Gemini API:", error);
        throw new Error("Failed to retrieve the comparative analysis. Please try again later.");
    }
};