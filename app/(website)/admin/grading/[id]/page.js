'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GradeSessionPage({ params }) {
    const { id } = params;
    const router = useRouter();

    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [writingScore, setWritingScore] = useState('');
    const [speakingScore, setSpeakingScore] = useState('');
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        fetchSessionDetails();
    }, [id]);

    const fetchSessionDetails = async () => {
        try {
            const res = await fetch(`/api/admin/grading/${id}`);
            if (res.ok) {
                const data = await res.json();
                setSession(data);
                // Pre-fill existing scores if any
                if (data.scores?.writing) setWritingScore(data.scores.writing);
                if (data.scores?.speaking) setSpeakingScore(data.scores.speaking);
                if (data.feedback) setFeedback(data.feedback);
            } else {
                console.error('Failed to fetch session');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/grading/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    writingScore: writingScore === '' ? undefined : parseFloat(writingScore),
                    speakingScore: speakingScore === '' ? undefined : parseFloat(speakingScore),
                    feedback
                }),
            });

            if (res.ok) {
                alert('Grading saved successfully!');
                router.push('/admin/grading'); // Return to list
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

    if (loading) return <div className="p-8 text-center">Loading session details...</div>;
    if (!session) return <div className="p-8 text-center text-red-500">Session not found.</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Grading Session</h1>
                    <p className="text-gray-500">
                        Candidate: <span className="font-semibold">{session.user?.name}</span> ({session.user?.email})
                    </p>
                    <p className="text-gray-500">
                        Test: {session.mockTest?.title}
                    </p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                >
                    Back to List
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Student Work */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Writing Task 1 */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold mb-4 text-blue-700">Writing Task 1</h2>
                        <div className="p-4 bg-gray-50 rounded border border-gray-200 min-h-[150px] whitespace-pre-wrap font-serif text-gray-800">
                            {session.answers?.writing?.task1 || <span className="text-gray-400 italic">No answer submitted for Task 1.</span>}
                        </div>
                    </div>

                    {/* Writing Task 2 */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold mb-4 text-blue-700">Writing Task 2</h2>
                        <div className="p-4 bg-gray-50 rounded border border-gray-200 min-h-[200px] whitespace-pre-wrap font-serif text-gray-800">
                            {session.answers?.writing?.task2 || <span className="text-gray-400 italic">No answer submitted for Task 2.</span>}
                        </div>
                    </div>

                    {/* Speaking (Placeholder for now) */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold mb-4 text-blue-700">Speaking Grading</h2>
                        <div className="p-4 bg-gray-50 rounded border border-gray-200">
                            <p className="text-sm text-gray-500 mb-2">Speaking data debug view:</p>
                            <pre className="text-xs bg-gray-100 p-2 overflow-auto max-h-40">
                                {JSON.stringify(session.answers?.speaking, null, 2) || 'No speaking data.'}
                            </pre>
                        </div>
                    </div>
                </div>

                {/* Right Column: Grading Controls */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-600 sticky top-6">
                        <h2 className="text-xl font-bold mb-6 text-gray-800">Score & Feedback</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Writing Band Score (0-9)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="9"
                                    step="0.5"
                                    value={writingScore}
                                    onChange={(e) => setWritingScore(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g. 6.5"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Speaking Band Score (0-9)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="9"
                                    step="0.5"
                                    value={speakingScore}
                                    onChange={(e) => setSpeakingScore(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g. 7.0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Feedback / Comments</label>
                                <textarea
                                    rows="6"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Provide detailed feedback on performance..."
                                ></textarea>
                            </div>

                            <div className="pt-4 border-t border-gray-100 mt-4">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className={`w-full py-3 px-4 rounded-md text-white font-semibold transition-all ${saving
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
        </div>
    );
}
