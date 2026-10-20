import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';

import {
  getCurrentUser,
  isParseConfigured,
  logIn as parseLogIn,
  logOut as parseLogOut,
  signUp as parseSignUp,
  type AuthenticatedUser,
  type ParseUser,
} from '@/lib/parse';

const SESSION_KEY = 'parse-session-token';

type SignUpInput = {
  name: string;
  username: string;
  email: string;
  password: string;
};

type AuthContextValue = {
  user: ParseUser | null;
  loading: boolean;
  configured: boolean;
  signUp: (input: SignUpInput) => Promise<void>;
  logIn: (username: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function saveSession(authenticatedUser: AuthenticatedUser) {
  await SecureStore.setItemAsync(SESSION_KEY, authenticatedUser.sessionToken);
  return authenticatedUser;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<ParseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isParseConfigured();

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        if (configured) {
          const sessionToken = await SecureStore.getItemAsync(SESSION_KEY);
          if (sessionToken) {
            const currentUser = await getCurrentUser(sessionToken);
            if (active) setUser(currentUser);
          }
        }
      } catch {
        await SecureStore.deleteItemAsync(SESSION_KEY);
      } finally {
        if (active) setLoading(false);
      }
    }

    void restoreSession();
    return () => {
      active = false;
    };
  }, [configured]);

  async function signUp(input: SignUpInput) {
    const authenticatedUser = await parseSignUp(input);
    await saveSession(authenticatedUser);
    try {
      setUser(await getCurrentUser(authenticatedUser.sessionToken));
    } catch {
      setUser({
        objectId: authenticatedUser.objectId,
        username: input.username,
        email: input.email,
        name: input.name,
        createdAt: authenticatedUser.createdAt,
        updatedAt: authenticatedUser.updatedAt,
      });
    }
  }

  async function logIn(username: string, password: string) {
    const authenticatedUser = await parseLogIn(username, password);
    await saveSession(authenticatedUser);
    setUser(authenticatedUser);
  }

  async function logOut() {
    const sessionToken = await SecureStore.getItemAsync(SESSION_KEY);
    try {
      if (sessionToken) await parseLogOut(sessionToken);
    } finally {
      await SecureStore.deleteItemAsync(SESSION_KEY);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, configured, signUp, logIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return context;
}