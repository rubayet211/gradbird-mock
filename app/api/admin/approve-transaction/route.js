import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import Package from '@/models/Package'; // Needed to look up totalMocks
import { auth } from '@/auth';

export async function PATCH(req) {
    try {
        const session = await auth();

        // 1. Check Authentication & Admin Role
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // NOTE: In a real app, strict role checking should be here.
        // Assuming session.user.role is populated from the DB or you fetch the user to check.
        // I will fetch the user to be sure.
        await connectDB();
        const currentUser = await User.findById(session.user.id);
        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
        }

        const { transactionId } = await req.json();

        if (!transactionId) {
            return NextResponse.json({ error: 'Missing transaction ID' }, { status: 400 });
        }

        // 2. Find Transaction
        const transaction = await Transaction.findById(transactionId).populate('package'); // Populate package to get totalMocks
        if (!transaction) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        if (transaction.status === 'approved') {
            return NextResponse.json({ error: 'Transaction already approved' }, { status: 400 });
        }

        // 3. Update Transaction Status
        transaction.status = 'approved';
        await transaction.save();

        // 4. Credit User with Mocks/Package
        // The transaction has a user field (ObjectId).
        const targetUser = await User.findById(transaction.user);
        if (targetUser) {
            const pkg = transaction.package;

            // Check if package has specific mocks (Content Package)
            if (pkg.mocks && pkg.mocks.length > 0) {
                // Add package to user's purchasedPackages (avoid duplicates)
                if (!targetUser.purchasedPackages.includes(pkg._id)) {
                    targetUser.purchasedPackages.push(pkg._id);
                }
                // Also increment mocksAvailable if it's used as a generic counter for "how many mocks can I take"
                // But if the system is shifting to specific access, better not to confuse it.
                // However, for safety/hybrid support:
                // targetUser.mocksAvailable = (targetUser.mocksAvailable || 0) + (pkg.totalMocks || 0); 
                // I will NOT increment mocksAvailable if it's a specific package purchase to prevents reusing credits on other mocks.
            } else {
                // Legacy Credit Package (No specific mocks, just count)
                const mocksToAdd = pkg.totalMocks || 0;
                targetUser.mocksAvailable = (targetUser.mocksAvailable || 0) + mocksToAdd;
            }

            await targetUser.save();
        }

        return NextResponse.json({ message: 'Transaction approved and user credited', transaction });

    } catch (error) {
        console.error('Approve Transaction Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
