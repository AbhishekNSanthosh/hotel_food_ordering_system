
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (res.ok) {
                const data = await res.json();
                router.push(data.redirect);
            } else {
                const data = await res.json();
                setError(data.error || 'Invalid credentials');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--warm-ivory)]">
            <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-2xl border-t-8 border-[var(--deep-burgundy)]">
                <div className="mb-8 text-center">
                    <div className="inline-block p-4 rounded-full bg-[var(--warm-ivory)] text-4xl mb-2">🍽️</div>
                    <h2 className="text-3xl font-black text-[var(--deep-burgundy)]">Staff Portal</h2>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Please sign in to continue</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold text-center border border-red-100 italic">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-bold text-[var(--charcoal)] uppercase tracking-widest mb-2">Username</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:border-[var(--deep-burgundy)] focus:bg-white focus:outline-none transition-all font-medium"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="Enter your username"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[var(--charcoal)] uppercase tracking-widest mb-2">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:border-[var(--deep-burgundy)] focus:bg-white focus:outline-none transition-all font-medium"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-gradient-to-r from-[var(--deep-burgundy)] to-[var(--muted-gold)] px-6 py-4 text-white font-black shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
                    >
                        {loading ? 'AUTHENTICATING...' : 'ACCESS DASHBOARD'}
                    </button>
                    <div className="text-center">
                        <p className="text-xs text-gray-400 font-medium tracking-tight">PROTECTED ACCESS ONLY</p>
                    </div>
                </form>
            </div>
        </div>
    );
}
