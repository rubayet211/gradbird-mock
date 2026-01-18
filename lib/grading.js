export function calculateBandScore(rawScore, type = 'reading') {
    // Standard IELTS Academic Band Score table (approximate)
    // Based on typical conversions for 40 questions

    // If we have fewer than 40 questions, we might want to scale the score
    // But for this helper, we'll assume the rawScore is out of 40 or we handle scaling elsewhere.
    // For this MVP, let's assume we pass the raw score.

    // Simple lookup (Score / 40)
    // This is valid for specific Academic Reading/Listening
    const bands = [
        { min: 39, band: 9.0 },
        { min: 37, band: 8.5 },
        { min: 35, band: 8.0 },
        { min: 32, band: 7.5 },
        { min: 30, band: 7.0 },
        { min: 26, band: 6.5 },
        { min: 23, band: 6.0 },
        { min: 19, band: 5.5 },
        { min: 15, band: 5.0 },
        { min: 13, band: 4.5 },
        { min: 10, band: 4.0 },
        { min: 8, band: 3.5 },
        { min: 6, band: 3.0 },
        { min: 4, band: 2.5 },
    ];

    for (const b of bands) {
        if (rawScore >= b.min) return b.band;
    }
    return 0; // Below minimal threshold
}

/**
 * Round a numeric value to the nearest IELTS half-band.
 * Official IELTS rounding rules:
 * - Fractional part < 0.25 → round down to whole
 * - Fractional part >= 0.25 and < 0.75 → round to half
 * - Fractional part >= 0.75 → round up to next whole
 * @param {number} score - The raw average score
 * @returns {number} Rounded IELTS band score
 */
export function roundToIELTSBand(score) {
    if (score == null || isNaN(score)) return 0;

    const whole = Math.floor(score);
    const fraction = score - whole;

    if (fraction < 0.25) {
        return whole;
    } else if (fraction < 0.75) {
        return whole + 0.5;
    } else {
        return whole + 1;
    }
}

/**
 * Normalize an answer for comparison
 * @param {string|Array} answer - The answer to normalize
 * @returns {string} Normalized answer string
 */
function normalizeAnswer(answer) {
    if (!answer) return '';

    // Handle array answers (e.g., MultipleAnswer)
    if (Array.isArray(answer)) {
        return answer.map(a => a.toString().trim().toLowerCase()).sort().join(',');
    }

    return answer.toString().trim().toLowerCase();
}

/**
 * Compare two answers for correctness
 * @param {string|Array} userAnswer - The user's answer
 * @param {string|Array} correctAnswer - The correct answer
 * @returns {boolean} Whether the answer is correct
 */
function compareAnswers(userAnswer, correctAnswer) {
    const normalizedUser = normalizeAnswer(userAnswer);
    const normalizedCorrect = normalizeAnswer(correctAnswer);
    return normalizedUser === normalizedCorrect;
}

/**
 * Calculate scores for a test session using MockTest schema
 * @param {Object} sessionData - The test session with user answers
 * @param {Object} mockTestData - The MockTest document with correct answers
 * @returns {Object} Results with reading and listening scores
 */
export function calculateScore(sessionData, mockTestData) {
    const results = {
        reading: { score: 0, total: 0, answers: [], band: 0 },
        listening: { score: 0, total: 0, answers: [], band: 0 },
    };

    // Get user answers from session
    const userReadingAnswers = sessionData.answers?.reading || {};
    const userListeningAnswers = sessionData.answers?.listening || {};

    // Calculate Reading Score using MockTest schema: reading.sections[].questions[]
    if (mockTestData.reading?.sections) {
        let correctCount = 0;
        let totalCount = 0;

        mockTestData.reading.sections.forEach(section => {
            if (section.questions) {
                section.questions.forEach(question => {
                    const qId = question.id;
                    const correctAnswer = question.correctAnswer;

                    // Skip if no correct answer defined
                    if (correctAnswer === undefined || correctAnswer === null) return;

                    totalCount++;
                    const userAnswer = userReadingAnswers[qId];
                    const isCorrect = compareAnswers(userAnswer, correctAnswer);

                    if (isCorrect) correctCount++;

                    results.reading.answers.push({
                        questionId: qId,
                        userAnswer: userAnswer ?? null,
                        correctAnswer: correctAnswer,
                        isCorrect
                    });
                });
            }
        });

        results.reading.score = correctCount;
        results.reading.total = totalCount;
        results.reading.band = calculateBandScore(correctCount);
    }

    // Calculate Listening Score using MockTest schema: listening.parts[].questions[]
    if (mockTestData.listening?.parts) {
        let correctCount = 0;
        let totalCount = 0;

        mockTestData.listening.parts.forEach(part => {
            if (part.questions) {
                part.questions.forEach(question => {
                    const qId = question.id;
                    const correctAnswer = question.correctAnswer;

                    // Skip if no correct answer defined
                    if (correctAnswer === undefined || correctAnswer === null) return;

                    totalCount++;
                    const userAnswer = userListeningAnswers[qId];
                    const isCorrect = compareAnswers(userAnswer, correctAnswer);

                    if (isCorrect) correctCount++;

                    results.listening.answers.push({
                        questionId: qId,
                        userAnswer: userAnswer ?? null,
                        correctAnswer: correctAnswer,
                        isCorrect
                    });
                });
            }
        });

        results.listening.score = correctCount;
        results.listening.total = totalCount;
        results.listening.band = calculateBandScore(correctCount);
    }

    return results;
}

