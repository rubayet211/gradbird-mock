/**
 * Answer Validation Service
 * Validates exam answers against the MockTest question schema
 */

/**
 * Valid answer types for each question type
 */
const QUESTION_TYPE_VALIDATORS = {
    // Single string answer types
    MCQ: (answer) => typeof answer === 'string' && answer.trim().length > 0,
    TrueFalse: (answer) => ['TRUE', 'FALSE', 'NOT GIVEN'].includes(answer),
    GapFill: (answer) => typeof answer === 'string',
    ShortAnswer: (answer) => typeof answer === 'string',
    Matching: (answer) => typeof answer === 'string' && answer.trim().length > 0,

    // Array answer types
    MultipleAnswer: (answer) => Array.isArray(answer) && answer.every(a => typeof a === 'string'),

    // String or number for labeling
    MapLabeling: (answer) => typeof answer === 'string' || typeof answer === 'number',
    DiagramLabeling: (answer) => typeof answer === 'string' || typeof answer === 'number',
};

/**
 * Extract all question IDs and their types from a MockTest
 * @param {Object} mockTest - The MockTest document
 * @param {string} module - 'reading' or 'listening'
 * @returns {Map<string|number, string>} Map of question ID to question type
 */
export function extractQuestionSchema(mockTest, module) {
    const questionMap = new Map();

    if (!mockTest) return questionMap;

    if (module === 'reading' && mockTest.reading?.sections) {
        mockTest.reading.sections.forEach(section => {
            extractQuestionsFromBlocks(section.questions || [], questionMap);
        });
    }

    if (module === 'listening' && mockTest.listening?.parts) {
        mockTest.listening.parts.forEach(part => {
            extractQuestionsFromBlocks(part.questions || [], questionMap);
        });
    }

    return questionMap;
}

/**
 * Extract questions from question blocks (new format with type/data structure)
 * @param {Array} blocks - Array of question blocks
 * @param {Map} questionMap - Map to populate with question ID -> type
 */
function extractQuestionsFromBlocks(blocks, questionMap) {
    blocks.forEach(block => {
        if (!block) return;

        const blockType = block.type;

        // Handle blocks with items array (TrueFalse, MCQ, etc.)
        if (Array.isArray(block.items)) {
            block.items.forEach(item => {
                if (item?.id !== undefined) {
                    questionMap.set(item.id, blockType);
                }
            });
            return;
        }

        // Handle Matching type
        if (blockType === 'Matching' && Array.isArray(block.data?.items)) {
            const startNumber = Number(block.startId ?? block.startNumber);
            if (Number.isFinite(startNumber)) {
                block.data.items.forEach((_, index) => {
                    questionMap.set(startNumber + index, 'Matching');
                });
            }
            return;
        }

        // Handle MapLabeling/DiagramLabeling
        if ((blockType === 'MapLabeling' || blockType === 'DiagramLabeling') && Array.isArray(block.data?.dropZones)) {
            block.data.dropZones.forEach(zone => {
                if (zone?.questionId !== undefined) {
                    questionMap.set(zone.questionId, blockType);
                }
            });
            return;
        }

        // Handle blocks with data.questions
        if (Array.isArray(block.data?.questions)) {
            block.data.questions.forEach(question => {
                if (question?.id !== undefined) {
                    questionMap.set(question.id, blockType);
                }
            });
            return;
        }

        // Handle MultipleAnswer
        if (blockType === 'MultipleAnswer' && block.data?.id !== undefined) {
            questionMap.set(block.data.id, 'MultipleAnswer');
            return;
        }

        // Handle legacy format with id at block level
        if (block.id !== undefined) {
            questionMap.set(block.id, block.type || 'Unknown');
        }
    });
}

/**
 * Validate answers against the question schema
 * @param {Object} answers - The answers object { questionId: answer }
 * @param {Map} questionSchema - Map of question ID to question type
 * @returns {Object} { valid: boolean, errors: Array, warnings: Array, validatedAnswers: Object }
 */
export function validateAnswers(answers, questionSchema) {
    const result = {
        valid: true,
        errors: [],
        warnings: [],
        validatedAnswers: {}
    };

    if (!answers || typeof answers !== 'object') {
        result.errors.push('Answers must be an object');
        result.valid = false;
        return result;
    }

    for (const [questionId, answer] of Object.entries(answers)) {
        const numericId = Number(questionId);

        // Try looking up the raw ID (string) first, then try as number
        // This handles cases where IDs are strings in DB but might look numeric
        let lookupId = null;

        if (questionSchema.has(questionId)) {
            lookupId = questionId;
        } else if (Number.isFinite(numericId) && questionSchema.has(numericId)) {
            lookupId = numericId;
        }

        // Check if question exists in schema
        if (lookupId === null) {
            result.warnings.push(`Question ID ${questionId} not found in test schema`);
            // Still include the answer (backward compatibility)
            result.validatedAnswers[questionId] = answer;
            continue;
        }

        const questionType = questionSchema.get(lookupId);
        const validator = QUESTION_TYPE_VALIDATORS[questionType];

        if (!validator) {
            result.warnings.push(`Unknown question type '${questionType}' for question ${questionId}`);
            result.validatedAnswers[questionId] = answer;
            continue;
        }

        if (!validator(answer)) {
            result.warnings.push(
                `Invalid answer format for question ${questionId} (type: ${questionType}): ` +
                `expected ${getExpectedFormat(questionType)}, got ${typeof answer}`
            );
        }

        result.validatedAnswers[questionId] = answer;
    }

    return result;
}

/**
 * Get human-readable expected format for a question type
 * @param {string} questionType - The question type
 * @returns {string} Human-readable format description
 */
function getExpectedFormat(questionType) {
    switch (questionType) {
        case 'MCQ':
        case 'TrueFalse':
        case 'GapFill':
        case 'ShortAnswer':
        case 'Matching':
            return 'string';
        case 'MultipleAnswer':
            return 'array of strings';
        case 'MapLabeling':
        case 'DiagramLabeling':
            return 'string or number';
        default:
            return 'unknown';
    }
}

/**
 * Validate writing responses
 * @param {Object} writingResponses - { task1Text: string, task2Text: string }
 * @returns {Object} { valid: boolean, errors: Array, warnings: Array }
 */
export function validateWritingResponses(writingResponses) {
    const result = { valid: true, errors: [], warnings: [] };

    if (!writingResponses || typeof writingResponses !== 'object') {
        result.errors.push('Writing responses must be an object');
        result.valid = false;
        return result;
    }

    const validKeys = ['task1Text', 'task2Text'];
    for (const key of Object.keys(writingResponses)) {
        if (!validKeys.includes(key)) {
            result.warnings.push(`Unknown writing response key: ${key}`);
        }
    }

    if (writingResponses.task1Text !== undefined && typeof writingResponses.task1Text !== 'string') {
        result.errors.push('task1Text must be a string');
        result.valid = false;
    }

    if (writingResponses.task2Text !== undefined && typeof writingResponses.task2Text !== 'string') {
        result.errors.push('task2Text must be a string');
        result.valid = false;
    }

    return result;
}
