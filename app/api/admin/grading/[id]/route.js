import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import TestSession from '@/models/TestSession';
import User from '@/models/User';
import MockTest from '@/models/MockTest';

function calculateOverallBand(scores) {
    const { reading, listening, writing, speaking } = scores;
    if (reading == null || listening == null || writing == null || speaking == null) {
        return null;
    }

    const average = (reading + listening + writing + speaking) / 4;

    // IELTS Rounding:
    // .25 -> .5
    // .75 -> next whole number
    // Basically, we want to floor to nearest 0.5, then add 0.5 if remainder >= 0.25 ?
    // Examples:
    // 6.25 -> 6.5
    // 6.125 -> 6.0
    // 6.75 -> 7.0
    // 6.625 -> 6.5

    // Logic: 
    // fractional part: 
    // < 0.25 -> 0
    // >= 0.25 && < 0.75 -> 0.5
    // >= 0.75 -> 1.0

    const whole = Math.floor(average);
    const fraction = average - whole;

    let roundedFraction = 0;
    if (fraction < 0.25) {
        roundedFraction = 0;
    } else if (fraction < 0.75) {
        roundedFraction = 0.5;
    } else {
        roundedFraction = 1.0;
    }

    return whole + roundedFraction;
}

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

        // Recalculate overall
        const newOverall = calculateOverallBand(session.scores);
        if (newOverall !== null) {
            session.scores.overall = newOverall;
        }

        await session.save();

        return NextResponse.json(session);

    } catch (error) {
        console.error('Error updating session grading:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
