import React, { useState, useCallback } from 'react';
import type { AnalysisResult } from './types';
import { analyzeResume } from './services/geminiService';
import ResumeUploader from './components/ResumeUploader';
import SpinnerIcon from './components/icons/SpinnerIcon';
import ResumeComparison from './components/ResumeComparison';

const App: React.FC = () => {
    const [analyzedResumes, setAnalyzedResumes] = useState<AnalysisResult[]>([]);
    const [jobDescription, setJobDescription] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = useCallback(async (selectedFile: File) => {
        if (!selectedFile) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await analyzeResume(selectedFile, jobDescription);
            setAnalyzedResumes(prev => [...prev, result]);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred during analysis.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [jobDescription]);

    const handleClearAll = () => {
        setAnalyzedResumes([]);
        setError(null);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8 font-sans">
            <header className="text-center mb-8 w-full max-w-4xl">
                 <h1 className="text-4xl sm:text-5xl font-bold text-green-700">
                    AI HR Recruiter
                </h1>
                <p className="text-lg text-gray-500 mt-1">by Rohit</p>
                <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                    Upload candidate resumes in PDF, DOCX, or TXT format to analyze and compare them side-by-side.
                </p>
            </header>
            <main className="w-full max-w-4xl">
                <div className="bg-white rounded-xl shadow-lg transition-all duration-300">
                    <ResumeUploader 
                        onFileSelect={handleFileSelect} 
                        jobDescription={jobDescription} 
                        onJobDescriptionChange={setJobDescription} 
                        isAnalyzing={isLoading}
                    />
                </div>

                {isLoading && (
                     <div className="text-center p-8 mt-6">
                        <div className="flex justify-center items-center mb-4">
                            <SpinnerIcon className="h-12 w-12 text-orange-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-700">Analyzing Resume...</h2>
                        <p className="text-gray-500">Our AI is working its magic. This might take a moment.</p>
                    </div>
                )}

                {error && (
                    <div className="mt-6 text-center p-8 bg-red-50 border border-red-200 rounded-lg">
                        <h2 className="text-xl font-semibold text-red-700">Analysis Failed</h2>
                        <p className="text-red-600 mt-2 mb-4">{error}</p>
                        <button onClick={() => setError(null)} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">
                            Dismiss
                        </button>
                    </div>
                )}
                
                {analyzedResumes.length > 0 && (
                    <div className="mt-8">
                        <ResumeComparison 
                            resumes={analyzedResumes} 
                            onClearAll={handleClearAll}
                            jobDescription={jobDescription} 
                        />
                    </div>
                )}
            </main>
            <footer className="text-center mt-8 text-sm text-gray-500">
                <p>Powered by Gemini API</p>
            </footer>
        </div>
    );
};

export default App;