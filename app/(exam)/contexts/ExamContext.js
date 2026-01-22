'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
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

const extractQuestionIdsFromBlocks = (blocks = []) => {
    const ids = [];

    blocks.forEach((block) => {
        if (!block) return;

        if (Array.isArray(block.items)) {
            block.items.forEach((item) => {
                if (item && item.id !== undefined) {
                    ids.push(item.id);
                }
            });
            return;
        }

        if (block.type === 'Matching' && Array.isArray(block.data?.items)) {
            const startNumber = Number(block.startId ?? block.startNumber);
            if (Number.isFinite(startNumber)) {
                block.data.items.forEach((_, index) => {
                    ids.push(startNumber + index);
                });
            }
            return;
        }

        if (block.type === 'MapLabeling' && Array.isArray(block.data?.dropZones)) {
            block.data.dropZones.forEach((zone) => {
                if (zone?.questionId !== undefined) {
                    ids.push(zone.questionId);
                }
            });
            return;
        }

        if (Array.isArray(block.data?.questions)) {
            block.data.questions.forEach((question) => {
                if (question && question.id !== undefined) {
                    ids.push(question.id);
                }
            });
            return;
        }

        if (block.type === 'MultipleAnswer' && block.data?.id !== undefined) {
            ids.push(block.data.id);
            return;
        }

        if (block.id !== undefined) {
            ids.push(block.id);
        }
    });

    return ids;
};

const getQuestionIdsFromExamData = (examData, activeModule) => {
    if (!examData) return [];

    const moduleKey = (activeModule || '').toLowerCase();
    if (moduleKey === 'reading' && examData.reading?.sections) {
        return examData.reading.sections.flatMap((section) =>
            extractQuestionIdsFromBlocks(section.questions || [])
        );
    }

    if (moduleKey === 'listening' && examData.listening?.parts) {
        return examData.listening.parts.flatMap((part) =>
            extractQuestionIdsFromBlocks(part.questions || [])
        );
    }

    if (moduleKey === 'writing') {
        return [1, 2];
    }

    if (moduleKey === 'speaking') {
        return [1, 2, 3];
    }

    if (examData.reading?.sections) {
        return examData.reading.sections.flatMap((section) =>
            extractQuestionIdsFromBlocks(section.questions || [])
        );
    }

    if (examData.listening?.parts) {
        return examData.listening.parts.flatMap((part) =>
            extractQuestionIdsFromBlocks(part.questions || [])
        );
    }

    if (examData.writing) {
        return [1, 2];
    }

    if (examData.speaking) {
        return [1, 2, 3];
    }

    if (examData.sections) {
        return examData.sections.flatMap((section) =>
            extractQuestionIdsFromBlocks(section.questions || [])
        );
    }

    if (examData.parts) {
        return examData.parts.flatMap((part) =>
            extractQuestionIdsFromBlocks(part.questions || [])
        );
    }

    if (examData.task1) {
        return [1, 2];
    }

    if (examData.part1) {
        return [1, 2, 3];
    }

    return [];
};

const buildQuestionStatus = (questionIds, savedAnswers = {}) => {
    return questionIds.map((id) => ({
        id,
        status: savedAnswers[id] ? 'answered' : 'unanswered',
    }));
};

const getReadingQuestionCount = (examData) => {
    const sections = examData?.reading?.sections ?? examData?.sections ?? [];
    return sections.reduce((acc, sec) => acc + (sec.questions?.length || 0), 0);
};

const getListeningQuestionCount = (examData) => {
    const parts = examData?.listening?.parts ?? examData?.parts ?? [];
    return parts.reduce((acc, part) => acc + (part.questions?.length || 0), 0);
};

const resolveQuestionCount = (examData, activeModule) => {
    if (!examData) return 0;

    const moduleKey = (activeModule || '').toLowerCase();
    if (moduleKey === 'reading') return getReadingQuestionCount(examData);
    if (moduleKey === 'listening') return getListeningQuestionCount(examData);
    if (moduleKey === 'writing') return 2;
    if (moduleKey === 'speaking') return 3;

    const readingCount = getReadingQuestionCount(examData);
    if (readingCount > 0) return readingCount;

    const listeningCount = getListeningQuestionCount(examData);
    if (listeningCount > 0) return listeningCount;

    if (examData.writing || examData.task1) return 2;
    if (examData.speaking || examData.part1) return 3;

    return 0;
};

const getDefaultQuestionCount = (activeModule) => {
    const moduleKey = (activeModule || '').toLowerCase();
    if (moduleKey === 'writing') return 2;
    if (moduleKey === 'speaking') return 3;
    return 40;
};

