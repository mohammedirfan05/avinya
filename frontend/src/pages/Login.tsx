import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Lock, Mail, ArrowRight } from 'lucide-react';
import { Input, Button } from '../components/ui'

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="glass p-8 rounded-xl border border-white/5">
          <div className="flex flex-col items-center mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mb-4">
              <Activity className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-semibold mb-1 text-slate-100">Avinya</h1>
            <p className="text-slate-500 text-sm">Traffic Management System</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Input
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                inputClassName='pl-10'
                className='relative'
              />
              <Mail className="absolute left-4 top-[73px] text-slate-500" size={16} />
            </div>

            <div className="space-y-2">
              <Input
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                inputClassName='pl-10'
                className='relative'
              />
              <Lock className="absolute left-4 top-[165px] text-slate-500" size={16} />
            </div>

            <Button type="submit" className='w-full flex items-center justify-center gap-2'>
              <span>Sign In</span>
              <ArrowRight size={16} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
