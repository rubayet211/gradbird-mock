"use client";

import { useState } from 'react';
import ImageUploader from '../../../components/ImageUploader';

export default function Step4Writing({ data, updateData }) {

    const updateTask1 = (field, value) => {
        updateData({
            writing: {
                ...data.writing,
                task1: { ...data.writing.task1, [field]: value }
            }
        });
    };

    const updateTask2 = (field, value) => {
        updateData({
            writing: {
                ...data.writing,
                task2: { ...data.writing.task2, [field]: value }
            }
        });
    };

    return (
        <div className="space-y-8">
            <h2 className="text-xl font-semibold text-gray-800">Writing Module</h2>

            <div className="p-6 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
                <h3 className="text-lg font-medium text-gray-800">Task 1</h3>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Prompt Text</label>
                    <textarea
                        value={data.writing.task1?.promptText || ''}
                        onChange={(e) => updateTask1('promptText', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                        placeholder="Summarize the chart below..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Task 1 Image (Chart/Diagram)</label>
                    <ImageUploader
                        value={data.writing.task1?.imageUrls?.[0] || ''}
                        onChange={(url) => updateTask1('imageUrls', url ? [url] : [])}
                        label="Upload chart or diagram image (PNG, JPG)"
                    />
                </div>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
                <h3 className="text-lg font-medium text-gray-800">Task 2</h3>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Prompt Text</label>
                    <textarea
                        value={data.writing.task2?.promptText || ''}
                        onChange={(e) => updateTask2('promptText', e.target.value)}
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                        placeholder="Discuss both views and give your opinion..."
                    />
                </div>
            </div>
        </div>
    );
}
