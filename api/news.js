import { put, list } from "@vercel/blob";

export default async function handler(req, res) {

  // =========================
  // ZAPIER → VERCEL
  // =========================
  if (req.method === "POST") {

    try {

      const body = req.body || {};

      const news = body.news || [];

      const data = {
        date: body.date || new Date().toLocaleDateString("en-IN"),
        updatedAt: new Date().toISOString(),
        news: news
      };

      await put(
        "latest-news.json",
        JSON.stringify(data),
        {
          access: "public",
          addRandomSuffix: false,
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


  // =========================
  // VERCEL → WEBSITE
  // =========================
  if (req.method === "GET") {

    try {

      const result = await list({
        prefix: "latest-news.json",
        limit: 1
      });

      if (!result.blobs || result.blobs.length === 0) {

        return res.status(200).json({
          date: null,
          news: []
        });

      }

      const blob = result.blobs[0];

      const response = await fetch(blob.url);

      const data = await response.json();

      return res.status(200).json(data);

    } catch (error) {

      return res.status(500).json({
        error: "Unable to load news"
      });

    }
  }


  return res.status(405).json({
    error: "Method not allowed"
  });

}
