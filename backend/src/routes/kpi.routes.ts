import { Router, Request, Response } from 'express';
import { kpiService } from '../services/kpi.service';
import { FiltroData, FiltroClassificacao } from '../types';

const router = Router();

function getFiltroFromQuery(req: Request): FiltroData {
  const hoje = new Date();
  const seteDiasAtras = new Date(hoje);
  seteDiasAtras.setDate(hoje.getDate() - 7);

  const dataInicio = (req.query.dataInicio as string) || seteDiasAtras.toISOString().split('T')[0];
  const dataFim = (req.query.dataFim as string) || hoje.toISOString().split('T')[0];
  const excluirEquipeAtivo = req.query.excluirEquipeAtivo === 'true';

  return { dataInicio, dataFim, excluirEquipeAtivo };
}

function getFiltroClassificacaoFromQuery(req: Request): FiltroClassificacao {
  const baseFiltro = getFiltroFromQuery(req);
  const classificacao = req.query.classificacao as string | undefined;
  return { ...baseFiltro, classificacao };
}

router.get('/overview', async (req: Request, res: Response) => {
  try {
    const filtro = getFiltroFromQuery(req);
    const data = await kpiService.getOverview(filtro);
    res.json(data);
  } catch (error) {
    console.warn('[KPIRoutes] Erro ao buscar overview (banco offline?):', error);
    // Retornar objeto vazio padrão para não quebrar o frontend
    res.json({
      totalAtendimentos: 0,
      concluidos: 0,
      pendentes: 0,
      tempoEsperaMedioSegundos: 0,
      tempoAtendimentoMedioSegundos: 0,
      tempoEsperaFormatado: '0 min 0 seg',
      tempoAtendimentoFormatado: '0 min 0 seg',
    });
  }
});

router.get('/timeline', async (req: Request, res: Response) => {
  try {
    const filtro = getFiltroFromQuery(req);
    const data = await kpiService.getTimeline(filtro);
    res.json(data);
  } catch (error) {
    console.warn('[KPIRoutes] Erro ao buscar timeline:', error);
    res.json([]);
  }
});

router.get('/equipes', async (req: Request, res: Response) => {
  try {
    const filtro = getFiltroFromQuery(req);
    const data = await kpiService.getEquipes(filtro);
    res.json(data);
  } catch (error) {
    console.warn('[KPIRoutes] Erro ao buscar equipes:', error);
    res.json([]);
  }
});

router.get('/agentes', async (req: Request, res: Response) => {
  try {
    const filtro = getFiltroFromQuery(req);
    const data = await kpiService.getAgentes(filtro);
    res.json(data);
  } catch (error) {
    console.warn('[KPIRoutes] Erro ao buscar agentes:', error);
    res.json([]);
  }
});

router.get('/canais', async (req: Request, res: Response) => {
  try {
    const filtro = getFiltroFromQuery(req);
    const data = await kpiService.getCanais(filtro);
    res.json(data);
  } catch (error) {
    console.warn('[KPIRoutes] Erro ao buscar canais:', error);
    res.json([]);
  }
});

router.get('/classificacoes', async (req: Request, res: Response) => {
  try {
    const filtro = getFiltroClassificacaoFromQuery(req);
    const data = await kpiService.getClassificacoes(filtro);
    res.json(data);
  } catch (error) {
    console.warn('[KPIRoutes] Erro ao buscar classificações:', error);
    res.json([]);
  }
});

router.get('/classificacoes-por-agente', async (req: Request, res: Response) => {
  try {
    const filtro = getFiltroClassificacaoFromQuery(req);
    const data = await kpiService.getClassificacoesPorAgente(filtro);
    res.json(data);
  } catch (error) {
    console.warn('[KPIRoutes] Erro ao buscar classificações por agente:', error);
    res.json([]);
  }
});

router.get('/picos-horario', async (req: Request, res: Response) => {
  try {
    const filtro = getFiltroFromQuery(req);
    const data = await kpiService.getPicosHorario(filtro);
    res.json(data);
  } catch (error) {
    console.warn('[KPIRoutes] Erro ao buscar picos por horário:', error);
    res.json(Array.from({ length: 24 }, (_, h) => ({ hora: h, total: 0 })));
  }
});

router.get('/todas-classificacoes', async (req: Request, res: Response) => {
  try {
    const filtro = getFiltroFromQuery(req);
    const data = await kpiService.getTodasClassificacoes(filtro);
    res.json(data);
  } catch (error) {
    console.warn('[KPIRoutes] Erro ao buscar todas as classificações:', error);
    res.json([]);
  }
});

export default router;
