import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import supabase from '../../../supabase-config';
import { useEffect, useState } from 'react';
import LoadingButton from '@/components/ui/loading-button';
export default function Login({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [theme, setTheme] = useState('light');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const newTheme = prefersDark ? 'dark' : 'light';
      setTheme(newTheme);
    }
  }, []);

  async function signInWithEmail() {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.code === 'invalid_credentials') {
        setError('Usuario o contraseña incorrectos');
      } else {
        setError(error.message);
      }
    } else {
      setError(null);
    }

    setIsLoading(false);
  }

  useEffect(() => {
    return () => {
      setError(null);
      setEmail('');
      setPassword('');
    };
  }, []);

  return (
    <div
      className={`flex flex-col h-screen w-screen items-center justify-center ${
        theme === 'dark' ? 'bg-black' : 'bg-white'
      }`}
    >
      <img src={theme === 'dark' ? './assets/logo-white.png' : './assets/logo.png'} />
      <div className={cn('flex flex-col gap-6 w-[400px]', className)} {...props}>
        <Card
          className={`${
            theme === 'dark'
              ? 'bg-[#aaa]/10 text-white border-[#aaa]/20 shadow-[#aaa]/20'
              : 'bg-white'
          }`}
        >
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Bienvenido</CardTitle>
            <CardDescription>Ingrese su email y contraseña </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                signInWithEmail();
              }}
            >
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Contraseña</Label>
                    {/* <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a> */}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <div className="text-red-500 text-sm">{error}</div>}
                <LoadingButton type="submit" className="w-full" isLoading={isLoading}>
                  Login
                </LoadingButton>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
