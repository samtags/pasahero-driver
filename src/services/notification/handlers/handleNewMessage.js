import { Alert } from "react-native";
import router from "@/src/services/router";

export default function handleNewMessage(data, notification) {
  console.debug("Handling new message", { data, notification });

  // todo: prevent from showing the prompt when user is already in the message screen
  Alert.alert("Passenger", data.message, [
    {
      text: "Dismiss",
      style: "cancel",
      onPress: () => {},
    },
    {
      text: "Reply",
      style: "default",
      onPress: () => {
        router.navigate({
          pathname: `/chat`,
          params: {
            id: data.trip_id,
            passenger_id: data?.sender_id,
          },
        });
      },
    },
  ]);
}
