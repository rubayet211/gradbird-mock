import PackageForm from '../PackageForm';
import connectDB from '@/lib/db';
import Package from '@/models/Package';
import MockTest from '@/models/MockTest';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import User from '@/models/User';

async function getData(id) {
    await connectDB();

    // Fetch Package
    const pkg = await Package.findById(id).lean();
    if (!pkg) return null;

    // Fetch All Mocks for selection
    const mocks = await MockTest.find({}, 'title moduleType type').lean();

    return {
        pkg: {
            ...pkg,
            _id: pkg._id.toString(),
            mocks: pkg.mocks ? pkg.mocks.map(m => m.toString()) : [], // ensure IDs are strings
            createdAt: pkg.createdAt.toString(),
        },
        mockTests: mocks.map(m => ({
            ...m,
            _id: m._id.toString(),
        }))
    };
}

export default async function EditPackagePage({ params }) {
    const session = await auth();
    if (!session || !session.user) {
        redirect('/api/auth/signin');
    }

    await connectDB();
    const currentUser = await User.findById(session.user.id).lean();
    if (!currentUser || currentUser.role !== 'admin') {
        redirect('/');
    }

    const { id } = params;
    const data = await getData(id);

    if (!data) {
        return <div className="p-8 text-center">Package not found</div>;
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Package</h1>
            </div>
            <PackageForm initialData={data.pkg} mockTests={data.mockTests} />
        </div>
    );
}
