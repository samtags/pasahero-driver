import moment from "moment";
import { memo, useEffect, useState } from "react";
import Mapbox from "@rnmapbox/maps";
import { Image } from "expo-image";
import { TouchableOpacity } from "react-native";
import { point } from "@/src/services/images/remote";

export default memo(function TripMarker({
  created_at,
  latitude,
  longitude,
  id,
  onPress = () => {},
}) {
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const now = moment();
    const expiration = moment(created_at).add(2, "minutes");

    const _isExpired = now.isAfter(expiration);
    setIsExpired(_isExpired);

    if (_isExpired === false) {
      setTimeout(() => {
        setIsExpired(true);
      }, expiration.diff(now));
    }
  }, []);

  if (isExpired) return null;

  const featureCollection = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        properties: {
          id: "trip",
        },
      },
    ],
  };

  return (
    <Mapbox.ShapeSource id={`${id}-marker-source`} shape={featureCollection}>
      <Mapbox.SymbolLayer
        id={`${id}-plate`}
        style={{
          iconImage: "plate",
          iconAllowOverlap: true,
          iconRotate: ["get", "rotation"],
          iconRotationAlignment: "map",
          iconSize: 0.2,
          iconAnchor: "center",
        }}
        filter={["==", ["get", "id"], "trip"]}
      />
      <Mapbox.MarkerView
        allowOverlap
        key={id}
        coordinate={[longitude, latitude]}
      >
        <TouchableOpacity onPress={onPress}>
          <Image
            style={{ width: 92, height: 92 }}
            cachePolicy="memory-disk"
            source={point}
          />
        </TouchableOpacity>
      </Mapbox.MarkerView>
    </Mapbox.ShapeSource>
  );
});
