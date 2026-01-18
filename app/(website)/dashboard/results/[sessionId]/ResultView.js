'use client';

import { useState } from 'react';

export default function ResultView({ results, scores, mockTestTitle, feedback }) {
    const [activeTab, setActiveTab] = useState('reading');

    const getScoreColor = (band) => {
        if (band >= 8) return 'text-green-600';
        if (band >= 6.5) return 'text-blue-600';
        if (band >= 5) return 'text-yellow-600';
        return 'text-red-600';
    };

    const StatusIcon = ({ isCorrect }) => (
        isCorrect ? (
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
        ) : (
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        )
    );

    return (
        <div className="space-y-8">
            {/* Header / Summary */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{mockTestTitle} Results</h1>
                <div className="text-gray-500 mb-8">Detailed performance breakdown</div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <div className="text-sm text-blue-600 font-medium mb-1">Overall Band</div>
                        <div className={`text-4xl font-bold ${getScoreColor(scores.overall)}`}>
                            {scores.overall?.toFixed(1) || '-'}
                        </div>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <div className="text-sm text-gray-600 font-medium mb-1">Reading</div>
                        <div className="text-2xl font-bold text-gray-900">{scores.reading?.toFixed(1) || '-'}</div>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <div className="text-sm text-gray-600 font-medium mb-1">Listening</div>
                        <div className="text-2xl font-bold text-gray-900">{scores.listening?.toFixed(1) || '-'}</div>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <div className="text-sm text-gray-600 font-medium mb-1">Writing & Speaking</div>
                        {(scores.writing > 0 || scores.speaking > 0) ? (
                            <div className="mt-2 space-y-1">
                                <div className="flex justify-between items-center text-sm">
                                    <span>Writing:</span>
                                    <span className={`font-bold ${getScoreColor(scores.writing)}`}>{scores.writing}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span>Speaking:</span>
                                    <span className={`font-bold ${getScoreColor(scores.speaking)}`}>{scores.speaking}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm font-medium text-amber-600 bg-amber-50 rounded px-2 py-1 inline-block mt-2">
                                Pending Grading
                            </div>
                        )}
                    </div>
                </div>

                {/* Feedback Section */}
                {feedback && (
                    <div className="mt-6 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                        <h3 className="text-md font-bold text-gray-800 mb-2">Examiner Feedback</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{feedback}</p>
                    </div>
                )}

            </div>

            {/* Detailed Breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('reading')}
                        className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'reading'
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        Reading Review
                    </button>
                    <button
                        onClick={() => setActiveTab('listening')}
                        className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'listening'
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        Listening Review
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'reading' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-800">Reading Answer Key</h3>
                                <div className="text-sm text-gray-500">
                                    Score: <span className="font-bold text-gray-900">{results.reading.score}</span> / {results.reading.total}
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                                            <th className="py-3 px-4">Q#</th>
                                            <th className="py-3 px-4">Your Answer</th>
                                            <th className="py-3 px-4">Correct Answer</th>
                                            <th className="py-3 px-4 text-center">Result</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm text-gray-700">
                                        {results.reading.answers.map((item, idx) => (
                                            <tr key={idx} className={`border-b border-gray-100 hover:bg-gray-50 ${item.isCorrect ? 'bg-green-50/30' : ''}`}>
                                                <td className="py-3 px-4 font-medium text-gray-900">{item.questionId}</td>
                                                <td className={`py-3 px-4 ${item.isCorrect ? 'text-green-700 font-medium' : 'text-red-600 line-through'}`}>
                                                    {item.userAnswer || <span className="text-gray-400 italic">No Answer</span>}
                                                </td>
                                                <td className="py-3 px-4 font-medium text-gray-900">
                                                    {item.correctAnswer}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex justify-center"><StatusIcon isCorrect={item.isCorrect} /></div>
                                                </td>
                                            </tr>
                                        ))}
                                        {results.reading.answers.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="py-8 text-center text-gray-500 italic">No answers recorded for this section.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'listening' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-800">Listening Answer Key</h3>
                                <div className="text-sm text-gray-500">
                                    Score: <span className="font-bold text-gray-900">{results.listening.score}</span> / {results.listening.total}
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                                            <th className="py-3 px-4">Q#</th>
                                            <th className="py-3 px-4">Your Answer</th>
                                            <th className="py-3 px-4">Correct Answer</th>
                                            <th className="py-3 px-4 text-center">Result</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm text-gray-700">
                                        {results.listening.answers.map((item, idx) => (
                                            <tr key={idx} className={`border-b border-gray-100 hover:bg-gray-50 ${item.isCorrect ? 'bg-green-50/30' : ''}`}>
                                                <td className="py-3 px-4 font-medium text-gray-900">{item.questionId}</td>
                                                <td className={`py-3 px-4 ${item.isCorrect ? 'text-green-700 font-medium' : 'text-red-600 line-through'}`}>
                                                    {item.userAnswer || <span className="text-gray-400 italic">No Answer</span>}
                                                </td>
                                                <td className="py-3 px-4 font-medium text-gray-900">
                                                    {item.correctAnswer}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex justify-center"><StatusIcon isCorrect={item.isCorrect} /></div>
                                                </td>
                                            </tr>
                                        ))}
                                        {results.listening.answers.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="py-8 text-center text-gray-500 italic">No answers recorded for this section.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
