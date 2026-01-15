'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MockTestList({ initialMocks }) {
    const router = useRouter();
    const [mocks, setMocks] = useState(initialMocks);
    const [processingId, setProcessingId] = useState(null);

    const handleToggleActive = async (mockId, currentStatus) => {
        setProcessingId(mockId);
        try {
            const res = await fetch(`/api/admin/mocks/${mockId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus })
            });

            if (res.ok) {
                const data = await res.json();
                setMocks(prev => prev.map(m =>
                    m._id === mockId ? { ...m, isActive: !currentStatus } : m
                ));
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to update');
            }
        } catch (error) {
            console.error('Toggle error:', error);
            alert('An error occurred');
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (mockId, title) => {
        if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) return;

        setProcessingId(mockId);
        try {
            const res = await fetch(`/api/admin/mocks/${mockId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setMocks(prev => prev.filter(m => m._id !== mockId));
                alert('Mock test deleted successfully');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('An error occurred');
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (mocks.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <p className="text-gray-500 mb-4">No mock tests found.</p>
                <Link
                    href="/admin/mocks/create"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                >
                    Create your first mock test &rarr;
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                    <tr>
                        <th className="p-4">Title</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 hidden md:table-cell">Created</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {mocks.map((mock) => (
                        <tr key={mock._id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                                <div className="font-medium text-gray-900">{mock.title}</div>
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${mock.type === 'Academic'
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'bg-green-50 text-green-700'
                                    }`}>
                                    {mock.type}
                                </span>
                            </td>
                            <td className="p-4">
                                <button
                                    onClick={() => handleToggleActive(mock._id, mock.isActive)}
                                    disabled={processingId === mock._id}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${mock.isActive ? 'bg-green-500' : 'bg-gray-300'
                                        } ${processingId === mock._id ? 'opacity-50' : ''}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${mock.isActive ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                                <span className="ml-2 text-xs text-gray-500">
                                    {mock.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td className="p-4 hidden md:table-cell text-gray-500">
                                {formatDate(mock.createdAt)}
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <Link
                                        href={`/admin/mocks/edit/${mock._id}`}
                                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-xs font-medium"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(mock._id, mock.title)}
                                        disabled={processingId === mock._id}
                                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors text-xs font-medium disabled:opacity-50"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
