'use client';

import { useState } from 'react';

// ===== STAT CARD COMPONENT =====
function StatCard({ label, value, subtext, color = 'text-indigo-600' }) {
    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</p>
            <p className={`text-3xl font-bold ${color} mt-1`}>{value}</p>
            {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
    );
}

// ===== BAR CHART COMPONENT =====
function BarChart({ data, labelKey = 'label', valueKey = 'value', maxItems = 10 }) {
    const items = data.slice(0, maxItems);
    const maxValue = Math.max(...items.map(d => d[valueKey]), 1);

    return (
        <div className="space-y-2">
            {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                    <div className="w-32 text-sm text-gray-600 truncate" title={item[labelKey]}>
                        {item[labelKey] || 'Unknown'}
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                        <div
                            className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${(item[valueKey] / maxValue) * 100}%` }}
                        />
                    </div>
                    <div className="w-12 text-sm font-medium text-gray-700 text-right">
                        {item[valueKey]}
                    </div>
                </div>
            ))}
            {items.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">No data available</p>
            )}
        </div>
    );
}

// ===== STATUS DISTRIBUTION (Horizontal stacked bar) =====
function StatusDistribution({ items }) {
    const total = items.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return <p className="text-gray-400 text-sm">No data</p>;

    const colors = ['bg-green-500', 'bg-amber-500', 'bg-red-500', 'bg-blue-500', 'bg-purple-500'];

    return (
        <div>
            <div className="flex h-8 rounded-lg overflow-hidden">
                {items.map((item, idx) => (
                    <div
                        key={idx}
                        className={`${colors[idx % colors.length]} transition-all duration-300`}
                        style={{ width: `${(item.value / total) * 100}%` }}
                        title={`${item.label}: ${item.value} (${Math.round((item.value / total) * 100)}%)`}
                    />
                ))}
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
                {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                        <span className={`w-3 h-3 rounded-full ${colors[idx % colors.length]}`} />
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-medium text-gray-800">{item.value}</span>
                        <span className="text-gray-400">({Math.round((item.value / total) * 100)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ===== PROGRESS CIRCLE =====
function ProgressCircle({ value, label, color = 'stroke-indigo-500' }) {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <svg width="100" height="100" className="transform -rotate-90">
                <circle
                    cx="50" cy="50" r={radius}
                    stroke="#e5e7eb" strokeWidth="8" fill="none"
                />
                <circle
                    cx="50" cy="50" r={radius}
                    className={color} strokeWidth="8" fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>
            <p className="text-2xl font-bold text-gray-800 -mt-16">{value}%</p>
            <p className="text-xs text-gray-500 mt-8">{label}</p>
        </div>
    );
}

// ===== SECTION CARD =====
function SectionCard({ title, children }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
            {children}
        </div>
    );
}

// ===== MAIN ANALYTICS COMPONENT =====
export default function AnalyticsDashboard({ data }) {
    const [activeTab, setActiveTab] = useState('tests');

    const tabs = [
        { id: 'tests', label: 'Tests' },
        { id: 'scores', label: 'Scores' },
        { id: 'payments', label: 'Payments' },
        { id: 'speaking', label: 'Speaking' },
        { id: 'mocks', label: 'Mocks' }
    ];

    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    label="Tests Completed"
                    value={data.tests.completed}
                    subtext={`${data.tests.completionRate}% completion rate`}
                    color="text-green-600"
                />
                <StatCard
                    label="Avg Band Score"
                    value={data.scores.averages.overall || '-'}
                    subtext={`${data.scores.gradedCount} graded`}
                    color="text-indigo-600"
                />
                <StatCard
                    label="Pending Transactions"
                    value={data.payments.pending}
                    subtext={`${data.payments.approvalRate}% approval rate`}
                    color="text-amber-600"
                />
                <StatCard
                    label="Speaking Slots"
                    value={`${data.speaking.bookedSlots}/${data.speaking.totalSlots}`}
                    subtext={`${data.speaking.bookingRate}% booked`}
                    color="text-purple-600"
                />
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tab.id
                                    ? 'bg-white text-indigo-600 border border-b-white border-gray-200 -mb-px'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'tests' && <TestsTab data={data.tests} />}
                {activeTab === 'scores' && <ScoresTab data={data.scores} />}
                {activeTab === 'payments' && <PaymentsTab data={data.payments} />}
                {activeTab === 'speaking' && <SpeakingTab data={data.speaking} />}
                {activeTab === 'mocks' && <MocksTab data={data.mocks} />}
            </div>
        </div>
    );
}

// ===== TAB COMPONENTS =====
function TestsTab({ data }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Test Status Distribution">
                <StatusDistribution
                    items={[
                        { label: 'Completed', value: data.completed },
                        { label: 'In Progress', value: data.inProgress },
                        { label: 'Abandoned', value: data.abandoned }
                    ]}
                />
            </SectionCard>
            <SectionCard title="Completion Rate">
                <div className="flex justify-center py-4">
                    <ProgressCircle
                        value={data.completionRate}
                        label="of started tests completed"
                        color="stroke-green-500"
                    />
                </div>
            </SectionCard>
            <SectionCard title="Tests by Mock Test">
                <BarChart
                    data={data.byMock.map(m => ({ label: m.title, value: m.count }))}
                    labelKey="label"
                    valueKey="value"
                />
            </SectionCard>
            <SectionCard title="Tests by Type">
                <StatusDistribution
                    items={data.byType.map(t => ({ label: t.type, value: t.count }))}
                />
            </SectionCard>
        </div>
    );
}

function ScoresTab({ data }) {
    const modules = [
        { key: 'reading', label: 'Reading', color: 'bg-blue-500' },
        { key: 'listening', label: 'Listening', color: 'bg-green-500' },
        { key: 'writing', label: 'Writing', color: 'bg-amber-500' },
        { key: 'speaking', label: 'Speaking', color: 'bg-purple-500' }
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Average Scores by Module">
                <div className="space-y-4">
                    {modules.map(mod => (
                        <div key={mod.key} className="flex items-center gap-3">
                            <div className="w-24 text-sm text-gray-600">{mod.label}</div>
                            <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                                <div
                                    className={`${mod.color} h-full rounded-full flex items-center justify-end pr-2`}
                                    style={{ width: `${(data.averages[mod.key] / 9) * 100}%` }}
                                >
                                    <span className="text-xs font-medium text-white">
                                        {data.averages[mod.key]}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="border-t pt-3 flex items-center gap-3">
                        <div className="w-24 text-sm font-medium text-gray-800">Overall</div>
                        <div className="text-2xl font-bold text-indigo-600">
                            {data.averages.overall}
                        </div>
                    </div>
                </div>
            </SectionCard>
            <SectionCard title="Score Distribution">
                <BarChart
                    data={data.distribution.map(d => ({
                        label: d.band === 'other' ? 'Other' : `Band ${d.band}+`,
                        value: d.count
                    }))}
                    labelKey="label"
                    valueKey="value"
                />
            </SectionCard>
            <SectionCard title="Grading Status">
                <div className="flex items-center gap-8">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-green-600">{data.gradedCount}</p>
                        <p className="text-sm text-gray-500">Fully Graded</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-amber-600">{data.pendingGrading}</p>
                        <p className="text-sm text-gray-500">Pending Grading</p>
                    </div>
                </div>
            </SectionCard>
        </div>
    );
}

function PaymentsTab({ data }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Transaction Status">
                <StatusDistribution
                    items={[
                        { label: 'Approved', value: data.approved },
                        { label: 'Pending', value: data.pending },
                        { label: 'Rejected', value: data.rejected }
                    ]}
                />
            </SectionCard>
            <SectionCard title="Approval Rate">
                <div className="flex justify-center py-4">
                    <ProgressCircle
                        value={data.approvalRate}
                        label="of transactions approved"
                        color="stroke-green-500"
                    />
                </div>
            </SectionCard>
            <SectionCard title="Transactions by Package">
                <BarChart
                    data={data.byPackage.map(p => ({ label: p.title, value: p.count }))}
                    labelKey="label"
                    valueKey="value"
                />
            </SectionCard>
            <SectionCard title="Recent Transactions">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {data.recent.map(tx => (
                        <div key={tx._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                            <div>
                                <p className="text-sm font-medium text-gray-800">{tx.user?.name || 'Unknown'}</p>
                                <p className="text-xs text-gray-500">{tx.package}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium">৳{tx.amount}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${tx.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        tx.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                            'bg-red-100 text-red-700'
                                    }`}>
                                    {tx.status}
                                </span>
                            </div>
                        </div>
                    ))}
                    {data.recent.length === 0 && (
                        <p className="text-gray-400 text-sm text-center py-4">No transactions yet</p>
                    )}
                </div>
            </SectionCard>
        </div>
    );
}

