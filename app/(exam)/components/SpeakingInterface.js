'use client';

import { useState, useEffect, useRef } from 'react';
import { useExam } from '../contexts/ExamContext';
import { SPEAKING_DATA as MOCK_DATA } from '../data/speaking-data'; // Fallback for now or remove if strictly DB


export default function SpeakingInterface() {
    const { examData, isLoading } = useExam();
    const speakingData = examData?.speaking || MOCK_DATA; // Fallback to MOCK_DATA if DB data missing

    const [part, setPart] = useState('part1'); // 'part1' | 'part2' | 'part3'

    // Safety check for part2 existence before accessing properties
    const initialPrepTime = speakingData?.part2?.preparationTime || 60;
    const initialSpeakingTime = speakingData?.part2?.speakingTime || 120;

    const [prepTimeLeft, setPrepTimeLeft] = useState(initialPrepTime);
    const [speakingTimeLeft, setSpeakingTimeLeft] = useState(initialSpeakingTime);
    const [isPrepTimerActive, setIsPrepTimerActive] = useState(false);
    const [isSpeakingTimerActive, setIsSpeakingTimerActive] = useState(false);

    // Update timers if data loads late
    useEffect(() => {
        if (speakingData?.part2) {
            setPrepTimeLeft(speakingData.part2.preparationTime);
            setSpeakingTimeLeft(speakingData.part2.speakingTime);
        }
    }, [speakingData]);

    // Timer logic for Part 2 Preparation
    useEffect(() => {
        let interval;
        if (isPrepTimerActive && prepTimeLeft > 0) {
            interval = setInterval(() => {
                setPrepTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (prepTimeLeft === 0) {
            setIsPrepTimerActive(false);
        }
        return () => clearInterval(interval);
    }, [isPrepTimerActive, prepTimeLeft]);

    // Timer logic for Part 2 Speaking
    useEffect(() => {
        let interval;
        if (isSpeakingTimerActive && speakingTimeLeft > 0) {
            interval = setInterval(() => {
                setSpeakingTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (speakingTimeLeft === 0) {
            setIsSpeakingTimerActive(false);
        }
        return () => clearInterval(interval);
    }, [isSpeakingTimerActive, speakingTimeLeft]);

    if (isLoading) {
        return <div className="h-full flex items-center justify-center">Loading speaking test...</div>;
    }

    if (!speakingData) {
        return <div className="h-full flex items-center justify-center">Error: No speaking data found.</div>;
    }



    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const togglePrepTimer = () => setIsPrepTimerActive(!isPrepTimerActive);
    const toggleSpeakingTimer = () => setIsSpeakingTimerActive(!isSpeakingTimerActive);

    const resetTimers = () => {
        setIsPrepTimerActive(false);
        setIsSpeakingTimerActive(false);
        if (speakingData?.part2) {
            setPrepTimeLeft(speakingData.part2.preparationTime);
            setSpeakingTimeLeft(speakingData.part2.speakingTime);
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
            {/* Header / Part Navigation */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
                <h2 className="text-xl font-bold text-gray-800">Speaking Module</h2>
                <div className="flex gap-2">
                    {['part1', 'part2', 'part3'].map((p) => (
                        <button
                            key={p}
                            onClick={() => {
                                setPart(p);
                                if (p === 'part2') resetTimers();
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${part === p
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {p === 'part1' ? 'Part 1: Interview' : p === 'part2' ? 'Part 2: Long Turn' : 'Part 3: Discussion'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    {part === 'part1' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{speakingData.part1.title}</h3>
                                <p className="text-gray-500">{speakingData.part1.duration}</p>
                                <hr className="my-6 border-gray-100" />
                                <div className="prose prose-lg text-gray-700">
                                    <p>{speakingData.part1.description}</p>
                                    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-6 mt-6 rounded-r-lg">
                                        <h4 className="font-semibold text-indigo-900 mb-2">Instructions</h4>
                                        <p className="text-indigo-800 m-0">
                                            Please relax and speak naturally. The examiner will verify your ID and ask you simple questions about yourself.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {part === 'part2' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Timer Controls */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Preparation</p>
                                        <p className={`text-4xl font-mono font-bold mt-1 ${prepTimeLeft < 10 && prepTimeLeft > 0 ? 'text-red-500 animate-pulse' : 'text-gray-900'}`}>
                                            {formatTime(prepTimeLeft)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={togglePrepTimer}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isPrepTimerActive
                                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                            : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                                            }`}
                                    >
                                        {isPrepTimerActive ? (
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        ) : (
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        )}
                                    </button>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Speaking</p>
                                        <p className={`text-4xl font-mono font-bold mt-1 ${speakingTimeLeft < 15 && speakingTimeLeft > 0 ? 'text-amber-500 animate-pulse' : 'text-gray-900'}`}>
                                            {formatTime(speakingTimeLeft)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={toggleSpeakingTimer}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isSpeakingTimerActive
                                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                            : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                                            }`}
                                    >
                                        {isSpeakingTimerActive ? (
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        ) : (
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Cue Card */}
                            <div className="bg-white rounded-2xl shadow-lg border-2 border-indigo-100 overflow-hidden">
                                <div className="bg-indigo-600 px-6 py-4">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <svg className="w-6 h-6 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                        Task Card
                                    </h3>
                                </div>
                                <div className="p-8">
                                    <p className="text-sm font-semibold text-indigo-600 mb-2 uppercase tracking-wider">Describe the following topic:</p>
                                    <h4 className="text-2xl font-bold text-gray-900 mb-6">{speakingData.part2.cueCard.topic}</h4>

                                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                        <p className="font-medium text-gray-700 mb-4">You should say:</p>
                                        <ul className="space-y-3">
                                            {speakingData.part2.cueCard.prompts.map((prompt, idx) => (
                                                <li key={idx} className="flex items-start gap-3 text-gray-800">
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold mt-0.5">
                                                        {idx + 1}
                                                    </span>
                                                    <span>{prompt}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="mt-8 flex items-center gap-3 text-amber-600 bg-amber-50 px-4 py-3 rounded-lg text-sm border border-amber-100">
                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <p>You have <span className="font-bold">1 minute</span> to prepare and <span className="font-bold">1-2 minutes</span> to speak.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {part === 'part3' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{speakingData.part3.title}</h3>
                                <p className="text-gray-500">{speakingData.part3.duration}</p>
                                <hr className="my-6 border-gray-100" />
                                <div className="prose prose-lg text-gray-700">
                                    <p>{speakingData.part3.description}</p>
                                    <div className="grid gap-6 mt-8">
                                        {speakingData.part3.discussionTopics.map((topicData, idx) => (
                                            <div key={idx} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                                <h4 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                                                    <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
                                                    {topicData.topic}
                                                </h4>
                                                <ul className="space-y-3">
                                                    {topicData.questions.map((q, qIdx) => (
                                                        <li key={qIdx} className="flex items-start gap-3">
                                                            <svg className="w-5 h-5 text-indigo-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                            <span className="text-gray-700">{q}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
