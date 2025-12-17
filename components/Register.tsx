import React, { useState } from 'react';

interface RegisterProps {
  onRegister: (name: string, email: string, password: string) => Promise<void>;
  onSwitchToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegister, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    try {
      await onRegister(name, email, password);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during registration.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-slate-900/40 backdrop-blur-xl rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 relative">
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-[50px] -z-10"></div>

      <h2 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
        Create Account
      </h2>
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-lg mb-6 text-center text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
          <div className="mt-1">
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none transition text-white placeholder-slate-600 shadow-inner"
            />
          </div>
        </div>
        <div>
          <label htmlFor="email-register" className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
          <div className="mt-1">
            <input
              id="email-register"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none transition text-white placeholder-slate-600 shadow-inner"
            />
          </div>
        </div>
        <div>
          <label htmlFor="password-register" className="block text-sm font-medium text-slate-300 mb-1">Password</label>
          <div className="mt-1">
            <input
              id="password-register"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:outline-none transition text-white placeholder-slate-600 shadow-inner"
            />
          </div>
        </div>
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-purple-900/40 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-purple-500 transition-all duration-300 transform hover:scale-[1.02]"
          >
            Register
          </button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="font-medium text-cyan-400 hover:text-cyan-300 focus:outline-none hover:underline">
          Login here
        </button>
      </p>
    </div>
  );
};