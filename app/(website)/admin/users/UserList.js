'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UserList({ initialUsers, pagination }) {
    const router = useRouter();
    const [users, setUsers] = useState(initialUsers);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ mocksAvailable: 0, role: 'student' });
    const [saving, setSaving] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setEditForm({
            mocksAvailable: user.mocksAvailable || 0,
            role: user.role || 'student'
        });
    };

    const closeEditModal = () => {
        setEditingUser(null);
        setEditForm({ mocksAvailable: 0, role: 'student' });
    };

    const handleSaveUser = async () => {
        if (!editingUser) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/users/${editingUser._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });

            if (res.ok) {
                const data = await res.json();
                setUsers(prev => prev.map(u =>
                    u._id === editingUser._id ? data.user : u
                ));
                closeEditModal();
                alert('User updated successfully!');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to update user');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('An error occurred while saving');
        } finally {
            setSaving(false);
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

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-4">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {/* Users Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                        <tr>
                            <th className="p-4">User</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Mocks Available</th>
                            <th className="p-4 hidden md:table-cell">Joined</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                    No users found.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {user.image ? (
                                                <img
                                                    src={user.image}
                                                    alt={user.name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                                                    {(user.name || user.email || '?')[0].toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium text-gray-900">{user.name || 'No name'}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {user.role || 'student'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-semibold text-gray-900">{user.mocksAvailable || 0}</span>
                                    </td>
                                    <td className="p-4 hidden md:table-cell text-gray-500">
                                        {formatDate(user.createdAt)}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => openEditModal(user)}
                                            className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-xs font-medium"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Info */}
            {pagination && (
                <div className="text-sm text-gray-500 text-center">
                    Showing {users.length} of {pagination.total} users
                </div>
            )}

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 m-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit User</h3>

                        <div className="mb-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                {editingUser.image ? (
                                    <img
                                        src={editingUser.image}
                                        alt={editingUser.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-lg">
                                        {(editingUser.name || editingUser.email || '?')[0].toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <div className="font-medium text-gray-900">{editingUser.name || 'No name'}</div>
                                    <div className="text-sm text-gray-500">{editingUser.email}</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mocks Available</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={editForm.mocksAvailable}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, mocksAvailable: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={editForm.role}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    <option value="student">Student</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={closeEditModal}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveUser}
                                disabled={saving}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
