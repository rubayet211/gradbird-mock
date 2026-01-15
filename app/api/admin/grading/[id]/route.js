import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import TestSession from '@/models/TestSession';
import User from '@/models/User';
import MockTest from '@/models/MockTest';
import { roundToIELTSBand } from '@/lib/grading';
import { auth } from '@/auth';

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
        const authSession = await auth();
        if (!authSession || !authSession.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { id } = params;
        const body = await req.json();
        const {
            writingScore,
            speakingScore,
            feedback,
            // New detailed scoring fields
            writingDetails,
            speakingDetails,
            detailedFeedback
        } = body;

        const session = await TestSession.findById(id);

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        // Update Writing score - support both simple and detailed
        if (writingScore !== undefined) {
            session.scores.writing = parseFloat(writingScore);
        } else if (writingDetails) {
            // Calculate writing score from detailed rubric
            const { taskAchievement, coherenceCohesion, lexicalResource, grammaticalRange } = writingDetails;
            session.writingDetails = writingDetails;

            if (taskAchievement && coherenceCohesion && lexicalResource && grammaticalRange) {
                const avg = (
                    parseFloat(taskAchievement) +
                    parseFloat(coherenceCohesion) +
                    parseFloat(lexicalResource) +
                    parseFloat(grammaticalRange)
                ) / 4;
                session.scores.writing = roundToIELTSBand(avg);
            }
        }

        // Update Speaking score - support both simple and detailed
        if (speakingScore !== undefined) {
            session.scores.speaking = parseFloat(speakingScore);
        } else if (speakingDetails) {
            // Calculate speaking score from detailed rubric
            const { fluencyCoherence, lexicalResource, grammaticalRange, pronunciation } = speakingDetails;
            session.speakingDetails = speakingDetails;

            if (fluencyCoherence && lexicalResource && grammaticalRange && pronunciation) {
                const avg = (
                    parseFloat(fluencyCoherence) +
                    parseFloat(lexicalResource) +
                    parseFloat(grammaticalRange) +
                    parseFloat(pronunciation)
                ) / 4;
                session.scores.speaking = roundToIELTSBand(avg);
            }
        }

        // Update detailed feedback
        if (detailedFeedback) {
            session.detailedFeedback = {
                ...session.detailedFeedback,
                ...detailedFeedback
            };
        }

        // Update general feedback
        if (feedback !== undefined) {
            session.feedback = feedback;
        }

        // Recalculate overall using centralized IELTS rounding
        const { reading, listening, writing, speaking } = session.scores;
        if (reading != null && listening != null && writing != null && speaking != null) {
            session.scores.overall = roundToIELTSBand((reading + listening + writing + speaking) / 4);
        }

        // Track grading metadata
        session.gradedAt = new Date();
        session.gradedBy = authSession.user.id;

        await session.save();

        return NextResponse.json(session);

    } catch (error) {
        console.error('Error updating session grading:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
