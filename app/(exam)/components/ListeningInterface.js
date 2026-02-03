'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useExam } from '../contexts/ExamContext';
import { useExamAudio } from '../hooks/useExamAudio';
import { LISTENING_EXAM_DATA } from '../data/listening-data';
import ResizableSplitPane from './ResizableSplitPane';
import GapFillQuestion from './GapFillQuestion';
import MatchingQuestion from './MatchingQuestion';
import MultipleAnswerMCQ from './MultipleAnswerMCQ';
import ShortAnswerQuestion from './ShortAnswerQuestion';
import MapLabelingQuestion from './MapLabelingQuestion';

export default function ListeningInterface() {
    const {
        setAnswer,
        answers,
        isExamEnded,
        examData,
        isLoading,
        loadError,
        volume,
        listeningPhase,
        startReviewPhase,
        reviewTimeLeft,
    } = useExam();

    // Part navigation state
    const [currentPartIndex, setCurrentPartIndex] = useState(0);
    const [showReviewToast, setShowReviewToast] = useState(false);

    // Use examData from database if available, fallback to static data
    const listeningData = useMemo(() => {
        if (examData?.listening?.parts) {
            return {
                title: examData.testTitle || 'Listening Test',
                parts: examData.listening.parts,
            };
        }
        return LISTENING_EXAM_DATA;
    }, [examData]);

    const parts = Array.isArray(listeningData?.parts) ? listeningData.parts : [];
    const currentPart = parts[currentPartIndex] || parts[0] || {
        partNumber: currentPartIndex + 1,
        title: `Part ${currentPartIndex + 1}`,
        questions: [],
    };
    const partQuestions = Array.isArray(currentPart?.questions) ? currentPart.questions : [];
    const currentPartTitle = typeof currentPart?.title === 'string'
        ? currentPart.title
        : `Part ${currentPart.partNumber || currentPartIndex + 1}`;

    // Audio playback with strict controls
    const handleAudioEnded = useCallback(() => {
        // When audio ends, trigger review phase
        startReviewPhase();
        setShowReviewToast(true);
        // Auto-hide toast after 5 seconds
        setTimeout(() => setShowReviewToast(false), 5000);
    }, [startReviewPhase]);

    useExamAudio({
        audioUrl: currentPart?.audioUrl,
        volume,
        onEnded: handleAudioEnded,
        disabled: isExamEnded || listeningPhase !== 'audio',
    });

    const handleAnswerChange = useCallback((questionId, value) => {
        setAnswer(questionId, value);
    }, [setAnswer]);

    // Show loading state (only if not already loaded with fallback data)
    if (isLoading && !listeningData.parts) {
        return (
            <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: 'var(--bg-color)' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p style={{ color: 'var(--text-color)' }}>Loading exam...</p>
                </div>
            </div>
        );
    }

    // Note: We don't show error state - instead we fall back to static data
    // This allows testing without a database connection

    // Left pane: Audio info and part tabs
    const leftPaneContent = (
        <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
            {/* Part Info / Transcript */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-4 pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        Part {currentPart.partNumber || currentPartIndex + 1}
                    </span>
                    <h2 className="text-xl font-bold mt-2">{currentPartTitle.split(':')[1] || currentPartTitle}</h2>
                </div>

                {/* Transcript (for review/after exam) */}
                {currentPart.transcript && listeningPhase !== 'audio' && (
                    <div className="bg-gray-50 rounded-xl p-4 border" style={{ borderColor: 'var(--border-color)' }}>
                        <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Transcript
                        </h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">{currentPart.transcript}</p>
                    </div>
                )}
            </div>

            {/* Part tabs */}
            <div className="flex border-t" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--panel-bg)' }}>
                {parts.map((part, index) => (
                    <button
                        key={part.id}
                        onClick={() => setCurrentPartIndex(index)}
                        className={`
                            flex-1 px-4 py-3 text-sm font-medium transition-colors border-r
                            ${currentPartIndex === index
                                ? 'bg-green-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }
                        `}
                        style={{ borderColor: 'var(--border-color)' }}
                    >
                        Part {part.partNumber || index + 1}
                    </button>
                ))}
            </div>
        </div>
    );

    // Render question blocks
    const renderQuestionBlock = (questionBlock, blockIndex) => {
        switch (questionBlock.type) {
            case 'TrueFalse':
                if (!Array.isArray(questionBlock.items) || questionBlock.items.length === 0) {
                    return null;
                }
                return (
                    <div key={blockIndex} className="space-y-6">
                        <div className="mb-4 pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                            <h2 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>{questionBlock.heading}</h2>
                            <p className="mt-2 text-sm" style={{ color: 'var(--text-color)', opacity: 0.7 }}>{questionBlock.instruction}</p>
                        </div>
                        {questionBlock.items.map((q, itemIndex) => {
                            const base = Number(questionBlock.startId ?? questionBlock.startNumber);
                            const itemNumber = Number(q.id);
                            const displayNumber = Number.isFinite(itemNumber)
                                ? itemNumber
                                : Number.isFinite(base)
                                    ? base + itemIndex
                                    : q.id;
                            return (
                            <div
                                key={q.id}
                                className="rounded-xl shadow-sm border p-5 transition-all hover:shadow-md mb-4"
                                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
                            >
                                <div className="flex gap-4">
                                    <span className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                        {displayNumber}
                                    </span>
                                    <div className="flex-1">
                                        <p className="font-medium mb-4" style={{ color: 'var(--text-color)' }}>{q.text}</p>
                                        <div className="flex gap-4 flex-wrap">
                                            {['TRUE', 'FALSE', 'NOT GIVEN'].map((option) => (
                                                <label
                                                    key={option}
                                                    className={`
                                                        flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all
                                                        ${answers[q.id] === option
                                                            ? 'border-green-600 bg-green-50 text-green-700'
                                                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                        }
                                                    `}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`question-${q.id}`}
                                                        value={option}
                                                        checked={answers[q.id] === option}
                                                        onChange={() => handleAnswerChange(q.id, option)}
                                                        className="sr-only"
                                                        disabled={isExamEnded}
                                                        tabIndex={q.id}
                                                    />
                                                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${answers[q.id] === option ? 'border-green-600 bg-green-600' : 'border-gray-400'}`}>
                                                        {answers[q.id] === option && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                                                    </span>
                                                    <span className="text-sm font-medium">{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                        })}
                    </div>
                );

            case 'MCQ':
                if (!Array.isArray(questionBlock.items) || questionBlock.items.length === 0) {
                    return null;
                }
                return (
                    <div key={blockIndex} className="space-y-6 mt-10 pt-6 border-t-2" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="mb-4 pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                            <h2 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>{questionBlock.heading}</h2>
                            <p className="mt-2 text-sm" style={{ color: 'var(--text-color)', opacity: 0.7 }}>{questionBlock.instruction}</p>
                        </div>
                        {questionBlock.items.map((q, itemIndex) => {
                            const base = Number(questionBlock.startId ?? questionBlock.startNumber);
                            const itemNumber = Number(q.id);
                            const displayNumber = Number.isFinite(itemNumber)
                                ? itemNumber
                                : Number.isFinite(base)
                                    ? base + itemIndex
                                    : q.id;
                            return (
                            <div
                                key={q.id}
                                className="rounded-xl shadow-sm border p-5 transition-all hover:shadow-md mb-4"
                                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
                            >
                                <div className="flex gap-4">
                                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                        {displayNumber}
                                    </span>
                                    <div className="flex-1">
                                        <p className="font-medium mb-4" style={{ color: 'var(--text-color)' }}>{q.text}</p>
                                        <div className="space-y-2">
                                            {q.options.map((option, optIdx) => (
                                                <label
                                                    key={optIdx}
                                                    className={`
                                                        flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all
                                                        ${answers[q.id] === option
                                                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                        }
                                                    `}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`question-${q.id}`}
                                                        value={option}
                                                        checked={answers[q.id] === option}
                                                        onChange={() => handleAnswerChange(q.id, option)}
                                                        className="sr-only"
                                                        disabled={isExamEnded}
                                                        tabIndex={q.id}
                                                    />
                                                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${answers[q.id] === option ? 'border-blue-600 bg-blue-600' : 'border-gray-400'}`}>
                                                        {answers[q.id] === option && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                                                    </span>
                                                    <span className="text-sm">{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                        })}
                    </div>
                );

            case 'Matching':
                if (!questionBlock.data) {
                    return null;
                }
                return (
                    <div key={blockIndex} className="mt-10 pt-6 border-t-2" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="mb-6 pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                            <h2 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>{questionBlock.heading}</h2>
                            <p className="mt-2 text-sm" style={{ color: 'var(--text-color)', opacity: 0.7 }}>{questionBlock.instruction}</p>
                        </div>
                        <MatchingQuestion
                            questionGroup={questionBlock.data}
                            startNumber={questionBlock.startId}
                            answers={answers}
                            onAnswerChange={handleAnswerChange}
                            disabled={isExamEnded}
                        />
                    </div>
                );

            case 'GapFill':
                if (!questionBlock.data) {
                    return null;
                }
                return (
                    <div key={blockIndex} className="mt-10 pt-6 border-t-2" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="mb-6 pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                            <h2 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>{questionBlock.heading}</h2>
                            <p className="mt-2 text-sm" style={{ color: 'var(--text-color)', opacity: 0.7 }}>{questionBlock.instruction}</p>
                        </div>
                        <GapFillQuestion
                            questionGroup={questionBlock.data}
                            startNumber={questionBlock.startId}
                            answers={answers}
                            onAnswerChange={handleAnswerChange}
                            disabled={isExamEnded}
                        />
                    </div>
                );

            case 'ShortAnswer':
                if (!questionBlock.data) {
                    return null;
                }
                return (
                    <div key={blockIndex} className="mt-10 pt-6 border-t-2" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="mb-6 pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                            <h2 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>{questionBlock.heading}</h2>
                            <p className="mt-2 text-sm" style={{ color: 'var(--text-color)', opacity: 0.7 }}>{questionBlock.instruction}</p>
                        </div>
                        <ShortAnswerQuestion
                            questionGroup={questionBlock.data}
                            startNumber={questionBlock.startId}
                            answers={answers}
                            onAnswerChange={handleAnswerChange}
                            disabled={isExamEnded}
                        />
                    </div>
                );

            case 'MapLabeling':
                if (!questionBlock.data) {
                    return null;
                }
                return (
                    <div key={blockIndex} className="mt-10 pt-6 border-t-2" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="mb-6 pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                            <h2 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>{questionBlock.heading}</h2>
                            <p className="mt-2 text-sm" style={{ color: 'var(--text-color)', opacity: 0.7 }}>{questionBlock.instruction}</p>
                        </div>
                        <MapLabelingQuestion
                            questionData={questionBlock.data}
                            startNumber={questionBlock.startId}
                            answers={answers}
                            onAnswerChange={handleAnswerChange}
                            disabled={isExamEnded}
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    // Right pane: Questions
    const rightPaneContent = (
        <div className="h-full overflow-y-auto transition-colors duration-300" style={{ backgroundColor: 'var(--panel-bg)' }}>
            <div className="p-6">
                {partQuestions.length > 0 ? (
                    partQuestions.map((block, index) => renderQuestionBlock(block, index))
                ) : (
                    <div className="text-sm text-gray-500">No questions available for this part.</div>
                )}
                <div className="h-8"></div>
            </div>
        </div>
    );

    return (
        <div className="flex-1 flex overflow-hidden relative">
            <ResizableSplitPane
                storageKey="listening-panel-sizes"
                leftPanel={leftPaneContent}
                rightPanel={rightPaneContent}
            />

            {/* Review Phase Toast Notification */}
            {showReviewToast && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
                    <div className="bg-amber-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="font-bold">Audio Finished</p>
                            <p className="text-sm">You have 2 minutes to check your answers.</p>
                        </div>
                        <button
                            onClick={() => setShowReviewToast(false)}
                            className="ml-4 hover:bg-amber-600 p-1 rounded"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
