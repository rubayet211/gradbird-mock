import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Image from 'next/image'; // Optimized Image component

export const dynamic = 'force-dynamic';

async function getUserData(userId) {
    await connectDB();
    const user = await User.findById(userId).lean();
    if (!user) return null;
    return {
        ...user,
        _id: user._id.toString(),
    };
}

const navItems = [
    { name: 'My Tests', href: '/dashboard', icon: 'clipboard' },
    { name: 'Buy Packages', href: '/payment', icon: 'shopping-cart' },
    { name: 'Book Speaking', href: '/dashboard/speaking', icon: 'calendar' },
    { name: 'Results', href: '/dashboard/results', icon: 'chart' },
    { name: 'Settings', href: '/dashboard/settings', icon: 'cog' }, // Added Settings
];

function NavIcon({ type }) {
    const icons = {
        'clipboard': (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        ),
        'shopping-cart': (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        'calendar': (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        'chart': (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        'cog': (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        )
    };
    return icons[type] || null;
}

export default async function DashboardLayout({ children }) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/api/auth/signin');
    }

    const user = await getUserData(session.user.id);

    if (!user) {
        redirect('/api/auth/signin');
    }

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-zinc-900">
            {/* Sidebar */}
            <aside className="hidden md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64">
                    <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white dark:bg-zinc-800 border-r border-gray-200 dark:border-zinc-700">
                        <div className="flex items-center flex-shrink-0 px-4">
                            <Link href="/" className="text-2xl font-bold text-indigo-600">Gradbirds</Link>
                        </div>
                        <div className="mt-8 flex-grow flex flex-col">
                            <nav className="flex-1 px-2 space-y-1">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="group flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    >
                                        <NavIcon type={item.icon} />
                                        <span className="ml-3">{item.name}</span>
                                    </Link>
                                ))}
                            </nav>
                        </div>
                        <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-zinc-700 p-4">
                            <div className="flex items-center">
                                {user.image && (
                                    <div className="h-9 w-9 relative rounded-full overflow-hidden">
                                        <Image
                                            src={user.image}
                                            alt={user.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.name}</p>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{user.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Mobile Header */}
                <div className="md:hidden bg-white dark:bg-zinc-800 shadow-sm">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <span className="text-xl font-bold text-indigo-600">Gradbirds</span>
                        <div className="flex space-x-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-700"
                                    title={item.name}
                                >
                                    <NavIcon type={item.icon} />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    {children}
                </main>
            </div>
        </div>
    );
}
