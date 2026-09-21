import { put, list } from "@vercel/blob";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET — website loads latest news
  if (req.method === "GET") {
    try {
      const result = await list({
        prefix: "latest-news.json"
      });

      if (!result.blobs || result.blobs.length === 0) {
        return res.status(200).json({
          success: true,
          news: []
        });
      }

      const blob = result.blobs[0];

      const response = await fetch(blob.url);
      const data = await response.json();

      return res.status(200).json(data);

    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // POST — Zapier sends news
  if (req.method === "POST") {
    try {
      const body = req.body || {};

      let news = body.news || "";

      const data = {
        success: true,
        date: body.date || new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString(),
        news: news
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
        data: data
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
