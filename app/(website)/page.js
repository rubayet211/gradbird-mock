import connectDB from '@/lib/db';
import Package from '@/models/Package';
import Link from 'next/link';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

async function getPackages() {
    await connectDB();
    const packages = await Package.find({}).lean();
    return packages.map(pkg => ({
        ...pkg,
        _id: pkg._id.toString(),
    }));
}

export default async function LandingPage() {
    const session = await auth();
    const packages = await getPackages();

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-white dark:bg-zinc-900 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 bg-white dark:bg-zinc-900 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                        <svg className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white dark:text-zinc-900 transform translate-x-1/2" fill="currentColor" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                            <polygon points="50,0 100,0 50,100 0,100" />
                        </svg>

                        <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                            <div className="sm:text-center lg:text-left">
                                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                                    <span className="block xl:inline">Master IELTS with</span>{' '}
                                    <span className="block text-indigo-600 xl:inline">Real Computer-Delivered Mocks</span>
                                </h1>
                                <p className="mt-3 text-base text-gray-500 dark:text-gray-400 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                    Experience the actual exam interface, get instant results, and practice speaking with our advanced mock system. Prepare with confidence.
                                </p>
                                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                                    <div className="rounded-md shadow">
                                        <Link href={session ? "/dashboard" : "/api/auth/signin"} className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg">
                                            Get Started
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
                <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-gray-50 dark:bg-zinc-800 flex items-center justify-center">
                    {/* Placeholder for Hero Image if needed, or just a decorative pattern */}
                    <div className="text-gray-400 dark:text-gray-600">
                        <svg className="h-56 w-56 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-12 bg-gray-50 dark:bg-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                            Everything you need to succeed
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 lg:mx-auto">
                            Our platform replicates the real exam environment to ensure you are fully prepared for test day.
                        </p>
                    </div>

                    <div className="mt-10">
                        <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                            {[
                                {
                                    name: 'Real Interface',
                                    description: 'Practice on an interface that looks and feels exactly like the official computer-delivered IELTS exam.',
                                    icon: (
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    ),
                                },
                                {
                                    name: 'Instant Results',
                                    description: 'Get your Reading and Listening scores immediately after completing the test with detailed analytics.',
                                    icon: (
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    ),
                                },
                                {
                                    name: 'Speaking Slots',
                                    description: 'Book live speaking sessions with certified examiners and receive comprehensive feedback.',
                                    icon: (
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    ),
                                },
                            ].map((feature) => (
                                <div key={feature.name} className="relative">
                                    <dt>
                                        <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                                            {feature.icon}
                                        </div>
                                        <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">{feature.name}</p>
                                    </dt>
                                    <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">
                                        {feature.description}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-12 bg-white dark:bg-zinc-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                            Simple, transparent pricing
                        </h2>
                        <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">
                            Choose the package that fits your study schedule.
                        </p>
                    </div>
                    <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:gap-x-8">
                        {packages.map((pkg) => (
                            <div key={pkg._id} className="relative p-8 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-sm flex flex-col">
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{pkg.title}</h3>
                                    <p className="mt-4 flex items-baseline text-gray-900 dark:text-white">
                                        <span className="text-5xl font-extrabold tracking-tight">৳{pkg.price}</span>
                                        <span className="ml-1 text-xl text-gray-500 dark:text-gray-400">/package</span>
                                    </p>
                                    <p className="mt-6 text-gray-500 dark:text-gray-400">{pkg.totalMocks} Total Mock Tests</p>

                                    <ul role="list" className="mt-6 space-y-4">
                                        {pkg.features.map((feature, index) => (
                                            <li key={index} className="flex">
                                                <svg className="flex-shrink-0 h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span className="ml-3 text-base text-gray-500 dark:text-gray-300">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Link
                                    href={session ? `/payment?packageId=${pkg._id}` : "/api/auth/signin"}
                                    className="mt-8 block w-full bg-indigo-600 border border-transparent rounded-md py-3 text-center text-base font-medium text-white hover:bg-indigo-700"
                                >
                                    Buy Now
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-800 dark:bg-zinc-950">
                <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
                    <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
                        <div className="px-5 py-2">
                            <Link href="#" className="text-base text-gray-400 hover:text-white">
                                Home
                            </Link>
                        </div>
                        <div className="px-5 py-2">
                            <Link href="#" className="text-base text-gray-400 hover:text-white">
                                About
                            </Link>
                        </div>
                        <div className="px-5 py-2">
                            <Link href="#" className="text-base text-gray-400 hover:text-white">
                                Contact
                            </Link>
                        </div>
                        <div className="px-5 py-2">
                            <Link href="#" className="text-base text-gray-400 hover:text-white">
                                Privacy Policy
                            </Link>
                        </div>
                    </nav>
                    <p className="mt-8 text-center text-base text-gray-400">
                        &copy; 2026 Gradbirds. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
