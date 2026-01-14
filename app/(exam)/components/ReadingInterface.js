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

// Sample IELTS Reading Passage
const READING_PASSAGE = `
The Remarkable Migration of Monarch Butterflies

Every year, millions of monarch butterflies embark on one of nature's most extraordinary journeys. These delicate insects travel up to 3,000 miles from their summer breeding grounds in the United States and Canada to their winter sanctuaries in the mountains of central Mexico. This annual migration is one of the most spectacular natural phenomena on Earth.

The monarch butterfly (Danaus plexippus) is easily recognized by its distinctive orange and black wing pattern. Despite weighing less than a gram, these remarkable creatures navigate across vast distances with remarkable precision, often returning to the same trees that their great-great-grandparents occupied the previous year.

The Journey South

The fall migration typically begins in late August when decreasing daylight and cooler temperatures trigger the butterflies to begin their journey south. Unlike other butterfly species, monarchs cannot survive the cold winters of northern climates. Their migration is driven by the need to escape freezing temperatures that would kill them.

During their journey, monarchs travel between 50 to 100 miles per day, riding thermal currents to conserve energy. They navigate using a combination of the sun's position and the Earth's magnetic field. Recent research has revealed that monarchs possess an internal magnetic compass in their antennae that helps them maintain their southward direction even on cloudy days.

The Mexican Wintering Grounds

The butterflies arrive at their Mexican wintering grounds in November, settling in oyamel fir forests at elevations of about 3,000 meters. These cool, misty forests provide the perfect microclimate for the butterflies. The temperatures are cool enough to slow their metabolism and conserve energy, but warm enough to prevent them from freezing.

At these sites, monarchs cluster together by the millions, covering entire trees with their orange and black wings. A single tree can hold tens of thousands of butterflies, creating a breathtaking display that attracts tourists from around the world. The butterflies remain in a state of semi-dormancy throughout the winter months, occasionally fluttering down to nearby streams to drink water.

The Return Journey

In late February and early March, as temperatures warm, the butterflies begin to stir. They mate at the overwintering sites before starting their long journey north. However, unlike the fall migration, which is completed by a single generation, the spring return takes multiple generations to complete.

The butterflies that left Mexico in the spring lay eggs on milkweed plants in Texas and the southern United States. These eggs hatch, and the new generation continues the journey northward. This process repeats three to four times, with each successive generation pushing further north until monarchs once again occupy their entire summer range by June.

Conservation Challenges

Despite their remarkable abilities, monarch populations have declined dramatically in recent decades. Scientists estimate that the eastern monarch population has decreased by approximately 80% since the mid-1990s. Several factors contribute to this decline.

The loss of milkweed habitat is perhaps the greatest threat to monarchs. Milkweed is the only plant on which monarchs lay their eggs, and it is the sole food source for monarch caterpillars. The widespread use of herbicides in agricultural areas has eliminated millions of acres of milkweed from the landscape.

Climate change also poses significant risks to monarch butterflies. Extreme weather events, such as severe storms and droughts, can kill large numbers of butterflies during migration. Additionally, changes in temperature and precipitation patterns may affect the timing of migration and the availability of nectar sources along migration routes.

Deforestation of the oyamel fir forests in Mexico threatens the butterflies' winter habitat. Although the Mexican government has established protected reserves, illegal logging continues to reduce the available habitat. Furthermore, climate change is causing temperatures in the mountain forests to rise, potentially forcing butterflies to higher elevations where suitable habitat may not exist.

Conservation Efforts

Numerous initiatives are underway to protect monarch butterflies and their habitats. In North America, conservation organizations, government agencies, and individuals are working to restore milkweed habitat along migration corridors. The "Monarch Highway" project, for example, aims to plant milkweed and nectar plants throughout the central United States.

Educational programs raise awareness about monarch conservation and encourage people to plant monarch-friendly gardens. Citizen science projects enable thousands of volunteers to monitor monarch populations and report sightings, providing valuable data for researchers.

International cooperation between the United States, Canada, and Mexico is essential for monarch conservation. The North American Monarch Conservation Plan coordinates efforts across all three countries to protect breeding, migrating, and overwintering habitat.

While challenges remain, there is hope for the monarch butterfly. Recent years have shown some population recovery, and growing public interest in monarch conservation continues to drive protection efforts. The fate of the monarch butterfly depends on our collective commitment to preserving the habitats and conditions these remarkable insects need to survive.
`;

