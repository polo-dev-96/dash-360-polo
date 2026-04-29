import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import kpiRoutes from './routes/kpi.routes';
import helenaRoutes from './routes/helena.routes';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors());
app.use(express.json());

app.use('/api/kpis', kpiRoutes);
app.use('/api/helena', helenaRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 API de KPIs disponível em:`);
  console.log(`   Local:   http://localhost:${PORT}/api/kpis`);
  console.log(`   Rede:    http://192.168.0.96:${PORT}/api/kpis`);
});
