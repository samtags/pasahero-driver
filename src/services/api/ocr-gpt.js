import axios from "@/src/services/axios";

export default async function OcrGpt(content) {
  console.debug("Received Optical character recognition for GTP request.");
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content,
        },
      ],
      functions: [
        {
          name: "extractJson",
          parameters: {
            type: "object",
            properties: {
              amount: {
                type: "number",
              },
              reference: {
                type: "string",
              },
            },
          },
        },
      ],
      function_call: { name: "extractJson" },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
      },
    },
  );

  return response;
}
