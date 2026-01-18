import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { sessionId, eventType, timestamp } = body;

        console.log(`[SECURITY LOG] Session: ${sessionId} | Event: ${eventType} | Time: ${timestamp}`);

        // TODO: In a real app, save this to the database (e.g. MongoDB)
        // const session = await ExamSession.findById(sessionId);
        // session.securityLogs.push({ eventType, timestamp });
        // await session.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error logging security event:', error);
        return NextResponse.json({ success: false, error: 'Failed to log event' }, { status: 500 });
    }
}
