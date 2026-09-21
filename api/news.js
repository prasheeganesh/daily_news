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

      return res.status(200).json({
        success: true,
        date: data.date,
        updatedAt: data.updatedAt,
        news: Array.isArray(data.news) ? data.news : []
      });

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

      // Convert JSON string from Zapier into an object
      if (typeof news === "string") {
        try {
          news = JSON.parse(news);
        } catch {
          news = [];
        }
      }

      // Zapier AI output:
      // { result: { items: [...] }, _agent_meta: {...} }
      if (news && news.result && Array.isArray(news.result.items)) {
        news = news.result.items;
      }

      // If result itself is a string containing JSON
      if (
        news &&
        typeof news === "object" &&
        news.result &&
        typeof news.result === "string"
      ) {
        try {
          const parsed = JSON.parse(news.result);

          if (Array.isArray(parsed)) {
            news = parsed;
          } else if (Array.isArray(parsed.items)) {
            news = parsed.items;
          }
        } catch {
          news = [];
        }
      }

      // If still not an array, make it an array
      if (!Array.isArray(news)) {
        news = [news];
      }

      // Normalize field names
      news = news.map(item => ({
        headline:
          item.headline ||
          item.Headline ||
          "Daily News",

        summary:
          item.summary ||
          item.Summary ||
          "",

        whyItMatters:
          item.whyItMatters ||
          item["Why It Matters"] ||
          "",

        source:
          item.source ||
          item.Source ||
          "Unknown",

        url:
          item.url ||
          item.URL ||
          item["Original Link"] ||
          ""
      }));

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
