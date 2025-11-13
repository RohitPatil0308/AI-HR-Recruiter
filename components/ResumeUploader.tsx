import React, { useState, useCallback, useRef } from 'react';
import UploadIcon from './icons/UploadIcon';

interface ResumeUploaderProps {
    onFileSelect: (file: File) => void;
    jobDescription: string;
    onJobDescriptionChange: (jd: string) => void;
    isAnalyzing: boolean;
}

const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onFileSelect, jobDescription, onJobDescriptionChange, isAnalyzing }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFileSelect(e.target.files[0]);
        }
        // Reset file input to allow uploading the same file again
        e.target.value = '';
    };

    const handleDragEvent = (e: React.DragEvent<HTMLDivElement>, dragging: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        if (isAnalyzing) return;
        setIsDragging(dragging);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        handleDragEvent(e, false);
        if (isAnalyzing) return;
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileSelect(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    const openFileDialog = () => {
        if (isAnalyzing) return;
        fileInputRef.current?.click();
    };

    const uploaderBaseClasses = "relative flex flex-col items-center justify-center w-full p-8 sm:p-12 border-2 border-dashed rounded-lg transition-colors duration-300";
    const uploaderInactiveClasses = "border-gray-300 bg-gray-50";
    const uploaderActiveClasses = "border-green-500 bg-green-100";
    const uploaderDisabledClasses = "cursor-not-allowed opacity-50";

    return (
        <div className="p-6 sm:p-8">
            <div className="mb-8">
                <label htmlFor="job-description" className="block text-lg font-semibold text-gray-800 mb-2">
                    Step 1: Provide Job Description (Optional)
                </label>
                <p className="text-sm text-gray-500 mb-3">
                    Paste a job description for a tailored analysis and a more accurate job fit score.
                </p>
                <textarea
                    id="job-description"
                    rows={8}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="e.g., Seeking a Senior Frontend Engineer with 5+ years of experience in React, TypeScript, and building scalable web applications..."
                    value={jobDescription}
                    onChange={(e) => onJobDescriptionChange(e.target.value)}
                    aria-label="Job Description"
                    disabled={isAnalyzing}
                />
            </div>
            
            <div>
                 <label className="block text-lg font-semibold text-gray-800 mb-2">
                    Step 2: Upload Resume
                </label>
                <div 
                    className={`${uploaderBaseClasses} ${isDragging ? uploaderActiveClasses : uploaderInactiveClasses} ${isAnalyzing ? uploaderDisabledClasses : ''}`}
                    onDragEnter={(e) => handleDragEvent(e, true)}
                    onDragLeave={(e) => handleDragEvent(e, false)}
                    onDragOver={(e) => handleDragEvent(e, true)}
                    onDrop={handleDrop}
                    onClick={openFileDialog}
                    role="button"
                    tabIndex={isAnalyzing ? -1 : 0}
                    aria-label="Resume upload area"
                    onKeyDown={(e) => !isAnalyzing && e.key === 'Enter' && openFileDialog()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.txt,.md,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                        disabled={isAnalyzing}
                    />
                    <div className="text-center cursor-pointer">
                        <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800">
                            Drag & Drop your resume here
                        </h3>
                        <p className="text-gray-500 mt-1">or click to browse files</p>
                        <p className="text-xs text-gray-400 mt-4">
                            Supported formats: PDF, DOCX, TXT, MD
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeUploader;