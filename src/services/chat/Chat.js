import uuidv4 from "@/src/services/util/uuidv4";
import storage from "../storage";

export default class Chat {
  id = "";
  message_id = "";
  created_at = "";
  message = "";
  sender_id = storage.getString("user.id");
  trip_id = "";
  receiver_id = "";

  constructor(message, id, receiver_id) {
    this.id = uuidv4();
    this.message_id = this.id;
    this.message = message;
    this.trip_id = id;
    this.receiver_id = receiver_id;
    this.created_at = new Date()
      .toISOString()
      .toLocaleString("en-US", { timeZone: "Asia/Manila" });
  }
}
