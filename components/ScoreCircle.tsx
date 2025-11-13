import React from 'react';

interface ScoreCircleProps {
    score: number;
}

const ScoreCircle: React.FC<ScoreCircleProps> = ({ score }) => {
    const getScoreColorClasses = (s: number) => {
        if (s >= 8) return { text: 'text-green-600', bg: 'bg-green-100' };
        if (s >= 5) return { text: 'text-yellow-600', bg: 'bg-yellow-100' };
        return { text: 'text-red-600', bg: 'bg-red-100' };
    };

    const { text, bg } = getScoreColorClasses(score);

    return (
        <div className={`relative w-16 h-16 rounded-full flex items-center justify-center ${bg}`}>
            <span className={`text-2xl font-bold ${text}`}>
                {score.toFixed(1)}
            </span>
        </div>
    );
};

export default ScoreCircle;