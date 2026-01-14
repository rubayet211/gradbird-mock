import mongoose from 'mongoose';

const PackageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    totalMocks: {
        type: Number,
        required: true,
    },
    features: {
        type: [String],
        default: [],
    },
});

export default mongoose.models.Package || mongoose.model('Package', PackageSchema);
