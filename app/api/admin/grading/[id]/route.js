import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import TestSession from '@/models/TestSession';
import User from '@/models/User';
import MockTest from '@/models/MockTest';
import { roundToIELTSBand } from '@/lib/grading';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = params;

        const session = await TestSession.findById(id)
            .populate('user', 'name email')
            .populate('mockTest');

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        return NextResponse.json(session);
    } catch (error) {
        console.error('Error fetching session details:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const { id } = params;
        const body = await req.json();
        const { writingScore, speakingScore, feedback } = body;

        const session = await TestSession.findById(id);

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        // Update scores
        if (writingScore !== undefined) session.scores.writing = parseFloat(writingScore);
        if (speakingScore !== undefined) session.scores.speaking = parseFloat(speakingScore);

        // Update feedback
        if (feedback !== undefined) session.feedback = feedback;

        // Recalculate overall using centralized IELTS rounding
        const { reading, listening, writing, speaking } = session.scores;
        if (reading != null && listening != null && writing != null && speaking != null) {
            session.scores.overall = roundToIELTSBand((reading + listening + writing + speaking) / 4);
        }

        await session.save();

        return NextResponse.json(session);

    } catch (error) {
        console.error('Error updating session grading:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
