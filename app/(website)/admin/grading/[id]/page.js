'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

// IELTS Band Descriptors (simplified for tooltips)
const BAND_DESCRIPTORS = {
    writing: {
        taskAchievement: {
            label: 'Task Achievement',
            description: 'How well the response addresses the task requirements'
        },
        coherenceCohesion: {
            label: 'Coherence & Cohesion',
            description: 'Logical organization and use of cohesive devices'
        },
        lexicalResource: {
            label: 'Lexical Resource',
            description: 'Range and accuracy of vocabulary'
        },
        grammaticalRange: {
            label: 'Grammatical Range & Accuracy',
            description: 'Range and accuracy of grammatical structures'
        }
    },
    speaking: {
        fluencyCoherence: {
            label: 'Fluency & Coherence',
            description: 'Speed, flow, and logical sequencing of speech'
        },
        lexicalResource: {
            label: 'Lexical Resource',
            description: 'Range and accuracy of vocabulary in speech'
        },
        grammaticalRange: {
            label: 'Grammatical Range & Accuracy',
            description: 'Range and control of grammatical structures'
        },
        pronunciation: {
            label: 'Pronunciation',
            description: 'Clarity and natural rhythm of pronunciation'
        }
    }
};

const BAND_OPTIONS = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

function BandSelector({ value, onChange, label, description }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-start">
                <div>
                    <label className="block text-sm font-medium text-gray-700">{label}</label>
                    <p className="text-xs text-gray-500">{description}</p>
                </div>
                <span className="text-lg font-bold text-blue-600">{value || '—'}</span>
            </div>
            <input
                type="range"
                min="0"
                max="18"
                step="1"
                value={BAND_OPTIONS.indexOf(parseFloat(value) || 0)}
                onChange={(e) => onChange(BAND_OPTIONS[parseInt(e.target.value)])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400">
                <span>0</span>
                <span>4.5</span>
                <span>9</span>
            </div>
        </div>
    );
}

function FeedbackInput({ value, onChange, placeholder }) {
    return (
        <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={2}
            placeholder={placeholder}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
        />
    );
}

function WordCount({ text }) {
    const words = text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
    return (
        <span className={`text-xs font-medium ${words < 150 ? 'text-amber-600' : 'text-green-600'}`}>
            {words} words
        </span>
    );
}

