import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registrasi gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded bg-orange-500 text-white shadow-sm mb-4">
            <span className="text-2xl font-bold">💰</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Daftar Akun Baru
          </h1>
          <p className="text-slate-500 mt-2">
            Mulai atur keuanganmu dengan lebih baik
          </p>
        </div>

        <Card className="bg-white border-none shadow-sm">
          <CardContent className="p-8">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nama Lengkap</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-3.5 text-slate-400 h-4 w-4" />
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Nama Anda"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-3.5 text-slate-400 h-4 w-4" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="email@contoh.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3.5 text-slate-400 h-4 w-4" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="••••••••"
                    required
                    minLength="6"
                  />
                </div>
                <p className="text-xs text-slate-500">Minimal 6 karakter.</p>
              </div>

              <Button type="submit" className="w-full h-11 text-base bg-blue-500 hover:bg-blue-600 text-white font-semibold mt-2" disabled={loading}>
                {loading ? 'Membuat Akun...' : (
                  <span className="flex items-center justify-center gap-2">
                    Daftar <FiArrowRight />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              Sudah punya akun?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                Masuk disini
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;