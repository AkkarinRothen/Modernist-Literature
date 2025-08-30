/** 
 * @file This file defines the TypeScript types for the application. 
 */

export interface ModernistInfo {
  topic: string;
  summary: string;
  characteristics: {
    name: string;
    explanation: string;
  }[];
  works: {
    title: string;
    author: string;
  }[];
  glossary: {
    term: string;
    definition: string;
  }[];
  // Optional fields for detailed analysis of specific works
  characters?: {
    name: string;
    description: string;
  }[];
  themes?: {
    name: string;
    explanation: string;
  }[];
  setting?: string;
  symbols?: {
    name: string;
    meaning: string;
  }[];
  relatedConcepts?: string[];
  characterRelationships?: {
    character1: string;
    character2: string;
    relationship: string;
  }[];
}

export interface AuthorDetails {
  bio: string;
  dates: string;
}

export interface ComparativeAnalysis {
  topics: [string, string];
  introduction: string;
  similarities: {
    point: string;
    explanation: string;
  }[];
  differences: {
    point: string;
    explanation: string;
  }[];
  conclusion: string;
}