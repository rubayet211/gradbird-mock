'use client';

import ExamHeader from '../../components/ExamHeader';
import ExamFooter from '../../components/ExamFooter';
import { useExam } from '../../contexts/ExamContext';

export default function ExamPage({ params }) {
    const { currentQuestionIndex, setAnswer, answers } = useExam();
    const currentQuestionId = currentQuestionIndex + 1;

    // Get current answer for this question
    const currentAnswer = answers[currentQuestionId] || '';

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <ExamHeader />

            {/* Main Content Area - allows text selection */}
            <main className="flex-1 bg-gray-100 p-6 overflow-y-auto select-text">
                <div className="max-w-4xl mx-auto">
                    {/* Question Card */}
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        {/* Question Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                Question {currentQuestionId}
                            </h2>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                Listening - Part 1
                            </span>
                        </div>

                        {/* Question Content Placeholder */}
                        <div className="mb-8">
                            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                                Complete the notes below. Write <strong>NO MORE THAN TWO WORDS AND/OR A NUMBER</strong> for each answer.
                            </p>

                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                <h3 className="font-semibold text-gray-800 mb-4">Enquiry about booking a hotel room</h3>
                                <ul className="space-y-3 text-gray-700">
                                    <li>• Check-in date: <span className="text-blue-600">15th September</span></li>
                                    <li>• Number of nights: <span className="text-blue-600">3</span></li>
                                    <li>
                                        • Type of room required:
                                        <input
                                            type="text"
                                            value={currentAnswer}
                                            onChange={(e) => setAnswer(currentQuestionId, e.target.value)}
                                            className="ml-2 px-3 py-1 border-2 border-blue-400 rounded-md focus:outline-none focus:border-blue-600 w-48"
                                            placeholder="Your answer..."
                                        />
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Audio Player Placeholder */}
                        <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-4">
                            <button className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition-colors">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </button>
                            <div className="flex-1">
                                <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                                    <div className="h-full w-1/3 bg-blue-500 rounded-full" />
                                </div>
                            </div>
                            <span className="text-gray-400 text-sm font-mono">02:35 / 08:00</span>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-amber-800 text-sm">
                                <strong>Tip:</strong> You will hear the recording only once. Listen carefully and write your answers as you hear them.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <ExamFooter />
        </div>
    );
}