const asArray = (value) => (Array.isArray(value) ? value : []);

const isBlockQuestion = (question) => {
    if (!question || typeof question !== 'object') return false;
    return (
        typeof question.data === 'object' ||
        question.heading ||
        question.instruction ||
        question.startId ||
        question.startNumber
    );
};

const normalizeOptionStrings = (options) => {
    return asArray(options)
        .map((option) => {
            if (typeof option === 'string') return option;
            if (option && typeof option === 'object') {
                return option.text || option.label || '';
            }
            return '';
        })
        .filter((option) => option);
};

const normalizeOptionObjects = (options) => {
    return asArray(options)
        .map((option, index) => {
            if (option && typeof option === 'object') {
                return {
                    id: option.id || String.fromCharCode(65 + index),
                    text: option.text || option.label || '',
                };
            }
            if (typeof option === 'string') {
                return {
                    id: String.fromCharCode(65 + index),
                    text: option,
                };
            }
            return null;
        })
        .filter((option) => option && option.text);
};

const normalizeMatchingItems = (items, baseId) => {
    return asArray(items).map((item, index) => ({
        id: item?.id || `${baseId}-${index + 1}`,
        text: item?.text || '',
    }));
};

const normalizeDropZones = (dropZones, startId, baseId) => {
    return asArray(dropZones).map((zone, index) => ({
        id: zone?.id || `${baseId}-zone-${index + 1}`,
        x: typeof zone?.x === 'number' ? zone.x : 50,
        y: typeof zone?.y === 'number' ? zone.y : 50,
        questionId: zone?.questionId ?? startId + index,
    }));
};

const normalizeDiagramQuestions = (questions, startId, baseId) => {
    return asArray(questions).map((question, index) => ({
        id: question?.id || `${baseId}-${startId + index}`,
        x: typeof question?.x === 'number' ? question.x : 50,
        y: typeof question?.y === 'number' ? question.y : 50,
        label: question?.label || '',
    }));
};

const countQuestionsForBlock = (block) => {
    if (!block) return 0;
    if (Array.isArray(block.items)) return block.items.length;
    if (block.type === 'Matching' && Array.isArray(block.data?.items)) return block.data.items.length;
    if ((block.type === 'MapLabeling' || block.type === 'DiagramLabeling') && Array.isArray(block.data?.dropZones)) {
        return block.data.dropZones.length;
    }
    if (Array.isArray(block.data?.questions)) return block.data.questions.length;
    if (block.type === 'MultipleAnswer') return 1;
    if (block.id !== undefined) return 1;
    return 0;
};

const normalizeExistingBlock = (block, counterRef) => {
    if (!block || typeof block !== 'object') return block;
    const normalized = { ...block };
    const count = Math.max(1, countQuestionsForBlock(normalized));
    const startId = Number(normalized.startId ?? normalized.startNumber);

    if (!Number.isFinite(startId)) {
        normalized.startId = counterRef.value;
        counterRef.value += count;
    } else {
        normalized.startId = startId;
        counterRef.value = Math.max(counterRef.value, startId + count);
    }

    if (normalized.data && !normalized.data.instruction && normalized.instruction) {
        normalized.data = {
            ...normalized.data,
            instruction: normalized.instruction,
        };
    }

    return normalized;
};

