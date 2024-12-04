import { createContext, useState, useEffect, useRef } from "react";
import useKeyboard from "@/src/services/hooks/useKeyboard";
import useDelayedValue from "@/src/services/hooks/useDelayedValue";
import { useMMKVString } from "react-native-mmkv";
import useOnUpdate from "@/src/services/hooks/useOnUpdate";
import log from "@/src/services/log";
import useAutoComplete from "@/src/services/queries/useAutoComplete";
import useGetCoordinates from "@/src/services/queries/useGetCoordinates";

export const Context = createContext({});

export default function Provider({ children, latitude, longitude }) {
  const cameraRef = useRef();

  const [isMapAlreadyChanged, setIsMapAlreadyChanged] = useState(false);
  const [selected, setSelected] = useState();
  const [q, setQ] = useState("");
  const [displayedValue, setDisplayedValue] = useState("");

  const { isKeyboardVisible } = useKeyboard();
  const { isPending, data } = useGetCoordinates(selected?.PlaceId);

  const debouncedInput = useDelayedValue(q, 750);
  const { data: suggestion } = useAutoComplete(debouncedInput);

  const [currentLocationString] = useMMKVString("location.current");
  let currentLocation = JSON.parse(currentLocationString || "{}"); // fall back pin location is the user's current location

  if (latitude && longitude) {
    currentLocation = {
      latitude,
      longitude,
    };
  }

  const [mapCoordinates, setMapCoordinates] = useState({
    latitude: 0,
    longitude: 0,
  });

  function handleSwipeMapStart() {
    setSelected();
    setIsMapAlreadyChanged(true);

    log.debug("User changed the pinned location.", { actionType: "swipe", selected }); // prettier-ignore
  }

  useEffect(() => {
    log.debug("Using Grab Maps Pin Provider.");
  }, []);

  useOnUpdate(() => {
    if (q) {
      log.debug("New search query detected. Clearing the selected location.", { query: q }); // prettier-ignore
      setSelected();
    }
  }, [q]);

  useOnUpdate(() => {
    if (selected) {
      log.debug("New selected location detected. Clearing the search query.", { location: selected }); // prettier-ignore
      setQ("");
    } else {
      // clear the input value upon swipe on the map
      setDisplayedValue("");
    }
  }, [selected]);

  // center map to the selected location
  useOnUpdate(() => {
    if (data?.longitude && data?.latitude) {
      log.debug("Changing the map center to the selected location.", data);

      cameraRef?.current?.setCamera({
        centerCoordinate: [data?.longitude, data?.latitude],
        animationMode: "none",
      });

      log.debug("Changing map coordinates details", data);
      setMapCoordinates({
        latitude: data?.latitude,
        longitude: data?.longitude,
      });
    }
  }, [data]);

  let displayedTitle;
  let displayedSubTitle;

  if (selected) {
    displayedTitle = selected?.Description;
    displayedSubTitle = selected?.Text;
  } else {
    if (isMapAlreadyChanged === false) {
      displayedTitle = currentLocation?.Description;
      displayedSubTitle = currentLocation?.Text;
    }
  }

  if (!displayedTitle) displayedTitle = "Exact location";
  if (!displayedSubTitle)
    displayedSubTitle = "Custom location selected on the map";

  const propsToPass = {
    selected,
    setSelected,
    isKeyboardVisible,
    suggestion,
    q,
    setQ,
    displayedValue,
    setDisplayedValue,
    isMapLoading: isPending,
    setMapCoordinates,
    title: displayedTitle,
    subTitle: displayedSubTitle,
    latitude: mapCoordinates.latitude || currentLocation.latitude,
    longitude: mapCoordinates.longitude || currentLocation.longitude,
    defaultLatitude: currentLocation.latitude || 0,
    defaultLongitude: currentLocation.longitude || 0,
    handleSwipeMapStart,
    cameraRef,
  };

  return <Context.Provider value={propsToPass}>{children}</Context.Provider>;
}
