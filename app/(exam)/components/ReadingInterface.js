'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useExam } from '../contexts/ExamContext';

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

export default function ReadingInterface() {
    const { setAnswer, answers } = useExam();
    const [highlights, setHighlights] = useState([]);
    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0 });
    const [selectedRange, setSelectedRange] = useState(null);
    const passageRef = useRef(null);
    const contentRef = useRef(null);

    // Handle text selection in the passage
    const handleMouseUp = useCallback((e) => {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (selectedText && contentRef.current?.contains(selection.anchorNode)) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const passageRect = passageRef.current.getBoundingClientRect();

            setTooltip({
                visible: true,
                x: rect.left + rect.width / 2 - passageRect.left,
                y: rect.top - passageRect.top - 10,
            });
            setSelectedRange(range.cloneRange());
        } else {
            setTooltip({ visible: false, x: 0, y: 0 });
            setSelectedRange(null);
        }
    }, []);

    // Handle clicking outside to hide tooltip
    const handleMouseDown = useCallback((e) => {
        if (!e.target.closest('.highlight-tooltip')) {
            setTooltip({ visible: false, x: 0, y: 0 });
        }
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
            span.className = 'bg-yellow-200 rounded px-0.5';
            span.dataset.highlightId = highlightId;
            selectedRange.surroundContents(span);

            setHighlights(prev => [...prev, newHighlight]);
        } catch (error) {
            // Handle partial element selection - use extractContents approach
            console.warn('Complex selection, using alternative highlight method');
            const fragment = selectedRange.extractContents();
            const span = document.createElement('span');
            span.className = 'bg-yellow-200 rounded px-0.5';
            span.dataset.highlightId = highlightId;
            span.appendChild(fragment);
            selectedRange.insertNode(span);

            setHighlights(prev => [...prev, newHighlight]);
        }

        // Clear selection and hide tooltip
        window.getSelection().removeAllRanges();
        setTooltip({ visible: false, x: 0, y: 0 });
        setSelectedRange(null);
    }, [selectedRange]);

    // Handle answer selection for True/False/Not Given questions
    const handleAnswerChange = (questionId, value) => {
        setAnswer(questionId, value);
    };

    return (
        <div className="flex-1 flex overflow-hidden">
            {/* Left Pane - Reading Passage */}
            <div
                ref={passageRef}
                className="w-1/2 h-full overflow-y-auto bg-white border-r border-gray-300 relative select-text"
                onMouseUp={handleMouseUp}
                onMouseDown={handleMouseDown}
            >
                {/* Highlight Tooltip */}
                {tooltip.visible && (
                    <div
                        className="highlight-tooltip absolute z-50 transform -translate-x-1/2 -translate-y-full"
                        style={{ left: tooltip.x, top: tooltip.y }}
                    >
                        <button
                            onClick={handleHighlight}
                            className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg hover:bg-gray-800 transition-colors flex items-center gap-1.5"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Highlight
                        </button>
                        <div className="absolute left-1/2 transform -translate-x-1/2 top-full">
                            <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900"></div>
                        </div>
                    </div>
                )}

                {/* Passage Content */}
                <div className="p-6">
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

            {/* Right Pane - Questions */}
            <div className="w-1/2 h-full overflow-y-auto bg-gray-50">
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

                    {/* Bottom spacing */}
                    <div className="h-8"></div>
                </div>
            </div>
        </div>
    );
}
