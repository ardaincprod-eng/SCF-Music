
const { Client } = require('pg');

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const data = JSON.parse(event.body);
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    const query = `
      INSERT INTO releases (user_id, song_title, artist_name, copyright_year, copyright_holder, producer_credits, artwork_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      data.userId, 
      data.songTitle, 
      data.artistName, 
      data.copyrightYear, 
      data.copyrightHolder, 
      data.producerCredits, 
      data.artworkUrl
    ];

    const result = await client.query(query, values);

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.rows[0])
    };
  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  } finally {
    await client.end();
  }
};