// Dummy questions for IELTS Reading True/False/Not Given
const READING_QUESTIONS = [
    { id: 1, text: "Monarch butterflies can survive cold winters in northern climates." },
    { id: 2, text: "Monarchs travel between 50 to 100 miles per day during migration." },
    { id: 3, text: "The butterflies use only the sun's position for navigation." },
    { id: 4, text: "Monarch butterflies arrive in Mexico in November." },
    { id: 5, text: "A single tree can hold up to one million butterflies." },
    { id: 6, text: "The spring return journey is completed by a single generation." },
    { id: 7, text: "The eastern monarch population has decreased by about 80% since the 1990s." },
    { id: 8, text: "Milkweed is the only plant on which monarchs lay their eggs." },
    { id: 9, text: "Climate change has no impact on monarch butterfly migration." },
    { id: 10, text: "The Mexican government has established protected reserves for monarchs." },
    { id: 11, text: "The 'Monarch Highway' project aims to build roads for butterfly observation." },
    { id: 12, text: "Citizen science projects help monitor monarch populations." },
    { id: 13, text: "Recent years have shown some population recovery for monarchs." },
];

// Sample Matching questions for IELTS Reading
const MATCHING_QUESTIONS = {
    id: 'matching-1',
    type: 'Matching',
    instruction: 'Match each statement with the correct section of the passage. Choose the appropriate letter (A-E) for each statement.',
    items: [
        { id: 'A', text: 'Describes the navigational abilities of monarch butterflies' },
        { id: 'B', text: 'Explains why monarchs need to migrate south' },
        { id: 'C', text: 'Discusses threats from habitat loss' },
        { id: 'D', text: 'Mentions the visual appearance of the species' },
        { id: 'E', text: 'Describes international conservation cooperation' },
    ],
    options: [
        'The Journey South',
        'The Mexican Wintering Grounds',
        'The Return Journey',
        'Conservation Challenges',
        'Conservation Efforts',
        'Introduction',
    ],
};

// Sample Multiple Answer questions for IELTS Reading
const MULTIPLE_ANSWER_QUESTIONS = [
    {
        id: 'ma-1',
        type: 'MultipleAnswer',
        instruction: 'Choose TWO letters, A-E.',
        text: 'Which TWO of the following are mentioned as threats to monarch butterflies?',
        options: [
            { id: 'A', text: 'Predation by birds during migration' },
            { id: 'B', text: 'Loss of milkweed habitat' },
            { id: 'C', text: 'Competition from other butterfly species' },
            { id: 'D', text: 'Climate change and extreme weather' },
            { id: 'E', text: 'Pollution in breeding grounds' },
        ],
        requiredCount: 2,
        correctAnswers: ['B', 'D'],
    },
    {
        id: 'ma-2',
        type: 'MultipleAnswer',
        instruction: 'Choose THREE letters, A-F.',
        text: 'Which THREE conservation efforts for monarchs are mentioned in the passage?',
        options: [
            { id: 'A', text: 'Captive breeding programs' },
            { id: 'B', text: 'Restoring milkweed habitat' },
            { id: 'C', text: 'Banning pesticide use entirely' },
            { id: 'D', text: 'Educational programs and awareness' },
            { id: 'E', text: 'Citizen science monitoring projects' },
            { id: 'F', text: 'Relocating butterflies to new regions' },
        ],
        requiredCount: 3,
        correctAnswers: ['B', 'D', 'E'],
    },
];

// Sample Gap Fill questions for IELTS Reading
const GAP_FILL_QUESTIONS = [
    {
        id: 'gf-1',
        type: 'GapFill',
        instruction: 'Complete the sentences below. Write NO MORE THAN TWO WORDS for each answer.',
        questions: [
            {
                id: 'gf-1-q1',
                text: 'Monarch butterflies travel up to ____ miles during migration.',
                wordLimit: 2,
            },
            {
                id: 'gf-1-q2',
                text: 'The butterflies use their ____ to detect the Earth\'s magnetic field.',
                wordLimit: 2,
            },
            {
                id: 'gf-1-q3',
                text: 'Milkweed is the ____ food source for monarch caterpillars.',
                wordLimit: 2,
            },
            {
                id: 'gf-1-q4',
                text: 'Scientists estimate a population decline of approximately ____ since the mid-1990s.',
                wordLimit: 2,
            },
            {
                id: 'gf-1-q5',
                text: 'Illegal logging reduces the available habitat despite the establishment of ____ by the Mexican government.',
                wordLimit: 2,
            },
        ],
    },
];

