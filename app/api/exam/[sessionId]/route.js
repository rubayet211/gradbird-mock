import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import TestSession from '@/models/TestSession';
import MockTest from '@/models/MockTest';

/**
 * GET /api/exam/[sessionId]
 * Fetch exam data (MockTest content) for a given test session
 */
export async function GET(request, { params }) {
    try {
        const session = await auth();

        // Check authentication
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { sessionId } = await params;

        await connectDB();

        // 1. Fetch Test Session
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

        // 2. Fetch Mock Test Data
        const mockTest = await MockTest.findById(testSession.mockTest);
        if (!mockTest) {
            return NextResponse.json({ error: 'Mock Test data not found' }, { status: 404 });
        }

        // 3. Return exam data (exclude correct answers for security)
        const examData = {
            sessionId: testSession._id,
            testTitle: mockTest.title,
            testType: mockTest.type,
            reading: mockTest.reading ? {
                sections: mockTest.reading.sections.map(section => ({
                    id: section._id?.toString() || section.title?.replace(/\s+/g, '-').toLowerCase(),
                    title: section.title,
                    passageText: section.passageText,
                    questions: section.questions.map(q => ({
                        id: q.id,
                        type: q.type,
                        text: q.text,
                        options: q.options || [],
                        items: q.items,
                        questions: q.questions,
                        imageUrl: q.imageUrl,
                        dropZones: q.dropZones,
                        labels: q.labels,
                        requiredCount: q.requiredCount,
                        // NOTE: correctAnswer is excluded for security
                    }))
                }))
            } : null,
            listening: mockTest.listening ? {
                parts: mockTest.listening.parts?.map(part => ({
                    id: part._id?.toString(),
                    partNumber: part.partNumber,
                    title: part.title,
                    audioUrl: part.audioUrl,
                    transcript: part.transcript,
                    questions: part.questions?.map(q => ({
                        id: q.id,
                        type: q.type,
                        text: q.text,
                        options: q.options || [],
                        wordLimit: q.wordLimit,
                        imageUrl: q.imageUrl,
                        dropZones: q.dropZones,
                        labels: q.labels,
                        items: q.items,
                        questions: q.questions,
                        // NOTE: correctAnswer is excluded for security
                    })) || [],
                })) || [],
            } : null,
            writing: mockTest.writing ? {
                task1: mockTest.writing.task1,
                task2: mockTest.writing.task2,
            } : null,
            speaking: mockTest.speaking ? {
                part1: mockTest.speaking.part1,
                part2: mockTest.speaking.part2,
                part3: mockTest.speaking.part3,
            } : null,
            // Session metadata
            startedAt: testSession.startedAt,
            timeRemaining: testSession.timeRemaining,
            savedAnswers: testSession.answers || {},
        };

        return NextResponse.json({ success: true, examData });

    } catch (error) {
        console.error('Error fetching exam data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
