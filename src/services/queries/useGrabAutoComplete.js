import { useQuery } from "@tanstack/react-query";
import autoComplete from "../api/grabAutoComplete";

/**
 *
 * @param {string} input
 */
export default function useGrabAutoComplete(input) {
  return useQuery({
    queryKey: ["grabAutoComplete", input],
    queryFn: async () => {
      if (!input) return [];

      const res = await autoComplete(input);
      return handleTransformCompatibilityWithGoogleAutoComplete(
        res?.data || []
      );
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

function handleTransformCompatibilityWithGoogleAutoComplete(data = []) {
  return data?.map((item) => {
    let description, main_text;

    if (item.Text) {
      const parts = item.Text.split(",");
      main_text = parts.shift();
      description = parts?.join(",")?.trim();
    }

    return {
      ...item,
      description,
      structured_formatting: {
        main_text,
      },
    };
  });
}
