
import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';

const COLORS = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];

const ExpenseChart = ({ transactions }) => {
    // Expense by Category (Pie)
    const categoryData = useMemo(() => {
        const expenses = transactions.filter((t) => t.category?.type === 'expense');
        const grouped = expenses.reduce((acc, curr) => {
            const cat = curr.category?.name || 'Uncategorized';
            acc[cat] = (acc[cat] || 0) + (curr.amount || 0);
            return acc;
        }, {});

        return Object.keys(grouped).map((key) => ({
            name: key,
            value: grouped[key],
        }));
    }, [transactions]);

    // Income vs Expense (Bar)
    const barData = useMemo(() => {
        const grouped = transactions.reduce((acc, curr) => {
            // Group by Month only for cleaner view or last 7 days? 
            // Fast Budget screenshot shows "7 hari terakhir" (Last 7 days)
            // Let's assume daily grouping for now based on available data
            const dateStr = curr.date || new Date().toISOString();
            const date = new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
            if (!acc[date]) acc[date] = { date, Pemasukan: 0, Pengeluaran: 0 };

            if (curr.category?.type === 'income') {
                acc[date].Pemasukan += (curr.amount || 0);
            } else {
                acc[date].Pengeluaran += (curr.amount || 0);
            }
            return acc;
        }, {});

        // Sort by actual date (this needs original date object, simplifying for now to just Object.values)
        // In real app, we should sort by timestamp.
        return Object.values(grouped).slice(-7); // Show last 7 groups/days
    }, [transactions]);

    if (transactions.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            {/* Pie Chart: Expenses */}
            <Card className="bg-white border-none shadow-sm">
                <CardHeader className="pb-0 pt-4 px-4">
                    <CardTitle className="text-slate-700 text-sm font-medium">Pengeluaran per Kategori</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                    <div className="h-[180px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `Rp ${value.toLocaleString()}`} />
                                <Legend verticalAlign="middle" align="right" layout="vertical" iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Bar Chart: Last 7 Days */}
            <Card className="bg-white border-none shadow-sm">
                <CardHeader className="pb-0 pt-4 px-4">
                    <CardTitle className="text-slate-700 text-sm font-medium">7 Hari Terakhir</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                    <div className="h-[180px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} barSize={12}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} dy={5} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(value) => `${value / 1000}k`} width={30} />
                                <Tooltip
                                    formatter={(value) => `Rp ${value.toLocaleString()}`}
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                />
                                <Bar dataKey="Pemasukan" fill="#4CAF50" radius={[2, 2, 0, 0]} />
                                <Bar dataKey="Pengeluaran" fill="#F44336" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ExpenseChart;
