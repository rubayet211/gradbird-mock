import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import Package from '@/models/Package';
import { auth } from '@/auth'; // Assuming auth is exported from @/auth

export async function POST(req) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { packageId, phoneNumber, bkashTxId } = await req.json();

        if (!packageId || !phoneNumber || !bkashTxId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await connectDB();

        const pkg = await Package.findById(packageId);
        if (!pkg) {
            return NextResponse.json({ error: 'Package not found' }, { status: 404 });
        }

        // Create Transaction
        const transaction = await Transaction.create({
            user: session.user.id, // Ensure your session has user.id. NextAuth typically puts it there with the right callbacks.
            package: packageId,
            amount: pkg.price,
            phoneNumber,
            bkashTxId,
            status: 'pending',
        });

        return NextResponse.json({
            message: 'Transaction created successfully',
            transaction
        }, { status: 201 });

    } catch (error) {
        console.error('Purchase API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
