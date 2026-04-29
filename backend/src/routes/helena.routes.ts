import { Router, Request, Response } from 'express';
import { helenaService } from '../services/helena.service';
import { FiltroHelena, StatusSessao } from '../types/helena.types';

const router = Router();

function getFiltroHelenaFromQuery(req: Request): FiltroHelena {
  const { dataInicio, dataFim, status } = req.query;
  return {
    ...(dataInicio && { dataInicio: dataInicio as string }),
    ...(dataFim && { dataFim: dataFim as string }),
    ...(status && { status: status as StatusSessao }),
  };
}

router.get('/realtime', async (_req: Request, res: Response) => {
  console.log('[Helena API] GET /realtime chamado às', new Date().toLocaleTimeString('pt-BR'));
  try {
    const data = await helenaService.getKPIsTempoReal();
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar KPIs em tempo real da Helena CRM:', error);
    const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
    res.status(500).json({ error: 'Erro ao buscar KPIs em tempo real', detalhe: mensagem });
  }
});

router.get('/finalizados', async (req: Request, res: Response) => {
  try {
    const filtro = getFiltroHelenaFromQuery(req);
    const data = await helenaService.getKPIsFinalizados(filtro);
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar atendimentos finalizados da Helena CRM:', error);
    const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
    res.status(500).json({ error: 'Erro ao buscar atendimentos finalizados', detalhe: mensagem });
  }
});

router.get('/sessoes', async (req: Request, res: Response) => {
  try {
    const filtro = getFiltroHelenaFromQuery(req);
    const data = await helenaService.getSessoes(filtro);
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar sessões da Helena CRM:', error);
    const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
    res.status(500).json({ error: 'Erro ao buscar sessões', detalhe: mensagem });
  }
});

router.get('/classificacoes', async (req: Request, res: Response) => {
  try {
    const filtro = getFiltroHelenaFromQuery(req);
    const data = await helenaService.getClassificacoes(filtro);
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar classificações da Helena CRM:', error);
    const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
    res.status(500).json({ error: 'Erro ao buscar classificações', detalhe: mensagem });
  }
});

router.get('/departamentos', async (_req: Request, res: Response) => {
  try {
    const mapa = await helenaService.getDepartamentos();
    // Converter Map para array de objetos
    const lista = Array.from(mapa.entries()).map(([id, name]) => ({ id, name }));
    res.json(lista);
  } catch (error) {
    console.error('Erro ao buscar departamentos da Helena CRM:', error);
    const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
    res.status(500).json({ error: 'Erro ao buscar departamentos', detalhe: mensagem });
  }
});

export default router;
