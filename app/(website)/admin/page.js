import Link from "next/link";
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import TestSession from '@/models/TestSession';
import User from '@/models/User';
import MockTest from '@/models/MockTest';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

async function getDashboardStats() {
    await connectDB();

    const [
        pendingTransactions,
        pendingGrading,
        totalUsers,
        totalMocks
    ] = await Promise.all([
        Transaction.countDocuments({ status: 'pending' }),
        TestSession.countDocuments({
            status: 'completed',
            $or: [
                { 'scores.writing': null },
                { 'scores.speaking': null }
            ]
        }),
        User.countDocuments(),
        MockTest.countDocuments()
    ]);

    return {
        pendingTransactions,
        pendingGrading,
        totalUsers,
        totalMocks
    };
}

export default async function AdminDashboard() {
    const session = await auth();

    if (!session || !session.user) {
        redirect('/api/auth/signin');
    }

    await connectDB();
    const currentUser = await User.findById(session.user.id).lean();
    if (!currentUser || currentUser.role !== 'admin') {
        redirect('/');
    }

    const stats = await getDashboardStats();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Welcome to the GradBirds admin panel.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Pending Transactions" value={stats.pendingTransactions} color="text-amber-600" />
                <StatCard label="Needs Grading" value={stats.pendingGrading} color="text-red-600" />
                <StatCard label="Total Users" value={stats.totalUsers} color="text-blue-600" />
                <StatCard label="Mock Tests" value={stats.totalMocks} color="text-purple-600" />
            </div>

            {/* Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardCard
                    title="Transactions"
                    description="Approve or reject payment transactions"
                    href="/admin/transactions"
                    color="bg-blue-500"
                    badge={stats.pendingTransactions > 0 ? stats.pendingTransactions : null}
                />
                <DashboardCard
                    title="Grading"
                    description="Grade writing and speaking modules"
                    href="/admin/grading"
                    color="bg-red-500"
                    badge={stats.pendingGrading > 0 ? stats.pendingGrading : null}
                />
                <DashboardCard
                    title="Users"
                    description="Manage registered users"
                    href="/admin/users"
                    color="bg-green-500"
                />
                <DashboardCard
                    title="Mock Tests"
                    description="Create and edit mock tests"
                    href="/admin/mocks"
                    color="bg-purple-500"
                />
                <DashboardCard
                    title="Speaking Slots"
                    description="Manage speaking test slots"
                    href="/admin/speaking"
                    color="bg-orange-500"
                />
            </div>
        </div>
    );
}

function StatCard({ label, value, color }) {
    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
    );
}

function DashboardCard({ title, description, href, color, badge }) {
    return (
        <Link href={href} className="block group">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative">
                {badge && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {badge}
                    </span>
                )}
                <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white mb-4`}>
                    <span className="text-xl font-bold">{title[0]}</span>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>
        </Link>
    );
}
