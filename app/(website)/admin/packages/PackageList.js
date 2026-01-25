'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PackageList({ packages }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(null);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this package?')) return;

        setIsDeleting(id);
        try {
            const res = await fetch(`/api/admin/packages/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete package');
            }

            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Error deleting package: ' + error.message);
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="overflow-x-auto bg-white dark:bg-zinc-800 shadow sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-zinc-900">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price (Discount)</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mocks Included</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {packages.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                No packages found. Create one to get started.
                            </td>
                        </tr>
                    ) : (
                        packages.map((pkg) => (
                            <tr key={pkg._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{pkg.title}</div>
                                    <div className="text-xs text-gray-400 max-w-[200px] truncate">{pkg.description}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    <div>৳{pkg.price}</div>
                                    {pkg.discount > 0 && (
                                        <div className="text-xs text-green-600">Off: ৳{pkg.discount}</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {pkg.mocks && pkg.mocks.length > 0 ? (
                                        <div className="flex flex-col gap-1">
                                            {pkg.mocks.slice(0, 3).map((m, i) => (
                                                <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full inline-block w-fit">
                                                    {m.title}
                                                </span>
                                            ))}
                                            {pkg.mocks.length > 3 && (
                                                <span className="text-xs text-gray-400">+{pkg.mocks.length - 3} more</span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400">Legacy / No mocks</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${pkg.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {pkg.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link
                                        href={`/admin/packages/${pkg._id}`}
                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(pkg._id)}
                                        disabled={isDeleting === pkg._id}
                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                                    >
                                        {isDeleting === pkg._id ? '...' : 'Delete'}
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
