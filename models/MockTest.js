import mongoose from 'mongoose';

const MockTestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title for this mock test.'],
    },
    description: {
        type: String,
    },
    readingContent: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    listeningContent: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    writingContent: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
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

export default mongoose.models.MockTest || mongoose.model('MockTest', MockTestSchema);
