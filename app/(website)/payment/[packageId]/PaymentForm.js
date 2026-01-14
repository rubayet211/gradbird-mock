'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentForm({ pkg }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        phoneNumber: '',
        bkashTxId: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    packageId: pkg._id,
                    phoneNumber: formData.phoneNumber, // Note: Transaction model didn't explicitly ask for phone, but User request did. I'll send it.
                    // Wait, looking at Transaction.js model earlier:
                    // user, package, amount, bkashTxId, status, createdAt.
                    // It does NOT have phoneNumber. 
                    // The User Request asked for "Input: Phone Number".
                    // I should probably store it. 
                    // I will check if I can update the Transaction model to include phoneNumber or just ignore it if the backend doesn't take it.
                    // For now I will send it to the API.
                    bkashTxId: formData.bkashTxId,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            // Success
            alert('Purchase submitted successfully! Pending approval.');
            router.push('/'); // Redirect home or to a "my purchases" page
            router.refresh();

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 p-4 rounded-md text-red-600 text-sm">
                    {error}
                </div>
            )}
            <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                </label>
                <div className="mt-1">
                    <input
                        type="tel"
                        name="phoneNumber"
                        id="phoneNumber"
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white sm:text-sm p-2 border"
                        placeholder="017xxxxxxxx"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div>
                <label htmlFor="bkashTxId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bkash Transaction ID
                </label>
                <div className="mt-1">
                    <input
                        type="text"
                        name="bkashTxId"
                        id="bkashTxId"
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white sm:text-sm p-2 border"
                        placeholder="8N7..."
                        value={formData.bkashTxId}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Processing...' : 'Submit Purchase'}
                </button>
            </div>
        </form>
    );
}
