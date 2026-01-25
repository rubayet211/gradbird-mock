import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Package from '@/models/Package';

export async function GET(req) {
    try {
        await connectDB();

        // Return only active packages
        // Populate mocks just to show titles if needed, or keep it light
        const packages = await Package.find({ isActive: true })
            .select('-__v') // Exclude internal version key
            .populate('mocks', 'title type moduleType')
            .sort({ order: 1, createdAt: -1 }); // Assume order field might exist later, or just sorting by date

        return NextResponse.json(packages);
    } catch (error) {
        console.error('Error fetching public packages:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
