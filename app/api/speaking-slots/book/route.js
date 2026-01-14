import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SpeakingSlot from '@/models/SpeakingSlot';
import User from '@/models/User';
import { auth } from '@/auth';

// PATCH - Student books a slot
export async function PATCH(req) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { slotId } = await req.json();

        if (!slotId) {
            return NextResponse.json({ error: 'Missing slot ID' }, { status: 400 });
        }

        await connectDB();

        // Get user and check mocksAvailable
        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.mocksAvailable < 1) {
            return NextResponse.json({
                error: 'No mock tests available. Please purchase a package first.'
            }, { status: 400 });
        }

        // Count user's existing bookings
        const existingBookings = await SpeakingSlot.countDocuments({ bookedBy: user._id });

        // Prevent booking if user has already used all their mocks
        // User can book as many slots as they have mocksAvailable
        if (existingBookings >= user.mocksAvailable) {
            return NextResponse.json({
                error: 'You have already booked the maximum number of slots allowed by your purchased tests.'
            }, { status: 400 });
        }

        // Find and update the slot
        const slot = await SpeakingSlot.findById(slotId);
        if (!slot) {
            return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
        }

        if (slot.bookedBy) {
            return NextResponse.json({ error: 'This slot is already booked' }, { status: 400 });
        }

        // Book the slot
        slot.bookedBy = user._id;
        await slot.save();

        return NextResponse.json({
            message: 'Slot booked successfully',
            slot: {
                _id: slot._id.toString(),
                date: slot.date.toISOString(),
                time: slot.time,
                meetingLink: slot.meetingLink,
            }
        });

    } catch (error) {
        console.error('Book Slot Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
