'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ExamContext = createContext(null);

// Initial time: 60 minutes in seconds
const INITIAL_TIME = 60 * 60;
const TOTAL_QUESTIONS = 40;

// Generate initial question status
const generateInitialQuestionStatus = () => {
    return Array.from({ length: TOTAL_QUESTIONS }, (_, i) => ({
        id: i + 1,
        status: 'unanswered', // 'unanswered' | 'answered' | 'flagged'
    }));
};

export function ExamProvider({ children, initialTime = INITIAL_TIME }) {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [questionStatus, setQuestionStatus] = useState(generateInitialQuestionStatus);
    const [isTimerRunning, setIsTimerRunning] = useState(true);

    // Timer countdown effect
    useEffect(() => {
        if (!isTimerRunning || timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setIsTimerRunning(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isTimerRunning, timeLeft]);

    // Navigate to a specific question
    const goToQuestion = useCallback((index) => {
        if (index >= 0 && index < TOTAL_QUESTIONS) {
            setCurrentQuestionIndex(index);
        }
    }, []);

    // Go to next question
    const goToNextQuestion = useCallback(() => {
        setCurrentQuestionIndex((prev) => Math.min(prev + 1, TOTAL_QUESTIONS - 1));
    }, []);

    // Go to previous question
    const goToPrevQuestion = useCallback(() => {
        setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
    }, []);

    // Set answer for a question
    const setAnswer = useCallback((questionId, answer) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: answer,
        }));

        // Update question status to answered (unless flagged)
        setQuestionStatus((prev) =>
            prev.map((q) =>
                q.id === questionId && q.status !== 'flagged'
                    ? { ...q, status: 'answered' }
                    : q
            )
        );
    }, []);

    // Toggle flag status for a question
    const toggleFlag = useCallback((questionId) => {
        setQuestionStatus((prev) =>
            prev.map((q) => {
                if (q.id !== questionId) return q;

                if (q.status === 'flagged') {
                    // If unflagging, check if there's an answer
                    return {
                        ...q,
                        status: answers[questionId] ? 'answered' : 'unanswered',
                    };
                }
                return { ...q, status: 'flagged' };
            })
        );
    }, [answers]);

    // Pause/resume timer
    const toggleTimer = useCallback(() => {
        setIsTimerRunning((prev) => !prev);
    }, []);

    const value = {
        timeLeft,
        currentQuestionIndex,
        answers,
        questionStatus,
        isTimerRunning,
        totalQuestions: TOTAL_QUESTIONS,
        goToQuestion,
        goToNextQuestion,
        goToPrevQuestion,
        setAnswer,
        toggleFlag,
        toggleTimer,
    };

    return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

export function useExam() {
    const context = useContext(ExamContext);
    if (!context) {
        throw new Error('useExam must be used within an ExamProvider');
    }
    return context;
}

// Helper function to format time as HH:MM:SS
export function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
