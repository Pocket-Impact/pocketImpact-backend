import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const HF_API_URL = "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2";

export const analyzeSentiment = async (text) => {
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/distilbert/distilbert-base-uncased-finetuned-sst-2-english",
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: text }),
      }
    );

    let result;
    try {
      result = await response.json();
    } catch (err) {
      const textRes = await response.text();
      throw new Error(`Hugging Face API error: ${textRes}`);
    }

    if (result.error)
      throw new Error(`Hugging Face API error: ${result.error}`);

    // Hugging Face returns an array with { label: 'POSITIVE', score: 0.999 }
  return result[0];
};
