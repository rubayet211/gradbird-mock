import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import Package from '@/models/Package';
import TransactionTabs from './TransactionTabs';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

async function getTransactions(status = 'all') {
    await connectDB();
    // Ensure models are registered
    // eslint-disable-next-line no-unused-vars
    const u = User;
    // eslint-disable-next-line no-unused-vars
    const p = Package;

    let query = {};
    if (status === 'pending') {
        query.status = 'pending';
    } else if (status === 'history') {
        query.status = { $in: ['approved', 'rejected'] };
    }

    const transactions = await Transaction.find(query)
        .populate('user', 'name email')
        .populate('package', 'title')
        .sort({ createdAt: -1 })
        .lean();

    return transactions.map(tx => ({
        ...tx,
        _id: tx._id.toString(),
        user: tx.user ? { ...tx.user, _id: tx.user._id.toString() } : null,
        package: tx.package ? { ...tx.package, _id: tx.package._id.toString() } : null,
        createdAt: tx.createdAt.toISOString(),
    }));
}

export default async function AdminTransactionsPage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect('/api/auth/signin');
    }

    await connectDB();
    const currentUser = await User.findById(session.user.id).lean();
    if (!currentUser || currentUser.role !== 'admin') {
        redirect('/');
    }

    const pendingTransactions = await getTransactions('pending');
    const historyTransactions = await getTransactions('history');

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Transaction Management
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Approve or reject payment transactions
                </p>
            </div>
            <TransactionTabs
                pendingTransactions={pendingTransactions}
                historyTransactions={historyTransactions}
            />
        </div>
    );
}
