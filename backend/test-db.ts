import pool from './src/config/database';

async function testDatabase() {
  try {
    console.log('Testando conexão com o banco...');
    
    // Testar conexão
    const [test] = await pool.execute('SELECT 1 as test');
    console.log('✓ Conexão OK');
    
    // Listar colunas da tabela
    console.log('\nColunas da tabela atendimento_kardex:');
    const [columns] = await pool.execute('DESCRIBE atendimento_kardex');
    (columns as any[]).forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
    
    // Verificar se a coluna classificacao existe
    const hasClassificacao = (columns as any[]).some(col => col.Field === 'classificacao');
    console.log(`\n✓ Coluna 'classificacao' existe: ${hasClassificacao}`);
    
    if (hasClassificacao) {
      // Verificar range de datas na tabela
      console.log('\nVerificando datas disponíveis...');
      const [dateRange] = await pool.execute(`
        SELECT 
          MIN(criacao) as data_min,
          MAX(criacao) as data_max,
          COUNT(*) as total_registros
        FROM atendimento_kardex
      `);
      console.log('Range de datas:', dateRange);
      
      // Testar query de classificações com range amplo
      console.log('\nTestando query de classificações...');
      const [rows] = await pool.execute(`
        SELECT 
          COALESCE(classificacao, 'Sem Classificação') as classificacao,
          COUNT(*) as total
        FROM atendimento_kardex
        WHERE criacao BETWEEN '2020-01-01' AND '2030-12-31'
        GROUP BY classificacao
        HAVING classificacao IS NOT NULL AND classificacao != ''
        ORDER BY total DESC
        LIMIT 10
      `);
      console.log('Resultado:', rows);
      
      // Contar registros sem classificação
      const [semClass] = await pool.execute(`
        SELECT COUNT(*) as total
        FROM atendimento_kardex
        WHERE classificacao IS NULL OR classificacao = ''
      `);
      console.log('Registros sem classificação:', semClass);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit(0);
  }
}

testDatabase();
