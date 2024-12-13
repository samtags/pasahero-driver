import storage from "@/src/services/storage";

export default function handleResetUser() {
  storage.delete("user.id");
  storage.delete("user.name");
  storage.delete("user.firstName");
  storage.delete("user.lastName");
  storage.delete("user.imageUrl");
  storage.delete("user.email");
  storage.delete("user.service");
  storage.delete("user.profile_id");
}
