import Link from 'next/link';
import PackageList from './PackageList';
import connectDB from '@/lib/db';
import Package from '@/models/Package';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import User from '@/models/User';

async function getPackages() {
    await connectDB();
    const packages = await Package.find()
        .populate('mocks', 'title type moduleType')
        .sort({ createdAt: -1 })
        .lean();

    // Convert ObjectIds to strings
    return packages.map(pkg => ({
        ...pkg,
        _id: pkg._id.toString(),
        mocks: pkg.mocks ? pkg.mocks.map(m => ({ ...m, _id: m._id.toString() })) : [],
        createdAt: pkg.createdAt.toString(),
    }));
}

export default async function PackagesPage() {
    const session = await auth();
    if (!session || !session.user) {
        redirect('/api/auth/signin');
    }

    await connectDB();
    const currentUser = await User.findById(session.user.id).lean();
    if (!currentUser || currentUser.role !== 'admin') {
        redirect('/');
    }

    const packages = await getPackages();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Package Management</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create, edit, and manage exam packages.</p>
                </div>
                <Link
                    href="/admin/packages/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Create Package
                </Link>
            </div>

            <PackageList packages={packages} />
        </div>
    );
}
