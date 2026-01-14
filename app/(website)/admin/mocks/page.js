import Link from 'next/link';

export default function MockTestsIndex() {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Mock Tests</h1>
                <Link
                    href="/admin/mocks/create"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    + Create New Mock Test
                </Link>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-500 mb-4">No mock tests found or list functionality not implemented yet.</p>
                <Link
                    href="/admin/mocks/create"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                >
                    Create your first mock test &rarr;
                </Link>
            </div>
        </div>
    );
}
