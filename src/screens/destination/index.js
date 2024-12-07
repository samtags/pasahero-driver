import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import SearchResult from "@/src/components/locations/SearchResult";
import LottieView from "lottie-react-native";
import Optional from "@/src/components/optional";
import { pinEntry, to, last } from "@/src/services/images/remote";
import { Alert } from "react-native";
import { useEffect, useRef, useState } from "react";
import useDelayedValue from "@/src/services/hooks/useDelayedValue";
import storage from "@/src/services/storage";
import log from "@/src/services/log";
import getCoordinatesByPlaceId from "@/src/services/api/getCoordinatesByPlaceId";
import router, { useRouterParams } from "@/src/services/router";
import useAutoComplete from "@/src/services/queries/useAutoComplete";
import handleSetDestination from "@/src/services/util/trip/handleSetDestination";

export default function DestinationScreen() {
  const textInputRef = useRef(null);

  const params = useRouterParams();
  const isFromMatchRequest = Boolean(params?.isFromMatchRequest);

  const latitude = params?.latitude;
  const longitude = params?.longitude;
  const shortAddress = params?.shortAddress;

  const [isModified, setIsModified] = useState(false);
  const [selection, setSelection] = useState(undefined);

  const [q, setQ] = useState(() => shortAddress ?? "");
  const debouncedInputValue = useDelayedValue(q, 750);
  const inputValue = isModified ? debouncedInputValue : "";

  const { isPending, data: autoCompleteResults = [] } =  useAutoComplete(inputValue); // prettier-ignore

  useEffect(() => {
    log.debug("User is in Search Destination Screen.", { provider: "Grab" });

    if (isModified === false) {
      textInputRef?.current?.blur?.();

      setTimeout(() => {
        textInputRef?.current?.focus?.();
      }, 150);
    }
  }, []);

  function handleChangeText(text) {
    setSelection(undefined);
    setIsModified(true);
    setQ(text);
  }

  async function handleSelect(item) {
    log.info("User select destination location.", {
      item,
      provider: "Grab",
      actionType: "tap",
    });

    let latitude, longitude;
    const shortAddress = item?.Description;
    const longAddress = item?.Text;

    setQ(shortAddress);

    handleSetDestination({ shortAddress, longAddress });
    router.setParams("/destination", { shortAddress, longAddress });

    getCoordinatesByPlaceId(item?.PlaceId)
      .then((res) => {
        latitude = res?.Geometry?.Point[1];
        longitude = res?.Geometry?.Point[0];

        console.debug("Got coordinates by place id.", res, latitude, longitude);

        handleSetDestination({ latitude, longitude });
        router.setParams("/destination", { longitude, latitude });
      })
      .catch((error) => {
        log.error("Failed to get coordinates by place ID.", { error });

        Alert.alert(
          "Oops!",
          "We encountered an error while processing the selected destination. Please try to search a destination again."
        );

        log.warn(
          "Oops, We encountered an error while processing the selected destination. Please try to search a destination again.",
          { error }
        );

        router.replace({ pathname: "/transit/search/last" });
      });

    if (isFromMatchRequest === false) {
      const currentLocationString = storage.getString("location.current");
      const location = JSON.parse(currentLocationString || "{}");

      router.navigate({
        pathname: "/origin",
        params: location,
      });

      setIsModified(false);

      return;
    }

    router.replace({ pathname: "/request" });
  }

  function handlePressPin() {
    if (isFromMatchRequest) {
      router.replace({
        pathname: "/destination-pin",
        params,
      });
    } else {
      const locationString = storage.getString("location.current");
      const location = JSON.parse(locationString);

      router.replace({
        pathname: "/destination-pin",
        params: {
          latitude: latitude || location.latitude,
          longitude: longitude || location.longitude,
          isFromMatchRequest,
        },
      });
    }
  }

  function handleOnFocus() {
    setSelection({
      start: 0,
      end: q?.length,
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heading}>
        <TouchableOpacity
          onPress={() => textInputRef.current.focus?.()}
          style={styles.inputContainer}
        >
          <Image
            style={styles.indicator}
            cachePolicy="memory-disk"
            source={to}
          />
          <View style={{ flex: 1 }}>
            <TextInput
              selection={selection}
              ref={textInputRef}
              style={styles.textInput}
              onChangeText={handleChangeText}
              value={q}
              placeholder="Search location"
              onFocus={handleOnFocus}
              numberOfLines={1}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handlePressPin}
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingLeft: 12,
          }}
        >
          <Image
            style={{ width: 24, height: 24 }}
            cachePolicy="memory-disk"
            source={pinEntry}
          />
        </TouchableOpacity>
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
              source={require("@/src/assets/json/autocomplete-preloader.json")}
            />
          </View>
        </Optional>

        <Optional condition={isPending === false}>
          {autoCompleteResults?.map((item) => (
            <SearchResult
              indicator={last}
              key={item?.PlaceId}
              shortAddress={item?.Description}
              longAddress={item?.Text}
              onPress={() => handleSelect(item)}
            />
          ))}
        </Optional>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  heading: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 16,
  },
  inputContainer: {
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    paddingVertical: 14,
    paddingLeft: 16,
    paddingRight: 36,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  indicator: { width: 16, height: 16, flexShrink: 0 },
  textInput: {
    fontSize: 18,
    fontFamily: "Lato-Bold",
    color: "#1B1B1B",
  },
});
