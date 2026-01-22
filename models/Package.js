import mongoose from 'mongoose';

const PackageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    discount: { // Discount amount or percentage description? User said "add a discount". I'll treat it as a display string or value. Let's make it a number for discount amount.
        type: Number,
        default: 0,
    },
    mocks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MockTest',
    }],
    totalMocks: {
        type: Number,
        default: 0, // Can be auto-calculated
    },
    features: {
        type: [String],
        default: [],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Package || mongoose.model('Package', PackageSchema);
