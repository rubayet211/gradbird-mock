import connectDB from '@/lib/db';
import SpeakingSlot from '@/models/SpeakingSlot';
import User from '@/models/User';
import SpeakingAdminPanel from './SpeakingAdminPanel';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

async function getAllSpeakingSlots() {
    await connectDB();
    // Ensure User model is registered for populate
    // eslint-disable-next-line no-unused-vars
    const u = User;

    const slots = await SpeakingSlot.find()
        .populate('bookedBy', 'name email')
        .sort({ date: 1, time: 1 })
        .lean();

    return slots.map(slot => ({
        ...slot,
        _id: slot._id.toString(),
        date: slot.date.toISOString(),
        bookedBy: slot.bookedBy ? { ...slot.bookedBy, _id: slot.bookedBy._id.toString() } : null,
        createdAt: slot.createdAt.toISOString(),
    }));
}

export default async function AdminSpeakingPage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect('/api/auth/signin');
    }

    // Check admin role
    await connectDB();
    const currentUser = await User.findById(session.user.id).lean();
    if (!currentUser || currentUser.role !== 'admin') {
        redirect('/');
    }

    const slots = await getAllSpeakingSlots();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    Speaking Test Slots Management
                </h1>
                <SpeakingAdminPanel initialSlots={slots} />
            </div>
        </div>
    );
}
