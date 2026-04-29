import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { KPIsTempoReal, KPIsFinalizadosHelena, ClassificacoesHelenaResponse } from '../types';

const INTERVALO_REALTIME_MS = 5_000;

export function useHelena() {
  const [realtime, setRealtime] = useState<KPIsTempoReal | null>(null);
  const [finalizados, setFinalizados] = useState<KPIsFinalizadosHelena | null>(null);
  const [classificacoes, setClassificacoes] = useState<ClassificacoesHelenaResponse | null>(null);
  const [loadingRealtime, setLoadingRealtime] = useState(false);
  const [loadingFinalizados, setLoadingFinalizados] = useState(false);
  const [loadingClassificacoes, setLoadingClassificacoes] = useState(false);
  const [errorRealtime, setErrorRealtime] = useState<string | null>(null);
  const [errorFinalizados, setErrorFinalizados] = useState<string | null>(null);
  const [errorClassificacoes, setErrorClassificacoes] = useState<string | null>(null);
  const [pesquisadoFinalizados, setPesquisadoFinalizados] = useState(false);
  const [pesquisadoClassificacoes, setPesquisadoClassificacoes] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchingRef = useRef(false);
  const visibleRef = useRef(true);

  const fetchRealtime = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoadingRealtime(true);
    setErrorRealtime(null);
    try {
      const data = await api.getHelenaRealtime();
      setRealtime(data);
    } catch (err) {
      console.error('[Helena] ❌ Erro no fetchRealtime:', err);
      setErrorRealtime(err instanceof Error ? err.message : 'Erro ao buscar dados em tempo real');
    } finally {
      setLoadingRealtime(false);
      fetchingRef.current = false;
    }
  }, []);

  const scheduleNext = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      if (!visibleRef.current) {
        scheduleNext();
        return;
      }
      await fetchRealtime();
      scheduleNext();
    }, INTERVALO_REALTIME_MS);
  }, [fetchRealtime]);

  const fetchFinalizados = useCallback(async (dataInicio: string, dataFim: string) => {
    setLoadingFinalizados(true);
    setErrorFinalizados(null);
    setPesquisadoFinalizados(true);
    try {
      const data = await api.getHelenaFinalizados(dataInicio, dataFim);
      setFinalizados(data);
    } catch (err) {
      setErrorFinalizados(err instanceof Error ? err.message : 'Erro ao buscar atendimentos finalizados');
    } finally {
      setLoadingFinalizados(false);
    }
  }, []);

  const fetchClassificacoes = useCallback(async (dataInicio: string, dataFim: string) => {
    setLoadingClassificacoes(true);
    setErrorClassificacoes(null);
    setPesquisadoClassificacoes(true);
    try {
      const data = await api.getHelenaClassificacoes(dataInicio, dataFim);
      setClassificacoes(data);
    } catch (err) {
      setErrorClassificacoes(err instanceof Error ? err.message : 'Erro ao buscar classificações');
    } finally {
      setLoadingClassificacoes(false);
    }
  }, []);

  useEffect(() => {
    fetchRealtime();
    scheduleNext();

    const onVisibility = () => {
      visibleRef.current = document.visibilityState === 'visible';
      if (visibleRef.current && !fetchingRef.current) {
        fetchRealtime();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [fetchRealtime, scheduleNext]);

  return {
    realtime,
    finalizados,
    classificacoes,
    loadingRealtime,
    loadingFinalizados,
    loadingClassificacoes,
    errorRealtime,
    errorFinalizados,
    errorClassificacoes,
    pesquisadoFinalizados,
    pesquisadoClassificacoes,
    fetchRealtime,
    fetchFinalizados,
    fetchClassificacoes,
  };
}
