import { useEffect, useRef, useState } from "react";
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
import Cta from "@/src/components/cta";
import { from, pinEntry, first } from "@/src/services/images/remote";
import useDelayedValue from "@/src/services/hooks/useDelayedValue";
import useAutoComplete from "@/src/services/queries/useAutoComplete";
import storage from "@/src/services/storage";
import log from "@/src/services/log";
import getCoordinatesByPlaceId from "@/src/services/api/getCoordinatesByPlaceId";
import { handleSetOrigin } from "@/src/services/util/trip/handleSetOrigin";
import router, { useRouterParams } from "@/src/services/router";

export default function OriginScreen() {
  const textInputRef = useRef(null);

  const params = useRouterParams();
  const isFromMatchRequest = Boolean(params?.isFromMatchRequest);

  const [isModified, setIsModified] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const [q, setQ] = useState(() => params?.shortAddress ?? "");
  const debouncedInputValue = useDelayedValue(q, 750);
  const inputValue = isModified ? debouncedInputValue : "";

  const {isPending, data: autoCompleteResults = []} = useAutoComplete(inputValue); // prettier-ignore

  useEffect(() => {
    log.debug("User is in Search Departure Screen.");

    if (isModified === false) {
      textInputRef?.current?.blur();

      setTimeout(() => {
        textInputRef?.current?.focus();
      }, 150);
    }
  }, []);

  function handleChangeText(text) {
    setIsModified(true);
    setQ(text);
  }

  function handleConfirm() {
    router.replace({ pathname: "/request" });
  }

  function handleSelect(item) {
    log.info("User select departure location.", {
      item,
      provider: "Grab",
      actionType: "tap",
    });

    getCoordinatesByPlaceId(item?.PlaceId)
      .then((res) => {
        log.debug("Got coordinates by place id.", {
          item,
          response: res,
          provider: "Grab",
        });

        handleSetOrigin({
          latitude: res?.Geometry?.Point[1],
          longitude: res?.Geometry?.Point[0],
          shortAddress: item?.Description,
          longAddress: item?.Text,
        });

        log.debug("Redirecting user to the Request Ride screen.");
        router.replace({ pathname: "/request" });

        // set location.current
        const newLocationRef = {
          latitude: res?.Geometry?.Point[1],
          longitude: res?.Geometry?.Point[0],
          shortAddress: item?.Description,
          longAddress: item?.Text,
        };

        storage.set("location.current", JSON.stringify(newLocationRef));
        log.debug(
          "Current location reference data is updated.",
          newLocationRef
        );
      })
      .catch((error) => {
        log.debug("Failed to get coordinates by place id", {
          error,
          provider: "Grab",
        });
      });
  }

  function handlePressPin() {
    if (isFromMatchRequest) {
      router.replace({
        pathname: "/origin-pin",
        params,
      });
    } else {
      const locationString = storage.getString("location.current");
      const location = JSON.parse(locationString);

      router.replace({
        pathname: "/origin-pin",
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      });
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heading}>
        <TouchableOpacity
          onPress={() => textInputRef?.current?.focus?.()}
          style={styles.inputContainer}
        >
          <Image
            style={styles.indicator}
            cachePolicy="memory-disk"
            source={from}
          />
          <View style={styles.textInputContainer}>
            <TextInput
              ref={textInputRef}
              style={styles.textInput}
              onChangeText={handleChangeText}
              value={q}
              selection={isModified ? undefined : selection}
              onFocus={() => {
                if (isModified === false) setSelection({ start: 0, end: q?.length }); // prettier-ignore
              }}
              placeholder="Search location"
              numberOfLines={1}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePressPin} style={styles.pinButton}>
          <Image
            style={styles.pin}
            cachePolicy="memory-disk"
            source={pinEntry}
          />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.full}
        contentContainerStyle={styles.contentContainerStyle}
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
              indicator={first}
              key={item?.PlaceId}
              shortAddress={item?.Description}
              longAddress={item?.Text}
              onPress={() => handleSelect(item)}
            />
          ))}
        </Optional>
      </ScrollView>
      <Optional
        condition={isModified === false && isFromMatchRequest === false}
      >
        <View style={{ padding: 16 }}>
          <Cta onPress={handleConfirm} color="#6366F1">
            Confirm Pickup
          </Cta>
        </View>
      </Optional>
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
    fontSize: 16,
    fontFamily: "Lato-Bold",
    color: "#1B1B1B",
  },
  pinButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 12,
  },
  pin: { width: 24, height: 24 },
  full: { flex: 1 },
  contentContainerStyle: {
    paddingHorizontal: 16,
  },
  textInputContainer: {
    flex: 1,
  },
});
