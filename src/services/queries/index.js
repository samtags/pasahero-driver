import { UNSAFE_retrieveProperty } from "../global";

export default function getQueryClient() {
  return UNSAFE_retrieveProperty("__queryClient__");
}
