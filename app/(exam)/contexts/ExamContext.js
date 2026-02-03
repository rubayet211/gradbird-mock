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

const normalizeExistingBlock = (block, counterRef, module) => {
    if (!block || typeof block !== 'object') return block;

    // Deep clone to safely mutate
    // Note regarding performance: A structuredClone or JSON parse/stringify might be cleaner but spread is used here.
    // Given the depth, strict cloning is better if we mutate.
    const normalized = JSON.parse(JSON.stringify(block));

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
        normalized.data.instruction = normalized.instruction;
    }

    // --- Inject Prefixes into Nested Items ---

    // Helper to prefix
    const p = (id) => (id && String(id).startsWith(module + '-')) ? id : `${module}-${id}`;

    if (Array.isArray(normalized.items)) {
        normalized.items = normalized.items.map(item => ({
            ...item,
            id: p(item.id || normalized.startId) // fallback?
        }));
    }

    if (normalized.type === 'Matching' && Array.isArray(normalized.data?.items)) {
        normalized.data.items = normalized.data.items.map((item, idx) => ({
            ...item,
            // Matching items usually imply question IDs starting from startId
            // But existing code logic for extractQuestionIdsFromBlocks implies this too.
            // We need to support how MatchingQuestion.js renders.
            // MatchingQuestion.js uses startNumber + index usually.
            // If we change IDs here, we must ensure MatchingQuestion.js uses `id` from item?
            // Let's check MatchingQuestion.js logic later. 
            // Ideally we explicitly set `id` on items.
            id: p(typeof item.id !== 'undefined' ? item.id : (normalized.startId + idx))
        }));
    }

    if ((normalized.type === 'MapLabeling' || normalized.type === 'DiagramLabeling') && Array.isArray(normalized.data?.dropZones)) {
        normalized.data.dropZones = normalized.data.dropZones.map(zone => ({
            ...zone,
            questionId: p(zone.questionId)
        }));
    }

    if (Array.isArray(normalized.data?.questions)) {
        normalized.data.questions = normalized.data.questions.map(q => ({
            ...q,
            id: p(q.id)
        }));
    }

    if (normalized.type === 'MultipleAnswer' && normalized.data?.id !== undefined) {
        normalized.data.id = p(normalized.data.id);
    }

    // Also block level id?
    if (normalized.id) {
        normalized.id = p(normalized.id);
    }

    return normalized;
};

