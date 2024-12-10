import { Audio } from "expo-av";
import { Vibration } from "react-native";

let sound;
let isPlaying = false;

export default async function handlePlayIncomingTripSound() {
  if (process.env.NODE_ENV === "development") return;
  if (isPlaying) return;

  if (!sound) {
    const data = await Audio.Sound.createAsync(
      require("@/src/assets/wav/trip.wav")
    );
    sound = data.sound;
  }

  await sound.replayAsync();
  isPlaying = true;
  Vibration.vibrate([250, 250, 250, 250, 250, 250, 250]);

  setTimeout(() => {
    isPlaying = false;
  }, 2000);
}
