import storage from "@/src/services/storage";
import getProfiles from "../api/getProfiles";
import { useQuery } from "@tanstack/react-query";

export default function useProfiles() {
  const id = storage.getString("user.id");

  return useQuery({
    queryKey: ["getProfiles", id],
    queryFn: () => getProfiles(id),
  });
}
