import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TestSession from '@/models/TestSession';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import MockTest from '@/models/MockTest';
import Package from '@/models/Package';
import SpeakingSlot from '@/models/SpeakingSlot';
import { auth } from '@/auth';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Verify admin role
        const currentUser = await User.findById(session.user.id).lean();
        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Ensure models are registered
        // eslint-disable-next-line no-unused-vars
        const models = { User, MockTest, Package };

        // ===== TEST ANALYTICS =====
        const [
            completedTests,
            inProgressTests,
            abandonedTests,
            testsByMock,
            testsByType
        ] = await Promise.all([
            TestSession.countDocuments({ status: 'completed' }),
            TestSession.countDocuments({ status: 'in_progress' }),
            TestSession.countDocuments({ status: 'abandoned' }),
            TestSession.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: '$mockTest', count: { $sum: 1 } } },
                { $lookup: { from: 'mocktests', localField: '_id', foreignField: '_id', as: 'mock' } },
                { $unwind: { path: '$mock', preserveNullAndEmptyArrays: true } },
                { $project: { title: '$mock.title', type: '$mock.type', count: 1 } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            TestSession.aggregate([
                { $match: { status: 'completed' } },
                { $lookup: { from: 'mocktests', localField: 'mockTest', foreignField: '_id', as: 'mock' } },
                { $unwind: { path: '$mock', preserveNullAndEmptyArrays: true } },
                { $group: { _id: '$mock.type', count: { $sum: 1 } } }
            ])
        ]);

        const totalTests = completedTests + inProgressTests + abandonedTests;
        const completionRate = totalTests > 0 ? Math.round((completedTests / (completedTests + abandonedTests || 1)) * 100) : 0;

        // ===== SCORE ANALYTICS =====
        const scoreStats = await TestSession.aggregate([
            { $match: { status: 'completed', 'scores.overall': { $exists: true, $ne: null } } },
            {
                $group: {
                    _id: null,
                    avgOverall: { $avg: '$scores.overall' },
                    avgReading: { $avg: '$scores.reading' },
                    avgListening: { $avg: '$scores.listening' },
                    avgWriting: { $avg: '$scores.writing' },
                    avgSpeaking: { $avg: '$scores.speaking' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Score distribution (band scores 0-9)
        const scoreDistribution = await TestSession.aggregate([
            { $match: { status: 'completed', 'scores.overall': { $exists: true, $ne: null } } },
            {
                $bucket: {
                    groupBy: '$scores.overall',
                    boundaries: [0, 4, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 10],
                    default: 'other',
                    output: { count: { $sum: 1 } }
                }
            }
        ]);

        // Pending grading count
        const pendingGrading = await TestSession.countDocuments({
            status: 'completed',
            $or: [
                { 'scores.writing': null },
                { 'scores.speaking': null }
            ]
        });

        // ===== PAYMENT ANALYTICS =====
        const [
            pendingTransactions,
            approvedTransactions,
            rejectedTransactions,
            transactionsByPackage,
            recentTransactions
        ] = await Promise.all([
            Transaction.countDocuments({ status: 'pending' }),
            Transaction.countDocuments({ status: 'approved' }),
            Transaction.countDocuments({ status: 'rejected' }),
            Transaction.aggregate([
                { $group: { _id: '$package', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
                { $lookup: { from: 'packages', localField: '_id', foreignField: '_id', as: 'pkg' } },
                { $unwind: { path: '$pkg', preserveNullAndEmptyArrays: true } },
                { $project: { title: '$pkg.title', count: 1, totalAmount: 1 } },
                { $sort: { count: -1 } }
            ]),
            Transaction.find()
                .populate('user', 'name email')
                .populate('package', 'title')
                .sort({ createdAt: -1 })
                .limit(10)
                .lean()
        ]);

        const totalTransactions = pendingTransactions + approvedTransactions + rejectedTransactions;
        const approvalRate = totalTransactions > 0 ? Math.round((approvedTransactions / totalTransactions) * 100) : 0;

        // ===== SPEAKING ANALYTICS =====
        const now = new Date();
        const [
            totalSlots,
            bookedSlots,
            upcomingSlots
        ] = await Promise.all([
            SpeakingSlot.countDocuments(),
            SpeakingSlot.countDocuments({ bookedBy: { $ne: null } }),
            SpeakingSlot.countDocuments({ date: { $gt: now } })
        ]);

        const bookingRate = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

        // ===== MOCK TEST ANALYTICS =====
        const [
            activeMocks,
            inactiveMocks,
            mocksByType
        ] = await Promise.all([
            MockTest.countDocuments({ isActive: true }),
            MockTest.countDocuments({ isActive: false }),
            MockTest.aggregate([
                { $group: { _id: '$type', count: { $sum: 1 } } }
            ])
        ]);

        // Format response
        const analytics = {
            tests: {
                completed: completedTests,
                inProgress: inProgressTests,
                abandoned: abandonedTests,
                total: totalTests,
                completionRate,
                byMock: testsByMock.map(t => ({
                    id: t._id?.toString(),
                    title: t.title || 'Unknown',
                    type: t.type,
                    count: t.count
                })),
                byType: testsByType.map(t => ({ type: t._id || 'Unknown', count: t.count }))
            },
            scores: {
                averages: scoreStats[0] ? {
                    overall: Number((scoreStats[0].avgOverall || 0).toFixed(1)),
                    reading: Number((scoreStats[0].avgReading || 0).toFixed(1)),
                    listening: Number((scoreStats[0].avgListening || 0).toFixed(1)),
                    writing: Number((scoreStats[0].avgWriting || 0).toFixed(1)),
                    speaking: Number((scoreStats[0].avgSpeaking || 0).toFixed(1))
                } : { overall: 0, reading: 0, listening: 0, writing: 0, speaking: 0 },
                distribution: scoreDistribution.map(d => ({ band: d._id, count: d.count })),
                gradedCount: scoreStats[0]?.count || 0,
                pendingGrading
            },
            payments: {
                pending: pendingTransactions,
                approved: approvedTransactions,
                rejected: rejectedTransactions,
                total: totalTransactions,
                approvalRate,
                byPackage: transactionsByPackage.map(t => ({
                    id: t._id?.toString(),
                    title: t.title || 'Unknown',
                    count: t.count,
                    totalAmount: t.totalAmount
                })),
                recent: recentTransactions.map(tx => ({
                    _id: tx._id.toString(),
                    user: tx.user ? { name: tx.user.name, email: tx.user.email } : null,
                    package: tx.package?.title || 'Unknown',
                    amount: tx.amount,
                    status: tx.status,
                    createdAt: tx.createdAt.toISOString()
                }))
            },
            speaking: {
                totalSlots,
                bookedSlots,
                availableSlots: totalSlots - bookedSlots,
                upcomingSlots,
                bookingRate
            },
            mocks: {
                active: activeMocks,
                inactive: inactiveMocks,
                total: activeMocks + inactiveMocks,
                byType: mocksByType.map(m => ({ type: m._id || 'Unknown', count: m.count }))
            }
        };

        return NextResponse.json(analytics);
    } catch (error) {
        console.error('Analytics API error:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
