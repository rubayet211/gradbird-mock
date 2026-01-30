'use client';

import { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
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
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * Draggable Label Component
 */
function DraggableLabel({ id, children, isUsed, disabled }) {
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
            style={{
                ...style,
                backgroundColor: isDragging ? undefined : isUsed ? undefined : 'var(--input-bg)',
                borderColor: isDragging || isUsed ? undefined : 'var(--border-color)',
                color: isUsed ? undefined : 'var(--text-color)'
            }}
            {...attributes}
            {...listeners}
            className={`
                px-3 py-2 rounded-lg border-2 text-sm font-medium
                transition-all duration-200 select-none whitespace-nowrap
                ${isDragging
                    ? 'border-blue-500 bg-blue-100 shadow-lg scale-105 z-50'
                    : isUsed
                        ? 'border-gray-200 bg-gray-100 text-gray-400 line-through'
                        : 'hover:border-blue-400 hover:shadow-md'
                }
            `}
        >
            {children}
        </div>
    );
}

/**
 * Droppable Zone Component (overlaid on map)
 */
function DroppableZone({ id, x, y, questionId, droppedLabel, onRemove, disabled }) {
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
                absolute transform -translate-x-1/2 -translate-y-1/2
                min-w-[80px] min-h-[36px] px-2 py-1
                rounded-lg border-2 transition-all duration-200
                flex items-center justify-center
                ${isOver && active
                    ? 'border-blue-500 bg-blue-100 shadow-lg scale-110'
                    : droppedLabel
                        ? 'border-green-500 bg-green-100'
                        : 'border-dashed border-gray-400 bg-white/80'
                }
            `}
            style={{
                left: `${x}%`,
                top: `${y}%`,
            }}
        >
            {/* Question Number Badge */}
            <span className="absolute -top-3 -left-3 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow">
                {questionId}
            </span>

            {droppedLabel ? (
                <div
                    className={`text-sm font-medium text-green-800 flex items-center gap-1 ${!disabled ? 'cursor-pointer hover:text-red-600' : ''}`}
                    onClick={!disabled ? onRemove : undefined}
                    title="Click to remove"
                >
                    <span>{droppedLabel}</span>
                    {!disabled && (
                        <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                </div>
            ) : (
                <span className={`text-xs ${isOver ? 'text-blue-600' : 'text-gray-400'}`}>
                    Drop here
                </span>
            )}
        </div>
    );
}

/**
 * Map Labeling Question Component
 * Displays a map/diagram image with draggable labels that snap to drop zones
 * 
 * @param {Object} props
 * @param {Object} props.questionData - Question data with imageUrl, dropZones, labels
 * @param {number} props.startNumber - Starting question number
 * @param {Object} props.answers - Current answers from ExamContext
 * @param {Function} props.onAnswerChange - Callback to update answers
 * @param {boolean} props.disabled - Whether inputs are disabled
 */
export default function MapLabelingQuestion({
    questionData,
    startNumber = 1,
    answers = {},
    onAnswerChange,
    disabled = false,
}) {
    const [activeId, setActiveId] = useState(null);

    const { imageUrl, dropZones, labels } = questionData;

    // Configure sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 200, tolerance: 5 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Track which labels are used
    const usedLabels = useMemo(() => {
        const used = new Set();
        dropZones.forEach(zone => {
            const questionId = zone.questionId;
            if (answers[questionId]) {
                used.add(answers[questionId]);
            }
        });
        return used;
    }, [answers, dropZones]);

    // Generate IDs for sortable context
    const labelIds = labels.map((_, i) => `label-${i}`);
    const zoneIds = dropZones.map(zone => `zone-${zone.id}`);
    const allIds = [...labelIds, ...zoneIds];

    const handleDragStart = useCallback((event) => {
        setActiveId(event.active.id);
    }, []);

    const handleDragEnd = useCallback((event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        // Check if dropped on a zone
        if (over.id.toString().startsWith('zone-')) {
            const zoneId = over.id.toString().replace('zone-', '');
            const zone = dropZones.find(z => z.id === zoneId);

            if (!zone) return;

            const labelIndex = parseInt(active.id.toString().replace('label-', ''), 10);
            const droppedLabel = labels[labelIndex];
            const questionId = zone.questionId;

            // Only set if label isn't already used elsewhere
            if (!usedLabels.has(droppedLabel) || answers[questionId] === droppedLabel) {
                onAnswerChange(questionId, droppedLabel);
            }
        }
    }, [dropZones, labels, answers, usedLabels, onAnswerChange]);

    const handleRemoveAnswer = useCallback((questionId) => {
        onAnswerChange(questionId, null);
    }, [onAnswerChange]);

    // Get currently dragged label text
    const activeLabel = activeId?.toString().startsWith('label-')
        ? labels[parseInt(activeId.toString().replace('label-', ''), 10)]
        : null;

    return (
        <div className="space-y-6">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={allIds}>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Map/Diagram Image */}
                        <div className="lg:col-span-3">
                            <div
                                className="relative rounded-xl overflow-hidden border-2 shadow-lg"
                                style={{
                                    borderColor: 'var(--border-color)',
                                    backgroundColor: 'var(--card-bg)',
                                    minHeight: '400px'
                                }}
                            >
                                {imageUrl ? (
                                    <Image
                                        src={imageUrl}
                                        alt="Map or Diagram"
                                        width={0}
                                        height={0}
                                        sizes="100vw"
                                        className="w-full h-auto"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                        <div className="text-center text-gray-500">
                                            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                            </svg>
                                            <p>Map/Diagram Placeholder</p>
                                        </div>
                                    </div>
                                )}

                                {/* Drop Zones overlaid on map */}
                                {dropZones.map(zone => (
                                    <DroppableZone
                                        key={zone.id}
                                        id={`zone-${zone.id}`}
                                        x={zone.x}
                                        y={zone.y}
                                        questionId={zone.questionId}
                                        droppedLabel={answers[zone.questionId]}
                                        onRemove={() => handleRemoveAnswer(zone.questionId)}
                                        disabled={disabled}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Labels Pool */}
                        <div className="lg:col-span-1">
                            <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-color)' }}>
                                Labels
                            </h3>
                            <div
                                className="space-y-2 p-4 rounded-xl min-h-[200px]"
                                style={{ backgroundColor: 'var(--panel-bg)' }}
                            >
                                {labels.map((label, index) => (
                                    <DraggableLabel
                                        key={`label-${index}`}
                                        id={`label-${index}`}
                                        isUsed={usedLabels.has(label)}
                                        disabled={disabled}
                                    >
                                        {label}
                                    </DraggableLabel>
                                ))}
                            </div>
                            <p className="text-xs mt-2 italic" style={{ color: 'var(--text-color)', opacity: 0.6 }}>
                                Drag labels to the numbered locations on the map
                            </p>
                        </div>
                    </div>
                </SortableContext>

                {/* Drag Overlay */}
                <DragOverlay>
                    {activeLabel ? (
                        <div className="px-3 py-2 rounded-lg border-2 border-blue-500 bg-blue-100 text-blue-800 font-medium text-sm shadow-xl">
                            {activeLabel}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
