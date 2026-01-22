import connectDB from '@/lib/db';
import Package from '@/models/Package';
import PaymentForm from './PaymentForm';
import { notFound } from 'next/navigation';

async function getPackage(id) {
    if (!id) return null;
    try {
        await connectDB();
        const pkg = await Package.findById(id).lean();
        if (pkg) {
            pkg._id = pkg._id.toString();
        }
        return pkg;
    } catch (error) {
        return null;
    }
}

export default async function PaymentPage({ params }) {
    const { packageId } = await params;
    const pkg = await getPackage(packageId);

    if (!pkg) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    Complete Purchase
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    You are purchasing: <span className="font-medium text-indigo-600 dark:text-indigo-400">{pkg.title}</span>
                </p>
                <div className="mt-4 text-center">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">৳{pkg.price}</span>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-zinc-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <PaymentForm pkg={pkg} />
                </div>
            </div>
        </div>
    );
}
