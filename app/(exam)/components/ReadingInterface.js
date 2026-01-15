'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useExam } from '../contexts/ExamContext';
import ResizableSplitPane from './ResizableSplitPane';
import ContextMenu from './ContextMenu';
import NoteModal from './NoteModal';
import NoteMarginIcon from './NoteMarginIcon';
import MatchingQuestion from './MatchingQuestion';
import MultipleAnswerMCQ from './MultipleAnswerMCQ';
import GapFillQuestion from './GapFillQuestion';
import DiagramLabeling from './DiagramLabeling';
import ShortAnswerQuestion from './ShortAnswerQuestion';
import { READING_EXAM_DATA } from '../data/reading-data';

export default function ReadingInterface() {
    const {
        setAnswer,
        answers,
        highlights,
        notes,
        addHighlight,
        removeHighlight,
        addNote,
        isExamEnded,
        currentQuestionIndex,
        goToQuestion,
        examData,
        isLoading,
        loadError,
    } = useExam();

    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
    const [selectedRange, setSelectedRange] = useState(null);
    const [noteModalOpen, setNoteModalOpen] = useState(false);
    const [selectedTextForNote, setSelectedTextForNote] = useState('');
    const passageRef = useRef(null);
    const contentRef = useRef(null);
    const [isRestored, setIsRestored] = useState(false);
    const [notePositions, setNotePositions] = useState({});

    // Use examData from database if available, fallback to static data
    const readingData = useMemo(() => {
        if (examData?.reading?.sections) {
            // Map database format to component format
            return {
                title: examData.testTitle || 'Reading Test',
                sections: examData.reading.sections.map(section => ({
                    id: section.id,
                    title: section.title,
                    content: section.passageText,
                    questions: section.questions || [],
                }))
            };
        }
        // Fallback to static data for development/testing
        return READING_EXAM_DATA;
    }, [examData]);

    // Passage Navigation State
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const currentSection = readingData.sections[currentSectionIndex] || readingData.sections[0];

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading exam...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (loadError) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center text-red-600">
                    <p className="text-lg font-medium">Error loading exam</p>
                    <p className="text-sm mt-2">{loadError}</p>
                </div>
            </div>
        );
    }

    // Restore highlights from context on passage change
    useEffect(() => {
        setIsRestored(false);
    }, [currentSectionIndex]);

    useEffect(() => {
        if (isRestored || !contentRef.current || highlights.length === 0) return;

        setIsRestored(true);

        highlights.forEach((highlight) => {
            const textNodes = getTextNodes(contentRef.current);
            for (const node of textNodes) {
                const index = node.textContent.indexOf(highlight.text);
                if (index !== -1) {
                    const range = document.createRange();
                    range.setStart(node, index);
                    range.setEnd(node, index + highlight.text.length);

                    const span = document.createElement('span');
                    const hasNote = notes.some(n => n.id === highlight.id);
                    const noteData = notes.find(n => n.id === highlight.id);

                    if (hasNote && noteData) {
                        span.className = 'bg-blue-200 rounded px-0.5 border-b-2 border-blue-400 cursor-pointer hover:bg-blue-300 transition-colors';
                        span.dataset.hasNote = 'true';
                        span.title = noteData.note;
                    } else {
                        span.className = 'bg-yellow-200 rounded px-0.5 cursor-pointer hover:bg-yellow-300 transition-colors';
                    }
                    span.dataset.highlightId = highlight.id;

                    try {
                        range.surroundContents(span);
                    } catch (e) {
                        // Skip
                    }
                    break;
                }
            }
        });
    }, [highlights, notes, isRestored, currentSectionIndex]);

    function getTextNodes(element) {
        const textNodes = [];
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        let node;
        while ((node = walker.nextNode())) {
            textNodes.push(node);
        }
        return textNodes;
    }

    const handleHighlightClick = useCallback((e) => {
        const span = e.target.closest('[data-highlight-id]');
        if (span && span.dataset.highlightId) {
            const highlightId = parseInt(span.dataset.highlightId, 10);
            const textContent = span.textContent;
            const textNode = document.createTextNode(textContent);
            span.parentNode.replaceChild(textNode, span);
            removeHighlight(highlightId);
        }
    }, [removeHighlight]);

    const handleContextMenu = useCallback((e) => {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (selectedText && contentRef.current?.contains(selection.anchorNode)) {
            e.preventDefault();
            const range = selection.getRangeAt(0);
            setSelectedRange(range.cloneRange());
            setContextMenu({
                visible: true,
                x: e.clientX,
                y: e.clientY,
            });
        }
    }, []);

    const closeContextMenu = useCallback(() => {
        setContextMenu({ visible: false, x: 0, y: 0 });
    }, []);

    const handleHighlight = useCallback(() => {
        if (!selectedRange) return;

        const selectedText = selectedRange.toString();
        if (!selectedText) return;

        const highlightId = Date.now();
        const newHighlight = {
            id: highlightId,
            text: selectedText,
        };

        try {
            const span = document.createElement('span');
            span.className = 'bg-yellow-200 rounded px-0.5 cursor-pointer hover:bg-yellow-300 transition-colors';
            span.dataset.highlightId = highlightId;
            selectedRange.surroundContents(span);
            addHighlight(newHighlight);
        } catch (error) {
            const fragment = selectedRange.extractContents();
            const span = document.createElement('span');
            span.className = 'bg-yellow-200 rounded px-0.5 cursor-pointer hover:bg-yellow-300 transition-colors';
            span.dataset.highlightId = highlightId;
            span.appendChild(fragment);
            selectedRange.insertNode(span);
            addHighlight(newHighlight);
        }

        window.getSelection().removeAllRanges();
        closeContextMenu();
        setSelectedRange(null);
    }, [selectedRange, closeContextMenu, addHighlight]);

    const handleNote = useCallback(() => {
        if (!selectedRange) return;
        const selectedText = selectedRange.toString();
        if (!selectedText) return;

        setSelectedTextForNote(selectedText);
        setNoteModalOpen(true);
        closeContextMenu();
    }, [selectedRange, closeContextMenu]);

    const handleSaveNote = useCallback((noteText) => {
        if (!selectedRange) return;
        const selectedText = selectedRange.toString();
        if (!selectedText) return;

        const highlightId = Date.now();
        const rangeRect = selectedRange.getBoundingClientRect();
        const passageRect = passageRef.current?.getBoundingClientRect();
        const scrollTop = passageRef.current?.scrollTop || 0;
        const topOffset = rangeRect.top - (passageRect?.top || 0) + scrollTop;

        const newNote = {
            id: highlightId,
            text: selectedText,
            note: noteText,
            passageId: currentSection.id,
            position: {
                topOffset: topOffset,
                scrollTop: scrollTop
            },
            createdAt: Date.now()
        };

        setNotePositions(prev => ({
            ...prev,
            [highlightId]: topOffset
        }));

        try {
            const span = document.createElement('span');
            span.className = 'bg-blue-200 rounded px-0.5 border-b-2 border-blue-400 cursor-pointer hover:bg-blue-300 transition-colors';
            span.dataset.highlightId = highlightId;
            span.dataset.hasNote = 'true';
            span.title = noteText;
            selectedRange.surroundContents(span);
        } catch (error) {
            const fragment = selectedRange.extractContents();
            const span = document.createElement('span');
            span.className = 'bg-blue-200 rounded px-0.5 border-b-2 border-blue-400 cursor-pointer hover:bg-blue-300 transition-colors';
            span.dataset.highlightId = highlightId;
            span.dataset.hasNote = 'true';
            span.title = noteText;
            span.appendChild(fragment);
            selectedRange.insertNode(span);
        }

        addNote(newNote);
        addHighlight({ id: highlightId, text: selectedText });

        window.getSelection().removeAllRanges();
        setSelectedRange(null);
        setNoteModalOpen(false);
        setSelectedTextForNote('');
    }, [selectedRange, addNote, addHighlight, currentSection.id]);

    const handleAnswerChange = (questionId, value) => {
        setAnswer(questionId, value);
    };

    const leftPaneContent = (
        <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
            <div
                ref={passageRef}
                className="flex-1 overflow-y-auto relative select-text transition-colors duration-300"
                onContextMenu={handleContextMenu}
                onClick={handleHighlightClick}
            >
                <div className="absolute left-2 top-0 w-8 h-full pointer-events-auto z-20">
                    {notes.filter(n => n.passageId === currentSection.id).map((note) => {
                        const topPos = notePositions[note.id] || note.position?.topOffset || 0;
                        if (topPos === 0) return null;
                        return (
                            <NoteMarginIcon
                                key={note.id}
                                note={note}
                                topOffset={topPos + 24}
                                onClick={() => {
                                    const highlightEl = contentRef.current?.querySelector(
                                        `[data-highlight-id="${note.id}"]`
                                    );
                                    if (highlightEl) {
                                        highlightEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        highlightEl.classList.add('ring-2', 'ring-amber-400');
                                        setTimeout(() => {
                                            highlightEl.classList.remove('ring-2', 'ring-amber-400');
                                        }, 1500);
                                    }
                                }}
                            />
                        );
                    })}
                </div>

                <div className="p-6 pl-12 pb-24">
                    <div className="mb-4 pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {currentSection.title.split(':')[0]}
                        </span>
                        <h2 className="text-xl font-bold mt-2">{currentSection.title.split(':')[1]}</h2>
                    </div>

                    <div ref={contentRef} className="max-w-none">
                        {currentSection.content.split('\n\n').map((paragraph, index) => {
                            if (!paragraph.trim()) return null;
                            const isHeader = paragraph.length < 60 && !paragraph.endsWith('.');
                            if (isHeader) {
                                return (
                                    <h3 key={index} className="text-lg font-bold mt-6 mb-3" style={{ color: 'var(--text-color)' }}>
                                        {paragraph}
                                    </h3>
                                );
                            }
                            return (
                                <p key={index} className="leading-relaxed mb-4" style={{ color: 'var(--text-color)' }}>
                                    {paragraph}
                                </p>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="flex border-t" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--panel-bg)' }}>
                {readingData.sections.map((section, index) => (
                    <button
                        key={section.id}
                        onClick={() => setCurrentSectionIndex(index)}
                        className={`
                            px-6 py-3 text-sm font-medium transition-colors border-r
                            ${currentSectionIndex === index
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }
                        `}
                    >
                        Passage {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );

    const renderQuestionBlock = (questionBlock, blockIndex) => {
        switch (questionBlock.type) {
            case 'TrueFalse':
                return (
                    <div key={blockIndex} className="space-y-6">
                        <div className="mb-4 pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                            <h2 className="text-xl font-bold text-gray-800">{questionBlock.heading}</h2>
                            <p className="mt-2 text-sm text-gray-600">{questionBlock.instruction}</p>
                        </div>
                        {questionBlock.items.map((q) => (
                            <div
                                key={q.id}
                                className="rounded-xl shadow-sm border p-5 transition-all hover:shadow-md mb-4"
                                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
                            >
                                <div className="flex gap-4">
                                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                        {q.id}
                                    </span>
                                    <div className="flex-1">
                                        <p className="font-medium mb-4" style={{ color: 'var(--text-color)' }}>{q.text}</p>
                                        <div className="flex gap-4">
                                            {['TRUE', 'FALSE', 'NOT GIVEN'].map((option) => (
                                                <label
                                                    key={option}
                                                    className={`
                                                        flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all
                                                        ${answers[q.id] === option
                                                            ? 'border-blue-600 bg-blue-50 text-blue-700'
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
                                                    />
                                                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${answers[q.id] === option ? 'border-blue-600 bg-blue-600' : 'border-gray-400'}`}>
                                                        {answers[q.id] === option && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                                                    </span>
                                                    <span className="text-sm font-medium">{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'Matching':
                return (
                    <div key={blockIndex} className="mt-10 pt-6 border-t-2 border-gray-300">
                        <div className="mb-6 pb-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">{questionBlock.heading}</h2>
                            <p className="mt-2 text-sm text-gray-600">{questionBlock.instruction}</p>
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
            case 'MultipleAnswer':
                return (
                    <div key={blockIndex} className="mt-10 pt-6 border-t-2 border-gray-300">
                        <div className="mb-6 pb-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">{questionBlock.heading}</h2>
                            <p className="mt-2 text-sm text-gray-600">{questionBlock.instruction}</p>
                        </div>
                        <MultipleAnswerMCQ
                            questionGroup={questionBlock.data}
                            questionNumber={questionBlock.startId}
                            answers={answers}
                            onAnswerChange={handleAnswerChange}
                            disabled={isExamEnded}
                        />
                    </div>
                );
            case 'GapFill':
                return (
                    <div key={blockIndex} className="mt-10 pt-6 border-t-2 border-gray-300">
                        <div className="mb-6 pb-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">{questionBlock.heading}</h2>
                            <p className="mt-2 text-sm text-gray-600">{questionBlock.instruction}</p>
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
            case 'DiagramLabeling':
                return (
                    <div key={blockIndex} className="mt-10 pt-6 border-t-2 border-gray-300">
                        <div className="mb-6 pb-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">{questionBlock.heading}</h2>
                            <p className="mt-2 text-sm text-gray-600">{questionBlock.instruction}</p>
                        </div>
                        <DiagramLabeling
                            questionGroup={questionBlock.data}
                            startNumber={questionBlock.startId}
                            answers={answers}
                            onAnswerChange={handleAnswerChange}
                            disabled={isExamEnded}
                        />
                    </div>
                );
            case 'ShortAnswer':
                return (
                    <div key={blockIndex} className="mt-10 pt-6 border-t-2 border-gray-300">
                        <div className="mb-6 pb-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">{questionBlock.heading}</h2>
                            <p className="mt-2 text-sm text-gray-600">{questionBlock.instruction}</p>
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
            default:
                return null;
        }
    };

    const rightPaneContent = (
        <div className="h-full overflow-y-auto transition-colors duration-300" style={{ backgroundColor: 'var(--panel-bg)' }}>
            <div className="p-6">
                {currentSection.questions.map((block, index) => renderQuestionBlock(block, index))}
                <div className="h-8"></div>
            </div>
        </div>
    );

    return (
        <div className="flex-1 flex overflow-hidden">
            <ResizableSplitPane
                storageKey="reading-panel-sizes"
                leftPanel={leftPaneContent}
                rightPanel={rightPaneContent}
            />

            {contextMenu.visible && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onHighlight={handleHighlight}
                    onNote={handleNote}
                    onClose={closeContextMenu}
                />
            )}

            {noteModalOpen && (
                <NoteModal
                    selectedText={selectedTextForNote}
                    onSave={handleSaveNote}
                    onClose={() => {
                        setNoteModalOpen(false);
                        setSelectedTextForNote('');
                        window.getSelection().removeAllRanges();
                        setSelectedRange(null);
                    }}
                />
            )}
        </div>
    );
}
