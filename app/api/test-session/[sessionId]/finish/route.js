import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import TestSession from '@/models/TestSession';
import MockTest from '@/models/MockTest';
import { calculateScore, roundToIELTSBand } from '@/lib/grading';

export async function POST(request, { params }) {
    try {
        const session = await auth();
        // Check authentication
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { sessionId } = params;

        await connectDB();

        // 1. Fetch Session
        const testSession = await TestSession.findById(sessionId);
        if (!testSession) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        // Verify User owns this session
        if (testSession.user.toString() !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 2. Fetch Mock Test Data (for correct answers)
        const mockTest = await MockTest.findById(testSession.mockTest);
        if (!mockTest) {
            return NextResponse.json({ error: 'Mock Test data missing' }, { status: 404 });
        }

        // 3. Calculate Scores
        const results = calculateScore(testSession, mockTest);

        // 4. Update Session
        testSession.status = 'completed';
        testSession.completedAt = new Date();
        testSession.scores = {
            reading: results.reading.band,
            listening: results.listening.band,
            // Partial overall (2-component) with official IELTS rounding
            overall: roundToIELTSBand((results.reading.band + results.listening.band) / 2),
            writing: null, // Pending grading
            speaking: null // Pending grading
        };
        // We might also want to store the detailed answer breakdown if needed, 
        // but typically we just re-calculate it on view or store it.
        // For now, let's just save the high-level scores. The breakdown can be re-computed 
        // using the same logic on the Results page or strictly computed here and stored.
        // Let's rely on re-computing or storing a "results" object if the schema supported it.
        // The Schema has 'scores' object.

        await testSession.save();

        return NextResponse.json({
            success: true,
            scores: testSession.scores,
            redirectUrl: `/dashboard/results/${sessionId}`
        });

    } catch (error) {
        console.error('Error finishing test:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
