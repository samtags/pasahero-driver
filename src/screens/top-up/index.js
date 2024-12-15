import { Alert, TextInput, View } from "react-native";
import Cta from "@/src/components/cta";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import JSON from "@/src/services/json";
import Text from "@/src/components/text";
import bucket from "@react-native-firebase/storage";
import storage from "@/src/services/storage";
import router from "@/src/services/router";
import { resetTopups } from "@/src/services/queries/useTopups";
import ocr from "@/src/services/api/ocr";
import OcrGpt from "@/src/services/api/ocr-gpt";
import topUp from "@/src/services/api/topUp";

export default function TopUpScreen() {
  const [file, setFile] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState();
  const [reference, setReference] = useState();

  async function handleOnPress() {
    setIsLoading(true);

    const results = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      selectionLimit: 1,
      base64: true,
    });

    const file = results.assets?.[0];
    setFile(file);

    console.debug("Sending request to vision api");
    const response = await ocr(file?.base64);

    const words = response?.data?.responses?.[0]?.fullTextAnnotation?.text;

    if (!words) {
      console.debug("No words found in image");
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
  }

  async function onSubmitTopup() {
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
    <View>
      <Text>{file?.fileName}</Text>
      <Cta onPress={handleOnPress}>Upload Screenshot</Cta>

      <View>
        <TextInput
          editable={false}
          value={amount}
          onChangeText={setAmount}
          placeholder="Enter amount"
        />
      </View>

      <View>
        <TextInput
          editable={false}
          value={reference}
          onChangeText={setReference}
          placeholder="Reference Number"
        />
      </View>

      <Cta disabled={isLoading} color="#6366F1" onPress={onSubmitTopup}>
        Submit Top up
      </Cta>
    </View>
  );
}
