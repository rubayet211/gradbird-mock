import connectDB from '@/lib/db';
import SpeakingSlot from '@/models/SpeakingSlot';
import User from '@/models/User';
import SpeakingBookingPanel from './SpeakingBookingPanel';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

async function getAvailableSlots() {
    await connectDB();

    const slots = await SpeakingSlot.find({ bookedBy: null })
        .sort({ date: 1, time: 1 })
        .lean();

    return slots.map(slot => ({
        _id: slot._id.toString(),
        date: slot.date.toISOString(),
        time: slot.time,
        createdAt: slot.createdAt.toISOString(),
    }));
}

async function getMyBookings(userId) {
    await connectDB();

    const slots = await SpeakingSlot.find({ bookedBy: userId })
        .sort({ date: 1, time: 1 })
        .lean();

    return slots.map(slot => ({
        _id: slot._id.toString(),
        date: slot.date.toISOString(),
        time: slot.time,
        meetingLink: slot.meetingLink,
        createdAt: slot.createdAt.toISOString(),
    }));
}

async function getUserMocksInfo(userId) {
    await connectDB();
    const user = await User.findById(userId).lean();
    const bookedCount = await SpeakingSlot.countDocuments({ bookedBy: userId });
    return {
        mocksAvailable: user?.mocksAvailable || 0,
        bookedCount,
    };
}

export default async function DashboardSpeakingPage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect('/api/auth/signin');
    }

    const [availableSlots, myBookings, mocksInfo] = await Promise.all([
        getAvailableSlots(),
        getMyBookings(session.user.id),
        getUserMocksInfo(session.user.id),
    ]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Speaking Test Booking
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    You have <span className="font-semibold text-indigo-600 dark:text-indigo-400">{mocksInfo.mocksAvailable}</span> mock test(s) available.
                    {mocksInfo.bookedCount > 0 && (
                        <> You have booked <span className="font-semibold">{mocksInfo.bookedCount}</span> slot(s).</>
                    )}
                </p>
                <SpeakingBookingPanel
                    initialAvailableSlots={availableSlots}
                    initialMyBookings={myBookings}
                    canBook={mocksInfo.bookedCount < mocksInfo.mocksAvailable}
                />
            </div>
        </div>
    );
}
