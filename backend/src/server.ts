import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import kpiRoutes from './routes/kpi.routes';
import helenaRoutes from './routes/helena.routes';
import path from 'path';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3003', 10);

app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api/kpis', kpiRoutes);
app.use('/api/helena', helenaRoutes);

// Servir arquivos estáticos do Frontend em produção
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// Rota para o Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Qualquer outra rota redireciona para o index.html do Frontend (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 API de KPIs disponível em:`);
  console.log(`   Local:   http://localhost:${PORT}/api/kpis`);
  console.log(`   Rede:    http://192.168.0.96:${PORT}/api/kpis`);
});
