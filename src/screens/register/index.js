import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableWithoutFeedback,
  ActivityIndicator,
  TouchableOpacity,
  ToastAndroid,
  Alert,
} from "react-native";
import { useRef, useEffect, useState } from "react";
import Text from "@/src/components/text";
import { useUser } from "@clerk/clerk-expo";
import { router, useLocalSearchParams, Link } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import Cta from "@/src/components/cta";
import log from "@/src/services/log";
import storage from "@react-native-firebase/storage";
import Optional from "@/src/components/optional";
import store from "@/src/services/storage";
import { useRouterParams } from "@/src/services/router";
import submitRegistration from "@/src/services/api/registerProfile";
import updateProfile from "@/src/services/api/updateProfile";
import { useMMKVString } from "react-native-mmkv";
import getColorByService from "@/src/services/util/colors/getColorByService";
import handleGetPlatformByService from "@/src/services/util/trip/handleGetPlatformByService";
import { Profile } from "../profile";

export default function RegisterProfile() {
  const { user } = useUser();
  const client = useQueryClient();
  const params = useRouterParams();
  const scrollViewRef = useRef();
  const [service] = useMMKVString("user.service");
  const platform = handleGetPlatformByService(service);
  const [file, setFile] = useState();

  const [preview, setPreview] = useProfilePreview({
    first_name: params?.first_name,
    last_name: params?.last_name,
    mobile_number: params?.mobile_number,
    vehicle_make: params?.vehicle_make,
    vehicle_model: params?.vehicle_model,
    vehicle_plate_number: params?.vehicle_plate_number,
    image_url: params?.image_url,
    vehicle_color: params?.vehicle_color,
  });

  function handleRetriggerProfiles() {
    client.invalidateQueries(["getProfiles", store.getString("user.id")]);
  }

  const { isPending, mutate: handleSubmit } = useMutation({
    mutationFn: () => submitRegistration(params?.id),
    onSuccess: () => {
      handleRetriggerProfiles();
      Alert.alert(
        "Profile submitted!",
        "Please wait for a few minutes while we review your profile.",
        [
          {
            text: "OK",
            onPress: () => {
              router.navigate("/");
              setTimeout(() => {
                ToastAndroid.show(
                  "Your profile is now being reviewed",
                  ToastAndroid.LONG
                );
              }, 500);
            },
          },
        ]
      );
    },
    onError: () =>
      log.warn("Unable to submit profile", { id: params?.id, user: user?.id }),
  });

  useEffect(() => {
    return () => {
      handleRetriggerProfiles();
    };
  }, []);

  function handleSumbitProfile() {
    const hasUnInitializedValue = Object.keys(preview).some(
      (key) => Boolean(preview[key]) === false
    );

    if (hasUnInitializedValue) {
      // scroll to top of the scroll view
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      ToastAndroid.show("Make sure to fill all the fields.", ToastAndroid.LONG);
      return;
    }

    handleSubmit(params?.id);
  }

  let ctaLabel = "Submit to Accept Trips";

  if (params.status === "DECLINED") {
    ctaLabel = "Resubmit Profile";
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={{ padding: 24 }}
      >
        <Optional condition={params.status === "DECLINED"}>
          <TouchableOpacity
            onPress={() => router.navigate({ pathname: "/profile-guideline" })}
            style={{
              backgroundColor: "#EF4444",
              padding: 16,
              borderRadius: 12,
              marginBottom: 24,
            }}
          >
            <Text color="#fff" size={14}>
              Profile has been declined. Please make sure all the details are
              correct. You can read the{" "}
              <Text
                color="#fff"
                size={14}
                weight="700"
                style={{ textDecorationLine: "underline", marginTop: 16 }}
              >
                profile review guidelines.
              </Text>{" "}
              for more details.
            </Text>
          </TouchableOpacity>
        </Optional>

        <Optional condition={params.status === "DRAFT"}>
          <TouchableOpacity
            onPress={() => router.navigate("/profile-guideline")}
            style={{
              backgroundColor: "#f3f4f6",
              padding: 16,
              borderRadius: 12,
              marginBottom: 24,
            }}
          >
            <Text color="#707070" size={14}>
              Before filling out your profile, please read our{" "}
              <Text
                color="#707070"
                size={14}
                weight="700"
                style={{ textDecorationLine: "underline", marginTop: 16 }}
              >
                Profile review guidelines.
              </Text>
            </Text>
          </TouchableOpacity>
        </Optional>

        <View style={styles.header}>
          <Text size={18} weight="700" color="#1B1B1B">
            Vehicle Information
          </Text>
        </View>

        <View style={{ marginTop: 24 }} />

        <View style={{ gap: 12 }}>
          <ProfileInput
            name="vehicle_make"
            label="Brand (Make)"
            placeholder="Enter Vehicle Make"
            defaultValue={params?.vehicle_make}
            onBlur={(value) => setPreview("vehicle_make", value)}
            helperText="Example: Honda, Yamaha, Suzuki, etc."
          />

          <ProfileInput
            name="vehicle_model"
            label="Model"
            placeholder="Enter Vehicle Model"
            defaultValue={params?.vehicle_model}
            onBlur={(value) => setPreview("vehicle_model", value)}
            helperText="Example: Click 125i, Aerox 155, ADV160, etc."
          />

          <ProfileInput
            name="vehicle_color"
            label="Color"
            placeholder="Enter Vehicle Color"
            defaultValue={params?.vehicle_color}
            helperText="Vehicle color in OR/CR"
            onBlur={(value) => setPreview("vehicle_color", value)}
          />

          <ProfileInput
            name="vehicle_plate_number"
            label="Plate Number"
            placeholder="Enter Plate Number"
            defaultValue={params?.vehicle_plate_number}
            onBlur={(value) => setPreview("vehicle_plate_number", value)}
            helperText="Example: CBA3141, ABC123, etc."
          />
        </View>

        <View style={{ marginTop: 24 }} />

        <View style={styles.header}>
          <Text size={18} weight="700" color="#1B1B1B">
            Personal Information
          </Text>
        </View>

        <View style={{ marginTop: 24 }} />

        <ProfileInput
          name="first_name"
          label="First Name"
          placeholder="Enter your first name"
          defaultValue={params?.first_name}
          onBlur={(value) => setPreview("first_name", value)}
        />
        <View style={{ marginTop: 24 }} />

        <ProfileInput
          name="last_name"
          label="Last Name"
          placeholder="Enter your last name"
          defaultValue={params?.last_name}
          onBlur={(value) => setPreview("last_name", value)}
        />

        <View style={{ marginTop: 24 }} />

        <View style={{ gap: 12 }}>
          <ProfileInput
            name="mobile_number"
            label="Mobile Number"
            placeholder="Enter your mobile number"
            defaultValue={params?.mobile_number}
            onBlur={(value) => setPreview("mobile_number", value)}
            maxLength={11}
            helperText="Example: 09123456789 (Not visible to passengers)"
          />

          <FileInput
            name="image_url"
            label="Driver Photo"
            placeholder={preview?.image_url || "Select a photo"}
            helperText={`Photo wearing your ${platform} gears`}
            onChange={(value) => setPreview("image_url", value)}
            onChangeFile={setFile}
          />
        </View>

        <View style={{ marginTop: 24 }} />

        <View style={styles.header}>
          <Text size={18} weight="700" color="#1B1B1B">
            Profile Preview
          </Text>
        </View>

        <Profile
          showRadioButton={false}
          brand={preview?.vehicle_make}
          firstName={preview?.first_name}
          lastName={preview?.last_name}
          mobile_number={preview?.mobile_number}
          img={file?.uri || preview?.image_url || params?.image_url}
          model={preview?.vehicle_model}
          platenNumber={preview?.vehicle_plate_number}
          color={preview?.vehicle_color}
        />

        <View style={{ marginTop: 24 }} />

        <View style={{ marginTop: 180 }} />

        <Text
          style={{ marginBottom: 20 }}
          textAlign="center"
          color="#707070"
          size={14}
        >
          By submitting your profile, you agree to the{" "}
          <Link
            href="/terms-condition"
            style={{ textDecorationLine: "underline" }}
          >
            Terms and Conditions
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy-policy"
            style={{ textDecorationLine: "underline" }}
          >
            Privacy Policy
          </Link>
          .
        </Text>
        <Cta
          disabled={isPending}
          onPress={handleSumbitProfile}
          style={{ opacity: isPending ? 0.5 : 1 }}
          color={getColorByService(service)}
        >
          {ctaLabel}
        </Cta>
      </ScrollView>
    </View>
  );
}

