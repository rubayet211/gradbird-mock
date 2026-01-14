'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminGradingList() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await fetch('/api/admin/grading');
            if (res.ok) {
                const data = await res.json();
                setSessions(data);
            } else {
                console.error('Failed to fetch sessions');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading pending grading sessions...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Pending Grading</h1>

            {sessions.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-sm text-center text-gray-500">
                    No sessions found needing grading.
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                            <tr>
                                <th className="p-4">Student</th>
                                <th className="p-4">Mock Test</th>
                                <th className="p-4">Date Completed</th>
                                <th className="p-4 hidden md:table-cell">Status</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {sessions.map((session) => (
                                <tr key={session._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-semibold text-gray-900">{session.user?.name || 'Unknown User'}</div>
                                        <div className="text-xs text-gray-500">{session.user?.email}</div>
                                    </td>
                                    <td className="p-4 text-gray-700">
                                        {session.mockTest?.title || 'Unknown Test'}
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        {new Date(session.completedAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 hidden md:table-cell">
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                            Needs Grading
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link
                                            href={`/admin/grading/${session._id}`}
                                            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition-colors"
                                        >
                                            Grade Now
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
