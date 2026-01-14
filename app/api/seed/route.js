import connectDB from '@/lib/db';
import Package from '@/models/Package';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await connectDB();

        const existingPackages = await Package.find({});

        if (existingPackages.length > 0) {
            return NextResponse.json({
                message: 'Packages already seeded',
                packages: existingPackages
            });
        }

        const dummyPackages = [
            {
                title: 'Basic',
                price: 500,
                totalMocks: 5,
                features: ['5 Mock Tests', 'Basic Analytics', 'Email Support']
            },
            {
                title: 'Standard',
                price: 1000,
                totalMocks: 15,
                features: ['15 Mock Tests', 'Advanced Analytics', 'Priority Email Support', '1 Expert Review']
            },
            {
                title: 'Premium',
                price: 2000,
                totalMocks: 50,
                features: ['50 Mock Tests', 'Full Analytics Suite', '24/7 Support', '5 Expert Reviews', 'Money Back Guarantee']
            }
        ];

        const createdPackages = await Package.insertMany(dummyPackages);

        return NextResponse.json({
            message: 'Packages seeded successfully',
            packages: createdPackages
        });

    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
