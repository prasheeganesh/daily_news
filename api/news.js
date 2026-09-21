export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Browser preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET — test API
  if (req.method === "GET") {
    return res.status(200).json({
      success: true,
      message: "Daily News API is working",
      news: []
    });
  }

  // POST — receive news from Zapier
  if (req.method === "POST") {
    try {
      const body = req.body || {};

      let news = body.news || [];

      // If Zapier sends news as a JSON string
      if (typeof news === "string") {
        try {
          news = JSON.parse(news);
        } catch {
          news = [
            {
              headline: "Daily News",
              summary: news,
              whyItMatters: "",
              source: "Zapier",
              url: ""
            }
          ];
        }
      }

      // If one object is received instead of an array
      if (!Array.isArray(news)) {
        news = [news];
      }

      const data = {
        success: true,
        date: body.date || new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString(),
        news: news
      };

      console.log("NEWS RECEIVED FROM ZAPIER:");
      console.log(JSON.stringify(data, null, 2));

      return res.status(200).json(data);

    } catch (error) {
      console.error("API ERROR:", error);

      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Other methods
  return res.status(405).json({
    success: false,
    error: "Method not allowed"
  });
}
