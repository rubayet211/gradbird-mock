import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SpeakingSlot from '@/models/SpeakingSlot';
import { auth } from '@/auth';

// GET - Fetch current user's booked slots
export async function GET() {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const slots = await SpeakingSlot.find({ bookedBy: session.user.id })
            .sort({ date: 1, time: 1 })
            .lean();

        const serializedSlots = slots.map(slot => ({
            _id: slot._id.toString(),
            date: slot.date.toISOString(),
            time: slot.time,
            meetingLink: slot.meetingLink,
            createdAt: slot.createdAt.toISOString(),
        }));

        return NextResponse.json({ slots: serializedSlots });

    } catch (error) {
        console.error('Get My Bookings Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
