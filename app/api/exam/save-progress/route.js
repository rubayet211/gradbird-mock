import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import TestSession from '@/models/TestSession';
import MockTest from '@/models/MockTest';
import {
    extractQuestionSchema,
    validateAnswers,
    validateWritingResponses
} from '@/lib/answerValidation';

/**
 * POST /api/exam/save-progress
 * Save student exam progress (answers and writing responses) to the database
 */
export async function POST(request) {
    try {
        const session = await auth();

        // Check authentication
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId, answers, writingResponses, timeRemaining } = body;

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
        }

        await connectDB();

        // Fetch Test Session
        const testSession = await TestSession.findById(sessionId);
        if (!testSession) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        // Verify user owns this session
        if (testSession.user.toString() !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Check if session is still active
        if (testSession.status === 'completed') {
            return NextResponse.json({ error: 'Exam already completed' }, { status: 400 });
        }

        // Fetch MockTest for schema validation
        const mockTest = await MockTest.findById(testSession.mockTest);

        // Validate answers if present (non-blocking - logs warnings but still saves)
        if (answers && mockTest) {
            // Validate reading answers
            if (answers.reading && mockTest.reading?.sections) {
                const readingSchema = extractQuestionSchema(mockTest, 'reading');
                const readingValidation = validateAnswers(answers.reading, readingSchema);
                if (readingValidation.warnings.length > 0) {
                    console.warn('[Answer Validation] Reading warnings:', readingValidation.warnings);
                }
                if (readingValidation.errors.length > 0) {
                    console.error('[Answer Validation] Reading errors:', readingValidation.errors);
                }
            }

            // Validate listening answers
            if (answers.listening && mockTest.listening?.parts) {
                const listeningSchema = extractQuestionSchema(mockTest, 'listening');
                const listeningValidation = validateAnswers(answers.listening, listeningSchema);
                if (listeningValidation.warnings.length > 0) {
                    console.warn('[Answer Validation] Listening warnings:', listeningValidation.warnings);
                }
                if (listeningValidation.errors.length > 0) {
                    console.error('[Answer Validation] Listening errors:', listeningValidation.errors);
                }
            }
        }

        // Validate writing responses if present (blocking - returns error on invalid format)
        if (writingResponses) {
            const writingValidation = validateWritingResponses(writingResponses);
            if (!writingValidation.valid) {
                console.error('[Answer Validation] Writing errors:', writingValidation.errors);
                return NextResponse.json({
                    error: 'Invalid writing response format',
                    details: writingValidation.errors
                }, { status: 400 });
            }
            if (writingValidation.warnings.length > 0) {
                console.warn('[Answer Validation] Writing warnings:', writingValidation.warnings);
            }
        }

        // Update session with progress
        if (answers) {
            testSession.answers = {
                ...testSession.answers,
                reading: { ...(testSession.answers?.reading || {}), ...(answers.reading || {}) },
                listening: { ...(testSession.answers?.listening || {}), ...(answers.listening || {}) },
            };
        }

        if (writingResponses) {
            testSession.answers = {
                ...testSession.answers,
                writing: writingResponses,
            };
        }

        if (typeof timeRemaining === 'number') {
            testSession.timeRemaining = timeRemaining;
        }

        testSession.lastSavedAt = new Date();
        await testSession.save();

        return NextResponse.json({
            success: true,
            message: 'Progress saved',
            savedAt: testSession.lastSavedAt
        });

    } catch (error) {
        console.error('Error saving exam progress:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
