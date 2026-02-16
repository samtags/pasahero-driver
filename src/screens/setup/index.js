import { useRouter } from "expo-router";
import {
  View,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { useRef, useState } from "react";
import { useMMKVString } from "react-native-mmkv";
import LottieView from "lottie-react-native";
import * as Location from "expo-location";
import { Image } from "expo-image";
import Text from "../../components/text";
import Cta from "../../components/cta";
import useDelayedValue from "../../services/hooks/useDelayedValue";
import useAutoComplete from "../../services/queries/useAutoComplete";
import getCoordinatesByPlaceId from "../../services/api/getCoordinatesByPlaceId";
import Optional from "../../components/optional";
import log from "../../services/log";
import { from, first, target } from "../../services/images/remote";
import reverseGeocode from "../../services/api/reverseGeocoding";
import router from "../../services/router";

export default function Setup() {
  const [_, setLocation] = useMMKVString("location.current");

  const textInputRef = useRef(null);

  const [selected, setSelected] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isGettingPlaceDetails, setIsGettingPlaceDetails] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const isButtonDisabled = isGettingLocation || !selected || isGettingPlaceDetails; // prettier-ignore

  const [q, setQ] = useState("");
  const debouncedInput = useDelayedValue(q, 750);

  let autoCompleteInput = debouncedInput;

  if (selected?.description === q) autoCompleteInput = "";
  const { data: autoCompleteResults = [], isPending } = useAutoComplete(autoCompleteInput); // prettier-ignore

  const handleUseCurrentLocation = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    const granted = status === "granted";

    if (!granted) {
      Alert.alert(
        "Permission required",
        "Please enable location permission to use current location. Do you want to open permission settings?",
        [
          { text: "Close", style: "cancel", onPress: () => {} },
          {
            text: "OK",
            style: "default",
            onPress: async () => {
              const { status } = await Location.requestForegroundPermissionsAsync(); // prettier-ignore

              if (status === "granted") {
                handleSetCurrentLocation();
              }
            },
          },
        ],
      );
      return;
    }

    handleSetCurrentLocation();
  };

  const handleSetCurrentLocation = async () => {
    setIsGettingLocation(true);

    const data = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    }).catch(() => undefined);

    if (!data) {
      Alert.alert(
        "Oops!",
        "Unable to get your current location. Please try to use the search instead.",
      );
      textInputRef?.current?.focus?.();
      return;
    }

    const latitude = data?.coords?.latitude;
    const longitude = data?.coords?.longitude;
    const heading = data?.coords?.heading;

    const geocode = await reverseGeocode(`${latitude},${longitude}`);
    setIsGettingLocation(false);

    const place = geocode?.data?.results?.[0];

    const longAddress = place?.formatted_address;
    const shortAddress = place?.formatted_address;

    setSelected(place);
    setSelection({ start: 0, end: 0 });
    setQ(longAddress);

    if (!place) {
      return Alert.alert(
        "Oops!",
        "Unable to get location details to the current location. Please try to search again.",
      );
    }

    setLocation(
      JSON.stringify({
        latitude,
        longitude,
        heading,
        longAddress,
        shortAddress,
      }),
    );

    log.debug("Initial location set to current location.", { latitude, longitude, heading, longAddress, shortAddress }); // prettier-ignore
    setTimeout(() => {
      router.navigate({ pathname: "/(tabs)" });
    }, 750);
  };

  const handleOnSetLocation = async () => {
    setIsGettingPlaceDetails(true);

    if (!selected?.PlaceId) {
      setIsGettingPlaceDetails(false);
      return Alert.alert(
        "Oops!",
        "Unable to get location details to the selected location. Please try to search again.",
      );
    }

    const result = await getCoordinatesByPlaceId(selected.PlaceId).catch(
      (error) => {
        log.warn("Unable to get location details.", { error });
        return undefined;
      },
    );

    setIsGettingPlaceDetails(false);

    if (!result || !result?.Geometry?.Point) {
      Alert.alert(
        "Oops!",
        "Unable to get location details to the selected location. Please try to search again.",
      );

      return;
    }
    const latitude = result.Geometry.Point[1];
    const longitude = result.Geometry.Point[0];
    const shortAddress = selected?.description;
    const longAddress = selected?.Text;

    setLocation(
      JSON.stringify({ latitude, longitude, shortAddress, longAddress }),
    );
    router.navigate({ pathname: "/(tabs)" });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="height" style={styles.content}>
        <View
          style={{ flexDirection: "row", paddingHorizontal: 16, marginTop: 16 }}
        >
          <TouchableOpacity
            onPress={() => textInputRef?.current?.focus?.()}
            style={{
              backgroundColor: "#F0F0F0",
              borderRadius: 10,
              paddingVertical: 14,
              paddingLeft: 16,
              paddingRight: 36,
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Image
              style={{ width: 14, height: 14, flexShrink: 0 }}
              cachePolicy="memory-disk"
              source={from}
            />
            <View style={{ flex: 1 }}>
              <TextInput
                numberOfLines={1}
                selection={selected ? selection : undefined}
                onFocus={() => {
                  setSelection({ start: 0, end: q?.length });
                }}
                onBlur={() => {
                  setSelection({ start: 0, end: 0 });
                }}
                ref={textInputRef}
                autoFocus
                style={{
                  fontSize: 18,
                  fontFamily: "Lato-Bold",
                  color: "#1B1B1B",
                }}
                onChangeText={(text) => {
                  setSelected(null);
                  setQ(text);
                }}
                value={q}
                placeholder="Search location"
              />
            </View>
          </TouchableOpacity>
          <Optional condition={isGettingLocation === false}>
            <TouchableOpacity
              onPress={handleUseCurrentLocation}
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingLeft: 12,
              }}
            >
              <Image
                style={{ width: 22, height: 22 }}
                cachePolicy="memory-disk"
                source={target}
              />
            </TouchableOpacity>
          </Optional>
          <Optional condition={isGettingLocation}>
            <View style={{ paddingLeft: 16, justifyContent: "center" }}>
              <ActivityIndicator color="#6366F1" />
            </View>
          </Optional>
        </View>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
          }}
        >
          <Optional condition={isPending}>
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <LottieView
                autoPlay
                loop
                style={{
                  width: 220,
                  height: 220,
                  marginTop: -64,
                  marginBottom: -88,
                }}
                source={require("../../assets/json/autocomplete-preloader.json")}
              />
            </View>
          </Optional>

          <Optional condition={isPending === false}>
            {autoCompleteResults?.map((item) => {
              let shortAddress = item?.Text?.split(",")?.[0];

              if (shortAddress.length < 3) {
                shortAddress = shortAddress + " " + item?.Text.split(",")?.[1];
              }

              item.description = shortAddress;

              return (
                <Prediction
                  key={item?.PlaceId}
                  shortAddress={shortAddress}
                  longAddress={item?.Text}
                  onPress={() => {
                    setSelected(item);
                    setQ(item?.description);
                    setSelection({ start: 0, end: 0 });
                  }}
                />
              );
            })}
          </Optional>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
        <Cta
          onPress={handleOnSetLocation}
          disabled={isButtonDisabled}
          color={isButtonDisabled ? "#B9BAF9" : "#6366F1"}
        >
          Set Location
        </Cta>
      </View>
    </SafeAreaView>
  );
}

/**
 *
 * @param {PredictionProps} props
 */
function Prediction({ shortAddress, longAddress, onPress }) {
  return (
    <TouchableOpacity onPress={() => onPress?.()}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingLeft: 8,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#EAEAEA",
        }}
      >
        <Image
          style={{ width: 24, height: 24 }}
          cachePolicy="memory-disk"
          source={first}
        />

        <View style={{ gap: 6, flex: 1, paddingRight: 16 }}>
          <Text numberOfLines={1} color="#1B1B1B" weight="bold" size={18}>
            {shortAddress}
          </Text>
          <Text numberOfLines={2} color="#707070" size={14}>
            {longAddress}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
    position: "relative",
  },
  content: {
    flex: 1,
  },
});

/**
 * @typedef PredictionProps
 * @property {string} shortAddress
 * @property {string} longAddress
 * @property {() => unknown} [onPress]
 */
