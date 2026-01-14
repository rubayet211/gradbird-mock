import connectDB from '@/lib/db';
import User from '@/models/User';
import TestSession from '@/models/TestSession';
import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import StartTestButton from './StartTestButton';

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

async function getTestSessions(userId) {
    await connectDB();
    const sessions = await TestSession.find({ user: userId })
        .populate('mockTest', 'title')
        .sort({ startedAt: -1 })
        .lean();
    return sessions.map(session => ({
        ...session,
        _id: session._id.toString(),
        user: session.user.toString(),
        mockTest: session.mockTest ? {
            _id: session.mockTest._id.toString(),
            title: session.mockTest.title,
        } : null,
        startedAt: session.startedAt?.toISOString(),
        completedAt: session.completedAt?.toISOString(),
    }));
}

const navItems = [
    { name: 'My Tests', href: '/dashboard', icon: 'clipboard' },
    { name: 'Buy Packages', href: '/payment', icon: 'shopping-cart' },
    { name: 'Book Speaking', href: '/dashboard/speaking', icon: 'calendar' },
    { name: 'Results', href: '/dashboard/results', icon: 'chart' },
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
    };
    return icons[type] || null;
}

function StatCard({ title, value, icon, color }) {
    const colorClasses = {
        indigo: 'bg-indigo-500',
        green: 'bg-green-500',
        amber: 'bg-amber-500',
    };

    return (
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden">
            <div className="p-5">
                <div className="flex items-center">
                    <div className={`flex-shrink-0 ${colorClasses[color]} rounded-md p-3`}>
                        {icon}
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                {title}
                            </dt>
                            <dd className="text-3xl font-bold text-gray-900 dark:text-white">
                                {value}
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getStatusBadge(status) {
    const styles = {
        in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        abandoned: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    const labels = {
        in_progress: 'In Progress',
        completed: 'Completed',
        abandoned: 'Abandoned',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/api/auth/signin');
    }

    const user = await getUserData(session.user.id);
    const testSessions = await getTestSessions(session.user.id);

    if (!user) {
        redirect('/api/auth/signin');
    }

    const completedTests = testSessions.filter(s => s.status === 'completed');
    const testsTaken = completedTests.length;
    const averageScore = completedTests.length > 0
        ? (completedTests.reduce((acc, s) => acc + (s.scores?.overall || 0), 0) / completedTests.length).toFixed(1)
        : 'N/A';
    const mocksRemaining = user.mocksAvailable || 0;

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-zinc-900">
            {/* Sidebar */}
            <aside className="hidden md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64">
                    <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white dark:bg-zinc-800 border-r border-gray-200 dark:border-zinc-700">
                        <div className="flex items-center flex-shrink-0 px-4">
                            <span className="text-2xl font-bold text-indigo-600">Gradbirds</span>
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
                                    <img
                                        className="inline-block h-9 w-9 rounded-full"
                                        src={user.image}
                                        alt={user.name}
                                    />
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
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
                        </div>

                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {/* Stats Overview */}
                            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                <StatCard
                                    title="Tests Taken"
                                    value={testsTaken}
                                    color="indigo"
                                    icon={
                                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    }
                                />
                                <StatCard
                                    title="Average Score"
                                    value={averageScore}
                                    color="green"
                                    icon={
                                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    }
                                />
                                <StatCard
                                    title="Mocks Remaining"
                                    value={mocksRemaining}
                                    color="amber"
                                    icon={
                                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    }
                                />
                            </div>

                            {/* My Tests Section */}
                            <div className="mt-8">
                                <div className="bg-white dark:bg-zinc-800 shadow-md rounded-xl overflow-hidden">
                                    <div className="px-6 py-5 border-b border-gray-200 dark:border-zinc-700 flex items-center justify-between">
                                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">My Tests</h2>
                                        {mocksRemaining > 0 ? (
                                            <StartTestButton />
                                        ) : (
                                            <Link
                                                href="/payment"
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                                            >
                                                Buy Mock Tests
                                            </Link>
                                        )}
                                    </div>

                                    {/* Test History Table */}
                                    <div className="overflow-x-auto">
                                        {testSessions.length > 0 ? (
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
                                                <thead className="bg-gray-50 dark:bg-zinc-900">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                            Test Name
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                            Date
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                            Score
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-zinc-800 divide-y divide-gray-200 dark:divide-zinc-700">
                                                    {testSessions.map((testSession) => (
                                                        <tr key={testSession._id} className="hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                                {testSession.mockTest?.title || 'Unknown Test'}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                                {formatDate(testSession.startedAt)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                {getStatusBadge(testSession.status)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                                {testSession.scores?.overall ? `${testSession.scores.overall}` : '—'}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                {testSession.status === 'in_progress' ? (
                                                                    <Link
                                                                        href={`/exam/${testSession._id}`}
                                                                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                                    >
                                                                        Continue
                                                                    </Link>
                                                                ) : testSession.status === 'completed' ? (
                                                                    <Link
                                                                        href={`/dashboard/results/${testSession._id}`}
                                                                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                                    >
                                                                        View Report
                                                                    </Link>
                                                                ) : (
                                                                    <span className="text-gray-400">—</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="px-6 py-12 text-center">
                                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tests taken yet</h3>
                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                    Get started by taking your first mock test.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
