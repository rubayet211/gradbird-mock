import connectDB from '@/lib/db';
import Package from '@/models/Package';
import MockTest from '@/models/MockTest';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await connectDB();

        let packageResult = 'Packages already seeded';
        let mockTestResult = 'Mock tests already seeded';

        // Seed packages
        const existingPackages = await Package.find({});
        if (existingPackages.length === 0) {
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
            await Package.insertMany(dummyPackages);
            packageResult = 'Packages seeded successfully';
        }

        // Seed mock tests
        const existingMockTests = await MockTest.find({});
        if (existingMockTests.length === 0) {
            const dummyMockTests = [
                {
                    title: 'IELTS Academic Mock Test 1',
                    description: 'Full IELTS Academic practice test with Reading, Listening, and Writing sections.',
                    isActive: true,
                },
                {
                    title: 'IELTS Academic Mock Test 2',
                    description: 'Comprehensive IELTS Academic practice covering all sections.',
                    isActive: true,
                },
                {
                    title: 'IELTS Academic Mock Test 3',
                    description: 'Advanced IELTS Academic practice test for final preparation.',
                    isActive: true,
                },
            ];
            await MockTest.insertMany(dummyMockTests);
            mockTestResult = 'Mock tests seeded successfully';
        }

        return NextResponse.json({
            message: 'Seeding complete',
            packages: packageResult,
            mockTests: mockTestResult,
        });

    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