function SpeakingTab({ data }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Slot Overview">
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-3xl font-bold text-indigo-600">{data.totalSlots}</p>
                        <p className="text-sm text-gray-500">Total Slots</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-3xl font-bold text-green-600">{data.bookedSlots}</p>
                        <p className="text-sm text-gray-500">Booked</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-3xl font-bold text-amber-600">{data.availableSlots}</p>
                        <p className="text-sm text-gray-500">Available</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-3xl font-bold text-blue-600">{data.upcomingSlots}</p>
                        <p className="text-sm text-gray-500">Upcoming</p>
                    </div>
                </div>
            </SectionCard>
            <SectionCard title="Booking Rate">
                <div className="flex justify-center py-4">
                    <ProgressCircle
                        value={data.bookingRate}
                        label="of slots booked"
                        color="stroke-purple-500"
                    />
                </div>
            </SectionCard>
        </div>
    );
}

function MocksTab({ data }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Mock Test Status">
                <StatusDistribution
                    items={[
                        { label: 'Active', value: data.active },
                        { label: 'Inactive', value: data.inactive }
                    ]}
                />
            </SectionCard>
            <SectionCard title="Mocks by Type">
                <StatusDistribution
                    items={data.byType.map(t => ({ label: t.type, value: t.count }))}
                />
            </SectionCard>
            <SectionCard title="Summary">
                <div className="flex items-center gap-8">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-green-600">{data.active}</p>
                        <p className="text-sm text-gray-500">Active</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-gray-400">{data.inactive}</p>
                        <p className="text-sm text-gray-500">Inactive</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-indigo-600">{data.total}</p>
                        <p className="text-sm text-gray-500">Total</p>
                    </div>
                </div>
            </SectionCard>
        </div>
    );
}
