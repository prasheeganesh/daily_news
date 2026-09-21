import { put, get } from "@vercel/blob";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET
  if (req.method === "GET") {
    try {
      const result = await get("latest-news.json", {
        access: "private"
      });

      if (!result || result.statusCode !== 200) {
        return res.status(200).json({
          success: true,
          news: []
        });
      }

      const text = await new Response(result.stream).text();
      const data = JSON.parse(text);

      // Make sure news is always an array
      if (!Array.isArray(data.news)) {
        data.news = [
          {
            headline: "Daily News",
            summary: String(data.news || ""),
            whyItMatters: "",
            source: "Zapier",
            url: ""
          }
        ];
      }

      return res.status(200).json(data);

    } catch (error) {
      return res.status(200).json({
        success: true,
        news: []
      });
    }
  }

  // POST
  if (req.method === "POST") {
    try {
      const body = req.body || {};

      let news = body.news || [];

      // If Zapier sends a JSON string containing an array
      if (typeof news === "string") {
        try {
          const parsed = JSON.parse(news);

          if (Array.isArray(parsed)) {
            news = parsed;
          } else {
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

      // If one object is received
      if (!Array.isArray(news)) {
        news = [news];
      }

      const data = {
        success: true,
        date:
          body.date ||
          new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString(),
        news
      };

      await put(
        "latest-news.json",
        JSON.stringify(data),
        {
          access: "private",
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: "application/json"
        }
      );

      return res.status(200).json({
        success: true,
        message: "News saved successfully",
        data
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
