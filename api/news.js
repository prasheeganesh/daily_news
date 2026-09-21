export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET
  if (req.method === "GET") {
    return res.status(200).json({
      success: true,
      message: "Daily News API is working",
      news: []
    });
  }

  // POST
  if (req.method === "POST") {
    try {
      const body = req.body || {};

      return res.status(200).json({
        success: true,
        message: "News received from Zapier",
        received: body
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  return res.status(405).json({
    success: false,
    error: "Method not allowed"
  });
}
