import { ExamProvider } from './contexts/ExamContext';
import SecurityGuard from './components/SecurityGuard';

export const metadata = {
    title: 'IELTS Exam - Computer Delivered Test',
    description: 'IELTS Computer-Delivered Exam Interface',
};

export default function ExamLayout({ children }) {
    return (
        <ExamProvider>
            <SecurityGuard />
            <div className="min-h-screen bg-gray-800 flex flex-col">
                {children}
            </div>
        </ExamProvider>
    );
}
