'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TransactionList({ transactions }) {
    const router = useRouter();
    const [approvingIds, setApprovingIds] = useState(new Set());

    const handleApprove = async (txId) => {
        if (!confirm('Are you sure you want to approve this transaction?')) return;

        setApprovingIds(prev => new Set(prev).add(txId));

        try {
            const res = await fetch('/api/admin/approve-transaction', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactionId: txId }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to approve');
            }

            alert('Transaction approved!');
            router.refresh(); // Reload to show updated list (remove approved item or change status)

        } catch (error) {
            alert(error.message);
        } finally {
            setApprovingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(txId);
                return newSet;
            });
        }
    };

    if (transactions.length === 0) {
        return <p className="text-gray-500 dark:text-gray-400">No pending transactions found.</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-zinc-800">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Package</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trx ID / Phone</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {transactions.map((tx) => (
                        <tr key={tx._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {tx.user?.name || tx.user?.email || 'Unknown User'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                {tx.package?.title || 'Unknown Package'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                ৳{tx.amount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                <div>{tx.bkashTxId}</div>
                                <div className="text-xs text-gray-400">{tx.phoneNumber}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                {new Date(tx.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    onClick={() => handleApprove(tx._id)}
                                    disabled={approvingIds.has(tx._id)}
                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 disabled:opacity-50"
                                >
                                    {approvingIds.has(tx._id) ? 'Approving...' : 'Approve'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
