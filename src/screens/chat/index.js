import { View, TextInput, TouchableOpacity } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useRef } from "react";
import { send } from "@/src/services/images/remote";
import { useRouterParams, useScreen } from "@/src/services/router";
import useChats from "@/src/services/chat/useChats";
import Text from "@/src/components/text";
import storage from "@/src/services/storage";
import moment from "moment";
import useRenderCounter from "@/src/services/hooks/useRenderCounter";
import useOnFocus from "@/src/services/hooks/useOnFocus";

export default function ChatScreen() {
  useRenderCounter("ChatScreen");

  useScreen();

  const userId = storage.getString("user.id");
  const params = useRouterParams();
  const scrollViewRef = useRef();
  const refInput = useRef();
  const messageText = useRef();

  const chats = useChats(params?.id, params?.passenger_id);

  function handleScrollToBottom() {
    scrollViewRef?.current?.scrollToEnd?.();
  }

  function handleChangeText(text) {
    messageText.current = text;
  }

  function handleSendMessage() {
    if (!messageText.current) return;
    chats.send(messageText.current);

    refInput.current.clear();
    messageText.current = "";
  }

  useOnFocus(() => setTimeout(chats.refresh, 1000));

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ gap: 24, padding: 16 }}
        onContentSizeChange={handleScrollToBottom}
      >
        {chats?.chats?.map((chat) => {
          if (chat.sender_id === userId) {
            return (
              <SenderChat
                key={chat.id}
                createdAt={chat.created_at}
                message={chat.message}
              />
            );
          }

          return (
            <ReceiverChat
              key={chat.id}
              createdAt={chat.created_at}
              message={chat.message}
            />
          );
        })}
      </ScrollView>

      <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
        <TouchableOpacity onPress={() => refInput?.current?.focus?.()}>
          <View style={styles.bottom}>
            <TextInput
              multiline
              ref={refInput}
              placeholder="Enter your message"
              onChangeText={handleChangeText}
              style={{ fontFamily: "Lato-Regular", fontSize: 16, flex: 1 }}
            />
            <TouchableOpacity
              hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
              style={{ alignSelf: "center", paddingLeft: 24 }}
              onPress={handleSendMessage}
            >
              <Image
                source={send}
                cachePolicy="memory-disk"
                style={{ width: 28, height: 28 }}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SenderChat(props) {
  return (
    <View style={{ alignItems: "flex-end", gap: 8 }}>
      <View style={styles.senderChat}>
        <Text size={17} textAlign="right" color="white">
          {props.message}
        </Text>
      </View>
      <Text size={14} textAlign="right" color="#6B7280">
        {moment(props.createdAt).fromNow()}
      </Text>
    </View>
  );
}

function ReceiverChat(props) {
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row" }}>
        <View style={styles.receiverChat}>
          <Text style={styles.message}>{props.message}</Text>
        </View>
      </View>
      <Text size={14} color="#6B7280">
        {moment(props.createdAt).fromNow()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  primary: {
    backgroundColor: "gainsboro",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  title: {
    color: "#38434D",
    marginVertical: 16,
    textAlign: "center",
  },
  sender: {
    color: "gray",
  },
  message: {
    fontSize: 16,
    fontWeight: "600",
  },
  spacer: {
    padding: 8,
  },
  textAlignRight: { textAlign: "right" },
  bottom: {
    backgroundColor: "#F0F0F0",
    height: 81,
    borderRadius: 10,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  senderChat: {
    maxWidth: "80%",
    backgroundColor: "#6366F1",
    padding: 16,
    paddingRight: 18,
    borderRadius: 29,
    borderBottomRightRadius: 0,
  },
  receiverChat: {
    maxWidth: "80%",
    backgroundColor: "#F3F4F4",
    padding: 16,
    borderRadius: 29,
    borderBottomLeftRadius: 0,
  },
});
