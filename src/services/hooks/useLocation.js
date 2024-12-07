import { useEffect, useState } from "react";
import { useMMKVString } from "react-native-mmkv";
import JSON from "@/src/services/json";

const defaultCenterCoordinate = [120.9763782, 14.5869407];

export default function useLocation() {
  const [location, setLocation] = useState({
    latitude: defaultCenterCoordinate[1],
    longitude: defaultCenterCoordinate[0],
  });

  const [userLocation] = useMMKVString("user.location");

  useEffect(() => {
    const data = JSON.parse(userLocation);
    if (data) {
      setLocation(data);
    }
  }, [userLocation]);

  return location;
}
