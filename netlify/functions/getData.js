
const { Client } = require('pg');

exports.handler = async (event) => {
  const { userId } = event.queryStringParameters;
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Tablo yoksa oluştur (İlk çalıştırma için)
    await client.query(`
      CREATE TABLE IF NOT EXISTS releases (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        song_title TEXT,
        artist_name TEXT,
        copyright_year TEXT,
        copyright_holder TEXT,
        producer_credits TEXT,
        artwork_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const result = await client.query(
      'SELECT * FROM releases WHERE user_id = $1 ORDER BY created_at DESC', 
      [userId]
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.rows)
    };
  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  } finally {
    await client.end();
  }
};
