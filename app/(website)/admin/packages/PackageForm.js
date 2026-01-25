'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PackageForm({ initialData = null, mockTests = [] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        price: initialData?.price || '',
        discount: initialData?.discount || 0,
        mocks: initialData?.mocks?.map(m => typeof m === 'object' ? m._id : m) || [],
        isActive: initialData?.isActive !== false, // default true
        features: initialData?.features?.join('\n') || '', // line separated
    });

    const [mockSearch, setMockSearch] = useState('');

    const filteredMocks = mockTests.filter(m =>
        m.title.toLowerCase().includes(mockSearch.toLowerCase()) ||
        m.moduleType.toLowerCase().includes(mockSearch.toLowerCase())
    );

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleMockToggle = (mockId) => {
        setFormData(prev => {
            const currentMocks = prev.mocks;
            if (currentMocks.includes(mockId)) {
                return { ...prev, mocks: currentMocks.filter(id => id !== mockId) };
            } else {
                return { ...prev, mocks: [...currentMocks, mockId] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                discount: parseFloat(formData.discount),
                features: formData.features.split('\n').filter(f => f.trim() !== ''),
            };

            const url = initialData ? `/api/admin/packages/${initialData._id}` : '/api/admin/packages';
            const method = initialData ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save package');
            }

            router.push('/admin/packages');
            router.refresh();

        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200 dark:divide-zinc-700 bg-white dark:bg-zinc-800 p-8 shadow rounded-lg">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                        {initialData ? 'Edit Package' : 'New Package'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Fill in the details to create a mock test package.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    {/* Title */}
                    <div className="sm:col-span-4">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Package Title
                        </label>
                        <div className="mt-1">
                            <input
                                type="text"
                                name="title"
                                id="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-zinc-600 dark:bg-zinc-700 rounded-md p-2"
                            />
                        </div>
                    </div>

                    {/* Active Status */}
                    <div className="sm:col-span-2 flex items-center pt-6">
                        <div className="flex items-center h-5">
                            <input
                                id="isActive"
                                name="isActive"
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="isActive" className="font-medium text-gray-700 dark:text-gray-300">
                                Active (Visible to users)
                            </label>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-6">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description
                        </label>
                        <div className="mt-1">
                            <textarea
                                id="description"
                                name="description"
                                rows={3}
                                required
                                value={formData.description}
                                onChange={handleChange}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-zinc-600 dark:bg-zinc-700 rounded-md p-2"
                            />
                        </div>
                        <p className="mt-2 text-sm text-gray-500">Brief description of what's included.</p>
                    </div>

                    {/* Price and Discount */}
                    <div className="sm:col-span-3">
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Price (৳)
                        </label>
                        <div className="mt-1">
                            <input
                                type="number"
                                name="price"
                                id="price"
                                required
                                min="0"
                                value={formData.price}
                                onChange={handleChange}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-zinc-600 dark:bg-zinc-700 rounded-md p-2"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="discount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Discount (৳)
                        </label>
                        <div className="mt-1">
                            <input
                                type="number"
                                name="discount"
                                id="discount"
                                min="0"
                                value={formData.discount}
                                onChange={handleChange}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-zinc-600 dark:bg-zinc-700 rounded-md p-2"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Amount to subtract from price (optional visualization).</p>
                    </div>

                    {/* Features */}
                    <div className="sm:col-span-6">
                        <label htmlFor="features" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Features / Highlights (Line separated)
                        </label>
                        <div className="mt-1">
                            <textarea
                                id="features"
                                name="features"
                                rows={4}
                                value={formData.features}
                                onChange={handleChange}
                                placeholder="Full Access&#10;Unlimited retakes&#10;Expert grading"
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-zinc-600 dark:bg-zinc-700 rounded-md p-2"
                            />
                        </div>
                    </div>

                    {/* Mock Selection */}
                    <div className="sm:col-span-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Included Mocks
                        </label>

                        <input
                            type="text"
                            placeholder="Search mocks..."
                            value={mockSearch}
                            onChange={(e) => setMockSearch(e.target.value)}
                            className="mb-2 w-full sm:w-1/2 p-2 border border-gray-300 dark:border-zinc-600 dark:bg-zinc-700 rounded text-sm"
                        />

                        <div className="border border-gray-300 dark:border-zinc-600 rounded-md max-h-64 overflow-y-auto p-4 bg-gray-50 dark:bg-zinc-900">
                            {filteredMocks.length === 0 ? (
                                <p className="text-sm text-gray-500">No mocks found matching "{mockSearch}"</p>
                            ) : (
                                <div className="grid grid-cols-1 gap-2">
                                    {filteredMocks.map(mock => (
                                        <div key={mock._id} className="flex items-start">
                                            <div className="flex items-center h-5">
                                                <input
                                                    id={`mock-${mock._id}`}
                                                    name={`mock-${mock._id}`}
                                                    type="checkbox"
                                                    checked={formData.mocks.includes(mock._id)}
                                                    onChange={() => handleMockToggle(mock._id)}
                                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label htmlFor={`mock-${mock._id}`} className="font-medium text-gray-700 dark:text-gray-300">
                                                    {mock.title} <span className="text-gray-400">({mock.moduleType})</span>
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <p className="mt-2 text-sm text-gray-500">Selected: {formData.mocks.length} mocks</p>
                    </div>
                </div>
            </div>

            <div className="pt-5">
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="bg-white dark:bg-zinc-700 py-2 px-4 border border-gray-300 dark:border-zinc-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Package'}
                    </button>
                </div>
            </div>
        </form>
    );
}
