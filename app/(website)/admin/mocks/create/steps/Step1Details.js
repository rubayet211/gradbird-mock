"use client";

import { useState } from 'react';

export default function Step1Details({ data, updateData }) {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Test Details</h2>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Test Title</label>
                <input
                    type="text"
                    value={data.title}
                    onChange={(e) => updateData({ title: e.target.value })}
                    placeholder="e.g. Cambridge 18 Test 1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500">Give a descriptive title for the mock test.</p>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Test Type</label>
                <select
                    value={data.type}
                    onChange={(e) => updateData({ type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                    <option value="Academic">Academic</option>
                    <option value="General Training">General Training</option>
                </select>
            </div>
        </div>
    );
}
