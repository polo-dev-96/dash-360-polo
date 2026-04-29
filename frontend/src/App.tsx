import { useState, useEffect } from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './components/ui/select'
import { useKPIs } from './hooks/useKPIs'
import { useHelena } from './hooks/useHelena'
import { useClassificacoes } from './hooks/useClassificacoes'
import type { FiltroData } from './types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LabelList,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  MessageSquare,
  CheckCircle,
  Clock,
  Users,
  Headphones,
  TrendingUp,
  RefreshCw,
  PieChartIcon,
  Tag,
  LayoutDashboard,
  Search,
  Filter,
  Activity,
  PhoneCall,
  Hourglass,
  AlertCircle,
  CheckSquare2,
} from 'lucide-react'
import logo from './logos/Logo Login 64x64.png'

const COLORS = ['#dc2626', '#6b7280', '#b91c1c', '#374151', '#ef4444', '#9ca3af']

const NAV_ITEMS = [
  { id: 'visao-geral',          label: 'Visão Geral',         icon: LayoutDashboard },
  { id: 'equipes',              label: 'Equipes',              icon: Users },
  { id: 'agentes',              label: 'Agentes',              icon: Headphones },
  { id: 'canais',               label: 'Canais',               icon: PieChartIcon },
  { id: 'classificacoes',       label: 'Classificações',       icon: Tag },
  { id: 'classificacoes-helena', label: 'Classificações Helena', icon: Tag },
  { id: 'monitoramento-geral',  label: 'Monitoramento Geral',  icon: Activity },
]

const PAGE_TITLES: Record<string, string> = {
  'visao-geral':          'Visão Geral',
  'equipes':              'Equipes',
  'agentes':              'Agentes',
  'canais':               'Canais',
  'classificacoes':       'Classificações',
  'classificacoes-helena': 'Classificações Helena',
  'monitoramento-geral':  'Monitoramento Geral',
}

