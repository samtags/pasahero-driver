import { useRef, useEffect, useState } from "react";
import OrderedMap from "@/src/services/ordered-map";
import subscribe from "@/src/services/realtime";
import getChats from "@/src/services/api/getChats";
import sendChat from "@/src/services/api/sendChat";
import Chat from "./Chat";
import storage from "../storage";
import moment from "moment";

export default function useChats(tripId, driverId) {
  const chatsMap = useRef(new OrderedMap());
  const [_, toggleState] = useState(false);

  function handleRerender() {
    setTimeout(() => toggleState((state) => !state), 250);
  }

  function send(message) {
    const chat = new Chat(message, tripId, driverId);

    addChat(chat);
    sendChat(chat);
  }

  function addChat(chat) {
    // check if already in chat list
    if (chatsMap?.current?.get(chat.id)) {
      console.log("Chat already in the list.", chat);
      return;
    }

    // otherwise add it
    chatsMap?.current?.addToEnd?.(chat.id, chat);
    console.log("Added chat to the list.", chat, chatsMap?.current?.size?.());

    // if added rerender the list
    handleRerender();

    // cache the chats
    storage.set(`__tmp_chats.${tripId}.${chat.id}`, JSON.stringify(chat));
  }

  useEffect(() => {
    // get chats from cache
    console.log("Getting chats from cache.");
    storage
      .getAllKeys()
      // filter the cache keys
      .filter((key) => key.includes(`__tmp_chats.${tripId}.`))
      // parse the chats
      .map((key) => JSON.parse(storage.getString(key)))
      // sort the chats by date
      .sort((a, b) => {
        if (moment(a.created_at).valueOf() < moment(b.created_at).valueOf()) return -1; // prettier-ignore
        if (moment(a.created_at).valueOf() > moment(b.created_at).valueOf()) return 1; // prettier-ignore
        return 0;
      })
      // add to the list by order
      .forEach((chat) => addChat(chat));

    // get chats
    console.log("Getting chats from server.");
    getChats(tripId)
      .then((chats) => {
        if (chats?.length > 0) {
          chats.forEach(addChat);
        }
      })
      .catch((err) => {
        console.log("Unable to get chats", err);
      });

    // subscribe to incoming chats
    console.log("Subscribing to incoming chats.");
    const unsubscribe = subscribe(`messages.${tripId}`, addChat);
    return () => unsubscribe?.();
  }, []);

  return {
    chats: chatsMap?.current?.map?.((_, value) => value),
    send,
  };
}
