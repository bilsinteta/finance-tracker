import { useState } from 'react';
import { authService } from '../api/authService';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { FiMenu } from 'react-icons/fi';

const Settings = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [passwords, setPasswords] = useState({ old_password: '', new_password: '' });
    const [loading, setLoading] = useState(false);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.changePassword(passwords);
            alert('Password berhasil diubah!');
            setPasswords({ old_password: '', new_password: '' });
        } catch (error) {
            alert(error.response?.data?.error || 'Gagal mengubah password');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('PERINGATAN: Apakah Anda yakin ingin menghapus akun? Data tidak dapat dikembalikan!')) {
            if (window.confirm('Yakin 100%? Ini langkah terakhir.')) {
                try {
                    await authService.deleteAccount();
                    authService.logout();
                    navigate('/login');
                } catch (error) {
                    alert('Gagal menghapus akun');
                }
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 sm:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="sm:ml-64 flex flex-col min-h-screen transition-all duration-300">
                <header className="bg-blue-500 text-white shadow-md h-16 flex items-center justify-between px-6 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button className="sm:hidden p-1 rounded hover:bg-white/20" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            <FiMenu className="h-6 w-6" />
                        </button>
                        <h1 className="text-xl font-semibold tracking-wide">Pengaturan</h1>
                    </div>
                </header>

                <main className="flex-1 p-6 space-y-6 max-w-2xl mx-auto w-full">
                    {/* Security Section */}
                    <Card className="bg-white border-none shadow-sm">
                        <CardContent className="p-6">
                            <h2 className="text-lg font-semibold text-slate-700 mb-4">Keamanan</h2>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Password Lama</label>
                                    <Input
                                        type="password"
                                        value={passwords.old_password}
                                        onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Password Baru</label>
                                    <Input
                                        type="password"
                                        value={passwords.new_password}
                                        onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                                        required
                                    />
                                </div>
                                <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                                    {loading ? 'Memproses...' : 'Ubah Password'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="bg-white border-2 border-red-100 shadow-sm">
                        <CardContent className="p-6">
                            <h2 className="text-lg font-semibold text-red-600 mb-2">Zona Bahaya</h2>
                            <p className="text-sm text-slate-500 mb-4">
                                Menghapus akun akan menghapus semua data transaksi Anda secara permanen. Tindakan ini tidak dapat dibatalkan.
                            </p>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteAccount}
                                className="w-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                            >
                                Hapus Akun Saya
                            </Button>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
};

export default Settings;
