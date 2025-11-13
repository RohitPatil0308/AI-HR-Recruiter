import React, { useState } from 'react';
import type { AnalysisResult, Education } from '../types';
import ScoreCircle from './ScoreCircle';
import MailIcon from './icons/MailIcon';
import PhoneIcon from './icons/PhoneIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import ChevronUpIcon from './icons/ChevronUpIcon';
import LightBulbIcon from './icons/LightBulbIcon';
import BriefcaseIcon from './icons/BriefcaseIcon';
import AcademicCapIcon from './icons/AcademicCapIcon';
import ClipboardIcon from './icons/ClipboardIcon';

interface ResumeSummaryCardProps {
    resume: AnalysisResult;
    isSelected: boolean;
    onSelect: () => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
    filterSkill?: string;
}

const EducationCard: React.FC<{ edu: Education }> = ({ edu }) => (
    <div className="p-2 border rounded-md bg-gray-50">
        <p className="font-semibold text-sm text-gray-800">{edu.degree}</p>
        <p className="text-xs text-gray-500">{edu.institution}</p>
        {edu.year && <p className="text-xs text-gray-500">{edu.year}</p>}
    </div>
);

const ResumeSummaryCard: React.FC<ResumeSummaryCardProps> = ({ resume, isSelected, onSelect, isExpanded, onToggleExpand, filterSkill }) => {
    const cardBaseClasses = "p-4 rounded-lg border-2 transition-all duration-300 flex flex-col";
    const cardSelectedClasses = "bg-green-50 border-green-500 shadow-lg";
    const cardUnselectedClasses = "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md";

    const [copiedField, setCopiedField] = useState<'email' | 'phone' | null>(null);

    const isSkillMatching = (skill: string): boolean => {
        if (!filterSkill || filterSkill.trim() === '') {
            return false;
        }
        return skill.toLowerCase().includes(filterSkill.toLowerCase());
    };

    const handleCopy = (textToCopy: string, field: 'email' | 'phone') => {
        if (!navigator.clipboard) {
            console.warn('Clipboard API not supported');
            return;
        }
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopiedField(field);
            setTimeout(() => {
                setCopiedField(null);
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    };

    return (
        <div className={`${cardBaseClasses} ${isSelected ? cardSelectedClasses : cardUnselectedClasses}`}>
            {/* --- Header --- */}
            <div className="flex items-start justify-between mb-4">
                <div 
                    className="flex-1 pr-4 cursor-pointer"
                    onClick={onSelect}
                    role="checkbox"
                    aria-checked={isSelected}
                >
                    <h3 className="font-bold text-lg text-gray-900 truncate">{resume.candidateName}</h3>
                    <p className="text-sm text-gray-500">Total Experience: {resume.totalExperience}</p>
                </div>
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={onSelect}
                    className="form-checkbox h-5 w-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                    aria-label={`Select ${resume.candidateName}`}
                />
            </div>
            
            {/* --- Expanded View --- */}
            {isExpanded && (
                <div className="space-y-4 mb-4">
                    {/* Contact Info */}
                    <div className="space-y-2">
                         {resume.email && (
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <div className="flex items-center min-w-0">
                                    <MailIcon className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0" />
                                    <span className="truncate" title={resume.email}>{resume.email}</span>
                                </div>
                                <button
                                    onClick={() => handleCopy(resume.email!, 'email')}
                                    className="ml-2 px-2 py-1 text-xs font-semibold rounded-md transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center w-20"
                                    aria-label="Copy email"
                                >
                                    {copiedField === 'email' ? 'Copied!' : <ClipboardIcon className="w-4 h-4" />}
                                </button>
                            </div>
                        )}
                        {resume.phone && (
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <div className="flex items-center min-w-0">
                                    <PhoneIcon className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0" />
                                    <span className="truncate" title={resume.phone}>{resume.phone}</span>
                                </div>
                                <button
                                    onClick={() => handleCopy(resume.phone!, 'phone')}
                                    className="ml-2 px-2 py-1 text-xs font-semibold rounded-md transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center w-20"
                                    aria-label="Copy phone number"
                                >
                                    {copiedField === 'phone' ? 'Copied!' : <ClipboardIcon className="w-4 h-4" />}
                                </button>
                            </div>
                        )}
                    </div>
                     {/* Education */}
                    <div>
                         <h4 className="flex items-center text-sm font-semibold text-gray-600 mb-2">
                            <AcademicCapIcon className="w-4 h-4 mr-2" /> Education
                        </h4>
                        <div className="space-y-2">
                           {resume.education.map((edu, i) => <EducationCard key={i} edu={edu} />)}
                        </div>
                    </div>
                     {/* Suitable Roles */}
                    <div>
                        <h4 className="flex items-center text-sm font-semibold text-gray-600 mb-2">
                            <BriefcaseIcon className="w-4 h-4 mr-2" /> Suitable Roles
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {resume.suitableJobRoles.map((role) => (
                                <span key={role} className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-1 rounded-full">{role}</span>
                            ))}
                        </div>
                    </div>
                     {/* All Skills */}
                    <div>
                         <h4 className="flex items-center text-sm font-semibold text-gray-600 mb-2">
                             <LightBulbIcon className="w-4 h-4 mr-2" /> All Skills
                        </h4>
                         <div className="flex flex-wrap gap-2">
                            {resume.keySkills.map((skill) => (
                                <span
                                    key={skill}
                                    className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                                        isSkillMatching(skill)
                                            ? 'bg-yellow-200 text-yellow-900 ring-1 ring-yellow-400'
                                            : 'bg-blue-100 text-blue-800'
                                    }`}
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

             {/* --- Collapsed Skills Preview --- */}
             {!isExpanded && resume.keySkills && resume.keySkills.length > 0 && (
                <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                        {resume.keySkills.slice(0, 3).map((skill) => (
                            <span
                                key={skill}
                                className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                                    isSkillMatching(skill)
                                        ? 'bg-yellow-200 text-yellow-900 ring-1 ring-yellow-400'
                                        : 'bg-blue-100 text-blue-800'
                                }`}
                            >
                                {skill}
                            </span>
                        ))}
                        {resume.keySkills.length > 3 && (
                            <span className="text-xs font-semibold text-gray-600 self-center bg-gray-200 px-2.5 py-1 rounded-full">
                                +{resume.keySkills.length - 3} more
                            </span>
                        )}
                    </div>
                </div>
            )}


            {/* --- Footer --- */}
            <div className="mt-auto">
                <div className="flex items-end justify-between">
                    <div className="flex-shrink-0">
                        <ScoreCircle score={resume.jobFitScore} />
                    </div>
                    <p className="text-xs text-gray-500 text-right ml-2 italic">
                        "{resume.jobFitScoreReason}"
                    </p>
                </div>
                <button
                    onClick={onToggleExpand}
                    className="w-full mt-4 text-center text-sm font-semibold text-gray-500 hover:text-gray-800 flex items-center justify-center py-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
                    aria-expanded={isExpanded}
                >
                    {isExpanded ? 'Show Less' : 'Show More'}
                    {isExpanded ? <ChevronUpIcon className="w-4 h-4 ml-1" /> : <ChevronDownIcon className="w-4 h-4 ml-1" />}
                </button>
            </div>
        </div>
    );
};

export default ResumeSummaryCard;