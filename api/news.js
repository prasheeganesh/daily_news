import { put, get } from "@vercel/blob";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET - Website loads saved news
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

      return res.status(200).json(data);

    } catch (error) {
      // No saved news yet
      if (
        error.message &&
        error.message.toLowerCase().includes("not found")
      ) {
        return res.status(200).json({
          success: true,
          news: []
        });
      }

      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // POST - Zapier sends news
  if (req.method === "POST") {
    try {
      const body = req.body || {};

      const data = {
        success: true,
        date:
          body.date ||
          new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString(),
        news: body.news || ""
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