function App() {
  const [activeTab, setActiveTab] = useState('visao-geral')
  
  // Filtros para as abas Visão Geral, Equipes, Agentes e Canais
  const [anoFiltro, setAnoFiltro] = useState<string>('')
  const [mesFiltro, setMesFiltro] = useState<string>('')
  const [modoFiltro, setModoFiltro] = useState<'ano-mes' | 'personalizado'>('ano-mes')
  const [dataInicioPersonalizada, setDataInicioPersonalizada] = useState<string>('')
  const [dataFimPersonalizada, setDataFimPersonalizada] = useState<string>('')
  
  // Filtros da aba Classificações
  const [anoClassificacao, setAnoClassificacao] = useState<string>('')
  const [mesClassificacao, setMesClassificacao] = useState<string>('')
  const [classificacaoFiltroLocal, setClassificacaoFiltroLocal] = useState<string>('')

  // Filtros da aba Equipes
  const [buscaEquipe, setBuscaEquipe] = useState<string>('')
  const [excluirAtivo, setExcluirAtivo] = useState<boolean>(false)

  // Filtro de equipe para Visão Geral
  const [visaoGeralExcluirAtivo, setVisaoGeralExcluirAtivo] = useState<boolean>(false)

  // Filtros do Monitoramento Geral (Helena CRM)
  const [helenaDataInicio, setHelenaDataInicio] = useState<string>('')
  const [helenaDataFim, setHelenaDataFim] = useState<string>('')

  // Filtros de Classificações Helena
  const [helenaClassDataInicio, setHelenaClassDataInicio] = useState<string>('')
  const [helenaClassDataFim, setHelenaClassDataFim] = useState<string>('')

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

  const MESES = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ]

  const [filtro, setFiltro] = useState<FiltroData>({
    dataInicio: '',
    dataFim: '',
  })

  const { overview, timeline, equipes, agentes, canais, picosHorario, loading, error, refetch } = useKPIs(filtro)
  const { 
    classificacoes, 
    classificacoesPorAgente, 
    todasClassificacoes, 
    loading: loadingClassificacoes, 
    pesquisado,
    search: searchClassificacoes,
  } = useClassificacoes()

  // Atualiza filtro automaticamente quando mudar visaoGeralExcluirAtivo (se já houver filtro aplicado)
  useEffect(() => {
    if (filtro.dataInicio && filtro.dataFim) {
      setFiltro(prev => ({ ...prev, excluirEquipeAtivo: visaoGeralExcluirAtivo }))
    }
  }, [visaoGeralExcluirAtivo])

  const handlePesquisarClassificacoes = () => {
    if (!anoClassificacao) return
    let dataInicio: string
    let dataFim: string
    if (mesClassificacao) {
      const ultimoDia = new Date(parseInt(anoClassificacao), parseInt(mesClassificacao), 0).getDate()
      dataInicio = `${anoClassificacao}-${mesClassificacao}-01`
      dataFim = `${anoClassificacao}-${mesClassificacao}-${String(ultimoDia).padStart(2, '0')}`
    } else {
      dataInicio = `${anoClassificacao}-01-01`
      dataFim = `${anoClassificacao}-12-31`
    }
    searchClassificacoes({
      dataInicio,
      dataFim,
      classificacao: classificacaoFiltroLocal || undefined,
    })
  }

  const aplicarFiltro = () => {
    let dataInicio: string
    let dataFim: string
    
    if (modoFiltro === 'personalizado') {
      if (!dataInicioPersonalizada || !dataFimPersonalizada) return
      dataInicio = dataInicioPersonalizada
      dataFim = dataFimPersonalizada
    } else {
      if (!anoFiltro) return
      if (mesFiltro) {
        const ultimoDia = new Date(parseInt(anoFiltro), parseInt(mesFiltro), 0).getDate()
        dataInicio = `${anoFiltro}-${mesFiltro}-01`
        dataFim = `${anoFiltro}-${mesFiltro}-${String(ultimoDia).padStart(2, '0')}`
      } else {
        dataInicio = `${anoFiltro}-01-01`
        dataFim = `${anoFiltro}-12-31`
      }
    }
    
    setFiltro({ dataInicio, dataFim, excluirEquipeAtivo: visaoGeralExcluirAtivo })
  }

  // ─── Shared Filter Bar ────────────────────────────────────────────────────
  const FiltroBar = () => (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-600">Modo:</span>
          <Select value={modoFiltro} onValueChange={(v) => { setModoFiltro(v as 'ano-mes' | 'personalizado'); setAnoFiltro(''); setMesFiltro(''); setDataInicioPersonalizada(''); setDataFimPersonalizada(''); }}>
            <SelectTrigger className="w-44 border-gray-300 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ano-mes">Ano / Mês</SelectItem>
              <SelectItem value="personalizado">Período Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {modoFiltro === 'ano-mes' ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-600">Ano:</span>
              <Select value={anoFiltro} onValueChange={(v) => { setAnoFiltro(v); setMesFiltro(''); }}>
                <SelectTrigger className="w-28 border-gray-300 text-sm">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {anoFiltro && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-600">Mês:</span>
                <Select value={mesFiltro} onValueChange={setMesFiltro}>
                  <SelectTrigger className="w-36 border-gray-300 text-sm">
                    <SelectValue placeholder="Todos os meses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os meses</SelectItem>
                    {MESES.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-600">De:</span>
              <input
                type="date"
                value={dataInicioPersonalizada}
                onChange={(e) => setDataInicioPersonalizada(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-600">Até:</span>
              <input
                type="date"
                value={dataFimPersonalizada}
                onChange={(e) => setDataFimPersonalizada(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </>
        )}

        <button
          onClick={aplicarFiltro}
          disabled={modoFiltro === 'ano-mes' ? !anoFiltro : (!dataInicioPersonalizada || !dataFimPersonalizada)}
          className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Aplicar Filtro
        </button>

        <button onClick={refetch} disabled={loading} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
          <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  )

  const SemFiltro = () => (
    <div className="flex flex-col items-center justify-center h-56 text-gray-400 gap-2">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-1">
        <Clock className="w-6 h-6 text-gray-400" />
      </div>
      <p className="text-base font-medium">Nenhum período selecionado</p>
      <p className="text-sm">Selecione um período e clique em <span className="font-semibold text-red-600">Aplicar Filtro</span></p>
    </div>
  )

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 w-96 text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-7 h-7 text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Erro ao carregar dados</h2>
          <p className="text-sm text-gray-500 mb-5">{error}</p>
          <button onClick={refetch} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors">
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

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

          {/* ── Visão Geral ── */}
          {activeTab === 'visao-geral' && (
            <div className="space-y-6">
              <FiltroBar />
              
              {/* Filtro de Equipe para Visão Geral */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-semibold text-gray-600">Filtrar Equipes:</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="filtroEquipeVG"
                        checked={!visaoGeralExcluirAtivo}
                        onChange={() => setVisaoGeralExcluirAtivo(false)}
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">Todas as equipes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="filtroEquipeVG"
                        checked={visaoGeralExcluirAtivo}
                        onChange={() => setVisaoGeralExcluirAtivo(true)}
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">Excluir equipes "Ativo"</span>
                    </label>
                  </div>
                </div>
              </div>

              {!filtro.dataInicio ? <SemFiltro /> : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total de Atendimentos</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? '—' : overview?.totalAtendimentos.toLocaleString('pt-BR')}</p>
                      </div>
                      <div className="bg-red-100 p-3 rounded-xl"><MessageSquare className="w-6 h-6 text-red-600" /></div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Concluídos</p>
                          <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? '—' : overview?.concluidos.toLocaleString('pt-BR')}</p>
                        </div>
                        <div className="bg-gray-100 p-3 rounded-xl"><CheckCircle className="w-6 h-6 text-gray-600" /></div>
                      </div>
                      {!loading && overview && (
                        <p className="text-xs text-gray-400 mt-3 font-medium">{((overview.concluidos / overview.totalAtendimentos) * 100).toFixed(1)}% do total</p>
                      )}
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tempo Médio de Espera</p>
                        <p className="text-xl font-bold text-gray-900 mt-2">{loading ? '—' : overview?.tempoEsperaFormatado}</p>
                      </div>
                      <div className="bg-red-50 p-3 rounded-xl"><Clock className="w-6 h-6 text-red-500" /></div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tempo Médio de Atendimento</p>
                        <p className="text-xl font-bold text-gray-900 mt-2">{loading ? '—' : overview?.tempoAtendimentoFormatado}</p>
                      </div>
                      <div className="bg-gray-100 p-3 rounded-xl"><TrendingUp className="w-6 h-6 text-gray-600" /></div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-base font-bold text-gray-900 mb-1">Evolução de Atendimentos</h2>
                    <p className="text-xs text-gray-400 mb-5">Total de atendimentos por dia</p>
                    <div className="h-80">
                      {!loading && timeline.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={timeline}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="data" tickFormatter={(v) => format(new Date(v), 'dd/MM', { locale: ptBR })} stroke="#9ca3af" tick={{ fontSize: 11 }} />
                            <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
                            <Tooltip formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Atendimentos']} labelFormatter={(l) => format(new Date(l), 'dd/MM/yyyy', { locale: ptBR })} contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                            <Bar dataKey="total" fill="#dc2626" name="Total" radius={[4, 4, 0, 0]} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">{loading ? 'Carregando...' : 'Sem dados para o período'}</div>
                      )}
                    </div>
                  </div>

                  {/* Picos de Atendimento por Horário */}
                  {(() => {
                    const picoMaximo = picosHorario.length > 0 ? picosHorario.reduce((prev, curr) => curr.total > prev.total ? curr : prev) : null
                    const horaFormatada = (h: number) => `${String(h).padStart(2, '0')}:00`
                    return (
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <h2 className="text-base font-bold text-gray-900">Picos de Atendimento por Horário</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Total acumulado de atendimentos em cada hora do dia no período selecionado</p>
                          </div>
                          {!loading && picoMaximo && picoMaximo.total > 0 && (
                            <div className="ml-6 flex-shrink-0 text-right bg-red-50 border border-red-100 rounded-xl px-5 py-3">
                              <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-0.5">Pico de atendimento</p>
                              <p className="text-3xl font-bold text-red-600">{horaFormatada(picoMaximo.hora)}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{picoMaximo.total.toLocaleString('pt-BR')} atendimentos</p>
                            </div>
                          )}
                        </div>
                        <div className="h-72 mt-4">
                          {!loading && picosHorario.some(p => p.total > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={picosHorario} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis
                                  dataKey="hora"
                                  tickFormatter={horaFormatada}
                                  stroke="#9ca3af"
                                  tick={{ fontSize: 11 }}
                                  interval={1}
                                />
                                <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
                                <Tooltip
                                  formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Atendimentos']}
                                  labelFormatter={(l) => `Horário: ${horaFormatada(Number(l))}`}
                                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                                />
                                <Bar
                                  dataKey="total"
                                  radius={[4, 4, 0, 0]}
                                  name="Atendimentos"
                                >
                                  {picosHorario.map((entry) => (
                                    <Cell
                                      key={`cell-${entry.hora}`}
                                      fill={picoMaximo && entry.hora === picoMaximo.hora ? '#dc2626' : '#93c5fd'}
                                    />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                              {loading ? 'Carregando...' : 'Sem dados para o período'}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })()}
                </>
              )}
            </div>
          )}

          {/* ── Equipes ── */}
          {activeTab === 'equipes' && (
            <div className="space-y-6">
              <FiltroBar />
              {!filtro.dataInicio ? <SemFiltro /> : (
                <>
                  {/* Filtros de Equipe */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-semibold text-gray-600">Filtros:</span>
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar equipe..."
                          value={buscaEquipe}
                          onChange={(e) => setBuscaEquipe(e.target.value)}
                          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={excluirAtivo}
                          onChange={(e) => setExcluirAtivo(e.target.checked)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-600">Excluir equipes "Ativo"</span>
                      </label>
                      {(buscaEquipe || excluirAtivo) && (
                        <button
                          onClick={() => { setBuscaEquipe(''); setExcluirAtivo(false); }}
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          Limpar filtros
                        </button>
                      )}
                    </div>
                  </div>

                  {(() => {
                    const equipesFiltradas = equipes.filter(e => {
                      const matchBusca = !buscaEquipe || e.equipe.toLowerCase().includes(buscaEquipe.toLowerCase())
                      const matchAtivo = !excluirAtivo || !e.equipe.toUpperCase().includes('ATIVO')
                      return matchBusca && matchAtivo
                    })
                    return (
                      <>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <Users className="w-5 h-5 text-red-600" />
                              <h2 className="text-base font-bold text-gray-900">Performance por Equipe</h2>
                            </div>
                            <span className="text-xs text-gray-500">
                              {equipesFiltradas.length} de {equipes.length} equipes
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mb-5">Atendimentos e tempo médio por equipe</p>
                          <div className="overflow-y-auto" style={{ height: Math.min(Math.max(equipesFiltradas.length * 45, 350), 700) }}>
                            {!loading && equipesFiltradas.length > 0 ? (
                              <ResponsiveContainer width="100%" height={equipesFiltradas.length * 45}>
                                <BarChart data={equipesFiltradas} layout="vertical" margin={{ top: 5, right: 80, left: 20, bottom: 5 }} barCategoryGap="20%">
                                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                                  <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                                  <YAxis dataKey="equipe" type="category" width={200} tick={{ fontSize: 11 }} stroke="#9ca3af" interval={0} />
                                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} formatter={(value: number, name: string, props: any) => { if (name === 'total') return [value.toLocaleString('pt-BR'), 'Atendimentos']; return [props.payload.tempoMedioFormatado, 'Tempo Médio'] }} />
                                  <Bar dataKey="total" fill="#dc2626" radius={[0, 4, 4, 0]}>
                                    <LabelList dataKey="total" position="right" formatter={(value: number) => value.toLocaleString('pt-BR')} fill="#374151" fontSize={11} fontWeight={600} />
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            ) : (
                              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                {loading ? 'Carregando...' : 'Nenhuma equipe encontrada com os filtros aplicados'}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
                          {!loading && equipesFiltradas.map((equipe, index) => (
                            <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-semibold text-gray-900 text-sm truncate" title={equipe.equipe}>{equipe.equipe}</p>
                              </div>
                              <p className="text-xs text-gray-400 mb-3">{equipe.total.toLocaleString('pt-BR')} atendimentos</p>
                              <div className="flex flex-wrap gap-2">
                                <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-lg" title="Tempo médio de atendimento">
                                  Atend.: {equipe.tempoMedioFormatado}
                                </span>
                                <span className="text-xs bg-amber-50 text-amber-700 font-semibold px-2.5 py-1 rounded-lg" title="Tempo médio de espera">
                                  Espera: {equipe.tempoEsperaMedioFormatado}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )
                  })()}
                </>
              )}
            </div>
          )}

          {/* ── Agentes ── */}
          {activeTab === 'agentes' && (
            <div className="space-y-6">
              <FiltroBar />
              {!filtro.dataInicio ? <SemFiltro /> : (
                <>
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <Headphones className="w-5 h-5 text-red-600" />
                      <h2 className="text-base font-bold text-gray-900">Performance por Agente</h2>
                    </div>
                    <p className="text-xs text-gray-400 mb-5">Top agentes por volume de atendimentos</p>
                    <div className="h-96">
                      {!loading && agentes.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={agentes.slice(0, 10)} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                            <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                            <YAxis dataKey="agente" type="category" width={150} tick={{ fontSize: 11 }} stroke="#9ca3af" />
                            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} formatter={(value: number, name: string, props: any) => { if (name === 'total') return [value.toLocaleString('pt-BR'), 'Atendimentos']; return [props.payload.tempoMedioFormatado, 'Tempo Médio'] }} />
                            <Bar dataKey="total" fill="#6b7280" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">{loading ? 'Carregando...' : 'Sem dados para o período'}</div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {!loading && agentes.slice(0, 8).map((agente, index) => (
                      <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
                        <img
                          src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(agente.agente)}&backgroundColor=fecaca,fed7aa,bbf7d0,bfdbfe,e9d5ff,fde68a`}
                          alt={agente.agente}
                          className="w-11 h-11 rounded-full flex-shrink-0 border-2 border-gray-200 bg-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{agente.agente}</p>
                          <p className="text-xs text-gray-500"><span className="font-bold text-gray-800">{agente.total.toLocaleString('pt-BR')} atend.</span> · {agente.tempoMedioFormatado}</p>
                          {/* 1ª resp.: aguardando validação do cálculo */}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Canais ── */}
          {activeTab === 'canais' && (
            <div className="space-y-6">
              <FiltroBar />
              {!filtro.dataInicio ? <SemFiltro /> : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <PieChartIcon className="w-5 h-5 text-red-600" />
                      <h2 className="text-base font-bold text-gray-900">Distribuição por Canal</h2>
                    </div>
                    <p className="text-xs text-gray-400 mb-4">Percentual de atendimentos por canal</p>
                    <div className="h-72">
                      {!loading && canais.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={canais} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="total" nameKey="canal">
                              {canais.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number, _name: string, props: any) => { const c = props.payload; return [`${value.toLocaleString('pt-BR')} (${c.percentual}%)`, c.canal] }} contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">{loading ? 'Carregando...' : 'Sem dados para o período'}</div>
                      )}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-base font-bold text-gray-900 mb-1">Canais de Atendimento</h2>
                    <p className="text-xs text-gray-400 mb-5">Volume por tipo de canal e número</p>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {loading ? (
                        <p className="text-gray-400 text-sm">Carregando...</p>
                      ) : canais.map((canal, index) => (
                        <div key={index} className="space-y-2">
                          {/* Canal principal */}
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold text-gray-800">{canal.canal}</span>
                                <span className="text-xs text-gray-500">{canal.total.toLocaleString('pt-BR')} ({canal.percentual}%)</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div className="h-1.5 rounded-full transition-all" style={{ width: `${canal.percentual}%`, backgroundColor: COLORS[index % COLORS.length] }} />
                              </div>
                            </div>
                          </div>
                          {/* Números do canal (expandido) */}
                          {canal.numeros && canal.numeros.length > 0 && (
                            <div className="ml-6 space-y-1.5 border-l-2 border-gray-200 pl-3">
                              {canal.numeros.map((num, numIndex) => (
                                <div key={numIndex} className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length], opacity: 0.6 }} />
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-600 truncate" title={num.numero}>{num.numero}</span>
                                      <span className="text-xs text-gray-400">{num.total.toLocaleString('pt-BR')} ({num.percentual}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1 mt-0.5">
                                      <div
                                        className="h-1 rounded-full transition-all"
                                        style={{ width: `${num.percentual}%`, backgroundColor: COLORS[index % COLORS.length], opacity: 0.6 }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Classificações ── */}
          {activeTab === 'classificacoes' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-semibold text-gray-600">Ano:</span>
                    <Select value={anoClassificacao} onValueChange={(v) => { setAnoClassificacao(v); setMesClassificacao('') }}>
                      <SelectTrigger className="w-28 border-gray-300 text-sm"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2026">2026</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {anoClassificacao && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-600">Mês:</span>
                      <Select value={mesClassificacao} onValueChange={setMesClassificacao}>
                        <SelectTrigger className="w-36 border-gray-300 text-sm"><SelectValue placeholder="Todos os meses" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos os meses</SelectItem>
                          {MESES.map((m) => (<SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {pesquisado && todasClassificacoes.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-600">Classificação:</span>
                      <Select value={classificacaoFiltroLocal} onValueChange={setClassificacaoFiltroLocal}>
                        <SelectTrigger className="w-64 border-gray-300 text-sm"><SelectValue placeholder="Todas as classificações" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todas as classificações</SelectItem>
                          {todasClassificacoes.map((c: string, i: number) => (<SelectItem key={i} value={c}>{c}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <button
                    onClick={handlePesquisarClassificacoes}
                    disabled={!anoClassificacao || loadingClassificacoes}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    {loadingClassificacoes ? 'Buscando...' : 'Pesquisar'}
                  </button>
                  {pesquisado && (
                    <span className="text-xs text-gray-500 font-medium">
                      {mesClassificacao ? `${MESES.find(m => m.value === mesClassificacao)?.label} / ${anoClassificacao}` : `Ano: ${anoClassificacao}`}
                      {classificacaoFiltroLocal ? ` · ${classificacaoFiltroLocal}` : ''}
                    </span>
                  )}
                </div>
              </div>

              {!pesquisado ? (
                <div className="flex flex-col items-center justify-center h-56 text-gray-400 gap-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                    <Tag className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-base font-medium">Nenhuma pesquisa realizada</p>
                  <p className="text-sm">Selecione um ano e clique em <span className="font-semibold text-red-600">Pesquisar</span></p>
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-base font-bold text-gray-900 mb-1">Classificações</h2>
                    <p className="text-xs text-gray-400 mb-5">{classificacaoFiltroLocal ? `Mostrando apenas: ${classificacaoFiltroLocal}` : 'Volume por tipo de classificação'}</p>
                    {loadingClassificacoes ? (
                      <p className="text-gray-400 text-sm">Carregando...</p>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
                        {classificacoes.map((item: any, index: number) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold text-gray-800 truncate">{item.classificacao}</span>
                                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{item.total.toLocaleString('pt-BR')} ({item.percentual}%)</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div className="h-1.5 rounded-full" style={{ width: `${item.percentual}%`, backgroundColor: COLORS[index % COLORS.length] }} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <Headphones className="w-5 h-5 text-red-600" />
                      <h2 className="text-base font-bold text-gray-900">Classificações por Agente</h2>
                    </div>
                    <p className="text-xs text-gray-400 mb-5">{classificacaoFiltroLocal ? `Agentes que atenderam "${classificacaoFiltroLocal}"` : 'Quantidade de atendimentos por agente e classificação'}</p>
                    <div className="h-96">
                      {!loadingClassificacoes && classificacoesPorAgente.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={classificacoesPorAgente.slice(0, 20)} layout="vertical" margin={{ left: 100 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                            <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                            <YAxis dataKey="agente" type="category" width={120} tick={{ fontSize: 11 }} stroke="#9ca3af" />
                            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} formatter={(_v: number, _n: string, props: any) => [_v, props.payload.classificacao]} labelFormatter={(label) => `Agente: ${label}`} />
                            <Bar dataKey="total" fill="#dc2626" radius={[0, 4, 4, 0]} name="Atendimentos" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">{loadingClassificacoes ? 'Carregando...' : 'Sem dados para o período'}</div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-base font-bold text-gray-900 mb-5">Detalhamento por Agente</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Agente</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Classificação</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {loadingClassificacoes ? (
                            <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-400">Carregando...</td></tr>
                          ) : (
                            classificacoesPorAgente.slice(0, 50).map((item: any, index: number) => (
                              <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 font-semibold text-gray-900">{item.agente}</td>
                                <td className="px-4 py-3 text-gray-600">{item.classificacao}</td>
                                <td className="px-4 py-3 text-right font-bold text-gray-900">{item.total.toLocaleString('pt-BR')}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Classificações Helena ── */}
          {activeTab === 'classificacoes-helena' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-red-600" />
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
                <div className="flex flex-col items-center justify-center h-56 text-gray-400 gap-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                    <Tag className="w-6 h-6 text-gray-400" />
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
                <div className="space-y-6">
                  {/* KPI Card total classificado */}
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-5 h-5 text-red-600" />
                      <h2 className="text-base font-bold text-gray-900">Total de Classificações</h2>
                    </div>
                    <p className="text-xs text-gray-400 mb-4">Conversas finalizadas com classificação no período</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-4">
                        <div className="bg-green-100 p-3 rounded-xl flex-shrink-0">
                          <Tag className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Classificados</p>
                          <p className="text-3xl font-bold text-green-800 mt-1">
                            {loadingClassificacoesHelena ? '—' : (classificacoesHelena?.total ?? 0).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex items-center gap-4">
                        <div className="bg-gray-200 p-3 rounded-xl flex-shrink-0">
                          <MessageSquare className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Finalizados</p>
                          <p className="text-3xl font-bold text-gray-800 mt-1">
                            {loadingClassificacoesHelena ? '—' : (classificacoesHelena?.totalFinalizados ?? 0).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-xl flex-shrink-0">
                          <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Taxa de Classificação</p>
                          <p className="text-3xl font-bold text-blue-800 mt-1">
                            {loadingClassificacoesHelena || !classificacoesHelena || classificacoesHelena.totalFinalizados === 0 ? '—' : `${Math.round(((classificacoesHelena?.total ?? 0) / classificacoesHelena.totalFinalizados) * 100)}%`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Gráfico de barras horizontais - classificações */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                      <h2 className="text-base font-bold text-gray-900 mb-1">Classificações</h2>
                      <p className="text-xs text-gray-400 mb-5">Volume por tipo de classificação (Helena CRM)</p>
                      {loadingClassificacoesHelena ? (
                        <p className="text-gray-400 text-sm">Carregando...</p>
                      ) : classificacoesHelena && classificacoesHelena.classificacoes.length > 0 ? (
                        <div className="grid grid-cols-1 gap-x-8 gap-y-4">
                          {classificacoesHelena.classificacoes.map((item, index) => (
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
                          <div className="h-full flex items-center justify-center text-gray-400 text-sm">{loadingClassificacoesHelena ? 'Carregando...' : 'Sem dados para o período'}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tabela detalhada */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-base font-bold text-gray-900 mb-5">Detalhamento por Agente</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
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
                      Ao vivo · atualiza a cada 5s
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

        </main>
      </div>
    </div>
  )
}

export default App
