'use client';

import ExamHeader from '../../components/ExamHeader';
import WritingInterface from '../../components/WritingInterface';

export default function ExamPage({ params }) {
    return (
        <div className="h-screen flex flex-col overflow-hidden">
            {/* Header */}
            <ExamHeader />

            {/* Main Content Area - Writing Interface */}
            <WritingInterface />
        </div>
    );
}