export default function GradeSessionPage({ params }) {
    const { id } = use(params);
    const router = useRouter();

    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('writing');
    const [showPrompts, setShowPrompts] = useState(true);

    // Writing scores state
    const [writingScores, setWritingScores] = useState({
        taskAchievement: '',
        coherenceCohesion: '',
        lexicalResource: '',
        grammaticalRange: ''
    });
    const [writingFeedback, setWritingFeedback] = useState({
        taskAchievement: '',
        coherenceCohesion: '',
        lexicalResource: '',
        grammaticalRange: '',
        overall: ''
    });

    // Speaking scores state
    const [speakingScores, setSpeakingScores] = useState({
        fluencyCoherence: '',
        lexicalResource: '',
        grammaticalRange: '',
        pronunciation: ''
    });
    const [speakingFeedback, setSpeakingFeedback] = useState({
        fluencyCoherence: '',
        lexicalResource: '',
        grammaticalRange: '',
        pronunciation: '',
        overall: ''
    });

    // General feedback
    const [generalFeedback, setGeneralFeedback] = useState('');

    useEffect(() => {
        fetchSessionDetails();
    }, [id]);

    const fetchSessionDetails = async () => {
        try {
            const res = await fetch(`/api/admin/grading/${id}`);
            if (res.ok) {
                const data = await res.json();
                setSession(data);

                // Pre-fill existing detailed scores if any
                if (data.writingDetails) {
                    setWritingScores(data.writingDetails);
                }
                if (data.speakingDetails) {
                    setSpeakingScores(data.speakingDetails);
                }
                if (data.detailedFeedback?.writing) {
                    setWritingFeedback(data.detailedFeedback.writing);
                }
                if (data.detailedFeedback?.speaking) {
                    setSpeakingFeedback(data.detailedFeedback.speaking);
                }
                if (data.feedback) {
                    setGeneralFeedback(data.feedback);
                }
            } else {
                console.error('Failed to fetch session');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateAverage = (scores) => {
        const values = Object.values(scores).filter(v => v !== '' && v !== null && v !== undefined);
        if (values.length === 0) return null;
        const avg = values.reduce((a, b) => parseFloat(a) + parseFloat(b), 0) / values.length;
        // Round to nearest 0.5
        return Math.round(avg * 2) / 2;
    };

    const writingOverall = calculateAverage(writingScores);
    const speakingOverall = calculateAverage(speakingScores);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/grading/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    writingDetails: writingScores,
                    speakingDetails: speakingScores,
                    detailedFeedback: {
                        writing: writingFeedback,
                        speaking: speakingFeedback
                    },
                    feedback: generalFeedback
                }),
            });

            if (res.ok) {
                alert('Grading saved successfully!');
                router.push('/admin/grading');
            } else {
                alert('Failed to save grading.');
            }
        } catch (error) {
            console.error('Error saving:', error);
            alert('An error occurred while saving.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading session details...</p>
        </div>
    );

    if (!session) return (
        <div className="p-8 text-center text-red-500">
            <p>Session not found.</p>
            <button onClick={() => router.back()} className="mt-4 text-blue-600 hover:underline">
                Go Back
            </button>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Grade Session</h1>
                    <div className="mt-2 space-y-1">
                        <p className="text-gray-600">
                            <span className="font-medium">Student:</span> {session.user?.name || 'Unknown'} ({session.user?.email})
                        </p>
                        <p className="text-gray-600">
                            <span className="font-medium">Test:</span> {session.mockTest?.title || 'Unknown Test'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    ← Back to List
                </button>
            </div>

            {/* Existing Scores Display */}
            {(session.scores?.reading || session.scores?.listening) && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Auto-Graded Scores</h3>
                    <div className="flex gap-6">
                        <div>
                            <span className="text-xs text-gray-500">Reading</span>
                            <p className="text-xl font-bold text-gray-900">{session.scores?.reading ?? '—'}</p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500">Listening</span>
                            <p className="text-xl font-bold text-gray-900">{session.scores?.listening ?? '—'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('writing')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'writing'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Writing
                    {writingOverall && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {writingOverall}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('speaking')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'speaking'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Speaking
                    {speakingOverall && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {speakingOverall}
                        </span>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Student Work */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'writing' && (
                        <>
                            {/* Prompts Toggle */}
                            {session.mockTest?.writing && (
                                <div className="bg-blue-50 rounded-lg border border-blue-100">
                                    <button
                                        onClick={() => setShowPrompts(!showPrompts)}
                                        className="w-full px-4 py-3 flex justify-between items-center text-sm font-medium text-blue-700"
                                    >
                                        <span>📝 View Task Prompts</span>
                                        <span>{showPrompts ? '▼' : '▶'}</span>
                                    </button>
                                    {showPrompts && (
                                        <div className="px-4 pb-4 space-y-4">
                                            {session.mockTest.writing.task1?.promptText && (
                                                <div>
                                                    <h4 className="text-xs font-semibold text-blue-600 mb-1">Task 1 Prompt</h4>
                                                    <p className="text-sm text-gray-700">{session.mockTest.writing.task1.promptText}</p>
                                                </div>
                                            )}
                                            {session.mockTest.writing.task2?.promptText && (
                                                <div>
                                                    <h4 className="text-xs font-semibold text-blue-600 mb-1">Task 2 Prompt</h4>
                                                    <p className="text-sm text-gray-700">{session.mockTest.writing.task2.promptText}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Task 1 Answer */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold text-gray-800">Task 1 Response</h2>
                                    <WordCount text={session.answers?.writing?.task1} />
                                </div>
                                <div className="p-4 bg-gray-50 rounded border border-gray-200 min-h-[150px] whitespace-pre-wrap font-serif text-gray-800 text-sm leading-relaxed">
                                    {session.answers?.writing?.task1 || <span className="text-gray-400 italic">No answer submitted.</span>}
                                </div>
                            </div>

                            {/* Task 2 Answer */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold text-gray-800">Task 2 Response</h2>
                                    <WordCount text={session.answers?.writing?.task2} />
                                </div>
                                <div className="p-4 bg-gray-50 rounded border border-gray-200 min-h-[200px] whitespace-pre-wrap font-serif text-gray-800 text-sm leading-relaxed">
                                    {session.answers?.writing?.task2 || <span className="text-gray-400 italic">No answer submitted.</span>}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'speaking' && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Speaking Data</h2>
                            <div className="p-4 bg-gray-50 rounded border border-gray-200">
                                <p className="text-sm text-gray-500 mb-2">Speaking session data:</p>
                                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-60">
                                    {JSON.stringify(session.answers?.speaking, null, 2) || 'No speaking data recorded.'}
                                </pre>
                                <p className="mt-4 text-sm text-gray-600">
                                    💡 Speaking tests are typically conducted live. Score based on your assessment of the student's performance during the speaking session.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Grading Controls */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-600 sticky top-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                {activeTab === 'writing' ? 'Writing' : 'Speaking'} Score
                            </h2>
                            <div className="text-center">
                                <span className="text-xs text-gray-500">Overall</span>
                                <p className="text-3xl font-bold text-blue-600">
                                    {activeTab === 'writing' ? (writingOverall ?? '—') : (speakingOverall ?? '—')}
                                </p>
                            </div>
                        </div>

                        {activeTab === 'writing' && (
                            <div className="space-y-6">
                                {Object.entries(BAND_DESCRIPTORS.writing).map(([key, desc]) => (
                                    <div key={key} className="space-y-2">
                                        <BandSelector
                                            value={writingScores[key]}
                                            onChange={(val) => setWritingScores(prev => ({ ...prev, [key]: val }))}
                                            label={desc.label}
                                            description={desc.description}
                                        />
                                        <FeedbackInput
                                            value={writingFeedback[key]}
                                            onChange={(val) => setWritingFeedback(prev => ({ ...prev, [key]: val }))}
                                            placeholder={`Feedback for ${desc.label}...`}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'speaking' && (
                            <div className="space-y-6">
                                {Object.entries(BAND_DESCRIPTORS.speaking).map(([key, desc]) => (
                                    <div key={key} className="space-y-2">
                                        <BandSelector
                                            value={speakingScores[key]}
                                            onChange={(val) => setSpeakingScores(prev => ({ ...prev, [key]: val }))}
                                            label={desc.label}
                                            description={desc.description}
                                        />
                                        <FeedbackInput
                                            value={speakingFeedback[key]}
                                            onChange={(val) => setSpeakingFeedback(prev => ({ ...prev, [key]: val }))}
                                            placeholder={`Feedback for ${desc.label}...`}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* General Feedback */}
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                General Feedback
                            </label>
                            <textarea
                                rows={4}
                                value={generalFeedback}
                                onChange={(e) => setGeneralFeedback(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Overall feedback and recommendations..."
                            />
                        </div>

                        {/* Save Button */}
                        <div className="mt-6">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-all ${saving
                                        ? 'bg-blue-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                                    }`}
                            >
                                {saving ? 'Saving...' : 'Submit Grades'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
