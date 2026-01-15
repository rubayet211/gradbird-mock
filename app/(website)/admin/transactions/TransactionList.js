'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TransactionList({ transactions, showHistory = false }) {
    const router = useRouter();
    const [processingIds, setProcessingIds] = useState(new Set());
    const [rejectModal, setRejectModal] = useState({ open: false, txId: null, reason: '' });

    const handleApprove = async (txId) => {
        if (!confirm('Are you sure you want to approve this transaction?')) return;

        setProcessingIds(prev => new Set(prev).add(txId));

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
            router.refresh();

        } catch (error) {
            alert(error.message);
        } finally {
            setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(txId);
                return newSet;
            });
        }
    };

    const openRejectModal = (txId) => {
        setRejectModal({ open: true, txId, reason: '' });
    };

    const closeRejectModal = () => {
        setRejectModal({ open: false, txId: null, reason: '' });
    };

    const handleReject = async () => {
        const { txId, reason } = rejectModal;
        if (!txId) return;

        setProcessingIds(prev => new Set(prev).add(txId));
        closeRejectModal();

        try {
            const res = await fetch('/api/admin/reject-transaction', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactionId: txId, reason }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to reject');
            }

            alert('Transaction rejected.');
            router.refresh();

        } catch (error) {
            alert(error.message);
        } finally {
            setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(txId);
                return newSet;
            });
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-amber-100 text-amber-700',
            approved: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (transactions.length === 0) {
        return (
            <p className="text-gray-500 dark:text-gray-400 p-6 text-center">
                {showHistory ? 'No transactions found.' : 'No pending transactions found.'}
            </p>
        );
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-zinc-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Package</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trx ID / Phone</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                            {showHistory && (
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            )}
                            {!showHistory && (
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            )}
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
                                {showHistory ? (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(tx.status)}
                                        {tx.status === 'rejected' && tx.rejectionReason && (
                                            <div className="text-xs text-gray-400 mt-1 max-w-[150px] truncate" title={tx.rejectionReason}>
                                                {tx.rejectionReason}
                                            </div>
                                        )}
                                    </td>
                                ) : (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleApprove(tx._id)}
                                                disabled={processingIds.has(tx._id)}
                                                className="px-3 py-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors disabled:opacity-50"
                                            >
                                                {processingIds.has(tx._id) ? 'Processing...' : 'Approve'}
                                            </button>
                                            <button
                                                onClick={() => openRejectModal(tx._id)}
                                                disabled={processingIds.has(tx._id)}
                                                className="px-3 py-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Reject Modal */}
            {rejectModal.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-md p-6 m-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reject Transaction</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Are you sure you want to reject this transaction? This action cannot be undone.
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Reason (optional)
                            </label>
                            <textarea
                                value={rejectModal.reason}
                                onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
                                rows={3}
                                placeholder="Enter rejection reason..."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={closeRejectModal}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
