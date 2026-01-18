import Link from 'next/link';
import connectDB from '@/lib/db';
import MockTest from '@/models/MockTest';
import User from '@/models/User';
import MockTestList from './MockTestList';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

async function getMockTests() {
    await connectDB();

    const mockTests = await MockTest.find()
        .select('title type isActive createdAt')
        .sort({ createdAt: -1 })
        .lean();

    return mockTests.map(m => ({
        ...m,
        _id: m._id.toString(),
        createdAt: m.createdAt?.toISOString() || null
    }));
}

export default async function MockTestsIndex() {
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
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Mock Tests</h1>
                    <p className="text-gray-500 mt-1">Create and manage IELTS mock tests</p>
                </div>
                <Link
                    href="/admin/mocks/create"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create New Mock Test
                </Link>
            </div>

            <MockTestList initialMocks={mockTests} />
        </div>
    );
}
