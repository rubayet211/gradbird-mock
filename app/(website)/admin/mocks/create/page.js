"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Step1Details from './steps/Step1Details';
import Step2Listening from './steps/Step2Listening';
import Step3Reading from './steps/Step3Reading';
import Step4Writing from './steps/Step4Writing';

export default function CreateMockPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);

    const [testData, setTestData] = useState({
        title: '',
        type: 'Academic',
        moduleType: 'Full',
        listening: {
            parts: [
                { partNumber: 1, title: 'Part 1: Conversation', audioUrl: '', transcript: '', questions: [] },
                { partNumber: 2, title: 'Part 2: Monologue', audioUrl: '', transcript: '', questions: [] },
                { partNumber: 3, title: 'Part 3: Discussion', audioUrl: '', transcript: '', questions: [] },
                { partNumber: 4, title: 'Part 4: Academic Lecture', audioUrl: '', transcript: '', questions: [] }
            ]
        },
        reading: {
            sections: [
                { title: 'Section 1', passageText: '', questions: [] },
                { title: 'Section 2', passageText: '', questions: [] },
                { title: 'Section 3', passageText: '', questions: [] }
            ]
        },
        writing: {
            task1: { promptText: '', imageUrls: [] },
            task2: { promptText: '' }
        }
    });

    const updateData = (newData) => {
        setTestData(prev => ({ ...prev, ...newData }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/admin/mocks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to save mock test');
            }

            alert('Mock Test created successfully!');
            router.push('/admin');
        } catch (error) {
            console.error(error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const allSteps = [
        { id: 1, title: 'Details', component: Step1Details },
        { id: 2, title: 'Listening', component: Step2Listening },
        { id: 3, title: 'Reading', component: Step3Reading },
        { id: 4, title: 'Writing', component: Step4Writing },
    ];

    let steps = [];
    if (testData.moduleType === 'Full') {
        steps = allSteps;
    } else if (testData.moduleType === 'Listening') {
        steps = [allSteps[0], allSteps[1]];
    } else if (testData.moduleType === 'Reading') {
        steps = [allSteps[0], allSteps[2]];
    } else if (testData.moduleType === 'Writing') {
        steps = [allSteps[0], allSteps[3]];
    } else if (testData.moduleType === 'Speaking') {
        steps = [allSteps[0]];
    }

    // Remap IDs to be sequential based on the filtered steps
    const activeSteps = steps.map((s, index) => ({
        ...s,
        id: index + 1,
        // Keep original component but remap the ID for the stepper UI
    }));

    const CurrentComponent = activeSteps.find(s => s.id === currentStep)?.component || Step1Details;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Mock Test</h1>
                <p className="text-gray-600">Follow the steps to configure the {testData.moduleType === 'Full' ? 'full IELTS' : `${testData.moduleType}`} mock test.</p>
            </div>

            {/* Stepper */}
            <div className="mb-8">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10" />
                    {activeSteps.map((step) => (
                        <div
                            key={step.id}
                            onClick={() => setCurrentStep(step.id)}
                            className={`flex flex-col items-center cursor-pointer bg-white px-2 ${currentStep === step.id ? 'opacity-100' : 'opacity-60'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${currentStep >= step.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-500'
                                }`}>
                                {step.id}
                            </div>
                            <span className={`text-sm font-medium ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                                }`}>
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-[400px]">
                <CurrentComponent data={testData} updateData={updateData} />
            </div>

            {/* Actions */}
            <div className="mt-8 flex justify-between">
                <button
                    onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                    disabled={currentStep === 1}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Back
                </button>

                {currentStep < activeSteps.length ? (
                    <button
                        onClick={() => setCurrentStep(prev => Math.min(activeSteps.length, prev + 1))}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                        Next: {activeSteps.find(s => s.id === currentStep + 1)?.title}
                    </button>
                ) : (
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-70 flex items-center gap-2"
                    >
                        {isSaving ? 'Saving...' : 'Save Mock Test'}
                    </button>
                )}
            </div>
        </div>
    );
}
