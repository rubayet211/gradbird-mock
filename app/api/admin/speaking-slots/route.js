import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SpeakingSlot from '@/models/SpeakingSlot';
import User from '@/models/User';
import { auth } from '@/auth';

// POST - Admin creates a new speaking slot
export async function POST(req) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Verify admin role
        const currentUser = await User.findById(session.user.id);
        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
        }

        const { date, time, meetingLink } = await req.json();

        if (!date || !time || !meetingLink) {
            return NextResponse.json({ error: 'Missing required fields: date, time, meetingLink' }, { status: 400 });
        }

        const slot = await SpeakingSlot.create({
            date: new Date(date),
            time,
            meetingLink,
            bookedBy: null,
        });

        return NextResponse.json({
            message: 'Speaking slot created successfully',
            slot
        }, { status: 201 });

    } catch (error) {
        console.error('Create Speaking Slot Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// GET - Admin fetches all slots
export async function GET(req) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Verify admin role
        const currentUser = await User.findById(session.user.id);
        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
        }

        // Ensure User model is registered for populate
        // eslint-disable-next-line no-unused-vars
        const u = User;

        const slots = await SpeakingSlot.find()
            .populate('bookedBy', 'name email')
            .sort({ date: 1, time: 1 })
            .lean();

        const serializedSlots = slots.map(slot => ({
            ...slot,
            _id: slot._id.toString(),
            date: slot.date.toISOString(),
            bookedBy: slot.bookedBy ? { ...slot.bookedBy, _id: slot.bookedBy._id.toString() } : null,
            createdAt: slot.createdAt.toISOString(),
        }));

        return NextResponse.json({ slots: serializedSlots });

    } catch (error) {
        console.error('Get Speaking Slots Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
