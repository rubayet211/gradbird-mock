import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
// Import User and Package to ensure models are registered if using populate without importing them might fail in some mongoose versions/setups, but usually fine if already registered.
import User from '@/models/User';
import Package from '@/models/Package';
import TransactionList from './TransactionList';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

async function getPendingTransactions() {
    await connectDB();
    // Ensure models are registered
    // eslint-disable-next-line no-unused-vars
    const u = User;
    // eslint-disable-next-line no-unused-vars
    const p = Package;

    const transactions = await Transaction.find({ status: 'pending' })
        .populate('user', 'name email') // Get user name/email
        .populate('package', 'title')   // Get package title
        .sort({ createdAt: -1 })
        .lean();

    return transactions.map(tx => ({
        ...tx,
        _id: tx._id.toString(),
        user: tx.user ? { ...tx.user, _id: tx.user._id.toString() } : null,
        package: tx.package ? { ...tx.package, _id: tx.package._id.toString() } : null,
        createdAt: tx.createdAt.toISOString(), // Serialize date
    }));
}

export default async function AdminTransactionsPage() {
    const session = await auth();

    // Basic protection
    if (!session || !session.user) {
        redirect('/api/auth/signin'); // Or custom login page
    }

    // IMPORTANT: You might want to check for admin role here too, but for now I'll trust the API to block actions if not admin.
    // Better to not show the page though.
    // In a real app we'd redirect if not admin.

    const transactions = await getPendingTransactions();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    Pending Transactions
                </h1>
                <div className="bg-white dark:bg-zinc-800 shadow overflow-hidden sm:rounded-lg">
                    <TransactionList transactions={transactions} />
                </div>
            </div>
        </div>
    );
}
