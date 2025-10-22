import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AuthError } from '@supabase/supabase-js';

// Function to map Supabase AuthError messages to user-friendly messages
const mapAuthErrorMessage = (error: AuthError): string => {
  switch (error.message) {
    case 'Invalid login credentials':
      return 'メールアドレスまたはパスワードが間違っています。';
    case 'Email not confirmed':
      return 'メールアドレスが確認されていません。受信トレイをご確認ください。';
    case 'User already registered':
      return 'このメールアドレスは既に登録されています。';
    case 'Password should be at least 6 characters.':
      return 'パスワードは6文字以上である必要があります。';
    default:
      return '認証中にエラーが発生しました。もう一度お試しください。';
  }
};

interface AuthResult {
  error: string | null;
  message: string | null;
  loading: boolean;
}

interface AuthHook {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  authResult: AuthResult;
}

export function useAuth(): AuthHook {
  const supabase = createClient();
  const router = useRouter();
  const [authResult, setAuthResult] = useState<AuthResult>({
    error: null,
    message: null,
    loading: false,
  });

  const handleAuthError = (error: AuthError) => {
    setAuthResult({ error: mapAuthErrorMessage(error), message: null, loading: false });
  };

  const login = async (email: string, password: string) => {
    setAuthResult({ error: null, message: null, loading: true });
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      handleAuthError(error);
    } else {
      setAuthResult({ error: null, message: null, loading: false });
      router.push('/dashboard');
    }
  };

  const signup = async (email: string, password: string, username: string) => {
    setAuthResult({ error: null, message: null, loading: true });
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
        data: {
          username: username,
        },
      },
    });

    if (error) {
      handleAuthError(error);
    } else {
      setAuthResult({ error: null, message: 'アカウントが作成されました。確認のためメールをご確認ください。', loading: false });
    }
  };

  return {
    login,
    signup,
    authResult,
  };
}
