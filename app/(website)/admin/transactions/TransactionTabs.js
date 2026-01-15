'use client';

import { useState } from 'react';
import TransactionList from './TransactionList';

export default function TransactionTabs({ pendingTransactions, historyTransactions }) {
    const [activeTab, setActiveTab] = useState('pending');

    return (
        <div>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-zinc-700 mb-6">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'pending'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                >
                    Pending
                    {pendingTransactions.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">
                            {pendingTransactions.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                >
                    History
                    <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 dark:bg-zinc-700 dark:text-gray-300 rounded-full text-xs">
                        {historyTransactions.length}
                    </span>
                </button>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-zinc-800 shadow overflow-hidden sm:rounded-lg">
                {activeTab === 'pending' ? (
                    <TransactionList transactions={pendingTransactions} showHistory={false} />
                ) : (
                    <TransactionList transactions={historyTransactions} showHistory={true} />
                )}
            </div>
        </div>
    );
}
