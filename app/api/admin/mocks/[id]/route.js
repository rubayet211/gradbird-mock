import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MockTest from '@/models/MockTest';
import User from '@/models/User';
import { auth } from '@/auth';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = params;

        const mockTest = await MockTest.findById(id).lean();

        if (!mockTest) {
            return NextResponse.json({ success: false, error: 'Mock test not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                ...mockTest,
                _id: mockTest._id.toString(),
                createdAt: mockTest.createdAt?.toISOString() || null
            }
        });
    } catch (error) {
        console.error('Failed to fetch mock test:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const currentUser = await User.findById(session.user.id);
        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
        }

        const { id } = params;
        const body = await req.json();

        // Only allow toggling isActive via PATCH
        const { isActive } = body;

        const mockTest = await MockTest.findByIdAndUpdate(
            id,
            { $set: { isActive } },
            { new: true }
        ).lean();

        if (!mockTest) {
            return NextResponse.json({ success: false, error: 'Mock test not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                ...mockTest,
                _id: mockTest._id.toString(),
                createdAt: mockTest.createdAt?.toISOString() || null
            }
        });
    } catch (error) {
        console.error('Failed to update mock test:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const currentUser = await User.findById(session.user.id);
        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
        }

        const { id } = params;
        const body = await req.json();

        const mockTest = await MockTest.findByIdAndUpdate(
            id,
            body,
            { new: true }
        ).lean();

        if (!mockTest) {
            return NextResponse.json({ success: false, error: 'Mock test not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                ...mockTest,
                _id: mockTest._id.toString(),
                createdAt: mockTest.createdAt?.toISOString() || null
            }
        });
    } catch (error) {
        console.error('Failed to update mock test:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const currentUser = await User.findById(session.user.id);
        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
        }

        const { id } = params;

        const mockTest = await MockTest.findByIdAndDelete(id);

        if (!mockTest) {
            return NextResponse.json({ success: false, error: 'Mock test not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Mock test deleted' });
    } catch (error) {
        console.error('Failed to delete mock test:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
