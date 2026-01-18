import { auth } from '@/auth';
import connectDB from '@/lib/db';
import TestSession from '@/models/TestSession';
import MockTest from '@/models/MockTest';
import { calculateScore, roundToIELTSBand } from '@/lib/grading';
import { notFound, redirect } from 'next/navigation';
import ResultView from './ResultView';

export default async function Page({ params }) {
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/auth/signin');
    }

    const { sessionId } = await params;

    await connectDB();

    const testSession = await TestSession.findById(sessionId);
    if (!testSession) {
        notFound();
    }

    if (testSession.user.toString() !== session.user.id) {
        // Not authorized to view this session
        return (
            <div className="p-8 text-center text-red-600">
                You are not authorized to view this result.
            </div>
        );
    }

    // If session is still in progress, we should probably redirect to the exam or show a message
    // But for now, let's assume if they hit this page, they want to see what they have so far
    // OR we could force a calculation if it's "abandoned" etc. 
    // The user requirement says "Finish" triggers scoring usually.
    // We'll calculate score on the fly for display purposes independent of stored status
    // ensuring we always show the latest state.

    const mockTest = await MockTest.findById(testSession.mockTest);
    if (!mockTest) {
        return <div className="p-8">Mock Test data not found.</div>;
    }

    // Calculate detailed breakdown
    const results = calculateScore(testSession, mockTest);

    // Use stored scores if available and status is completed, otherwise use calculated fallback
    const scores = testSession.status === 'completed' && testSession.scores && testSession.scores.overall !== undefined
        ? testSession.scores
        : {
            reading: results.reading.band,
            listening: results.listening.band,
            // Partial overall with official IELTS rounding
            overall: roundToIELTSBand((results.reading.band + results.listening.band) / 2),
            writing: null,
            speaking: null
        };

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            <ResultView
                results={results}
                scores={scores}
                mockTestTitle={mockTest.title}
                feedback={testSession.feedback}
            />
        </div>
    );
}
