import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { demo, Portfolio } from './data';
import { configured, fetchPortfolio } from './api';
type State = { data: Portfolio; loading: boolean; error: string; source: string; favorites: string[]; refresh: () => Promise<void>; toggle: (id: string) => void };
const Context = createContext<State | null>(null);
export function Provider({ children }: React.PropsWithChildren) {
  const [data,setData] = useState<Portfolio>(demo); const [loading,setLoading] = useState(configured); const [error,setError] = useState(''); const [source,setSource] = useState('Demonstração'); const [favorites,setFavorites] = useState<string[]>([]);
  const [ready,setReady] = useState(false); const busy = useRef(false);
  const refresh = useCallback(async () => {
    if (!configured || busy.current) return; busy.current = true; setLoading(true); setError('');
    try { const fresh = await fetchPortfolio(); setData(fresh); setSource('Back4App'); }
    catch(e) { setError(e instanceof Error ? e.message : 'Não foi possível conectar.'); }
    finally { setLoading(false); busy.current = false; }
  }, []);
  useEffect(() => { void refresh(); AsyncStorage.getItem('portfolio:favorites').then(v => { const parsed: unknown = JSON.parse(v || '[]'); if (Array.isArray(parsed)) setFavorites(parsed.filter((x): x is string => typeof x === 'string')); }).catch(() => setError('Não foi possível ler os favoritos.')).finally(() => setReady(true)); }, [refresh]);
  const saveQueue = useRef(Promise.resolve());
  useEffect(() => { if (ready) saveQueue.current = saveQueue.current.then(() => AsyncStorage.setItem('portfolio:favorites',JSON.stringify(favorites))).catch(() => setError('Não foi possível salvar os favoritos.')); }, [favorites,ready]);
  const toggle = (id: string) => { if (ready) setFavorites(old => old.includes(id) ? old.filter(x => x !== id) : [...old,id]); };
  return <Context.Provider value={{ data,loading,error,source,favorites,refresh,toggle }}>{children}</Context.Provider>;
}
export function usePortfolio() { const state = useContext(Context); if (!state) throw new Error('Provider ausente'); return state; }
