'use client';

import { useState, useCallback } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    useSortable,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Draggable Option Component
function DraggableOption({ id, children, isUsed, disabled }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id, disabled: isUsed || disabled });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : (isUsed || disabled) ? 0.4 : 1,
        cursor: (isUsed || disabled) ? 'not-allowed' : isDragging ? 'grabbing' : 'grab',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`
                px-4 py-2 rounded-lg border-2 text-sm font-medium
                transition-all duration-200 select-none
                ${isDragging
                    ? 'border-blue-500 bg-blue-100 shadow-lg scale-105 z-50'
                    : isUsed
                        ? 'border-gray-200 bg-gray-100 text-gray-400'
                        : 'border-gray-300 bg-white hover:border-blue-400 hover:shadow-md'
                }
            `}
        >
            {children}
        </div>
    );
}

// Droppable Slot Component
function DroppableSlot({ id, questionNumber, itemText, droppedOption, onRemove, disabled }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        isOver,
        active,
    } = useSortable({ id });

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className={`
                flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200
                ${isOver && active
                    ? 'border-blue-500 bg-blue-50 shadow-inner'
                    : droppedOption
                        ? 'border-green-300 bg-green-50'
                        : 'border-dashed border-gray-300 bg-gray-50'
                }
            `}
        >
            {/* Question Number */}
            <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                {questionNumber}
            </span>

            {/* Item Text */}
            <div className="flex-1">
                <p className="text-gray-800 font-medium">{itemText}</p>
            </div>

            {/* Drop Zone / Dropped Option */}
            <div className="flex-shrink-0 min-w-[140px]">
                {droppedOption ? (
                    <div
                        className={`px-4 py-2 rounded-lg border-2 border-green-400 bg-green-100 text-green-800 font-medium text-sm flex items-center gap-2 transition-colors ${!disabled ? 'cursor-pointer hover:bg-red-50 hover:border-red-300 hover:text-red-600' : ''}`}
                        onClick={!disabled ? onRemove : undefined}
                        title="Click to remove"
                    >
                        <span>{droppedOption}</span>
                        <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                ) : (
                    <div className={`
                        px-4 py-2 rounded-lg border-2 border-dashed text-sm text-gray-400 text-center
                        ${isOver ? 'border-blue-500 bg-blue-100 text-blue-600' : 'border-gray-300'}
                    `}>
                        Drop here
                    </div>
                )}
            </div>
        </div>
    );
}

// Main MatchingQuestion Component
export default function MatchingQuestion({
    questionGroup,
    startNumber = 1,
    answers = {},
    onAnswerChange,
    disabled = false,
}) {
    const [activeId, setActiveId] = useState(null);

    // Configure sensors for pointer, touch, and keyboard
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Track which options are used
    const usedOptions = Object.values(answers).filter(Boolean);

    // Generate IDs for sortable context
    const optionIds = questionGroup.options.map((_, i) => `option-${i}`);
    const slotIds = questionGroup.items.map((item) => `slot-${item.id}`);
    const allIds = [...optionIds, ...slotIds];

    const handleDragStart = useCallback((event) => {
        setActiveId(event.active.id);
    }, []);

    const handleDragEnd = useCallback((event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        // Check if dropped on a slot
        if (over.id.toString().startsWith('slot-')) {
            const slotId = over.id.toString().replace('slot-', '');
            const optionIndex = parseInt(active.id.toString().replace('option-', ''), 10);
            const droppedOption = questionGroup.options[optionIndex];

            // Find the question number for this slot
            const itemIndex = questionGroup.items.findIndex(item => item.id === slotId);
            const questionId = startNumber + itemIndex;

            // Only set if the option isn't already used elsewhere
            if (!usedOptions.includes(droppedOption) || answers[questionId] === droppedOption) {
                onAnswerChange(questionId, droppedOption);
            }
        }
    }, [questionGroup, startNumber, answers, usedOptions, onAnswerChange]);

    const handleRemoveAnswer = useCallback((questionId) => {
        onAnswerChange(questionId, null);
    }, [onAnswerChange]);

    // Get the currently dragged option text
    const activeOption = activeId?.toString().startsWith('option-')
        ? questionGroup.options[parseInt(activeId.toString().replace('option-', ''), 10)]
        : null;

    return (
        <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800 font-medium mb-2">Instructions:</p>
                <p className="text-sm text-amber-700">{questionGroup.instruction}</p>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={allIds} strategy={verticalListSortingStrategy}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left: Options Pool */}
                        <div className="lg:col-span-1">
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                                Options
                            </h3>
                            <div className="space-y-2 p-4 bg-gray-100 rounded-xl min-h-[200px]">
                                {questionGroup.options.map((option, index) => (
                                    <DraggableOption
                                        key={`option-${index}`}
                                        id={`option-${index}`}
                                        isUsed={usedOptions.includes(option)}
                                        disabled={disabled}
                                    >
                                        {option}
                                    </DraggableOption>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2 italic">
                                Drag options to match with items on the right
                            </p>
                        </div>

                        {/* Right: Items with Drop Slots */}
                        <div className="lg:col-span-2">
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                                Questions
                            </h3>
                            <div className="space-y-3">
                                {questionGroup.items.map((item, index) => {
                                    const questionId = startNumber + index;
                                    return (
                                        <DroppableSlot
                                            key={item.id}
                                            id={`slot-${item.id}`}
                                            questionNumber={questionId}
                                            itemText={item.text}
                                            droppedOption={answers[questionId]}
                                            onRemove={() => handleRemoveAnswer(questionId)}
                                            disabled={disabled}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </SortableContext>

                {/* Drag Overlay for visual feedback */}
                <DragOverlay>
                    {activeOption ? (
                        <div className="px-4 py-2 rounded-lg border-2 border-blue-500 bg-blue-100 text-blue-800 font-medium text-sm shadow-xl">
                            {activeOption}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
