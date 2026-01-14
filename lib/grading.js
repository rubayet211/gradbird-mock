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

export function calculateScore(sessionData, mockTestData) {
    const results = {
        reading: { score: 0, total: 0, answers: [] },
        listening: { score: 0, total: 0, answers: [] },
    };

    // Calculate Reading Score
    if (mockTestData.readingContent && mockTestData.readingContent.answers) {
        const correctAnswers = mockTestData.readingContent.answers; // Map { "1": "TRUE", "2": "A" }
        const userAnswers = sessionData.answers.reading || {};

        let correctCount = 0;
        let totalCount = 0;

        // Iterate through correct answers keys to grade
        Object.keys(correctAnswers).forEach(qId => {
            totalCount++;
            const correct = correctAnswers[qId];
            const userAns = userAnswers[qId];
            const isCorrect = userAns === correct;

            if (isCorrect) correctCount++;

            results.reading.answers.push({
                questionId: qId,
                userAnswer: userAns,
                correctAnswer: correct,
                isCorrect
            });
        });

        results.reading.score = correctCount;
        results.reading.total = totalCount;
        results.reading.band = calculateBandScore(correctCount);
    }

    // Calculate Listening Score
    if (mockTestData.listeningContent && mockTestData.listeningContent.answers) {
        const correctAnswers = mockTestData.listeningContent.answers; // Map
        const userAnswers = sessionData.answers.listening || {};

        let correctCount = 0;
        let totalCount = 0;

        Object.keys(correctAnswers).forEach(qId => {
            totalCount++;
            const correct = correctAnswers[qId];
            const userAns = userAnswers[qId];
            // Simple string comparison, maybe need normalization (lowercase, trim)
            // For MVP exact match or specific tolerance
            const isCorrect = userAns && userAns.toString().trim().toLowerCase() === correct.toString().trim().toLowerCase();

            if (isCorrect) correctCount++;

            results.listening.answers.push({
                questionId: qId,
                userAnswer: userAns,
                correctAnswer: correct,
                isCorrect
            });
        });

        results.listening.score = correctCount;
        results.listening.total = totalCount;
        results.listening.band = calculateBandScore(correctCount);
    }

    return results;
}
