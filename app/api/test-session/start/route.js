import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import MockTest from '@/models/MockTest';
import TestSession from '@/models/TestSession';

export async function POST(request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Fetch user from database to get latest mocksAvailable
        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.mocksAvailable <= 0) {
            return NextResponse.json({ error: 'No mocks available. Please purchase a package.' }, { status: 403 });
        }

        // Find a random active mock test
        const activeMockTests = await MockTest.find({ isActive: true });

        if (activeMockTests.length === 0) {
            return NextResponse.json({ error: 'No mock tests available. Please contact support.' }, { status: 404 });
        }

        const randomIndex = Math.floor(Math.random() * activeMockTests.length);
        const selectedMockTest = activeMockTests[randomIndex];

        // Create new test session
        const testSession = await TestSession.create({
            user: user._id,
            mockTest: selectedMockTest._id,
            status: 'in_progress',
            startedAt: new Date(),
        });

        // Decrement mocksAvailable
        await User.findByIdAndUpdate(user._id, { $inc: { mocksAvailable: -1 } });

        return NextResponse.json({
            success: true,
            sessionId: testSession._id.toString(),
            mockTestTitle: selectedMockTest.title,
            moduleType: selectedMockTest.moduleType || 'Full',
        });
    } catch (error) {
        console.error('Error starting test session:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
