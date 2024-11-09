'use client';
import { useState } from 'react';
import { supabase } from './supabaseClient';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';


const organizationColor = "#cfa83a";

export default function Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setError('');  // Clear previous errors
    setLoading(true);  // Set loading state

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);  // End loading state

    if (error) {
      setError(error.message);
    } else {
      // Redirect to dashboard on successful login
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full h-screen space-y-4">
      <Card className="w-full max-w-lg border" style={{ borderColor: organizationColor }}>
                <CardHeader>
                    <img src="/logo.jpeg" alt="Organization Logo" className="w-36 h-36 mx-auto mb-4 pointer-events-none" />
                    <CardTitle className="text-center text-2xl font-bold">
                        Association of Women Traditional Title Holders in Nigeria
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription className="text-center">
                        Empowering communities, enriching lives
                    </CardDescription>
                </CardContent>
            </Card>
      <h1 className='text-2xl'> Election Monitor Login</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-2 border border-gray-300 rounded"
        style={{ borderColor: organizationColor }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 border border-gray-300 rounded"
        style={{ borderColor: organizationColor }}
      />
      {error && <p className="text-red-500">{error}</p>}
      <Button 
        variant="outline" 
        onClick={handleLogin}
        disabled={loading}  // Disable button while loading
        className='bg-yellow-500'
      >
        {loading ? "Logging in..." : "Login"}
      </Button>
    </div>
  );
}
