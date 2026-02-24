import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ToastAndroid,
  Alert,
} from "react-native";
import { useRef, useEffect, useState } from "react";
import Text from "@/src/components/text";
import { useUser } from "@clerk/clerk-expo";
import { useLocalSearchParams, Link } from "expo-router";
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
import { useMMKVBoolean, useMMKVString } from "react-native-mmkv";
import getColorByService from "@/src/services/util/colors/getColorByService";
import handleGetPlatformByService from "@/src/services/util/trip/handleGetPlatformByService";
import { Profile } from "../profile";
import Select from "@/src/components/select";
import axios from "@/src/services/axios";
import router from "@/src/services/router";

export default function RegisterProfile() {
  const { user } = useUser();
  const client = useQueryClient();
  const params = useRouterParams();
  const scrollViewRef = useRef();
  const [service] = useMMKVString("user.service");
  const platform = handleGetPlatformByService(service);
  const [file, setFile] = useState();
  const [showSurveySelect, setShowSurveySelect] = useState(false);
  const hideSurvey = Boolean(useMMKVBoolean("user.hide_profile_survey")?.[0]);
  const [isUploading, setIsUploading] = useState(false);

  const [preview, setPreview] = useProfilePreview({
    first_name: params?.first_name,
    last_name: params?.last_name,
    mobile_number: params?.mobile_number,
    vehicle_make: params?.vehicle_make,
    vehicle_model: params?.vehicle_model,
    vehicle_plate_number: params?.vehicle_plate_number,
    image_url: params?.image_url,
    vehicle_color: params?.vehicle_color,
    survey: null,
  });

  const hasUnInitializedValue = Object.keys(preview).some((key) => {
    if (key === "survey" && hideSurvey === true) return false;
    return Boolean(preview[key]) === false;
  });

  function handleRetriggerProfiles() {
    client.invalidateQueries(["getProfiles", store.getString("user.id")]);
  }

  const { isPending, mutate: handleSubmit } = useMutation({
    mutationFn: () => {
      if (preview?.survey) submitSurvey(preview?.survey);
      return submitRegistration(params?.id);
    },
    onSuccess: () => {
      handleRetriggerProfiles();
      store.set("user.hide_profile_survey", true);
      console.debug("Hiding profile survey to the next time.");
      Alert.alert(
        "Profile submitted!",
        "Please wait for a few minutes while we review your profile.",
        [
          {
            text: "OK",
            onPress: () => {
              router.back();

              setTimeout(() => {
                ToastAndroid.show(
                  "Your profile is now being reviewed",
                  ToastAndroid.LONG,
                );
              }, 500);
            },
          },
        ],
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

  function handleSumbitProfile(resubmit = false) {
    if (resubmit === false) {
      if (params.status === "ACCEPTED") {
        //
      }

      // if (params.status === "APPROVED") {
      //   return Alert.alert(
      //     "Profile is already in verified",
      //     "Resubmitting profile will cause your profile to be verified again. While in review, you cannot accept any trip request. Are you sure you want to resubmit?",
      //     [
      //       {
      //         text: "Cancel",
      //         style: "cancel",
      //       },
      //       {
      //         text: "Resubmit",
      //         onPress: () => {
      //           handleSumbitProfile(true);
      //         },
      //       },
      //     ],
      //   );
      // }

      if (params.status === "PENDING") {
        return Alert.alert(
          "Profile is already in review",
          "Resubmitting profile will cause the ongoing review to be canceled. Are you sure you want to resubmit?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Resubmit",
              onPress: () => {
                handleSumbitProfile(true);
              },
            },
          ],
        );
      }
    }

    const hasUnInitializedValue = Object.keys(preview).some((key) => {
      if (key === "survey" && hideSurvey === true) return false;
      return Boolean(preview[key]) === false;
    });

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

  if (params.status === "PENDING") {
    ctaLabel = "Resubmit Profile";
  }

  if (params.status === "ACCEPTED") {
    ctaLabel = "Apply for Verification";
  }

  if (params.status === "APPROVED") {
    ctaLabel = "Resubmit Profile";
  }

  if (isUploading) ctaLabel = "Uploading Photo. Please wait...";

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
            onPress={() => router.navigate({ pathname: "/profile-guideline" })}
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
            required
            name="vehicle_make"
            label="Brand (Make)"
            placeholder="Enter Vehicle Make"
            defaultValue={params?.vehicle_make}
            onBlur={(value) => setPreview("vehicle_make", value)}
            helperText="Example: Honda, Yamaha, Suzuki, etc."
            disabled={params.status === "ACCEPTED"}
          />

          <ProfileInput
            required
            name="vehicle_model"
            label="Model"
            placeholder="Enter Vehicle Model"
            defaultValue={params?.vehicle_model}
            onBlur={(value) => setPreview("vehicle_model", value)}
            helperText="Example: Click 125i, Aerox 155, ADV160, etc."
            disabled={params.status === "ACCEPTED"}
          />

          <ProfileInput
            required
            name="vehicle_color"
            label="Color"
            placeholder="Enter Vehicle Color"
            defaultValue={params?.vehicle_color}
            helperText="Vehicle color in OR/CR"
            onBlur={(value) => setPreview("vehicle_color", value)}
            disabled={params.status === "ACCEPTED"}
          />

          <ProfileInput
            required
            name="vehicle_plate_number"
            label="Plate Number"
            placeholder="Enter Plate Number"
            defaultValue={params?.vehicle_plate_number}
            onBlur={(value) => setPreview("vehicle_plate_number", value)}
            helperText="Example: CBA3141, ABC123, etc."
            disabled={params.status === "ACCEPTED"}
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
          required
          name="first_name"
          label="First Name"
          placeholder="Enter your first name"
          defaultValue={params?.first_name}
          onBlur={(value) => setPreview("first_name", value)}
          disabled={params.status === "ACCEPTED"}
        />
        <View style={{ marginTop: 24 }} />

        <ProfileInput
          required
          name="last_name"
          label="Last Name"
          placeholder="Enter your last name"
          defaultValue={params?.last_name}
          onBlur={(value) => setPreview("last_name", value)}
          disabled={params.status === "ACCEPTED"}
        />

        <View style={{ marginTop: 24 }} />

        <View style={{ gap: 12 }}>
          <ProfileInput
            required
            name="mobile_number"
            label="Mobile Number"
            placeholder="Enter your mobile number"
            defaultValue={params?.mobile_number}
            onBlur={(value) => setPreview("mobile_number", value)}
            maxLength={11}
            helperText="Example: 09123456789 (Not visible to passengers)"
            disabled={params.status === "ACCEPTED"}
          />

          <FileInput
            required
            name="image_url"
            label="Driver Photo"
            placeholder={preview?.image_url || "Press here to select"}
            helperText={`Photo wearing your ${platform} gears`}
            onChange={(value) => setPreview("image_url", value)}
            onChangeFile={setFile}
            disabled={params.status === "ACCEPTED"}
            onUpload={(status) => setIsUploading(status)}
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

        <Optional condition={hideSurvey === false}>
          <View style={styles.header}>
            <Text size={18} weight="700" color="#1B1B1B">
              Quick Survey
            </Text>
          </View>

          <View style={{ marginTop: 8 }} />
          <Text weight="700" size={14} color="#707070">
            Where did you hear about us?
          </Text>

          <TouchableOpacity onPress={() => setShowSurveySelect(true)}>
            <View
              style={{
                marginTop: 16,
                backgroundColor: "#EFEFF0",
                paddingHorizontal: 16,
                paddingVertical: 20,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              <Text color="#707070" size={14}>
                {preview?.survey?.label || "Select where did you hear from us"}
              </Text>
            </View>
          </TouchableOpacity>
          <View style={{ flexDirection: "row", marginTop: 8 }}>
            <Text color="#c1c1c1" size={13}>
              Press the input box to select
            </Text>
          </View>

          <Optional condition={preview?.survey?.value === "Others"}>
            <View
              style={{
                marginTop: 16,
                backgroundColor: "#EFEFF0",
                paddingHorizontal: 16,
                paddingVertical: 20,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              <TextInput
                autoFocus
                numberOfLines={1}
                maxLength={280}
                placeholder="Enter your answer"
                style={{ fontFamily: "Lato-Regular", flex: 1 }}
              />
            </View>
            <View style={{ flexDirection: "row", marginTop: 8 }}>
              <Text color="#c1c1c1" size={13}>
                Type here where you heard about us
              </Text>
            </View>
          </Optional>
        </Optional>

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
        <Optional condition={params.status !== "ACCEPTED"}>
          <View>
            <Cta
              disabled={isPending || isUploading}
              onPress={handleSumbitProfile}
              style={{ opacity: isPending || hasUnInitializedValue ? 0.5 : 1 }}
              color={getColorByService(service)}
            >
              {ctaLabel}
            </Cta>
          </View>
        </Optional>
      </ScrollView>
      <Optional condition={showSurveySelect}>
        <Select
          options={[
            { label: "Social Media", value: "Social Media" },
            { label: "Blog", value: "Blog" },
            { label: "Flyers", value: "Flyers" },
            { label: "Peer Rider Referral", value: "Peer Rider Referral" },
            { label: "Customer Testimonials", value: "Customer Testimonials" },
            { label: "Others", value: "Others" },
          ]}
          handleSelect={(selected) => {
            setPreview("survey", selected);
            setShowSurveySelect(false);
          }}
          onClose={() => setShowSurveySelect(false)}
          closeText="Close"
          confirmText="Confirm"
          label=""
        />
      </Optional>
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
  required,
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
            <Optional condition={required}>
              <Text color="#EF4444">*</Text>
            </Optional>
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
  required,
  label, //
  placeholder,
  name,
  onChange,
  helperText,
  onChangeFile = () => {},
  disabled = false,
  onUpload = (status) => {},
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
    if (disabled) return;

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
        onUpload(false);
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

      onUpload(true);
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
        })
        .finally(() => {
          onUpload(false);
        });
    } else {
      // todo: handle camera permissions not granted
      log.warn("Camera permissions not granted");
    }

    setIsLoading(false);
    onUpload(false);
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
            <Optional condition={required}>
              <Text color="#EF4444">*</Text>
            </Optional>
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
        <TouchableOpacity
          onPress={() => router.replace({ pathname: "/profile-guideline" })}
        >
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
    paddingBottom: 16,
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

function submitSurvey(data) {
  console.debug("Submitting survey", data);
  if (!data) return;
  axios
    .post(
      "https://app.nocodb.com/api/v2/tables/mt6nckkevdx9fca/records",
      {
        Medium: data?.value,
        Email: store.getString("user.email"),
      },
      {
        headers: {
          "xc-token": "pUgoMx8PbT4N8j6ddNYZfhV_0-rAZylgaa0pioUB",
        },
      },
    )
    .then((response) => {
      console.debug("Survey submitted", response);
    })
    .catch((error) => {
      console.debug("Error submitting survey", error);
    });
}
