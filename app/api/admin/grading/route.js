import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import TestSession from '@/models/TestSession';
import User from '@/models/User';
import MockTest from '@/models/MockTest';

export async function GET() {
    try {
        await dbConnect();

        // Find completed sessions where writing or speaking score is missing
        // This query assumes that if it's completed, it SHOULD have scores.
        // We might want to refine this if some tests don't have writing/speaking.
        // But for now, we look for any completed session awaiting manual grading.
        const sessions = await TestSession.find({
            status: 'completed',
            $or: [
                { 'scores.writing': null },
                { 'scores.speaking': null }
            ]
        })
            .populate('user', 'name email')
            .populate('mockTest', 'title type')
            .sort({ completedAt: -1 });

        return NextResponse.json(sessions);
    } catch (error) {
        console.error('Error fetching grading sessions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch grading sessions' },
            { status: 500 }
        );
    }
}
