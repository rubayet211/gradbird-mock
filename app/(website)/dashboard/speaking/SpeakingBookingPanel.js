'use client';

import { useState } from 'react';

export default function SpeakingBookingPanel({ initialAvailableSlots, initialMyBookings, canBook }) {
    const [availableSlots, setAvailableSlots] = useState(initialAvailableSlots);
    const [myBookings, setMyBookings] = useState(initialMyBookings);
    const [bookingSlotId, setBookingSlotId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleBook = async (slotId) => {
        setBookingSlotId(slotId);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/speaking-slots/book', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slotId }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to book slot');
            }

            // Remove from available, add to my bookings
            const bookedSlot = availableSlots.find(s => s._id === slotId);
            setAvailableSlots(availableSlots.filter(s => s._id !== slotId));
            setMyBookings([...myBookings, {
                ...bookedSlot,
                meetingLink: data.slot.meetingLink,
            }].sort((a, b) => new Date(a.date) - new Date(b.date)));

            setSuccess('Slot booked successfully! You can now see the meeting link below.');
        } catch (err) {
            setError(err.message);
        } finally {
            setBookingSlotId(null);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (timeStr) => {
        // Convert 24h to 12h format
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    return (
        <div className="space-y-8">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg">
                    {success}
                </div>
            )}

            {/* My Booked Slots */}
            {myBookings.length > 0 && (
                <div className="bg-white dark:bg-zinc-800 shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-zinc-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Your Booked Sessions
                        </h2>
                    </div>
                    <ul className="divide-y divide-gray-200 dark:divide-zinc-700">
                        {myBookings.map((slot) => (
                            <li key={slot._id} className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                                            {formatDate(slot.date)}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {formatTime(slot.time)}
                                        </p>
                                    </div>
                                    <a
                                        href={slot.meetingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        Join Meeting
                                    </a>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Available Slots */}
            <div className="bg-white dark:bg-zinc-800 shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-zinc-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Available Slots
                    </h2>
                </div>
                {availableSlots.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        No available slots at the moment. Please check back later.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-zinc-700">
                        {availableSlots.map((slot) => (
                            <li key={slot._id} className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                                            {formatDate(slot.date)}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {formatTime(slot.time)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleBook(slot._id)}
                                        disabled={!canBook || bookingSlotId === slot._id}
                                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${canBook
                                                ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                                                : 'bg-gray-400 cursor-not-allowed'
                                            } disabled:opacity-50`}
                                    >
                                        {bookingSlotId === slot._id ? 'Booking...' : canBook ? 'Book' : 'No credits'}
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {!canBook && availableSlots.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded-lg text-center">
                    You have used all your available mock test bookings.
                    <a href="/payment" className="ml-1 underline font-medium">Purchase more</a> to book additional slots.
                </div>
            )}
        </div>
    );
}
