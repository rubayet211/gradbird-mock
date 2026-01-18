import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { auth } from '@/auth';

export async function GET(req, { params }) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const currentUser = await User.findById(session.user.id);
        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
        }

        const { id } = params;
        const user = await User.findById(id).lean();

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            ...user,
            _id: user._id.toString(),
            createdAt: user.createdAt?.toISOString() || null
        });

    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const currentUser = await User.findById(session.user.id);
        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
        }

        const { id } = params;
        const body = await req.json();
        const { mocksAvailable, role } = body;

        // Prevent self-demotion
        if (id === session.user.id && role && role !== 'admin') {
            return NextResponse.json({ error: 'Cannot demote yourself from admin' }, { status: 400 });
        }

        const updateFields = {};
        if (mocksAvailable !== undefined) {
            updateFields.mocksAvailable = parseInt(mocksAvailable);
        }
        if (role !== undefined && ['student', 'admin'].includes(role)) {
            updateFields.role = role;
        }

        const user = await User.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true }
        ).lean();

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'User updated successfully',
            user: {
                ...user,
                _id: user._id.toString(),
                createdAt: user.createdAt?.toISOString() || null
            }
        });

    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
