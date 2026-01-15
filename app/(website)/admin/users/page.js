import connectDB from '@/lib/db';
import User from '@/models/User';
import UserList from './UserList';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

async function getUsers() {
    await connectDB();

    const users = await User.find()
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

    return {
        users: users.map(u => ({
            ...u,
            _id: u._id.toString(),
            createdAt: u.createdAt?.toISOString() || null
        })),
        pagination: {
            total: await User.countDocuments(),
            page: 1,
            limit: 50
        }
    };
}

export default async function AdminUsersPage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect('/api/auth/signin');
    }

    await connectDB();
    const currentUser = await User.findById(session.user.id).lean();
    if (!currentUser || currentUser.role !== 'admin') {
        redirect('/');
    }

    const { users, pagination } = await getUsers();

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-500 mt-1">View and manage registered users</p>
            </div>
            <UserList initialUsers={users} pagination={pagination} />
        </div>
    );
}
