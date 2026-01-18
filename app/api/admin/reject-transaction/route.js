import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import { auth } from '@/auth';

export async function PATCH(req) {
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

        const { transactionId, reason } = await req.json();

        if (!transactionId) {
            return NextResponse.json({ error: 'Missing transaction ID' }, { status: 400 });
        }

        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        if (transaction.status !== 'pending') {
            return NextResponse.json({ error: 'Transaction is not pending' }, { status: 400 });
        }

        // Update status to rejected
        transaction.status = 'rejected';
        if (reason) {
            transaction.rejectionReason = reason;
        }
        await transaction.save();

        return NextResponse.json({
            message: 'Transaction rejected',
            transaction
        });

    } catch (error) {
        console.error('Reject Transaction Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
