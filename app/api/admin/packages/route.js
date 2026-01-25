import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Package from '@/models/Package';
import { auth } from '@/auth';
import User from '@/models/User';

export async function GET(req) {
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

        const packages = await Package.find().populate('mocks', 'title type moduleType').sort({ createdAt: -1 });
        return NextResponse.json(packages);
    } catch (error) {
        console.error('Error fetching packages:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req) {
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

        const body = await req.json();
        const { title, description, price, discount, mocks, features, isActive } = body;

        // Validation
        if (!title || !description || price === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newPackage = await Package.create({
            title,
            description,
            price,
            discount: discount || 0,
            mocks: mocks || [],
            totalMocks: mocks ? mocks.length : 0,
            features: features || [],
            isActive: isActive !== undefined ? isActive : true,
        });

        return NextResponse.json(newPackage, { status: 201 });
    } catch (error) {
        console.error('Error creating package:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
