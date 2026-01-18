'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
    getHighlights,
    saveHighlights,
    getNotes,
    saveNotes,
} from '../../../lib/highlightStorage';
import {
    getWritingResponses,
    saveWritingResponses,
} from '../../../lib/writingStorage';

const ExamContext = createContext(null);

// Initial time: 60 minutes in seconds
const INITIAL_TIME = 60 * 60;
// Generate initial question status
const generateInitialQuestionStatus = (count) => {
    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        status: 'unanswered', // 'unanswered' | 'answered' | 'flagged'
    }));
};

export function ExamProvider({ children, initialTime = INITIAL_TIME, sessionId }) {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [questionStatus, setQuestionStatus] = useState([]);
    const [isTimerRunning, setIsTimerRunning] = useState(true);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isExamEnded, setIsExamEnded] = useState(false);
    const [isHidden, setIsHidden] = useState(false);

    // Listening module state
    const [volume, setVolume] = useState(1); // 0.0 to 1.0
    const [listeningPhase, setListeningPhase] = useState('audio'); // 'audio' | 'review' | 'ended'
    const [reviewTimeLeft, setReviewTimeLeft] = useState(0); // 2 minutes = 120 seconds
    const REVIEW_PERIOD_SECONDS = 120; // 2 minutes for review

    // Exam data from database
    const [examData, setExamData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const lastSyncRef = useRef(Date.now());
    const syncIntervalRef = useRef(null);
    const writingDebounceRef = useRef(null); // Debounce timer for writing auto-save

    // Theme state
    const [theme, setTheme] = useState('standard'); // 'standard' | 'inverted' | 'high-contrast'

    // Load theme from localStorage on mount
    useEffect(() => {
        const storedTheme = localStorage.getItem('exam-theme');
        if (storedTheme) {
            setTheme(storedTheme);
        }
    }, []);

    // Apply theme to document body
    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('exam-theme', theme);
    }, [theme]);

    // Font Size state
    const [fontSize, setFontSize] = useState('standard'); // 'standard' | 'large' | 'extra-large'

    // Load font size from localStorage on mount
    useEffect(() => {
        const storedFontSize = localStorage.getItem('exam-font-size');
        if (storedFontSize) {
            setFontSize(storedFontSize);
        }
    }, []);

    // Apply font size to document body
    useEffect(() => {
        document.body.setAttribute('data-font-size', fontSize);
        localStorage.setItem('exam-font-size', fontSize);
    }, [fontSize]);

    const toggleFontSize = useCallback(() => {
        setFontSize((prev) => {
            if (prev === 'standard') return 'large';
            if (prev === 'large') return 'extra-large';
            return 'standard';
        });
    }, []);

    // Start review phase (called when audio ends)
    const startReviewPhase = useCallback(() => {
        setListeningPhase('review');
        setReviewTimeLeft(REVIEW_PERIOD_SECONDS);
    }, []);

    // Review phase countdown timer
    useEffect(() => {
        if (listeningPhase !== 'review' || reviewTimeLeft <= 0) return;

        const interval = setInterval(() => {
            setReviewTimeLeft((prev) => {
                if (prev <= 1) {
                    setListeningPhase('ended');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [listeningPhase, reviewTimeLeft]);

    // Auto-submit when review phase ends
    useEffect(() => {
        if (listeningPhase === 'ended' && reviewTimeLeft === 0 && !isExamEnded) {
            submitExam();
        }
    }, [listeningPhase, reviewTimeLeft, isExamEnded]);

    // Log security events to server
    const logSecurityEvent = useCallback(async (eventType) => {
        if (!sessionId) return;
        try {
            await fetch('/api/exam/log-security', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId,
                    eventType,
                    timestamp: new Date().toISOString(),
                }),
            });
        } catch (error) {
            console.error('Failed to log security event:', error);
        }
    }, [sessionId]);

    const toggleHideScreen = useCallback(() => {
        setIsHidden((prev) => {
            const newState = !prev;
            logSecurityEvent(newState ? 'SCREEN_HIDDEN' : 'SCREEN_RESUMED');
            return newState;
        });
    }, [logSecurityEvent]);

    // Highlight and note state
    const [highlights, setHighlights] = useState([]);
    const [notes, setNotes] = useState([]);

    // Writing responses state
    const [writingResponses, setWritingResponses] = useState({
        task1Text: '',
        task2Text: ''
    });

    // Load highlights, notes, and writing responses from localStorage on mount
    useEffect(() => {
        if (sessionId) {
            const storedHighlights = getHighlights(sessionId);
            const storedNotes = getNotes(sessionId);
            const storedWriting = getWritingResponses(sessionId);
            setHighlights(storedHighlights);
            setNotes(storedNotes);
            setWritingResponses(storedWriting);
        }
    }, [sessionId]);

    // Save highlights to localStorage when they change
    useEffect(() => {
        if (sessionId && highlights.length >= 0) {
            saveHighlights(sessionId, highlights);
        }
    }, [sessionId, highlights]);

    // Save notes to localStorage when they change
    useEffect(() => {
        if (sessionId && notes.length >= 0) {
            saveNotes(sessionId, notes);
        }
    }, [sessionId, notes]);

    // Save writing responses to localStorage when they change
    useEffect(() => {
        if (sessionId) {
            saveWritingResponses(sessionId, writingResponses);
        }
    }, [sessionId, writingResponses]);

    // Fetch exam data from database on mount
    useEffect(() => {
        if (!sessionId) {
            setIsLoading(false);
            return;
        }

        const fetchExamData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/exam/${sessionId}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch exam data');
                }

                // Calculate total questions based on exam data structure
                let count = 0;
                const eData = data.examData;

                if (eData.reading) {
                    count = eData.reading.sections?.reduce((acc, sec) => acc + (sec.questions?.length || 0), 0) || 0;
                } else if (eData.listening) {
                    count = eData.listening.parts?.reduce((acc, part) => acc + (part.questions?.length || 0), 0) || 0;
                } else if (eData.writing) {
                    count = 2; // Task 1 and Task 2
                } else if (eData.speaking) {
                    count = 3; // Part 1, 2, 3
                } else if (eData.sections) {
                    // Direct access (Reading)
                    count = eData.sections.reduce((acc, sec) => acc + (sec.questions?.length || 0), 0);
                } else if (eData.parts) {
                    // Direct access (Listening)
                    count = eData.parts.reduce((acc, part) => acc + (part.questions?.length || 0), 0);
                } else if (eData.task1) {
                    // Direct access (Writing)
                    count = 2;
                } else if (eData.part1) {
                    // Direct access (Speaking)
                    count = 3;
                }

                // Fallback default if calculation fails (e.g. empty test or error)
                if (count === 0) count = 40;

                setTotalQuestions(count);

                // Initialize question status
                let initialStatus = generateInitialQuestionStatus(count);

                setExamData(data.examData);

                // Restore saved answers if any
                if (data.examData.savedAnswers) {
                    setAnswers(data.examData.savedAnswers);

                    // Update status for answered questions
                    const saved = data.examData.savedAnswers;
                    initialStatus = initialStatus.map(q => ({
                        ...q,
                        status: saved[q.id] ? 'answered' : 'unanswered'
                    }));
                }

                setQuestionStatus(initialStatus);

                // Restore time remaining if any
                if (data.examData.timeRemaining) {
                    setTimeLeft(data.examData.timeRemaining);
                }
            } catch (error) {
                console.error('Error fetching exam data:', error);
                setLoadError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchExamData();
    }, [sessionId]);

    // Debounced server sync every 60 seconds
    const syncProgressToServer = useCallback(async () => {
        if (!sessionId || isExamEnded) return;

        try {
            await fetch('/api/exam/save-progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    answers,
                    writingResponses,
                    timeRemaining: timeLeft,
                }),
            });
            lastSyncRef.current = Date.now();
        } catch (error) {
            console.error('Failed to sync progress to server:', error);
        }
    }, [sessionId, answers, writingResponses, timeLeft, isExamEnded]);

    // Set up auto-sync interval (every 60 seconds)
    useEffect(() => {
        if (!sessionId || isExamEnded) return;

        syncIntervalRef.current = setInterval(() => {
            syncProgressToServer();
        }, 60000); // 60 seconds

        return () => {
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
            }
        };
    }, [sessionId, isExamEnded, syncProgressToServer]);

    // Add a new highlight
    const addHighlight = useCallback((highlight) => {
        setHighlights((prev) => [...prev, highlight]);
    }, []);

    // Remove a highlight by ID
    const removeHighlight = useCallback((highlightId) => {
        setHighlights((prev) => prev.filter((h) => h.id !== highlightId));
    }, []);

    // Add a new note
    const addNote = useCallback((note) => {
        setNotes((prev) => [...prev, note]);
    }, []);

    // Remove a note by ID
    const removeNote = useCallback((noteId) => {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
    }, []);

    // Update an existing note
    const updateNote = useCallback((noteId, updates) => {
        setNotes((prev) => prev.map((n) =>
            n.id === noteId ? { ...n, ...updates } : n
        ));
    }, []);

    // Update writing response for a specific task
    const updateWritingResponse = useCallback((taskNumber, text) => {
        setWritingResponses((prev) => ({
            ...prev,
            [`task${taskNumber}Text`]: text
        }));

        // Debounced server sync (after 2 seconds of no typing)
        if (writingDebounceRef.current) {
            clearTimeout(writingDebounceRef.current);
        }
        writingDebounceRef.current = setTimeout(() => {
            syncProgressToServer();
        }, 2000);
    }, [syncProgressToServer]);

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

    // Auto-submit when time runs out
    useEffect(() => {
        if (timeLeft === 0 && !isExamEnded) {
            submitExam();
        }
    }, [timeLeft, isExamEnded]);

    const submitExam = useCallback(async () => {
        if (isExamEnded) return;

        setIsExamEnded(true);
        setIsTimerRunning(false);

        try {
            await fetch(`/api/test-session/${sessionId}/finish`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ answers }),
            });

            // Optional: Redirect to results page or show completion modal
            // router.push(`/dashboard/results/${sessionId}`);
        } catch (error) {
            console.error('Failed to submit exam:', error);
            // Even if API fails, UI should remain in ended state
        }
    }, [sessionId, answers, isExamEnded]);

    // Navigate to a specific question
    const goToQuestion = useCallback((index) => {
        if (index >= 0 && index < totalQuestions) {
            setCurrentQuestionIndex(index);
        }
    }, [totalQuestions]);

    // Go to next question
    const goToNextQuestion = useCallback(() => {
        if (totalQuestions <= 0) return;
        const maxIndex = Math.max(totalQuestions - 1, 0);
        setCurrentQuestionIndex((prev) => Math.min(prev + 1, maxIndex));
    }, [totalQuestions]);

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

    const toggleReviewScreen = useCallback(() => {
        setIsReviewOpen((prev) => !prev);
    }, []);

    const value = {
        timeLeft,
        currentQuestionIndex,
        answers,
        questionStatus,
        isTimerRunning,
        totalQuestions,
        goToQuestion,
        goToNextQuestion,
        goToPrevQuestion,
        setAnswer,
        toggleFlag,
        toggleTimer,
        isReviewOpen,
        setIsReviewOpen,
        toggleReviewScreen,
        // Highlight and note management
        highlights,
        notes,
        addHighlight,
        removeHighlight,
        addNote,
        removeNote,
        updateNote,
        sessionId,
        // Writing response management
        writingResponses,
        updateWritingResponse,
        isExamEnded,
        submitExam,
        // Privacy Mode
        isHidden,
        toggleHideScreen,
        logSecurityEvent,
        // Theme
        theme,
        setTheme,
        // Font Size
        fontSize,
        toggleFontSize,
        setFontSize,
        // Exam Data from Database
        examData,
        isLoading,
        loadError,
        // Listening Module
        volume,
        setVolume,
        listeningPhase,
        setListeningPhase,
        reviewTimeLeft,
        startReviewPhase,
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
