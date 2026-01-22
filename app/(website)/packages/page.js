import connectDB from '@/lib/db';
import Package from '@/models/Package';
import Link from 'next/link';
import { auth } from '@/auth';

async function getPackages() {
    await connectDB();
    const packages = await Package.find({ isActive: true })
        .populate('mocks', 'title type moduleType')
        .sort({ createdAt: -1 })
        .lean();

    return packages.map(pkg => ({
        ...pkg,
        _id: pkg._id.toString(),
        mocks: pkg.mocks ? pkg.mocks.map(m => ({ ...m, _id: m._id.toString() })) : [],
        createdAt: pkg.createdAt.toString(),
    }));
}

export default async function PackagesPage() {
    const session = await auth();
    const packages = await getPackages();

    return (
        <div className="bg-gray-50 dark:bg-zinc-900 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                        Choose Your Plan
                    </h2>
                    <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                        Select a package that suits your preparation needs.
                    </p>
                </div>

                <div className="mt-12 grid gap-8 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
                    {packages.length === 0 ? (
                        <div className="col-span-full text-center text-gray-500">
                            No packages available at the moment. Please check back later.
                        </div>
                    ) : (
                        packages.map((pkg) => (
                            <div key={pkg._id} className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300">
                                <div className="p-6 flex-1">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {pkg.title}
                                    </h3>
                                    <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm line-clamp-3">
                                        {pkg.description}
                                    </p>

                                    <div className="mt-4">
                                        <div className="flex items-baseline">
                                            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                                                ৳{pkg.price - (pkg.discount || 0)}
                                            </span>
                                            {pkg.discount > 0 && (
                                                <span className="ml-2 text-lg font-medium text-gray-500 decoration-red-500 line-through">
                                                    ৳{pkg.price}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Features List */}
                                    <ul className="mt-6 space-y-4">
                                        {pkg.features && pkg.features.length > 0 ? (
                                            pkg.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start">
                                                    <div className="flex-shrink-0">
                                                        {/* Check Icon */}
                                                        <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                                                        {feature}
                                                    </p>
                                                </li>
                                            ))
                                        ) : pkg.mocks.length > 0 ? (
                                            <>
                                                <li className="flex items-start">
                                                    <div className="flex-shrink-0">
                                                        <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                                                        Includes {pkg.mocks.length} Mock Tests:
                                                    </p>
                                                </li>
                                                <div className="ml-8 mt-2 flex flex-wrap gap-2">
                                                    {pkg.mocks.slice(0, 3).map(m => (
                                                        <span key={m._id} className="text-xs bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
                                                            {m.title}
                                                        </span>
                                                    ))}
                                                    {pkg.mocks.length > 3 && (
                                                        <span className="text-xs text-gray-500">+{pkg.mocks.length - 3} more</span>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <li className="flex items-start">
                                                <p className="text-sm text-gray-500">Standard Mock Package</p>
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                <div className="p-6 bg-gray-50 dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-700">
                                    <Link
                                        href={session ? `/payment/${pkg._id}` : `/api/auth/signin?callbackUrl=/payment/${pkg._id}`}
                                        className="block w-full text-center bg-blue-600 border border-transparent rounded-md py-3 px-8 text-base font-medium text-white hover:bg-blue-700 transition-colors"
                                    >
                                        Buy Now
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
