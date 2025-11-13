import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult, ComparisonInsight } from '../types';

if (!process.env.API_KEY) {
  // This will be handled by the execution environment.
  // In a local dev environment, you would need to set this.
  console.warn("API_KEY is not set. The application will not work without it.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    candidateName: { type: Type.STRING, description: "The full name of the candidate." },
    email: { type: Type.STRING, description: "The candidate's primary email address, if available." },
    phone: { type: Type.STRING, description: "The candidate's primary phone number, if available." },
    keySkills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of the candidate's most important technical and soft skills. Maximum 10 skills."
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          degree: { type: Type.STRING, description: "The degree obtained, e.g., 'Bachelor of Science in Computer Science'." },
          institution: { type: Type.STRING, description: "The name of the university or institution." },
          year: { type: Type.STRING, description: "The year of graduation or completion, e.g., '2020'." }
        },
        required: ['degree', 'institution']
      },
      description: "A list of the candidate's educational qualifications."
    },
    totalExperience: {
      type: Type.STRING,
      description: "A concise summary of the candidate's total years of professional experience, e.g., '8+ years'."
    },
    suitableJobRoles: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of 3-5 job roles the candidate would be a good fit for."
    },
    jobFitScore: {
      type: Type.NUMBER,
      description: "A score from 1 to 10 indicating the overall suitability and strength of the candidate's profile. 1 is low, 10 is excellent."
    },
    jobFitScoreReason: {
        type: Type.STRING,
        description: "A brief, one-sentence explanation for the job fit score, highlighting the main reasons (e.g., strong alignment on key skills but lacks required years of experience)."
    }
  },
  required: ['candidateName', 'keySkills', 'education', 'totalExperience', 'suitableJobRoles', 'jobFitScore', 'jobFitScoreReason']
};

const comparisonSchema = {
    type: Type.OBJECT,
    properties: {
        bestFitCandidateName: {
            type: Type.STRING,
            description: "The full name of the candidate who is the best fit for the job."
        },
        recommendationReason: {
            type: Type.STRING,
            description: "A detailed, multi-sentence paragraph explaining why the recommended candidate is the best fit, comparing them against the others."
        },
        candidateComparison: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    candidateName: { type: Type.STRING },
                    strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 2-3 key strengths for this candidate relevant to the job description." },
                    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 1-2 potential weaknesses or areas for improvement for this candidate." }
                },
                required: ['candidateName', 'strengths', 'weaknesses']
            }
        }
    },
    required: ['bestFitCandidateName', 'recommendationReason', 'candidateComparison']
};


const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
}

export const analyzeResume = async (resumeFile: File, jobDescription?: string): Promise<AnalysisResult> => {
    try {
        let promptText = `You are an expert AI HR Recruiter. Analyze the following resume file and extract the specified information. Provide the output in a structured JSON format that strictly adheres to the provided schema.`;

        if (jobDescription && jobDescription.trim() !== '') {
            promptText += `\n\nYour analysis MUST be performed in the context of the following job description. The 'jobFitScore' must reflect how well the candidate matches this specific job description. 'SuitableJobRoles' should be roles similar to the one described that the candidate might also be a good fit for.`;
            promptText += `\n\nJob Description:\n---\n${jobDescription}\n---`;
        } else {
            promptText += `\n\nThe 'jobFitScore' should be a general assessment of the candidate's profile strength based on their experience and skills.`;
        }
        
        const resumePart = await fileToGenerativePart(resumeFile);
        const parts = [
            { text: promptText },
            resumePart
        ];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        // Basic validation
        if (!result.candidateName || !Array.isArray(result.keySkills) || typeof result.jobFitScore !== 'number' || !result.jobFitScoreReason) {
            throw new Error("Received malformed data from AI model.");
        }

        return { ...result, id: crypto.randomUUID() } as AnalysisResult;

    } catch (error) {
        console.error("Error analyzing resume with Gemini API:", error);
        if (error instanceof Error && (error.message.includes('malformed') || error.message.includes('JSON'))) {
             throw new Error("The AI failed to analyze the resume structure. Please try a different resume or format.");
        }
        throw new Error("An error occurred while communicating with the AI. Please ensure the API key is valid and try again.");
    }
};

export const compareResumes = async (resumes: AnalysisResult[], jobDescription: string): Promise<ComparisonInsight> => {
    try {
        const candidateData = resumes.map(({ id, ...rest }) => rest);

        let prompt = `You are an expert AI HR Recruiter. I have provided you with JSON data for ${resumes.length} candidates. Your task is to perform a comparative analysis of these candidates for a specific job role.

Job Description:
---
${jobDescription || 'A general professional role.'}
---

Candidate Data:
---
${JSON.stringify(candidateData, null, 2)}
---

Based on the job description and the candidate data, provide a detailed comparison. Identify the best-fit candidate, explain your reasoning, and list the key strengths and weaknesses for each candidate.

Your output MUST be in a structured JSON format that strictly adheres to the provided schema. Do not include any text outside of the JSON object.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: comparisonSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        // Basic validation
        if (!result.bestFitCandidateName || !result.recommendationReason || !Array.isArray(result.candidateComparison)) {
             throw new Error("Received malformed comparison data from AI model.");
        }

        return result as ComparisonInsight;

    } catch (error) {
        console.error("Error comparing resumes with Gemini API:", error);
         if (error instanceof Error && (error.message.includes('malformed') || error.message.includes('JSON'))) {
             throw new Error("The AI failed to generate a comparison. Please try again.");
        }
        throw new Error("An error occurred while communicating with the AI for comparison. Please try again.");
    }
};