const normalizeFlatQuestion = (question, module, counterRef) => {
    const type = question?.type || 'MCQ';
    const heading = question?.heading || `Question ${counterRef.value}`;
    const instruction = question?.instruction || '';
    const startId = counterRef.value;
    const baseId = question?.id || `${module}-${startId}`;

    let block;
    switch (type) {
        case 'TrueFalse':
            block = {
                type,
                heading,
                instruction,
                startId,
                items: [{
                    id: question?.id || startId,
                    text: question?.text || '',
                }],
            };
            break;
        case 'GapFill':
            block = {
                type,
                heading,
                instruction,
                startId,
                data: {
                    id: baseId,
                    instruction,
                    questions: [{
                        id: question?.id || startId,
                        text: question?.text || '',
                        wordLimit: question?.wordLimit,
                    }],
                },
            };
            break;
        case 'ShortAnswer':
            block = {
                type,
                heading,
                instruction,
                startId,
                data: {
                    id: baseId,
                    instruction,
                    wordLimitDescription: question?.wordLimit ? `Write NO MORE THAN ${question.wordLimit} WORDS` : undefined,
                    questions: [{
                        id: question?.id || startId,
                        text: question?.text || '',
                        wordLimit: question?.wordLimit,
                    }],
                },
            };
            break;
        case 'Matching':
            block = {
                type,
                heading,
                instruction,
                startId,
                data: {
                    id: baseId,
                    instruction,
                    items: normalizeMatchingItems(question?.items, baseId),
                    options: normalizeOptionStrings(question?.options),
                },
            };
            break;
        case 'MapLabeling':
            block = {
                type,
                heading,
                instruction,
                startId,
                data: {
                    id: baseId,
                    instruction,
                    imageUrl: question?.imageUrl || '',
                    dropZones: normalizeDropZones(question?.dropZones, startId, baseId),
                    labels: normalizeOptionStrings(question?.labels),
                },
            };
            break;
        case 'DiagramLabeling':
            block = {
                type,
                heading,
                instruction,
                startId,
                data: {
                    id: baseId,
                    instruction,
                    imageUrl: question?.imageUrl || '',
                    questions: normalizeDiagramQuestions(question?.questions, startId, baseId),
                },
            };
            break;
        case 'MultipleAnswer':
            block = {
                type,
                heading,
                instruction,
                startId,
                data: {
                    id: question?.id || startId,
                    instruction,
                    text: question?.text || '',
                    options: normalizeOptionObjects(question?.options),
                    requiredCount: question?.requiredCount || 2,
                },
            };
            break;
        case 'MCQ':
        default:
            block = {
                type: 'MCQ',
                heading,
                instruction,
                startId,
                items: [{
                    id: question?.id || startId,
                    text: question?.text || '',
                    options: normalizeOptionStrings(question?.options),
                }],
            };
            break;
    }

    counterRef.value += Math.max(1, countQuestionsForBlock(block));
    return block;
};

const normalizeQuestionBlocks = (questions, module, counterRef) => {
    const list = asArray(questions);
    return list.map((item) => {
        if (isBlockQuestion(item)) {
            return normalizeExistingBlock(item, counterRef);
        }
        return normalizeFlatQuestion(item, module, counterRef);
    });
};

const normalizeExamData = (examData) => {
    if (!examData || typeof examData !== 'object') return examData;
    const normalized = { ...examData };

    if (examData.reading?.sections) {
        const counterRef = { value: 1 };
        normalized.reading = {
            ...examData.reading,
            sections: examData.reading.sections.map((section) => ({
                ...section,
                questions: normalizeQuestionBlocks(section.questions, 'reading', counterRef),
            })),
        };
    }

    if (examData.listening?.parts) {
        const counterRef = { value: 1 };
        normalized.listening = {
            ...examData.listening,
            parts: examData.listening.parts.map((part) => ({
                ...part,
                questions: normalizeQuestionBlocks(part.questions, 'listening', counterRef),
            })),
        };
    }

    return normalized;
};

export function ExamProvider({ children, initialTime = INITIAL_TIME, sessionId }) {
    const searchParams = useSearchParams();
    const activeModule = (searchParams?.get('module') || 'reading').toLowerCase();
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
    }, [sessionId, activeModule]);

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
    }, [sessionId, activeModule]);

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
                    const isDev = process.env.NODE_ENV !== 'production';
                    if (isDev && response.status === 404) {
                        const fallbackCount = getDefaultQuestionCount(activeModule);
                        setTotalQuestions(fallbackCount);
                        setQuestionStatus(generateInitialQuestionStatus(fallbackCount));
                        setExamData(null);
                        setLoadError(null);
                        return;
                    }
                    throw new Error(data.error || 'Failed to fetch exam data');
                }

                const normalizedExamData = normalizeExamData(data.examData);

                // Calculate total questions based on the active module
                let count = resolveQuestionCount(normalizedExamData, activeModule);

                // Fallback default if calculation fails (e.g. empty test or error)
                if (count === 0) count = getDefaultQuestionCount(activeModule);

                const questionIds = getQuestionIdsFromExamData(normalizedExamData, activeModule);
                const totalCount = questionIds.length > 0 ? questionIds.length : count;

                setTotalQuestions(totalCount);
                setExamData(normalizedExamData);

                const saved = normalizedExamData?.savedAnswers || {};

                // Restore saved answers if any
                if (normalizedExamData?.savedAnswers) {
                    setAnswers(saved);
                }

                // Initialize question status
                let initialStatus = questionIds.length > 0
                    ? buildQuestionStatus(questionIds, saved)
                    : generateInitialQuestionStatus(totalCount);

                if (!questionIds.length && normalizedExamData?.savedAnswers) {
                    initialStatus = initialStatus.map(q => ({
                        ...q,
                        status: saved[q.id] ? 'answered' : 'unanswered'
                    }));
                }

                setQuestionStatus(initialStatus);

                // Restore time remaining if any
                if (normalizedExamData?.timeRemaining) {
                    setTimeLeft(normalizedExamData.timeRemaining);
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
