'use client';

import Link from 'next/link';

export default function GradingList({ sessions }) {
    if (sessions.length === 0) {
        return (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-gray-500">No sessions found needing grading.</p>
                <p className="text-sm text-gray-400 mt-2">All caught up! 🎉</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                    <tr>
                        <th className="p-4">Student</th>
                        <th className="p-4">Mock Test</th>
                        <th className="p-4">Date Completed</th>
                        <th className="p-4 hidden md:table-cell">Needs</th>
                        <th className="p-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {sessions.map((session) => {
                        const needsWriting = session.scores?.writing == null;
                        const needsSpeaking = session.scores?.speaking == null;

                        return (
                            <tr key={session._id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    <div className="font-semibold text-gray-900">
                                        {session.user?.name || 'Unknown User'}
                                    </div>
                                    <div className="text-xs text-gray-500">{session.user?.email}</div>
                                </td>
                                <td className="p-4">
                                    <div className="text-gray-700">{session.mockTest?.title || 'Unknown Test'}</div>
                                    <div className="text-xs text-gray-400">{session.mockTest?.type}</div>
                                </td>
                                <td className="p-4 text-gray-500">
                                    {session.completedAt
                                        ? new Date(session.completedAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })
                                        : '—'
                                    }
                                </td>
                                <td className="p-4 hidden md:table-cell">
                                    <div className="flex gap-1">
                                        {needsWriting && (
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                Writing
                                            </span>
                                        )}
                                        {needsSpeaking && (
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                Speaking
                                            </span>
                                        )}
                                    </div>
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
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
