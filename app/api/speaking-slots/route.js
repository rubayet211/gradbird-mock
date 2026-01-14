import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SpeakingSlot from '@/models/SpeakingSlot';

// GET - Fetch available slots (where bookedBy is null)
export async function GET() {
    try {
        await connectDB();

        const slots = await SpeakingSlot.find({ bookedBy: null })
            .sort({ date: 1, time: 1 })
            .lean();

        const serializedSlots = slots.map(slot => ({
            ...slot,
            _id: slot._id.toString(),
            date: slot.date.toISOString(),
            createdAt: slot.createdAt.toISOString(),
        }));

        return NextResponse.json({ slots: serializedSlots });

    } catch (error) {
        console.error('Get Available Slots Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
