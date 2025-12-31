import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import Button from './ui/Button';
import axios from '../api/axios';
import { FiCpu, FiRefreshCw } from 'react-icons/fi';

const AiInsightCard = ({ transactions }) => {
    const [insight, setInsight] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateInsight = async () => {
        setLoading(true);
        setError(null);
        try {
            // Prepare data: simplify to type, amount, category, date
            const dataForAi = transactions.map(tx => ({
                date: tx.date,
                amount: tx.amount,
                category: tx.category?.name || 'Uncategorized',
                type: tx.category?.type
            })).slice(0, 50); // Limit context

            const response = await axios.post('/ai/insight', { transactions: dataForAi });
            setInsight(response.data.insight);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Gagal menghubungi server AI.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100 shadow-sm relative overflow-hidden">
            {/* Decorative background shape */}
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-indigo-100 opacity-50 blur-xl"></div>

            <CardHeader className="pb-2 relative z-10">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-indigo-900 flex items-center gap-2 text-lg">
                        <FiCpu className="text-indigo-600" />
                        Analisis AI
                    </CardTitle>
                    {!insight && !loading && (
                        <Button size="sm" onClick={generateInsight} className="bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-md">
                            Analisa Sekarang ✨
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="relative z-10">
                {loading ? (
                    <div className="flex flex-col items-center py-6 text-indigo-400 gap-3 animate-pulse">
                        <FiRefreshCw className="h-6 w-6 animate-spin" />
                        <span className="text-sm font-medium">Sedang berpikir...</span>
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md border border-red-100">
                        {error}
                        <div className="mt-2 text-center">
                            <Button variant="outline" size="xs" onClick={generateInsight} className="text-red-600 border-red-200 hover:bg-red-50">Coba Lagi</Button>
                        </div>
                    </div>
                ) : insight ? (
                    <div className="space-y-4">
                        <div className="prose prose-sm prose-indigo text-slate-700 bg-white/60 p-4 rounded-lg border border-indigo-50/50 shadow-sm leading-relaxed whitespace-pre-line">
                            {insight}
                        </div>
                        <div className="flex justify-end">
                            <Button variant="ghost" size="sm" onClick={generateInsight} className="text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50">
                                <FiRefreshCw className="mr-2 h-3 w-3" /> Refresh
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-slate-500 text-sm py-2">
                        Dapatkan saran finansial cerdas berdasarkan riwayat transaksimu.
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AiInsightCard;
