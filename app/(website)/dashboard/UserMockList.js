'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UserMockList({ mocks }) {
    const router = useRouter();
    const [loadingId, setLoadingId] = useState(null);

    async function handleStartTest(mockId) {
        setLoadingId(mockId);
        try {
            const response = await fetch('/api/test-session/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mockId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to start test');
            }

            // Redirect to exam page
            let redirectUrl = `/exam/${data.sessionId}`;
            if (data.moduleType && data.moduleType !== 'Full') {
                redirectUrl += `?module=${data.moduleType.toLowerCase()}`;
            } else {
                redirectUrl += `?module=listening`;
            }

            router.push(redirectUrl);
        } catch (err) {
            alert(err.message);
            setLoadingId(null);
        }
    }

    if (mocks.length === 0) {
        return (
            <div className="text-center py-6 bg-white dark:bg-zinc-800 rounded-xl shadow-sm">
                <p className="text-gray-500 dark:text-gray-400">You haven't purchased any specific mock packages yet.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mocks.map((mock) => (
                <div key={mock._id} className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-700 hover:shadow-md transition-shadow">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${mock.moduleType === 'Full'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                }`}>
                                {mock.moduleType} Test
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium border border-gray-200 dark:border-zinc-600 px-2 py-1 rounded">
                                {mock.type}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2" title={mock.title}>
                            {mock.title}
                        </h3>

                        <div className="mt-4">
                            <button
                                onClick={() => handleStartTest(mock._id)}
                                disabled={loadingId === mock._id}
                                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                            >
                                {loadingId === mock._id ? 'Starting...' : 'Start Test'}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