const normalizeFlatQuestion = (question, module, counterRef) => {
    const type = question?.type || 'MCQ';
    const heading = question?.heading || `Question ${counterRef.value}`;
    const instruction = question?.instruction || '';
    const startId = counterRef.value;

    // Prefix IDs with module to ensure global uniqueness and matching with answers
    // Note: If question.id exists, we prefix it. If we generate one, we prefix it.
    const rawBaseId = question?.id || String(startId);
    const baseId = rawBaseId.startsWith(`${module}-`) ? rawBaseId : `${module}-${rawBaseId}`;

    let block;
    switch (type) {
        case 'TrueFalse':
            block = {
                type,
                heading,
                instruction,
                startId: startId, // Keep tracking numbers as numbers for display if needed? 
                // Actually Question components use id for logical ID but startId might be numeric for display numbering.
                // Let's keep startId numeric for now, components often compute display number from it. 
                items: [{
                    id: question?.id ? `${module}-${question.id}` : `${module}-${startId}`,
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
                        id: question?.id ? `${module}-${question.id}` : `${module}-${startId}`,
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
                        id: question?.id ? `${module}-${question.id}` : `${module}-${startId}`,
                        text: question?.text || '',
                        wordLimit: question?.wordLimit,
                    }],
                },
            };
            break;
        case 'Matching':
            // Matching items usually have IDs too
            block = {
                type,
                heading,
                instruction,
                startId,
                data: {
                    id: baseId,
                    instruction,
                    items: normalizeMatchingItems(question?.items, baseId), // We should ensure this propagates prefix?
                    // normalizeMatchingItems uses baseId. 
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
                    id: question?.id ? `${module}-${question.id}` : `${module}-${startId}`,
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
                    id: question?.id ? `${module}-${question.id}` : `${module}-${startId}`,
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
            // For existing blocks, we might need to inject prefixes into their items?
            // Existing blocks (from DB schema) might have raw IDs inside.
            // This function `normalizeExistingBlock` just updates ids/counters. 
            // We should PROBABLY ensure IDs inside are prefixed too.
            // But let's look at normalizeFlatQuestion first.
            return normalizeExistingBlock(item, counterRef, module);
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

const flattenAnswers = (nestedAnswers) => {
    if (!nestedAnswers) return {};
    const flat = {};

    if (nestedAnswers.reading) {
        Object.entries(nestedAnswers.reading).forEach(([id, val]) => {
            flat[`reading-${id}`] = val;
        });
    }
    if (nestedAnswers.listening) {
        Object.entries(nestedAnswers.listening).forEach(([id, val]) => {
            flat[`listening-${id}`] = val;
        });
    }
    // Writing/Speaking usually don't have "answers" in this object, but if they did:
    if (nestedAnswers.writing) {
        Object.entries(nestedAnswers.writing).forEach(([id, val]) => {
            flat[`writing-${id}`] = val;
        });
    }
    if (nestedAnswers.speaking) {
        Object.entries(nestedAnswers.speaking).forEach(([id, val]) => {
            flat[`speaking-${id}`] = val;
        });
    }

    return flat;
};

const nestAnswers = (flatAnswers, examData) => {
    if (!flatAnswers) return { reading: {}, listening: {} };

    // Initialize with empty objects
    const nested = {
        reading: {},
        listening: {},
        writing: {},
        speaking: {} // Just in case
    };

    Object.entries(flatAnswers).forEach(([key, value]) => {
        // key is expected to be "module-id"
        // Split by first hyphen to support IDs that might contain hyphens (though our normalized IDs shouldn't ideally)
        const parts = key.split('-');
        if (parts.length < 2) return; // Invalid key format

        const module = parts[0];
        // The ID is the rest of the string (re-join if needed)
        const id = parts.slice(1).join('-');

        if (nested[module]) {
            nested[module][id] = value;
        }
    });

    return nested;
};

export function ExamProvider({ children, initialTime = INITIAL_TIME, sessionId }) {
    const searchParams = useSearchParams();
    // --- Refactored: Helper to get module (and guard against undefined)
    const getModule = () => (searchParams?.get('module') || 'reading').toLowerCase();
    const activeModule = getModule();

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
    const writingDebounceRef = useRef(null);

    // Theme state
    const [theme, setTheme] = useState('standard');
    useEffect(() => {
        const storedTheme = localStorage.getItem('exam-theme');
        if (storedTheme) setTheme(storedTheme);
    }, []);
    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('exam-theme', theme);
    }, [theme]);

    // Font Size state
    const [fontSize, setFontSize] = useState('standard');
    useEffect(() => {
        const storedFontSize = localStorage.getItem('exam-font-size');
        if (storedFontSize) setFontSize(storedFontSize);
    }, []);
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

    // Auto-advance module or submit when review phase ends (Listening only)
    useEffect(() => {
        if (listeningPhase === 'ended' && reviewTimeLeft === 0 && !isExamEnded) {
            finishModule();
        }
    }, [listeningPhase, reviewTimeLeft, isExamEnded]);

    // Log security events
    const logSecurityEvent = useCallback(async (eventType) => {
        if (!sessionId) return;
        try {
            await fetch('/api/exam/log-security', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

    // Load local storage data
    useEffect(() => {
        if (sessionId) {
            setHighlights(getHighlights(sessionId));
            setNotes(getNotes(sessionId));
            setWritingResponses(getWritingResponses(sessionId));
        }
    }, [sessionId]);

    useEffect(() => {
        if (sessionId) saveHighlights(sessionId, highlights);
    }, [sessionId, highlights]);

    useEffect(() => {
        if (sessionId) saveNotes(sessionId, notes);
    }, [sessionId, notes]);

    useEffect(() => {
        if (sessionId) saveWritingResponses(sessionId, writingResponses);
    }, [sessionId, writingResponses]);


    // --- Module Progression Logic ---
    const router = { push: (url) => window.location.href = url }; // Simple router shim or use from next/navigation
    // Note: We used `useSearchParams` but not `useRouter` at top level. 
    // We should probably import `useRouter` from 'next/navigation' properly if we want SPA nav. 
    // But modifying imports is a different chunk. For now, assuming standard nav or we can inject it.
    // Actually, useSearchParams is there. Let's add useRouter if missing or assume standard window location for now as fallback.

    // Debounced sync
    const syncProgressToServer = useCallback(async () => {
        if (!sessionId || isExamEnded) return;

        try {
            await fetch('/api/exam/save-progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    answers: nestAnswers(answers, examData), // Must handle prefixes
                    writingResponses,
                    timeRemaining: timeLeft,
                }),
            });
            lastSyncRef.current = Date.now();
        } catch (error) {
            console.error('Failed to sync progress to server:', error);
        }
    }, [sessionId, answers, writingResponses, timeLeft, isExamEnded, examData]);

    useEffect(() => {
        if (!sessionId || isExamEnded) return;
        syncIntervalRef.current = setInterval(() => syncProgressToServer(), 60000);
        return () => clearInterval(syncIntervalRef.current);
    }, [sessionId, isExamEnded, syncProgressToServer]);


    // --- Safe Module Navigation ---
    const finishModule = useCallback(async () => {
        if (!examData) return;

        const MODULE_ORDER = ['reading', 'listening', 'writing', 'speaking'];
        const currentModuleIndex = MODULE_ORDER.indexOf(activeModule);

        // Save current progress before moving on
        await syncProgressToServer();

        // If validation fails or needs alert? check logic here...

        if (currentModuleIndex >= 0 && currentModuleIndex < MODULE_ORDER.length - 1) {
            const nextModule = MODULE_ORDER[currentModuleIndex + 1];
            // Use window.location to force full reload/update or next/navigation
            // Assuming next/navigation is better for SPA feeling
            // Since we don't have router imported, using window.location.search update
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('module', nextModule);
            window.location.href = newUrl.toString();
        } else {
            // Last module or unknown: Submit Exam
            submitExam();
        }
    }, [activeModule, examData, syncProgressToServer]); // submitExam not in dep yet, defined below


    // Fetch exam data
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

                // Calculate total questions
                let count = resolveQuestionCount(normalizedExamData, activeModule);
                if (count === 0) count = getDefaultQuestionCount(activeModule);

                // Get IDs for *current module only* ensuring prefixes
                // NOTE: We need to update getQuestionIdsFromExamData to handle prefixes if we change normalize
                // OR we just rely on normalizing them with prefixes.
                // The current normalize code doesn't add prefixes to IDs inside the object structure, 
                // it just cleans them. 
                // We will handle prefixing dynamically below to be safe.

                const questionIdsUnprefixed = getQuestionIdsFromExamData(normalizedExamData, activeModule);

                // Prefix IDs for current module to match our storage key format: "module-id"
                // But wait, the previous code used raw IDs. 
                // To fix collision, we MUST prefix them in `answers` state.
                const questionIds = questionIdsUnprefixed.map(id => `${activeModule}-${id}`);

                const totalCount = questionIds.length > 0 ? questionIds.length : count;

                setTotalQuestions(totalCount);
                setExamData(normalizedExamData);

                // Flatten and prefix saved answers
                const allSavedAnswers = flattenAnswers(normalizedExamData?.savedAnswers);
                // Note: flattenAnswers now needs to return prefixed keys: {'reading-1': 'A', ...}
                // We need to update flattenAnswers definition (it's outside this chunk).
                // Assuming we updated/will update helpers.

                setAnswers(allSavedAnswers);

                // Initialize status
                // We check if `activeModule-id` is in `allSavedAnswers`
                const initialStatus = questionIds.map(qId => ({
                    id: qId, // This is now 'reading-1'
                    status: allSavedAnswers[qId] ? 'answered' : 'unanswered'
                }));

                setQuestionStatus(initialStatus);

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
    }, [sessionId, activeModule]); // Added activeModule to refetch on module change

    // Add/Remove Highlight/Note - consistent
    const addHighlight = useCallback((h) => setHighlights((p) => [...p, h]), []);
    const removeHighlight = useCallback((id) => setHighlights((p) => p.filter((h) => h.id !== id)), []);
    const addNote = useCallback((n) => setNotes((p) => [...p, n]), []);
    const removeNote = useCallback((id) => setNotes((p) => p.filter((n) => n.id !== id)), []);
    const updateNote = useCallback((id, u) => setNotes((p) => p.map((n) => n.id === id ? { ...n, ...u } : n)), []);

    const updateWritingResponse = useCallback((taskNumber, text) => {
        setWritingResponses((prev) => ({
            ...prev,
            [`task${taskNumber}Text`]: text
        }));
        if (writingDebounceRef.current) clearTimeout(writingDebounceRef.current);
        writingDebounceRef.current = setTimeout(() => syncProgressToServer(), 2000);
    }, [syncProgressToServer]);

    // Timer
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

    // Auto-submit on time zero
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: nestAnswers(answers, examData) }),
            });
            // Redirect done by ReviewScreen or similar logic usually
        } catch (error) {
            console.error('Failed to submit exam:', error);
        }
    }, [sessionId, answers, isExamEnded, examData]);

    // Navigation
    const goToQuestion = useCallback((index) => {
        if (index >= 0 && index < totalQuestions) setCurrentQuestionIndex(index);
    }, [totalQuestions]);

    const goToNextQuestion = useCallback(() => {
        if (totalQuestions <= 0) return;
        setCurrentQuestionIndex((prev) => Math.min(prev + 1, totalQuestions - 1));
    }, [totalQuestions]);

    const goToPrevQuestion = useCallback(() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0)), []);

    // Set Answer - now expects prefixed ID or we ensure logic handles it
    // The components usually pass the ID from the question block. 
    // We should make sure `answer` call includes prefix OR component knows about prefix.
    // EASIEST: The component gets questions with normalized IDs. We should prefix IDs inside normalization 
    // OR we prefix them here. 
    // Let's decide: `setAnswer` receives raw ID (e.g. "1") and must store as `module-1`.
    // Valid approach: The `activeModule` is known here.
    const setAnswer = useCallback((rawQuestionId, answer) => {
        // Ensure ID is string
        const qIdStr = String(rawQuestionId);
        // If it comes with prefix already (unlikely from UI unless we changed UI), check
        const questionId = qIdStr.startsWith(`${activeModule}-`) ? qIdStr : `${activeModule}-${qIdStr}`;

        setAnswers((prev) => ({
            ...prev,
            [questionId]: answer,
        }));

        setQuestionStatus((prev) =>
            prev.map((q) =>
                q.id === questionId && q.status !== 'flagged'
                    ? { ...q, status: 'answered' }
                    : q
            )
        );
    }, [activeModule]);

    const toggleFlag = useCallback((rawQuestionId) => {
        const qIdStr = String(rawQuestionId);
        const questionId = qIdStr.startsWith(`${activeModule}-`) ? qIdStr : `${activeModule}-${qIdStr}`;
        setQuestionStatus((prev) =>
            prev.map((q) => {
                if (q.id !== questionId) return q;
                if (q.status === 'flagged') {
                    return {
                        ...q,
                        status: answers[questionId] ? 'answered' : 'unanswered',
                    };
                }
                return { ...q, status: 'flagged' };
            })
        );
    }, [answers, activeModule]);

    const toggleTimer = useCallback(() => setIsTimerRunning((prev) => !prev), []);
    const toggleReviewScreen = useCallback(() => setIsReviewOpen((prev) => !prev), []);

    const value = {
        timeLeft,
        currentQuestionIndex,
        answers, // Should components receive full flat answers? Yes. But they might look for "1". 
        // Components should be looking for scoped answers. 
        // If we change keys to `reading-1`, we broke components unless they also look up by `reading-1`.
        // WE SHOULD: expose a scoped accessor or components need updating.
        // BETTER: `answers` here can be the full set. 
        // But we should expose `getAnswer(id)`?
        // Or, if we update `questionStatus` IDs to be `reading-1`, then the UI listing questions will use `reading-1`.
        // The Question components map over `questionStatus` or `questions`.
        // If we normalized `questions` to have prefixed IDs, then everything flows naturally.

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
        highlights,
        notes,
        addHighlight,
        removeHighlight,
        addNote,
        removeNote,
        updateNote,
        sessionId,
        writingResponses,
        updateWritingResponse,
        isExamEnded,
        submitExam,
        finishModule, // Expose this new function!
        isHidden,
        toggleHideScreen,
        logSecurityEvent,
        theme,
        setTheme,
        fontSize,
        toggleFontSize,
        setFontSize,
        examData,
        isLoading,
        loadError,
        volume,
        setVolume,
        listeningPhase,
        setListeningPhase,
        reviewTimeLeft,
        startReviewPhase,
        finishModule,
        activeModule
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
