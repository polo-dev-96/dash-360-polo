import { useState, useEffect } from 'react'
import { useHelena } from './hooks/useHelena'
import { useHelenaAgentes } from './hooks/useHelenaAgentes'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  MessageSquare,
  CheckCircle,
  Clock,
  Users,
  Headphones,
  TrendingUp,
  RefreshCw,
  Tag,
  Activity,
  PhoneCall,
  Hourglass,
  AlertCircle,
  CheckSquare2,
  BarChart3,
} from 'lucide-react'
import logo from './logos/Logo Login 64x64.png'

const COLORS = ['#dc2626', '#6b7280', '#b91c1c', '#374151', '#ef4444', '#9ca3af']

const NAV_ITEMS = [
  { id: 'monitoramento-geral',  label: 'Monitoramento Geral',  icon: Activity },
  { id: 'desempenho-agentes',  label: 'Desempenho Agentes',  icon: BarChart3 },
  { id: 'classificacoes-helena', label: 'Classificações Helena', icon: Tag },
]

const PAGE_TITLES: Record<string, string> = {
  'classificacoes-helena': 'Classificações Helena',
  'monitoramento-geral':  'Monitoramento Geral',
  'desempenho-agentes':   'Desempenho Agentes',
}

function App() {
  const [activeTab, setActiveTab] = useState('monitoramento-geral')

  const hoje = new Date().toISOString().split('T')[0]

  // Filtros do Monitoramento Geral (Helena CRM)
  const [helenaDataInicio, setHelenaDataInicio] = useState<string>(hoje)
  const [helenaDataFim, setHelenaDataFim] = useState<string>(hoje)

  // Filtros de Classificações Helena
  const [helenaClassDataInicio, setHelenaClassDataInicio] = useState<string>('')
  const [helenaClassDataFim, setHelenaClassDataFim] = useState<string>('')

  // Filtros de Desempenho Agentes
  const [agentesDataInicio, setAgentesDataInicio] = useState<string>(hoje)
  const [agentesDataFim, setAgentesDataFim] = useState<string>(hoje)

  const {
    realtime,
    finalizados,
    classificacoes: classificacoesHelena,
    loadingRealtime,
    loadingFinalizados,
    loadingClassificacoes: loadingClassificacoesHelena,
    errorRealtime,
    errorFinalizados,
    errorClassificacoes: errorClassificacoesHelena,
    pesquisadoFinalizados,
    pesquisadoClassificacoes: pesquisadoClassificacoesHelena,
    fetchRealtime,
    fetchFinalizados,
    fetchClassificacoes: fetchClassificacoesHelena,
  } = useHelena()

  const {
    agentes: agentesPerformance,
    loading: loadingAgentes,
    error: errorAgentes,
    pesquisado: pesquisadoAgentes,
    fetchAgentes,
  } = useHelenaAgentes()

  // Carrega atendimentos finalizados do dia automaticamente ao abrir
  useEffect(() => {
    fetchFinalizados(helenaDataInicio, helenaDataFim)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside className="w-64 bg-gray-900 flex flex-col fixed inset-y-0 left-0 z-50">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-700">
          <img src={logo} alt="Logo" className="w-12 h-12 object-contain flex-shrink-0 drop-shadow-lg" />
          <div>
            <p className="text-white font-bold text-sm leading-tight">Dashboard 360º</p>
            <p className="text-gray-400 text-xs">Painel de Atendimentos</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest px-3 mb-3">Menu</p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {isActive && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
              </button>
            )
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="px-5 py-4 border-t border-gray-700">
          <p className="text-gray-500 text-xs">© 2026 Dashboard 360º Omni</p>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────────────────────── */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{PAGE_TITLES[activeTab]}</h1>
            <p className="text-xs text-gray-400 mt-0.5">Dashboard 360º Omni · Painel de Atendimentos</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-gray-500 font-medium">Sistema online</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-8 py-6">

          {/* ── Monitoramento Geral ── */}
          {activeTab === 'monitoramento-geral' && (
            <div className="space-y-6">

              {/* ── Tempo Real ── */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-red-600" />
                    <h2 className="text-base font-bold text-gray-900">Atendimentos em Tempo Real</h2>
                    <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block" />
                      Ao vivo · atualiza a cada 30s
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {realtime && (
                      <span className="text-xs text-gray-400">
                        Atualizado às {new Date(realtime.atualizadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    )}
                    <button
                      onClick={fetchRealtime}
                      disabled={loadingRealtime}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Atualizar agora"
                    >
                      <RefreshCw className={`w-4 h-4 text-gray-500 ${loadingRealtime ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {errorRealtime ? (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorRealtime}</span>
                  </div>
                ) : (
                  <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-center gap-4">
                      <div className="bg-amber-100 p-3 rounded-xl flex-shrink-0">
                        <Hourglass className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Em Espera</p>
                        <p className="text-xs text-amber-600 mt-0.5">PENDING</p>
                        <p className="text-3xl font-bold text-amber-800 mt-1">
                          {(realtime?.emEspera ?? 0).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-center gap-4">
                      <div className="bg-blue-100 p-3 rounded-xl flex-shrink-0">
                        <PhoneCall className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Em Atendimento</p>
                        <p className="text-xs text-blue-600 mt-0.5">IN_PROGRESS</p>
                        <p className="text-3xl font-bold text-blue-800 mt-1">
                          {(realtime?.emAtendimento ?? 0).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex items-center gap-4">
                      <div className="bg-gray-200 p-3 rounded-xl flex-shrink-0">
                        <MessageSquare className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Ativo</p>
                        <p className="text-xs text-gray-500 mt-0.5">PENDING + IN_PROGRESS</p>
                        <p className="text-3xl font-bold text-gray-800 mt-1">
                          {(realtime?.total ?? 0).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Por Equipe (Tempo Real) */}
                  <div className="mt-4 bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-5 h-5 text-red-600" />
                      <h3 className="text-sm font-bold text-gray-800">Atendimentos por Equipe (DepartmentId)</h3>
                    </div>
                    {realtime && realtime.porEquipe.length > 0 ? (
                      <div className="space-y-3">
                        {realtime.porEquipe.map((item, idx) => {
                          const maxVal = Math.max(...realtime.porEquipe.map(e => e.total))
                          const pct = maxVal > 0 ? Math.round((item.total / maxVal) * 100) : 0
                          return (
                            <div key={idx} className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-semibold text-gray-800 truncate">{item.equipe}</span>
                                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{item.total.toLocaleString('pt-BR')}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: COLORS[idx % COLORS.length] }} />
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">Sem dados para o período</p>
                    )}
                  </div>
                </>)}
              </div>

              {/* ── Finalizados ── */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CheckSquare2 className="w-5 h-5 text-red-600" />
                  <h2 className="text-base font-bold text-gray-900">Atendimentos Finalizados</h2>
                </div>

                {/* Filtro de datas */}
                <div className="flex flex-wrap items-center gap-4 mb-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">De:</span>
                    <input
                      type="date"
                      value={helenaDataInicio}
                      onChange={(e) => setHelenaDataInicio(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">Até:</span>
                    <input
                      type="date"
                      value={helenaDataFim}
                      onChange={(e) => setHelenaDataFim(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <button
                    onClick={() => fetchFinalizados(helenaDataInicio, helenaDataFim)}
                    disabled={!helenaDataInicio || !helenaDataFim || loadingFinalizados}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    {loadingFinalizados ? 'Buscando...' : 'Pesquisar'}
                  </button>
                  {pesquisadoFinalizados && helenaDataInicio && helenaDataFim && (
                    <span className="text-xs text-gray-500 font-medium">
                      {format(new Date(helenaDataInicio + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })} até {format(new Date(helenaDataFim + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  )}
                </div>

                {!pesquisadoFinalizados ? (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                      <Clock className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-base font-medium">Nenhum período selecionado</p>
                    <p className="text-sm">Selecione um período e clique em <span className="font-semibold text-red-600">Pesquisar</span></p>
                  </div>
                ) : errorFinalizados ? (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorFinalizados}</span>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* KPI Cards finalizados */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-4">
                        <div className="bg-green-100 p-3 rounded-xl flex-shrink-0">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Total Finalizados</p>
                          <p className="text-3xl font-bold text-green-800 mt-1">
                            {loadingFinalizados ? '—' : (finalizados?.total ?? 0).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-center gap-4">
                        <div className="bg-red-100 p-3 rounded-xl flex-shrink-0">
                          <Clock className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Tempo Médio de Espera</p>
                          <p className="text-2xl font-bold text-red-800 mt-1">
                            {loadingFinalizados ? '—' : (finalizados?.tempoEsperaFormatado ?? '—')}
                          </p>
                        </div>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex items-center gap-4">
                        <div className="bg-gray-200 p-3 rounded-xl flex-shrink-0">
                          <TrendingUp className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Tempo Médio de Atendimento</p>
                          <p className="text-2xl font-bold text-gray-800 mt-1">
                            {loadingFinalizados ? '—' : (finalizados?.tempoAtendimentoFormatado ?? '—')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Por Canal e Por Agente */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Por Canal */}
                      <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <h3 className="text-sm font-bold text-gray-800 mb-4">Finalizados por Canal</h3>
                        {loadingFinalizados ? (
                          <p className="text-gray-400 text-sm">Carregando...</p>
                        ) : finalizados && finalizados.porCanal.length > 0 ? (
                          <div className="space-y-3">
                            {finalizados.porCanal.map((item, idx) => {
                              const maxVal = Math.max(...finalizados.porCanal.map(c => c.total))
                              const pct = maxVal > 0 ? Math.round((item.total / maxVal) * 100) : 0
                              return (
                                <div key={idx} className="flex items-center gap-3">
                                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm font-semibold text-gray-800 truncate">{item.canal}</span>
                                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{item.total.toLocaleString('pt-BR')}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: COLORS[idx % COLORS.length] }} />
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm">Sem dados para o período</p>
                        )}
                      </div>

                      {/* Por Agente */}
                      <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <h3 className="text-sm font-bold text-gray-800 mb-4">Finalizados por Agente</h3>
                        {loadingFinalizados ? (
                          <p className="text-gray-400 text-sm">Carregando...</p>
                        ) : finalizados && finalizados.porAgente.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-gray-200">
                                  <th className="pb-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Agente</th>
                                  <th className="pb-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Finalizados</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {finalizados.porAgente.slice(0, 15).map((item, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-2.5 font-medium text-gray-800 flex items-center gap-2">
                                      <img
                                        src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(item.agente)}&backgroundColor=fecaca,fed7aa,bbf7d0,bfdbfe,e9d5ff`}
                                        alt={item.agente}
                                        className="w-6 h-6 rounded-full border border-gray-200 bg-gray-100 flex-shrink-0"
                                      />
                                      {item.agente}
                                    </td>
                                    <td className="py-2.5 text-right font-bold text-gray-900">{item.total.toLocaleString('pt-BR')}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm">Sem dados para o período</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ── Desempenho Agentes ── */}
          {activeTab === 'desempenho-agentes' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">De:</span>
                    <input
                      type="date"
                      value={agentesDataInicio}
                      onChange={(e) => setAgentesDataInicio(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">Até:</span>
                    <input
                      type="date"
                      value={agentesDataFim}
                      onChange={(e) => setAgentesDataFim(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <button
                    onClick={() => fetchAgentes(agentesDataInicio, agentesDataFim)}
                    disabled={!agentesDataInicio || !agentesDataFim || loadingAgentes}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    {loadingAgentes ? 'Buscando...' : 'Pesquisar'}
                  </button>
                  {pesquisadoAgentes && agentesDataInicio && agentesDataFim && (
                    <span className="text-xs text-gray-500 font-medium">
                      {format(new Date(agentesDataInicio + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })} até {format(new Date(agentesDataFim + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  )}
                </div>
              </div>

              {!pesquisadoAgentes ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                    <Clock className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-base font-medium">Nenhum período selecionado</p>
                  <p className="text-sm">Selecione um período e clique em <span className="font-semibold text-red-600">Pesquisar</span></p>
                </div>
              ) : errorAgentes ? (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorAgentes}</span>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h2 className="text-base font-bold text-gray-900">Qualidade do atendimento por agente</h2>
                    <p className="text-xs text-gray-500 mt-1">Foram considerados atendimentos finalizados no período selecionado.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Agente</th>
                          <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Atendimentos Concluídos</th>
                          <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Média de Espera</th>
                          <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Primeira Resposta</th>
                          <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Tempo de Atendimento</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {loadingAgentes ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-400">Carregando...</td>
                          </tr>
                        ) : agentesPerformance.length > 0 ? (
                          agentesPerformance.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(item.agente)}&backgroundColor=fecaca,fed7aa,bbf7d0,bfdbfe,e9d5ff`}
                                    alt={item.agente}
                                    className="w-8 h-8 rounded-full border border-gray-200 bg-gray-100 flex-shrink-0"
                                  />
                                  <span className="font-medium text-gray-900">{item.agente}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right font-bold text-gray-900">{item.total.toLocaleString('pt-BR')}</td>
                              <td className="px-6 py-4 text-right text-gray-600">{item.tempoEsperaMedioFormatado}</td>
                              <td className="px-6 py-4 text-right text-gray-600">{item.tempoPrimeiraRespostaMedioFormatado}</td>
                              <td className="px-6 py-4 text-right text-gray-600">{item.tempoAtendimentoMedioFormatado}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-400">Sem dados para o período selecionado</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Classificações Helena ── */}
          {activeTab === 'classificacoes-helena' && (
            <div className="space-y-6">
              {/* Filtro de datas */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">De:</span>
                    <input
                      type="date"
                      value={helenaClassDataInicio}
                      onChange={(e) => setHelenaClassDataInicio(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">Até:</span>
                    <input
                      type="date"
                      value={helenaClassDataFim}
                      onChange={(e) => setHelenaClassDataFim(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <button
                    onClick={() => fetchClassificacoesHelena(helenaClassDataInicio, helenaClassDataFim)}
                    disabled={!helenaClassDataInicio || !helenaClassDataFim || loadingClassificacoesHelena}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    {loadingClassificacoesHelena ? 'Buscando...' : 'Pesquisar'}
                  </button>
                  {pesquisadoClassificacoesHelena && helenaClassDataInicio && helenaClassDataFim && (
                    <span className="text-xs text-gray-500 font-medium">
                      {format(new Date(helenaClassDataInicio + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })} até {format(new Date(helenaClassDataFim + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  )}
                </div>
              </div>

              {!pesquisadoClassificacoesHelena ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                    <Clock className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-base font-medium">Nenhum período selecionado</p>
                  <p className="text-sm">Selecione um período e clique em <span className="font-semibold text-red-600">Pesquisar</span></p>
                </div>
              ) : errorClassificacoesHelena ? (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorClassificacoesHelena}</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Classificações Gerais */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <Tag className="w-5 h-5 text-red-600" />
                      <h2 className="text-base font-bold text-gray-900">Classificações</h2>
                    </div>
                    <p className="text-xs text-gray-400 mb-5">Volume por classificação</p>
                    {!loadingClassificacoesHelena && classificacoesHelena && classificacoesHelena.classificacoes.length > 0 ? (
                      <div className="space-y-3">
                        {classificacoesHelena.classificacoes.slice(0, 20).map((item, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold text-gray-800 truncate">{item.categoria}</span>
                                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{item.total.toLocaleString('pt-BR')} ({item.percentual}%)</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div className="h-1.5 rounded-full" style={{ width: `${item.percentual}%`, backgroundColor: COLORS[index % COLORS.length] }} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
                        <AlertCircle className="w-6 h-6" />
                        <p className="text-sm">Nenhuma classificação encontrada no período</p>
                        <p className="text-xs text-gray-400">As conversas finalizadas não possuem classificação preenchida</p>
                      </div>
                    )}
                  </div>

                  {/* Classificações por Agente */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <Headphones className="w-5 h-5 text-red-600" />
                      <h2 className="text-base font-bold text-gray-900">Classificações por Agente</h2>
                    </div>
                    <p className="text-xs text-gray-400 mb-5">Quantidade de atendimentos por agente e classificação</p>
                    <div className="h-96">
                      {!loadingClassificacoesHelena && classificacoesHelena && classificacoesHelena.porAgente.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={classificacoesHelena.porAgente.slice(0, 20)} layout="vertical" margin={{ left: 100 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                            <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                            <YAxis dataKey="agente" type="category" width={120} tick={{ fontSize: 11 }} stroke="#9ca3af" />
                            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} formatter={(_v: number, _n: string, props: any) => [_v, props.payload.categoria]} labelFormatter={(label) => `Agente: ${label}`} />
                            <Bar dataKey="total" fill="#dc2626" radius={[0, 4, 4, 0]} name="Atendimentos" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
                          <AlertCircle className="w-6 h-6" />
                          <p className="text-sm">Nenhuma classificação por agente encontrada</p>
                        </div>
                      )}
                    </div>

                    {/* Tabela de Classificações por Agente */}
                    <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Agente</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Classificação</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {loadingClassificacoesHelena ? (
                            <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-400">Carregando...</td></tr>
                          ) : classificacoesHelena && classificacoesHelena.porAgente.length > 0 ? (
                            classificacoesHelena.porAgente.slice(0, 50).map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 font-semibold text-gray-900">{item.agente}</td>
                                <td className="px-4 py-3 text-gray-600">{item.categoria}</td>
                                <td className="px-4 py-3 text-right font-bold text-gray-900">{item.total.toLocaleString('pt-BR')}</td>
                              </tr>
                            ))
                          ) : (
                            <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-400">Sem dados para o período</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  )
}

export default App