// Sample Diagram Labeling questions for IELTS Reading
const DIAGRAM_LABELING_QUESTIONS = {
    id: 'dl-1',
    type: 'DiagramLabeling',
    instruction: 'Write NO MORE THAN TWO WORDS for each answer.',
    imageUrl: 'https://cdn.britannica.com/39/150539-050-7119F9CC/parts-flower.jpg', // Placeholder flower diagram
    questions: [
        { id: 'dl-1-q1', x: 20, y: 30, label: 'Part A' },
        { id: 'dl-1-q2', x: 75, y: 25, label: 'Part B' },
        { id: 'dl-1-q3', x: 50, y: 60, label: 'Part C' },
        { id: 'dl-1-q4', x: 30, y: 80, label: 'Part D' },
    ]
};

export default function ReadingInterface() {
    const {
        setAnswer,
        answers,
        highlights,
        notes,
        addHighlight,
        removeHighlight,
        addNote
    } = useExam();
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
    const [selectedRange, setSelectedRange] = useState(null);
    const [noteModalOpen, setNoteModalOpen] = useState(false);
    const [selectedTextForNote, setSelectedTextForNote] = useState('');
    const passageRef = useRef(null);
    const contentRef = useRef(null);
    const [isRestored, setIsRestored] = useState(false);
    const [notePositions, setNotePositions] = useState({});

    // Restore highlights from context on mount
    useEffect(() => {
        if (isRestored || !contentRef.current || highlights.length === 0) return;

        // Mark as restored to prevent re-running
        setIsRestored(true);

        // Restore each highlight by finding the text and wrapping it
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
                        // Skip if unable to wrap
                    }
                    break; // Only wrap the first occurrence
                }
            }
        });
    }, [highlights, notes, isRestored]);

    // Helper function to get all text nodes within an element
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

    // Handle clicking on a highlight to remove it
    const handleHighlightClick = useCallback((e) => {
        const span = e.target.closest('[data-highlight-id]');
        if (span && span.dataset.highlightId) {
            const highlightId = parseInt(span.dataset.highlightId, 10);

            // Remove the span wrapper but keep the text content
            const textContent = span.textContent;
            const textNode = document.createTextNode(textContent);
            span.parentNode.replaceChild(textNode, span);

            // Remove from context
            removeHighlight(highlightId);
        }
    }, [removeHighlight]);

    // Handle right-click context menu on text selection
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

    // Close context menu
    const closeContextMenu = useCallback(() => {
        setContextMenu({ visible: false, x: 0, y: 0 });
    }, []);

    // Apply highlight to selected text
    const handleHighlight = useCallback(() => {
        if (!selectedRange) return;

        const selectedText = selectedRange.toString();
        if (!selectedText) return;

        // Create highlight data
        const highlightId = Date.now();
        const newHighlight = {
            id: highlightId,
            text: selectedText,
        };

        // Wrap the selection in a highlight span
        try {
            const span = document.createElement('span');
            span.className = 'bg-yellow-200 rounded px-0.5 cursor-pointer hover:bg-yellow-300 transition-colors';
            span.dataset.highlightId = highlightId;
            selectedRange.surroundContents(span);

            addHighlight(newHighlight);
        } catch (error) {
            // Handle partial element selection - use extractContents approach
            console.warn('Complex selection, using alternative highlight method');
            const fragment = selectedRange.extractContents();
            const span = document.createElement('span');
            span.className = 'bg-yellow-200 rounded px-0.5 cursor-pointer hover:bg-yellow-300 transition-colors';
            span.dataset.highlightId = highlightId;
            span.appendChild(fragment);
            selectedRange.insertNode(span);

            addHighlight(newHighlight);
        }

        // Clear selection and hide context menu
        window.getSelection().removeAllRanges();
        closeContextMenu();
        setSelectedRange(null);
    }, [selectedRange, closeContextMenu, addHighlight]);

    // Handle Note action - open note modal
    const handleNote = useCallback(() => {
        if (!selectedRange) return;
        const selectedText = selectedRange.toString();
        if (!selectedText) return;

        setSelectedTextForNote(selectedText);
        setNoteModalOpen(true);
        closeContextMenu();
    }, [selectedRange, closeContextMenu]);

    // Save note with highlighted text
    const handleSaveNote = useCallback((noteText) => {
        if (!selectedRange) return;

        const selectedText = selectedRange.toString();
        if (!selectedText) return;

        // Create highlight and note data with position
        const highlightId = Date.now();

        // Get scroll position for margin icon placement
        const rangeRect = selectedRange.getBoundingClientRect();
        const passageRect = passageRef.current?.getBoundingClientRect();
        const scrollTop = passageRef.current?.scrollTop || 0;
        const topOffset = rangeRect.top - (passageRect?.top || 0) + scrollTop;

        const newNote = {
            id: highlightId,
            text: selectedText,
            note: noteText,
            passageId: 'passage-1',
            position: {
                topOffset: topOffset,
                scrollTop: scrollTop
            },
            createdAt: Date.now()
        };

        // Store position for margin icon
        setNotePositions(prev => ({
            ...prev,
            [highlightId]: topOffset
        }));

        // Wrap the selection in a highlight span with note indicator
        try {
            const span = document.createElement('span');
            span.className = 'bg-blue-200 rounded px-0.5 border-b-2 border-blue-400 cursor-pointer hover:bg-blue-300 transition-colors';
            span.dataset.highlightId = highlightId;
            span.dataset.hasNote = 'true';
            span.title = noteText;
            selectedRange.surroundContents(span);
        } catch (error) {
            console.warn('Complex selection, using alternative highlight method');
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

        // Clear selection
        window.getSelection().removeAllRanges();
        setSelectedRange(null);
        setNoteModalOpen(false);
        setSelectedTextForNote('');
    }, [selectedRange, addNote, addHighlight]);

    // Handle answer selection for True/False/Not Given questions
    const handleAnswerChange = (questionId, value) => {
        setAnswer(questionId, value);
    };

    // Left pane content - Reading Passage
    const leftPaneContent = (
        <div
            ref={passageRef}
            className="h-full overflow-y-auto bg-white relative select-text"
            onContextMenu={handleContextMenu}
            onClick={handleHighlightClick}
        >
            {/* Margin Note Icons */}
            <div className="absolute left-2 top-0 w-8 h-full pointer-events-auto z-20">
                {notes.map((note) => {
                    const topPos = notePositions[note.id] || note.position?.topOffset || 0;
                    if (topPos === 0) return null;
                    return (
                        <NoteMarginIcon
                            key={note.id}
                            note={note}
                            topOffset={topPos + 24} // Add 24px for header padding
                            onClick={() => {
                                // Scroll to the highlighted text
                                const highlightEl = contentRef.current?.querySelector(
                                    `[data-highlight-id="${note.id}"]`
                                );
                                if (highlightEl) {
                                    highlightEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    // Flash effect
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

            {/* Passage Content */}
            <div className="p-6 pl-12">
                <div className="mb-4 pb-4 border-b border-gray-200">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        Reading Passage 1
                    </span>
                    <p className="mt-3 text-sm text-gray-500">
                        You should spend about 20 minutes on Questions 1-13, which are based on the reading passage below.
                    </p>
                </div>

                <div ref={contentRef} className="prose prose-gray max-w-none">
                    {READING_PASSAGE.split('\n\n').map((paragraph, index) => {
                        if (index === 0) return null; // Skip empty first line
                        if (index === 1) {
                            return (
                                <h1 key={index} className="text-2xl font-bold text-gray-900 mb-6">
                                    {paragraph}
                                </h1>
                            );
                        }
                        // Check if paragraph is a heading (short and no period at end)
                        if (paragraph.length < 50 && !paragraph.endsWith('.')) {
                            return (
                                <h2 key={index} className="text-lg font-semibold text-gray-800 mt-6 mb-3">
                                    {paragraph}
                                </h2>
                            );
                        }
                        return (
                            <p key={index} className="text-gray-700 leading-relaxed mb-4">
                                {paragraph}
                            </p>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    // Right pane content - Questions
    const rightPaneContent = (
        <div className="h-full overflow-y-auto bg-gray-50">
            <div className="p-6">
                {/* Questions Header */}
                <div className="mb-6 pb-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Questions 1-13</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Do the following statements agree with the information given in the reading passage?
                    </p>
                    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-sm text-amber-800 font-medium mb-2">Write:</p>
                        <ul className="text-sm text-amber-700 space-y-1">
                            <li><strong>TRUE</strong> if the statement agrees with the information</li>
                            <li><strong>FALSE</strong> if the statement contradicts the information</li>
                            <li><strong>NOT GIVEN</strong> if there is no information on this</li>
                        </ul>
                    </div>
                </div>

                {/* Questions List */}
                <div className="space-y-6">
                    {READING_QUESTIONS.map((question) => (
                        <div
                            key={question.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 transition-all hover:shadow-md"
                        >
                            <div className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                    {question.id}
                                </span>
                                <div className="flex-1">
                                    <p className="text-gray-800 font-medium mb-4">{question.text}</p>
                                    <div className="flex gap-4">
                                        {['TRUE', 'FALSE', 'NOT GIVEN'].map((option) => (
                                            <label
                                                key={option}
                                                className={`
                                                    flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all
                                                    ${answers[question.id] === option
                                                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                    }
                                                `}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${question.id}`}
                                                    value={option}
                                                    checked={answers[question.id] === option}
                                                    onChange={() => handleAnswerChange(question.id, option)}
                                                    className="sr-only"
                                                />
                                                <span
                                                    className={`
                                                        w-4 h-4 rounded-full border-2 flex items-center justify-center
                                                        ${answers[question.id] === option
                                                            ? 'border-blue-600 bg-blue-600'
                                                            : 'border-gray-400'
                                                        }
                                                    `}
                                                >
                                                    {answers[question.id] === option && (
                                                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                                                    )}
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

                {/* Matching Questions Section */}
                <div className="mt-10 pt-6 border-t-2 border-gray-300">
                    <div className="mb-6 pb-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800">Questions 14-18</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Match each statement with the correct section of the passage.
                        </p>
                    </div>

                    <MatchingQuestion
                        questionGroup={MATCHING_QUESTIONS}
                        startNumber={14}
                        answers={answers}
                        onAnswerChange={handleAnswerChange}
                    />
                </div>

                {/* Multiple Answer Questions Section */}
                <div className="mt-10 pt-6 border-t-2 border-gray-300">
                    <div className="mb-6 pb-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800">Questions 19-20</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Choose the correct letters from the options given.
                        </p>
                        <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <p className="text-sm text-purple-800 font-medium mb-2">Instructions:</p>
                            <ul className="text-sm text-purple-700 space-y-1">
                                <li>Read each question carefully</li>
                                <li>Select the <strong>exact number</strong> of answers specified</li>
                                <li>You cannot select more than the required number</li>
                            </ul>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {MULTIPLE_ANSWER_QUESTIONS.map((question, index) => (
                            <MultipleAnswerMCQ
                                key={question.id}
                                questionGroup={question}
                                questionNumber={19 + index}
                                answers={answers}
                                onAnswerChange={handleAnswerChange}
                            />
                        ))}
                    </div>
                </div>

                {/* Gap Fill Questions Section */}
                <div className="mt-10 pt-6 border-t-2 border-gray-300">
                    <div className="mb-6 pb-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800">Questions 21-25</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Complete the sentences below.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {GAP_FILL_QUESTIONS.map((group, index) => (
                            <GapFillQuestion
                                key={group.id}
                                questionGroup={group}
                                startNumber={21}
                                answers={answers}
                                onAnswerChange={handleAnswerChange}
                            />
                        ))}
                    </div>
                </div>

                {/* Diagram Labeling Questions Section */}
                <div className="mt-10 pt-6 border-t-2 border-gray-300">
                    <div className="mb-6 pb-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800">Questions 26-29</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Label the parts of the flower.
                        </p>
                    </div>

                    <DiagramLabeling
                        questionGroup={DIAGRAM_LABELING_QUESTIONS}
                        startNumber={26}
                        answers={answers}
                        onAnswerChange={handleAnswerChange}
                    />
                </div>

                {/* Bottom spacing */}
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

            {/* Context Menu */}
            {contextMenu.visible && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onHighlight={handleHighlight}
                    onNote={handleNote}
                    onClose={closeContextMenu}
                />
            )}

            {/* Note Modal */}
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