function useProfilePreview(initialState = {}) {
  const [state, setState] = useState(initialState);

  function handleUpdateState(key, value) {
    setState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  }

  return [state, handleUpdateState];
}

function ProfileInput({
  label, //
  placeholder,
  name,
  disabled,
  onPress,
  keyboardType = "default",
  onBlur, // (value) => {}
  type = "text",
  defaultValue,
  helperText,
  maxLength,
}) {
  const params = useLocalSearchParams();

  const [value, setValue] = useState("");

  useEffect(() => {
    if (params?.[name]) setValue(params?.[name]);
  }, []);

  function handleOnBlur() {
    updateProfile(params?.id, { [name]: value });
    onBlur?.(value);
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={() => onPress?.()}>
        <View
          style={{
            backgroundColor: "#EFEFF0",
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <Text style={{ width: 110 }} weight="700" size={14} color="#707070">
            {label}
          </Text>
          <Optional
            condition={type === "text"}
            fallback={
              <View style={{ paddingVertical: 7 }}>
                <Text color="#707070" numberOfLines={1} size={13.5}>
                  {defaultValue}
                </Text>
              </View>
            }
          >
            <TextInput
              keyboardType={keyboardType}
              editable={!disabled}
              style={{ flex: 1, fontFamily: "Lato-Regular" }}
              placeholder={placeholder}
              value={value}
              onChangeText={setValue}
              onBlur={handleOnBlur}
              numberOfLines={1}
              maxLength={maxLength}
            />
          </Optional>
        </View>
      </TouchableWithoutFeedback>
      <Optional condition={helperText}>
        <View style={{ flexDirection: "row", gap: 4, flexWrap: "wrap" }}>
          <Text color="#c1c1c1" size={13}>
            {helperText}
          </Text>
        </View>
      </Optional>
    </>
  );
}

function FileInput({
  label, //
  placeholder,
  name,
  onChange,
  helperText,
  onChangeFile = () => {},
}) {
  const params = useLocalSearchParams();
  const key = `profiles.${params?.id}.${name}`;

  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const lastStoredValue = store.getString(key);
    if (lastStoredValue) {
      setFileName(lastStoredValue);
      setIsSuccess(true);
    }
  }, []);

  async function handleOnPress() {
    setErrorMessage("");
    setIsLoading(true);
    setIsSuccess(false);

    log.debug("asking for camera permissions");
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();

    log.debug("checking if camera permissions granted");
    if (cameraStatus.status === "granted") {
      log.debug("Launching photo library");
      const results = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 1,
        selectionLimit: 1,
      });

      const file = results.assets?.[0];

      if (!file) {
        log.debug("No file selected");
        setErrorMessage("No image selected.");
        return;
      }

      onChangeFile(file);

      const uri = file?.uri;
      const fileName = uri?.split("ImagePicker/")?.[1];
      setFileName(fileName);

      const path = `/profiles/${params?.id}/${name}-${fileName}`;
      const reference = storage().ref(path);

      log.info("Uploading profile image", { name, uri, fileName, file, path }); // prettier-ignore
      const task = reference.putFile(uri);

      task
        .then(async () => {
          const url = await reference.getDownloadURL();
          setIsSuccess(true);

          store.set(key, fileName);
          onChange?.(url);
          updateProfile(params?.id, { [name]: url });
          log.info("Profile image uploaded", { url });
        })
        .catch((e) => {
          log.warn("Unable to upload profile image", { error: e, name, uri, fileName, file, path }); // prettier-ignore
          setFileName("");
          setErrorMessage("Unable to upload image.");
        });
    } else {
      // todo: handle camera permissions not granted
      log.warn("Camera permissions not granted");
    }

    setIsLoading(false);
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={handleOnPress}>
        <View
          style={{
            backgroundColor: "#EFEFF0",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <Text
            style={{ width: 110, flexShrink: 0 }}
            weight="700"
            size={14}
            color="#707070"
          >
            {label}
          </Text>
          <View style={{ paddingVertical: 7, flex: 1 }}>
            <Text color="#707070" numberOfLines={1} size={13.5}>
              {fileName || placeholder}
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
      <View style={{ flexDirection: "row", gap: 4, flexWrap: "wrap" }}>
        <Text color="#c1c1c1" size={13}>
          {helperText}.
        </Text>
        <TouchableOpacity onPress={() => router.navigate("/profile-guideline")}>
          <Text
            style={{ textDecorationLine: "underline" }}
            color="#c1c1c1"
            size={13}
          >
            Example.
          </Text>
        </TouchableOpacity>
      </View>
      {/* <Optional condition={errorMessage}>
        <Text numberOfLines={1} color="#f97316" size={12}>
          {errorMessage}
        </Text>
      </Optional> */}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
    height: "100%",
  },
  driverContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 24,
  },
  driverImageContainer: {
    width: 55,
    height: 55,
    borderRadius: 9,
    backgroundColor: "#EFEFEF",
    overflow: "hidden",
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
});
