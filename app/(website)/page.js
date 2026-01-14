import connectDB from '@/lib/db';
import Package from '@/models/Package';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getPackages() {
    await connectDB();
    const packages = await Package.find({}).lean();
    // Convert _id to string to pass to client component safely (if needed) and avoid serialization issues
    return packages.map(pkg => ({
        ...pkg,
        _id: pkg._id.toString(),
    }));
}

export default async function HomePage() {
    const packages = await getPackages();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
                        Choose Your Plan
                    </h1>
                    <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-400">
                        Select a package that suits your preparation needs. Get access to premium mock tests and analytics.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
                    {packages.map((pkg) => (
                        <div key={pkg._id} className="flex flex-col rounded-2xl bg-white dark:bg-zinc-800 shadow-xl overflow-hidden transition-transform transform hover:scale-105">
                            <div className="p-8 flex-1">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {pkg.title}
                                </h3>
                                <p className="mt-4 flex items-baseline text-gray-900 dark:text-white">
                                    <span className="text-5xl font-extrabold tracking-tight">৳{pkg.price}</span>
                                    <span className="ml-1 text-xl text-gray-500 dark:text-gray-400">/package</span>
                                </p>
                                <p className="mt-6 text-gray-500 dark:text-gray-400">
                                    {pkg.totalMocks} Total Mock Tests
                                </p>

                                <ul role="list" className="mt-6 space-y-4">
                                    {pkg.features.map((feature, index) => (
                                        <li key={index} className="flex">
                                            {/* Checkmark Icon */}
                                            <svg className="flex-shrink-0 h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="ml-3 text-base text-gray-500 dark:text-gray-300">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="p-8 bg-gray-50 dark:bg-zinc-700">
                                <Link
                                    href={`/payment/${pkg._id}`}
                                    className="block w-full text-center rounded-lg border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                                >
                                    Buy Now
                                </Link>
                            </div>
                        </div>
                    ))}

                    {packages.length === 0 && (
                        <div className="col-span-full text-center text-gray-500">
                            No packages found. Please seed the database.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
