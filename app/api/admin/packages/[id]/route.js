import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Package from '@/models/Package';
import { auth } from '@/auth';
import User from '@/models/User';

export async function GET(req, { params }) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { id } = params;
        const pkg = await Package.findById(id).populate('mocks');

        if (!pkg) {
            return NextResponse.json({ error: 'Package not found' }, { status: 404 });
        }

        return NextResponse.json(pkg);
    } catch (error) {
        console.error('Error fetching package:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Admin check
        const currentUser = await User.findById(session.user.id);
        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = params;
        const body = await req.json();
        const { title, description, price, discount, mocks, features, isActive } = body;

        const pkg = await Package.findById(id);
        if (!pkg) {
            return NextResponse.json({ error: 'Package not found' }, { status: 404 });
        }

        pkg.title = title || pkg.title;
        pkg.description = description || pkg.description;
        if (price !== undefined) pkg.price = price;
        if (discount !== undefined) pkg.discount = discount;
        if (mocks !== undefined) {
            pkg.mocks = mocks;
            pkg.totalMocks = mocks.length;
        }
        if (features !== undefined) pkg.features = features;
        if (isActive !== undefined) pkg.isActive = isActive;

        await pkg.save();

        return NextResponse.json(pkg);
    } catch (error) {
        console.error('Error updating package:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Admin check
        const currentUser = await User.findById(session.user.id);
        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = params;
        const pkg = await Package.findByIdAndDelete(id);

        if (!pkg) {
            return NextResponse.json({ error: 'Package not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Package deleted successfully' });
    } catch (error) {
        console.error('Error deleting package:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
