import React, { useState, useMemo, useEffect } from 'react';
import type { AnalysisResult, ComparisonInsight } from '../types';
import { compareResumes } from '../services/geminiService';
import ResumeSummaryCard from './ResumeSummaryCard';
import UsersIcon from './icons/UsersIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import LightBulbIcon from './icons/LightBulbIcon';
import FilterIcon from './icons/FilterIcon';

interface ResumeComparisonProps {
    resumes: AnalysisResult[];
    onClearAll: () => void;
    jobDescription: string;
}

const ResumeComparison: React.FC<ResumeComparisonProps> = ({ resumes, onClearAll, jobDescription }) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [view, setView] = useState<'list' | 'table'>('list');
    const [sortBy, setSortBy] = useState<'default' | 'score' | 'experience'>('default');
    
    const [insight, setInsight] = useState<ComparisonInsight | null>(null);
    const [isComparing, setIsComparing] = useState(false);
    const [compareError, setCompareError] = useState<string | null>(null);

    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        skill: '',
        score: 0,
        experience: 0,
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: type === 'range' || type === 'number' ? Number(value) : value,
        }));
    };

    const resetFilters = () => {
        setFilters({ skill: '', score: 0, experience: 0 });
    };

    const areFiltersActive = useMemo(() => {
        return filters.skill !== '' || filters.score > 0 || filters.experience > 0;
    }, [filters]);


    const handleSelect = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };
    
    const handleToggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const selectedResumes = useMemo(() => 
        resumes.filter(r => selectedIds.has(r.id)),
    [resumes, selectedIds]);

    const handleCompareClick = async () => {
        setView('table');
        setIsComparing(true);
        setCompareError(null);
        setInsight(null);
        try {
            const result = await compareResumes(selectedResumes, jobDescription);
            setInsight(result);
        } catch (err) {
            if (err instanceof Error) {
                setCompareError(err.message);
            } else {
                setCompareError('An unknown error occurred while generating comparison.');
            }
        } finally {
            setIsComparing(false);
        }
    };
    
    const parseExperience = (experience: string): number => {
        if (!experience) return 0;
        const match = experience.match(/(\d+\.?\d*)/);
        return match ? parseFloat(match[0]) : 0;
    };

    const filteredAndSortedResumes = useMemo(() => {
        const filtered = resumes.filter(resume => {
            const skillMatch = filters.skill ? resume.keySkills.some(s => s.toLowerCase().includes(filters.skill.toLowerCase())) : true;
            const scoreMatch = filters.score > 0 ? resume.jobFitScore >= filters.score : true;
            const experienceMatch = filters.experience > 0 ? parseExperience(resume.totalExperience) >= filters.experience : true;
            return skillMatch && scoreMatch && experienceMatch;
        });

        if (sortBy === 'default') {
            return filtered;
        }
        
        const sorted = [...filtered];
        if (sortBy === 'score') {
            sorted.sort((a, b) => b.jobFitScore - a.jobFitScore);
        } else if (sortBy === 'experience') {
            sorted.sort((a, b) => parseExperience(b.totalExperience) - parseExperience(a.totalExperience));
        }
        return sorted;
    }, [resumes, sortBy, filters]);


    if (view === 'table') {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Candidate Comparison</h2>
                    <button
                        onClick={() => setView('list')}
                        className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Back to List
                    </button>
                </div>
                {isComparing && (
                     <div className="text-center p-8">
                        <div className="flex justify-center items-center mb-4">
                            <SpinnerIcon className="h-12 w-12 text-orange-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-700">Generating Insights...</h2>
                        <p className="text-gray-500">The AI is comparing candidates. This may take a moment.</p>
                    </div>
                )}
                {compareError && (
                    <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
                        <h2 className="text-xl font-semibold text-red-700">Comparison Failed</h2>
                        <p className="text-red-600 mt-2 mb-4">{compareError}</p>
                    </div>
                )}
                {insight && (
                    <div className="space-y-8">
                        {/* Recommendation Section */}
                        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                             <h3 className="text-xl font-bold text-green-800 flex items-center mb-2">
                                <LightBulbIcon className="h-6 w-6 mr-2 text-green-600" />
                                AI Recommendation
                            </h3>
                            <p className="text-lg font-semibold text-gray-800">
                                Best Fit: <span className="text-green-700">{insight.bestFitCandidateName}</span>
                            </p>
                            <p className="text-gray-600 mt-2">{insight.recommendationReason}</p>
                        </div>

                        {/* Side-by-Side Comparison */}
                         <div className={`grid grid-cols-1 md:grid-cols-${selectedResumes.length > 1 ? '2' : '1'} lg:grid-cols-${selectedResumes.length > 2 ? '3' : selectedResumes.length} gap-6`}>
                            {insight.candidateComparison.map((comp) => (
                                <div key={comp.candidateName} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <h4 className="text-lg font-bold text-gray-800">{comp.candidateName}</h4>
                                    <div className="mt-4">
                                        <h5 className="font-semibold text-green-700">Strengths</h5>
                                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mt-1">
                                            {comp.strengths.map(s => <li key={s}>{s}</li>)}
                                        </ul>
                                    </div>
                                    <div className="mt-4">
                                        <h5 className="font-semibold text-red-700">Weaknesses</h5>
                                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mt-1">
                                            {comp.weaknesses.map(w => <li key={w}>{w}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )
    }
    
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-gray-200 pb-4 gap-y-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzed Resumes ({filteredAndSortedResumes.length} / {resumes.length})</h2>
                    <div className="flex items-center gap-2">
                         <span className="text-sm font-semibold text-gray-500 mr-2">Sort by:</span>
                         <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                            <button 
                                onClick={() => setSortBy('score')} 
                                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${sortBy === 'score' ? 'bg-white shadow text-green-700' : 'text-gray-600 hover:bg-gray-200'}`}
                            >
                                Score
                            </button>
                             <button 
                                onClick={() => setSortBy('experience')} 
                                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${sortBy === 'experience' ? 'bg-white shadow text-green-700' : 'text-gray-600 hover:bg-gray-200'}`}
                            >
                                Experience
                            </button>
                         </div>
                         {sortBy !== 'default' && (
                             <button 
                                onClick={() => setSortBy('default')}
                                className="text-sm text-gray-500 hover:text-red-500 font-semibold transition-colors ml-2"
                                title="Reset to original order"
                            >
                                Reset Sort
                            </button>
                         )}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                     <button
                        onClick={onClearAll}
                        className="text-sm text-gray-500 hover:text-red-500 font-semibold transition-colors"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={handleCompareClick}
                        disabled={selectedIds.size < 2}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <UsersIcon className="h-5 w-5 mr-2"/>
                        Compare ({selectedIds.size})
                    </button>
                     <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg border-2 transition-colors ${showFilters || areFiltersActive ? 'bg-green-100 border-green-600 text-green-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                        aria-expanded={showFilters}
                    >
                        <FilterIcon className="h-5 w-5 mr-2" />
                        Filters {areFiltersActive ? '(Active)' : ''}
                    </button>
                </div>
            </div>

            {showFilters && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-fade-in-down">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                        <div>
                            <label htmlFor="skill" className="block text-sm font-medium text-gray-700">Filter by Skill</label>
                            <input
                                type="text"
                                name="skill"
                                id="skill"
                                value={filters.skill}
                                onChange={handleFilterChange}
                                placeholder="e.g., React, Python"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-1">Min. Score: <span className="font-bold text-green-700">{filters.score.toFixed(1)}</span></label>
                            <input
                                type="range"
                                name="score"
                                id="score"
                                min="0"
                                max="10"
                                step="0.5"
                                value={filters.score}
                                onChange={handleFilterChange}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                            />
                        </div>
                        <div>
                            <label htmlFor="experience" className="block text-sm font-medium text-gray-700">Min. Experience (Yrs)</label>
                            <input
                                type="number"
                                name="experience"
                                id="experience"
                                min="0"
                                value={filters.experience}
                                onChange={handleFilterChange}
                                placeholder="e.g., 5"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                            />
                        </div>
                        <div className="flex justify-end">
                             <button
                                onClick={resetFilters}
                                disabled={!areFiltersActive}
                                className="text-sm text-gray-500 hover:text-red-500 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedResumes.map(resume => (
                    <ResumeSummaryCard
                        key={resume.id}
                        resume={resume}
                        isSelected={selectedIds.has(resume.id)}
                        onSelect={() => handleSelect(resume.id)}
                        isExpanded={expandedIds.has(resume.id)}
                        onToggleExpand={() => handleToggleExpand(resume.id)}
                        filterSkill={filters.skill}
                    />
                ))}
            </div>
             {filteredAndSortedResumes.length === 0 && (
                <div className="text-center py-12 col-span-full">
                    <h3 className="text-xl font-semibold text-gray-700">No Resumes Found</h3>
                    <p className="text-gray-500 mt-2">
                        {areFiltersActive ? "Try adjusting your filters or upload more resumes." : "Upload a resume to get started."}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ResumeComparison;