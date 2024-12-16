import {
  Alert,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Cta from "@/src/components/cta";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import JSON from "@/src/services/json";
import Text from "@/src/components/text";
import bucket from "@react-native-firebase/storage";
import storage from "@/src/services/storage";
import router from "@/src/services/router";
import { resetTopups } from "@/src/services/queries/useTopups";
import ocr from "@/src/services/api/ocr";
import OcrGpt from "@/src/services/api/ocr-gpt";
import topUp from "@/src/services/api/topUp";
import Optional from "@/src/components/optional";
import {
  mayaActive,
  gcashActive,
  mayaInactive,
  gcashInactive,
  mayaQrFrame,
  gCashQrFrame,
} from "@/src/services/images/remote";
import { Image } from "expo-image";
import amt from "@/src/services/util/amount";
import { useFeatureValue } from "@growthbook/growthbook-react";

export default function TopUpScreen() {
  const [file, setFile] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState();
  const [reference, setReference] = useState();
  const [provider, setProvider] = useState("GCash"); // Gcash or Maya
  const color = provider === "GCash" ? "#1380FE" : "#000";

  const gcashQr = useFeatureValue("gcash-qr");
  const mayaQr = useFeatureValue("maya-qr");

  async function handleOnPress() {
    setIsLoading(true);

    const results = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      selectionLimit: 1,
      base64: true,
    });

    const file = results.assets?.[0];

    if (!file) {
      return setIsLoading(false);
    }

    setFile(file);

    console.debug("Sending request to vision api");
    const response = await ocr(file?.base64);

    const words = response?.data?.responses?.[0]?.fullTextAnnotation?.text;

    if (!words) {
      console.debug("No words found in image");
      Alert.alert(
        "Invalid proof",
        `Unable to read the screenshot you selected. Please make sure you are selecting ${provider} transaction screenshot. If the issue persists, please contact us.`
      );
      setFile();
      setAmount();
      setReference();
      return setIsLoading(false);
    }

    const content = `""" ${words} """ Extract the amount and reference number and return them in JSON format { amount, reference } . JSON answer only.`;

    console.debug("prompt:", content);

    const res = await OcrGpt(content);
    setIsLoading(false);

    const result = res.data?.choices?.[0]?.message?.function_call?.arguments;
    const extract = JSON.parse(result, {});

    if (extract.amount) setAmount(String(extract.amount));
    if (extract.reference) setReference(extract.reference);
    else {
      Alert.alert(
        "No reference found",
        `Unable to extract the reference number from the screenshot you selected. Please make sure you are reference number is visible on the screenshot. If the issue persists, please contact us.`
      );
    }
  }

  async function onSubmitTopup() {
    if (!file) {
      return Alert.alert(
        "Unable to find screenshot",
        "Please select a screenshot and try again."
      );
    }
    setIsLoading(true);

    const uri = file?.uri;
    const fileName = uri?.split("ImagePicker/")?.[1];

    const user = storage.getString("user.id");
    const now = Date.now();
    const path = `/top-up/${user}/${now}-${fileName}`;

    const ref = bucket().ref(path);

    console.debug("Uploading profile image", { now, uri, fileName, file, path }); // prettier-ignore
    const task = ref.putFile(uri);

    await new Promise((resolve, reject) => {
      task
        .then(async () => {
          const screenshot = await ref.getDownloadURL();

          setIsLoading(false);
          console.debug("Profile image uploaded", { screenshot });
          topUp({
            reference,
            amount: Number(amount),
            screenshot,
          })
            .then(() => {
              Alert.alert("Success", "Top up successful", [
                {
                  text: "OK",
                  onPress: router.back,
                },
              ]);
              resetTopups();
              resolve();
            })
            .catch((err) => {
              console.debug("Unable to top-up", err);
              Alert.alert(
                "Try again later.",
                "Unable to submit top up request at this time. If the problem persists, please contact us."
              );
            });
        })
        .catch((err) => {
          console.debug("Unable to upload image", err);
          Alert.alert(
            "Unable to upload.",
            "There is wrong with the image you selected. Please try again."
          );
          reject();
        });
    });
  }

  return (
    <View style={{ backgroundColor: "white", padding: 16, flex: 1 }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          gap: 24,
          padding: 16,
        }}
      >
        <View
          style={{
            position: "relative",
            width: 204,
            height: 204,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={provider === "GCash" ? gCashQrFrame : mayaQrFrame}
            style={{ width: "100%", height: "100%" }}
          />
          <Image
            source={provider === "GCash" ? gcashQr : mayaQr}
            cachePolicy="memory-disk"
            style={{
              position: "absolute",
              width: 160,
              height: 160,
            }}
          />
        </View>

        <View style={{ flexDirection: "row", gap: 32 }}>
          <TouchableOpacity onPress={() => setProvider("GCash")}>
            <View
              style={{ justifyContent: "center", alignItems: "center", gap: 4 }}
            >
              <Image
                style={{
                  width: 24,
                  height: 24,
                }}
                source={provider === "GCash" ? gcashActive : gcashInactive}
                cachePolicy="memory-disk"
              />
              <Text
                weight={provider === "GCash" ? "700" : "400"}
                color={provider === "GCash" ? "#1380FE" : "#707070"}
              >
                GCash
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setProvider("Maya")}>
            <View
              style={{ justifyContent: "center", alignItems: "center", gap: 4 }}
            >
              <Image
                style={{
                  width: 24,
                  height: 24,
                }}
                source={provider === "Maya" ? mayaActive : mayaInactive}
                cachePolicy="memory-disk"
              />

              <Text
                color={provider === "Maya" ? "#000" : "#707070"}
                weight={provider === "Maya" ? "700" : "400"}
              >
                Maya
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flexShrink: 0, gap: 16 }}>
        <Input
          label="Proof"
          value={file?.fileName || "No screenshot selected"}
          helperText="Press to select screenshot."
          onPress={handleOnPress}
          disabled={isLoading}
        />

        <Input
          label="Amount"
          value={amt.format(amount || 0)}
          disabled
          helperText=""
        />
        <Input label="Reference" value={reference} disabled helperText="" />

        <Cta
          textColor={provider === "GCash" ? "#fff" : "#30F19E"}
          disabled={isLoading}
          color={color}
          onPress={onSubmitTopup}
        >
          Submit Top up
        </Cta>
      </View>
    </View>
  );
}

function Input({ helperText, label, value, disabled, onPress }) {
  return (
    <>
      <TouchableOpacity onPress={() => onPress?.()} disabled={disabled}>
        <View style={styles.input(disabled)}>
          <Text style={{ width: 110 }} weight="700" size={14} color="#707070">
            {label}
          </Text>
          <View>
            <Text color="#707070" numberOfLines={1} size={13.5}>
              {value}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <Optional condition={helperText}>
        <View
          style={{
            flexDirection: "row",
            gap: 4,
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          <Text color="#c1c1c1" size={13}>
            {helperText}
          </Text>
          <View style={{ opacity: disabled ? 1 : 0 }}>
            <ActivityIndicator size="small" color="#c1c1c1" />
          </View>
        </View>
      </Optional>
    </>
  );
}

const styles = StyleSheet.create({
  input: (disabled) => ({
    backgroundColor: "#EFEFF0",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    opacity: disabled ? 0.5 : 1,
  }),
});
