import Link from "next/link";

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Welcome to the GradBirds admin panel.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard
                    title="Transactions"
                    description="Manage payment transactions"
                    href="/admin/transactions"
                    color="bg-blue-500"
                />
                <DashboardCard
                    title="Users"
                    description="Manage registered users"
                    href="/admin/users"
                    color="bg-green-500"
                />
                <DashboardCard
                    title="Mock Tests"
                    description="Create and edit mock tests"
                    href="/admin/mocks"
                    color="bg-purple-500"
                />
                <DashboardCard
                    title="Speaking Slots"
                    description="Manage speaking test slots"
                    href="/admin/speaking"
                    color="bg-orange-500"
                />
            </div>
        </div>
    );
}

function DashboardCard({ title, description, href, color }) {
    return (
        <Link href={href} className="block group">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white mb-4`}>
                    {/* Simple dot icon for now, or just the first letter */}
                    <span className="text-xl font-bold">{title[0]}</span>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>
        </Link>
    );
}
