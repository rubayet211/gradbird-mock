import PackageForm from '../PackageForm';
import connectDB from '@/lib/db';
import MockTest from '@/models/MockTest';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import User from '@/models/User';

async function getMockTests() {
    await connectDB();
    const mocks = await MockTest.find({}, 'title moduleType type').lean();
    return mocks.map(m => ({
        ...m,
        _id: m._id.toString(),
    }));
}

export default async function CreatePackagePage() {
    const session = await auth();
    if (!session || !session.user) {
        redirect('/api/auth/signin');
    }

    await connectDB();
    const currentUser = await User.findById(session.user.id).lean();
    if (!currentUser || currentUser.role !== 'admin') {
        redirect('/');
    }

    const mockTests = await getMockTests();

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Package</h1>
            </div>
            <PackageForm mockTests={mockTests} />
        </div>
    );
}
