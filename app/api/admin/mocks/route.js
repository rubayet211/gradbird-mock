import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MockTest from '@/models/MockTest';

export async function POST(req) {
    try {
        await dbConnect();
        const data = await req.json();

        // Basic backend validation can be added here, 
        // essentially we trust the strict schema to do most heavy lifting.

        const mockTest = await MockTest.create(data);

        return NextResponse.json({ success: true, data: mockTest }, { status: 201 });
    } catch (error) {
        console.error('Failed to create mock test:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
