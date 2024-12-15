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
    console.log("🚀 ~ handleOnPress ~ file:", file);

    console.log("Sending request to vision api");
    const response = await axios.post(
      "https://vision.googleapis.com/v1/images:annotate?key=REDACTED",
      {
        requests: [
          {
            image: {
              content: file?.base64,
            },
            features: [{ type: "TEXT_DETECTION", maxResults: 5 }],
          },
        ],
      }
    );
    console.log(
      "🚀 ~ handleOnPress ~ response:",
      response?.data?.responses?.[0]
    );

    const words = response?.data?.responses?.[0]?.fullTextAnnotation?.text;

    if (!words) {
      console.log("No words found in image");
      return setIsLoading(false);
    }

    const content = `""" ${words} """ Extract the amount and reference number and return them in JSON format { amount, reference } . JSON answer only.`;

    console.log("🚀 ~ handleOnPress ~ content:", content);

    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content,
          },
        ],
        functions: [
          {
            name: "extractJson",
            parameters: {
              type: "object",
              properties: {
                amount: {
                  type: "number",
                },
                reference: {
                  type: "string",
                },
              },
            },
          },
        ],
        function_call: { name: "extractJson" },
      },
      {
        headers: {
          Authorization:
            "Bearer REDACTED",
        },
      }
    );

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

    console.log("Uploading profile image", { now, uri, fileName, file, path }); // prettier-ignore
    const task = ref.putFile(uri);

    await new Promise((resolve, reject) => {
      task
        .then(async () => {
          const screenshot = await ref.getDownloadURL();
          const driver_id = storage.getString("user.id");

          setIsLoading(false);
          console.log("Profile image uploaded", { screenshot });
          await axios
            .post("https://driver.pasahero.app/wallet/top-up", {
              reference,
              amount: Number(amount),
              screenshot,
              driver_id,
            })
            .then(() => {
              Alert.alert("Success", "Top up successful", [
                {
                  text: "OK",
                  onPress: router.back,
                },
              ]);
              resolve();
            })
            .catch((err) => {
              console.log("🚀 ~ .then ~ err:", err);
              Alert.alert("Unable to upload.", "Please try again later.");
            });
        })
        .catch((err) => {
          console.log("🚀 ~ onSubmitTopup ~ err:", err);
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
          editable={isLoading === false}
          value={amount}
          onChangeText={setAmount}
          placeholder="Enter amount"
        />
      </View>

      <View>
        <TextInput
          editable={isLoading === false}
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
