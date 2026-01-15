import connectDB from '@/lib/db';
import TestSession from '@/models/TestSession';
import User from '@/models/User';
import MockTest from '@/models/MockTest';
import GradingList from './GradingList';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

async function getPendingGradingSessions() {
    await connectDB();
    // Ensure models are registered
    // eslint-disable-next-line no-unused-vars
    const u = User;
    // eslint-disable-next-line no-unused-vars
    const m = MockTest;

    const sessions = await TestSession.find({
        status: 'completed',
        $or: [
            { 'scores.writing': null },
            { 'scores.speaking': null }
        ]
    })
        .populate('user', 'name email')
        .populate('mockTest', 'title type')
        .sort({ completedAt: -1 })
        .lean();

    return sessions.map(s => ({
        ...s,
        _id: s._id.toString(),
        user: s.user ? { ...s.user, _id: s.user._id.toString() } : null,
        mockTest: s.mockTest ? { ...s.mockTest, _id: s.mockTest._id.toString() } : null,
        startedAt: s.startedAt?.toISOString() || null,
        completedAt: s.completedAt?.toISOString() || null,
    }));
}

export default async function AdminGradingPage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect('/api/auth/signin');
    }

    await connectDB();
    const currentUser = await User.findById(session.user.id).lean();
    if (!currentUser || currentUser.role !== 'admin') {
        redirect('/');
    }

    const pendingSessions = await getPendingGradingSessions();

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Pending Grading</h1>
                <p className="text-gray-500 mt-1">Grade writing and speaking modules for completed tests</p>
            </div>
            <GradingList sessions={pendingSessions} />
        </div>
    );
}
