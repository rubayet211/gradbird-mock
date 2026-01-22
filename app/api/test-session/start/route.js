import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import MockTest from '@/models/MockTest';
import TestSession from '@/models/TestSession';
import Package from '@/models/Package';

export async function POST(request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { mockId } = body;

        await connectDB();

        // Fetch user from database to get latest mocksAvailable
        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        let selectedMockTest;
        let consumeCredit = false;

        if (mockId) {
            // 1. User requested a specific mock
            // Check availability in MockTest collection
            selectedMockTest = await MockTest.findById(mockId);
            if (!selectedMockTest || !selectedMockTest.isActive) {
                return NextResponse.json({ error: 'Mock test not found or inactive' }, { status: 404 });
            }

            // Check Access:
            // A. Check if included in any Purchased Package
            const hasPackageAccess = await Package.exists({
                _id: { $in: user.purchasedPackages },
                mocks: mockId
            });

            if (hasPackageAccess) {
                // Access granted via package (Unlimited access usually? Or one-time? 
                // The prompt says "after buying it they would have access to the mocks... they can take anytime."
                // Implies unlimited access or at least reusable access without burning credits.
                consumeCredit = false;
            } else {
                // B. Fallback to mocksAvailable credit
                if (user.mocksAvailable > 0) {
                    consumeCredit = true;
                } else {
                    return NextResponse.json({ error: 'You do not have access to this mock test. Please purchase a package.' }, { status: 403 });
                }
            }

        } else {
            // 2. Legacy Random Selection
            if (user.mocksAvailable <= 0) {
                return NextResponse.json({ error: 'No mocks available. Please purchase a package.' }, { status: 403 });
            }

            // Find a random active mock test
            const activeMockTests = await MockTest.find({ isActive: true });

            if (activeMockTests.length === 0) {
                return NextResponse.json({ error: 'No mock tests available. Please contact support.' }, { status: 404 });
            }

            const randomIndex = Math.floor(Math.random() * activeMockTests.length);
            selectedMockTest = activeMockTests[randomIndex];
            consumeCredit = true;
        }

        // Create new test session
        const testSession = await TestSession.create({
            user: user._id,
            mockTest: selectedMockTest._id,
            status: 'in_progress',
            startedAt: new Date(),
        });

        // Decrement mocksAvailable ONLY if credit was consumed
        if (consumeCredit) {
            await User.findByIdAndUpdate(user._id, { $inc: { mocksAvailable: -1 } });
        }

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
