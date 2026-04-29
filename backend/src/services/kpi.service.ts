import pool from '../config/database';
import { FiltroData, KPIOverview, TimelineData, EquipeStats, AgenteStats, CanalStats, FiltroClassificacao, ClassificacaoStats, ClassificacaoPorAgente } from '../types';

function segundosParaFormatoLegivel(segundos: number): string {
  if (!segundos || segundos === 0) return '0 min 0 seg';
  
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const segs = Math.floor(segundos % 60);
  
  if (horas > 0) {
    return `${horas} h ${minutos} min ${segs} seg`;
  }
  return `${minutos} min ${segs} seg`;
}

function getEquipeFilterWhere(filtro: FiltroData, alias: string = ''): string {
  const prefix = alias ? `${alias}.` : '';
  if (filtro.excluirEquipeAtivo) {
    return `AND ${prefix}equipe IS NOT NULL AND ${prefix}equipe NOT LIKE '%ATIVO%'`;
  }
  return '';
}

export class KPIService {
  async getOverview(filtro: FiltroData): Promise<KPIOverview> {
    try {
      const equipeFilter = getEquipeFilterWhere(filtro);
      const query = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'Concluído' OR status_descricao LIKE '%concluído%' THEN 1 ELSE 0 END) as concluidos,
          SUM(CASE WHEN status != 'Concluído' AND status_descricao NOT LIKE '%concluído%' THEN 1 ELSE 0 END) as pendentes,
          AVG(TIME_TO_SEC(tempo_espera)) as tempo_espera_medio,
          AVG(TIME_TO_SEC(tempo_atendimento)) as tempo_atendimento_medio
        FROM atendimento_kardex
        WHERE DATE(criacao) BETWEEN ? AND ?
        ${equipeFilter}
      `;
      const [rows] = await pool.execute(query, [filtro.dataInicio, filtro.dataFim]);
      const row = (rows as any[])[0];
      const tempoEsperaSegundos = row.tempo_espera_medio || 0;
      const tempoAtendimentoSegundos = row.tempo_atendimento_medio || 0;
      return {
        totalAtendimentos: row.total || 0,
        concluidos: row.concluidos || 0,
        pendentes: row.pendentes || 0,
        tempoEsperaMedioSegundos: tempoEsperaSegundos,
        tempoAtendimentoMedioSegundos: tempoAtendimentoSegundos,
        tempoEsperaFormatado: segundosParaFormatoLegivel(tempoEsperaSegundos),
        tempoAtendimentoFormatado: segundosParaFormatoLegivel(tempoAtendimentoSegundos),
      };
    } catch {
      console.warn('[KPIService] Banco indisponível — retornando overview vazio');
      return { totalAtendimentos: 0, concluidos: 0, pendentes: 0, tempoEsperaMedioSegundos: 0, tempoAtendimentoMedioSegundos: 0, tempoEsperaFormatado: segundosParaFormatoLegivel(0), tempoAtendimentoFormatado: segundosParaFormatoLegivel(0) };
    }
  }

  async getTimeline(filtro: FiltroData): Promise<TimelineData[]> {
    try {
      const equipeFilter = getEquipeFilterWhere(filtro);
      const query = `
        SELECT 
          DATE(criacao) as data,
          COUNT(*) as total,
          SUM(CASE WHEN status = 'Concluído' OR status_descricao LIKE '%concluído%' THEN 1 ELSE 0 END) as concluidos,
          AVG(TIME_TO_SEC(tempo_espera)) as tempo_espera_medio,
          AVG(TIME_TO_SEC(tempo_atendimento)) as tempo_atendimento_medio
        FROM atendimento_kardex
        WHERE DATE(criacao) BETWEEN ? AND ?
        ${equipeFilter}
        GROUP BY DATE(criacao)
        ORDER BY data
      `;
      const [rows] = await pool.execute(query, [filtro.dataInicio, filtro.dataFim]);
      return (rows as any[]).map(row => ({
        data: row.data,
        total: row.total,
        concluidos: row.concluidos || 0,
        tempoEsperaMedio: row.tempo_espera_medio || 0,
        tempoAtendimentoMedio: row.tempo_atendimento_medio || 0,
      }));
    } catch {
      console.warn('[KPIService] Banco indisponível — retornando timeline vazia');
      return [];
    }
  }

  async getEquipes(filtro: FiltroData): Promise<EquipeStats[]> {
    try {
      const query = `
        SELECT
          COALESCE(equipe, 'Sem Equipe') as equipe,
          COUNT(*) as total,
          AVG(TIME_TO_SEC(tempo_atendimento)) as tempo_medio,
          AVG(TIME_TO_SEC(tempo_espera)) as tempo_espera_medio
        FROM atendimento_kardex
        WHERE DATE(criacao) BETWEEN ? AND ?
        GROUP BY equipe
        HAVING equipe IS NOT NULL
        ORDER BY total DESC
      `;
      const [rows] = await pool.execute(query, [filtro.dataInicio, filtro.dataFim]);
      return (rows as any[]).map(row => {
        const segundosAtendimento = row.tempo_medio || 0;
        const segundosEspera = row.tempo_espera_medio || 0;
        return {
          equipe: row.equipe,
          total: row.total,
          tempoMedioSegundos: segundosAtendimento,
          tempoMedioFormatado: segundosParaFormatoLegivel(segundosAtendimento),
          tempoEsperaMedioSegundos: segundosEspera,
          tempoEsperaMedioFormatado: segundosParaFormatoLegivel(segundosEspera),
        };
      });
    } catch {
      console.warn('[KPIService] Banco indisponível — retornando equipes vazias');
      return [];
    }
  }

  async getAgentes(filtro: FiltroData): Promise<AgenteStats[]> {
    try {
      const query = `
        SELECT 
          COALESCE(agente, 'Sem Agente') as agente,
          COUNT(*) as total,
          AVG(TIME_TO_SEC(tempo_atendimento)) as tempo_medio,
          AVG(
            CASE
              WHEN primeira_resposta IS NOT NULL
                AND criacao IS NOT NULL
                AND primeira_resposta > criacao
              THEN TIMESTAMPDIFF(SECOND, criacao, primeira_resposta)
              ELSE NULL
            END
          ) as tempo_primeira_resposta_medio
        FROM atendimento_kardex
        WHERE DATE(criacao) BETWEEN ? AND ?
        GROUP BY agente
        HAVING agente IS NOT NULL
        ORDER BY total DESC
        LIMIT 20
      `;
      const [rows] = await pool.execute(query, [filtro.dataInicio, filtro.dataFim]);
      return (rows as any[]).map(row => {
        const segundos = row.tempo_medio || 0;
        const segundosPrimeiraResposta = row.tempo_primeira_resposta_medio || 0;
        return {
          agente: row.agente,
          total: row.total,
          tempoMedioSegundos: segundos,
          tempoMedioFormatado: segundosParaFormatoLegivel(segundos),
          tempoPrimeiraRespostaSegundos: segundosPrimeiraResposta,
          tempoPrimeiraRespostaFormatado: segundosParaFormatoLegivel(segundosPrimeiraResposta),
        };
      });
    } catch {
      console.warn('[KPIService] Banco indisponível — retornando agentes vazios');
      return [];
    }
  }

  async getCanais(filtro: FiltroData): Promise<CanalStats[]> {
    try {
      const queryTotal = `
        SELECT COUNT(*) as total
        FROM atendimento_kardex
        WHERE DATE(criacao) BETWEEN ? AND ?
      `;
      const [totalRows] = await pool.execute(queryTotal, [filtro.dataInicio, filtro.dataFim]);
      const totalGeral = (totalRows as any[])[0].total || 1;

      const queryCanais = `
        SELECT
          COALESCE(canal, 'Desconhecido') as canal,
          COUNT(*) as total
        FROM atendimento_kardex
        WHERE DATE(criacao) BETWEEN ? AND ?
        GROUP BY canal
        HAVING canal IS NOT NULL
        ORDER BY total DESC
      `;
      const [canaisRows] = await pool.execute(queryCanais, [filtro.dataInicio, filtro.dataFim]);

      const queryNumeros = `
        SELECT
          COALESCE(canal, 'Desconhecido') as canal,
          COALESCE(contato_empresa, 'N/A') as numero,
          COUNT(*) as total
        FROM atendimento_kardex
        WHERE DATE(criacao) BETWEEN ? AND ?
          AND contato_empresa IS NOT NULL
          AND TRIM(contato_empresa) != ''
        GROUP BY canal, contato_empresa
        ORDER BY canal, total DESC
      `;
      const [numerosRows] = await pool.execute(queryNumeros, [filtro.dataInicio, filtro.dataFim]);

      const numerosPorCanal = new Map<string, any[]>();
      (numerosRows as any[]).forEach(row => {
        if (!numerosPorCanal.has(row.canal)) {
          numerosPorCanal.set(row.canal, []);
        }
        numerosPorCanal.get(row.canal)!.push(row);
      });

      return (canaisRows as any[]).map(row => {
        const canalTotal = row.total;
        const numeros = numerosPorCanal.get(row.canal) || [];
        return {
          canal: row.canal,
          total: canalTotal,
          percentual: Math.round((canalTotal / totalGeral) * 100),
          numeros: numeros.map(n => ({
            numero: n.numero,
            total: n.total,
            percentual: Math.round((n.total / canalTotal) * 100),
          })),
        };
      });
    } catch {
      console.warn('[KPIService] Banco indisponível — retornando canais vazios');
      return [];
    }
  }

  async getClassificacoes(filtro: FiltroClassificacao): Promise<ClassificacaoStats[]> {
    try {
      const queryTotal = `
        SELECT COUNT(*) as total
        FROM atendimento_kardex
        WHERE DATE(criacao) BETWEEN ? AND ?
        ${filtro.classificacao ? "AND classificacao = ?" : ""}
      `;
      const paramsTotal = filtro.classificacao 
        ? [filtro.dataInicio, filtro.dataFim, filtro.classificacao]
        : [filtro.dataInicio, filtro.dataFim];
      const [totalRows] = await pool.execute(queryTotal, paramsTotal);
      const totalGeral = (totalRows as any[])[0].total || 1;

      const query = `
        SELECT 
          classificacao,
          COUNT(*) as total
        FROM atendimento_kardex
        WHERE DATE(criacao) BETWEEN ? AND ?
          AND classificacao IS NOT NULL
          AND TRIM(classificacao) != ''
          ${filtro.classificacao ? "AND classificacao = ?" : ""}
        GROUP BY classificacao
        ORDER BY total DESC
        LIMIT 50
      `;
      const params = filtro.classificacao 
        ? [filtro.dataInicio, filtro.dataFim, filtro.classificacao]
        : [filtro.dataInicio, filtro.dataFim];
      const [rows] = await pool.execute(query, params);
      if (!rows || !Array.isArray(rows)) return [];
      return (rows as any[]).map(row => ({
        classificacao: row.classificacao || 'Sem nome',
        total: row.total || 0,
        percentual: totalGeral > 0 ? Math.round((row.total / totalGeral) * 100) : 0,
      }));
    } catch {
      console.warn('[KPIService] Banco indisponível — retornando classificações vazias');
      return [];
    }
  }

  async getClassificacoesPorAgente(filtro: FiltroClassificacao): Promise<ClassificacaoPorAgente[]> {
    try {
      const query = `
        SELECT 
          COALESCE(agente, 'Sem Agente') as agente,
          COALESCE(classificacao, 'Sem Classificação') as classificacao,
          COUNT(*) as total
        FROM atendimento_kardex
        WHERE DATE(criacao) BETWEEN ? AND ?
        ${filtro.classificacao ? "AND classificacao = ?" : ""}
        GROUP BY agente, classificacao
        HAVING agente IS NOT NULL AND classificacao IS NOT NULL
        ORDER BY total DESC
        LIMIT 100
      `;
      const params = filtro.classificacao 
        ? [filtro.dataInicio, filtro.dataFim, filtro.classificacao]
        : [filtro.dataInicio, filtro.dataFim];
      const [rows] = await pool.execute(query, params);
      return (rows as any[]).map(row => ({
        agente: row.agente,
        classificacao: row.classificacao,
        total: row.total,
      }));
    } catch {
      console.warn('[KPIService] Banco indisponível — retornando classificações por agente vazias');
      return [];
    }
  }

  async getPicosHorario(filtro: FiltroData): Promise<{ hora: number; total: number }[]> {
    try {
      const equipeFilter = getEquipeFilterWhere(filtro);
      const query = `
        SELECT 
          HOUR(criacao) as hora,
          COUNT(*) as total
        FROM atendimento_kardex
        WHERE DATE(criacao) BETWEEN ? AND ?
        ${equipeFilter}
        GROUP BY HOUR(criacao)
        ORDER BY hora
      `;
      const [rows] = await pool.execute(query, [filtro.dataInicio, filtro.dataFim]);
      const byHour = new Map<number, number>();
      (rows as any[]).forEach(row => byHour.set(row.hora, row.total));
      return Array.from({ length: 24 }, (_, h) => ({
        hora: h,
        total: byHour.get(h) ?? 0,
      }));
    } catch {
      console.warn('[KPIService] Banco indisponível — retornando picos horário vazios');
      return Array.from({ length: 24 }, (_, h) => ({ hora: h, total: 0 }));
    }
  }

  async getTodasClassificacoes(filtro: FiltroData): Promise<string[]> {
    try {
      const query = `
        SELECT DISTINCT classificacao
        FROM atendimento_kardex
        WHERE DATE(criacao) BETWEEN ? AND ?
          AND classificacao IS NOT NULL
          AND classificacao != ''
        ORDER BY classificacao
        LIMIT 100
      `;

      const [rows] = await pool.execute(query, [filtro.dataInicio, filtro.dataFim]);
      
      return (rows as any[]).map(row => row.classificacao);
    } catch {
      console.warn('[KPIService] Banco indisponível — retornando classificações vazias');
      return [];
    }
  }
}

export const kpiService = new KPIService();
