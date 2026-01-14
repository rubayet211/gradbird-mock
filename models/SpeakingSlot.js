import mongoose from 'mongoose';

const SpeakingSlotSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: [true, 'Please provide a date for this slot.'],
    },
    time: {
        type: String,
        required: [true, 'Please provide a time for this slot.'],
    },
    meetingLink: {
        type: String,
        required: [true, 'Please provide a meeting link for this slot.'],
    },
    bookedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.SpeakingSlot || mongoose.model('SpeakingSlot', SpeakingSlotSchema);
