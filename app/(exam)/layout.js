'use client';

import { useParams } from 'next/navigation';
import { ExamProvider } from './contexts/ExamContext';
import SecurityGuard from './components/SecurityGuard';
import PrivacyScreen from './components/PrivacyScreen';

export default function ExamLayout({ children }) {
    const params = useParams();
    const sessionId = params?.sessionId;

    return (
        <ExamProvider sessionId={sessionId}>
            <SecurityGuard />
            <PrivacyScreen />
            <div className="min-h-screen bg-gray-800 flex flex-col">
                {children}
            </div>
        </ExamProvider>
    );
}

