import { Router, Request, Response } from 'express';
import { helenaService } from '../services/helena.service';
import { FiltroHelena, StatusSessao } from '../types/helena.types';

const router = Router();

// ── SSE: lista de clientes conectados ──
const sseClients = new Set<Response>();

function broadcastSSE(data: object): void {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    client.write(message);
  }
}

function getFiltroHelenaFromQuery(req: Request): FiltroHelena {
  const { dataInicio, dataFim, status } = req.query;
  return {
    ...(dataInicio && { dataInicio: dataInicio as string }),
    ...(dataFim && { dataFim: dataFim as string }),
    ...(status && { status: status as StatusSessao }),
  };
}

// ── GET /events — Server-Sent Events (frontend se conecta aqui) ──
router.get('/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
  sseClients.add(res);
  console.log(`[Helena SSE] Cliente conectado. Total: ${sseClients.size}`);

  const heartbeat = setInterval(() => {
    res.write(':ping\n\n');
  }, 30_000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
    console.log(`[Helena SSE] Cliente desconectado. Total: ${sseClients.size}`);
  });
});

// ── POST /webhook — recebe eventos da Helena CRM ──
router.post('/webhook', (req: Request, res: Response) => {
  const secret = process.env.WEBHOOK_SECRET;
  if (secret && req.query.secret !== secret) {
    console.warn('[Helena Webhook] Tentativa com secret inválido');
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const evento = req.body;
  const tipoEvento = evento?.event ?? evento?.type ?? 'desconhecido';
  console.log(`[Helena Webhook] Evento recebido: ${tipoEvento} | payload: ${JSON.stringify(evento).slice(0, 300)}`);

  helenaService.invalidateRealtimeCache();

  broadcastSSE({ type: 'webhook', event: tipoEvento, ts: Date.now() });

  res.status(200).json({ ok: true, event: tipoEvento });
});

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
