import axios from "@/src/services/axios";

export default async function ocr(base64Image) {
  console.debug("Received Optical character recognition request.");
  const response = await axios.post(
    "https://vision.googleapis.com/v1/images:annotate?key=REDACTED",
    {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [{ type: "TEXT_DETECTION", maxResults: 5 }],
        },
      ],
    },
  );

  return response;
}
