import JSON from "@/src/services/json";
import { useMMKVString } from "react-native-mmkv";
import Mapbox from "@rnmapbox/maps";

export default function DriverDisplay({ subscriptionKeys }) {
  return subscriptionKeys?.map((id) => <DriverMarker key={id} id={id} />);
}

function DriverMarker({ id }) {
  const [locationString] = useMMKVString(id);
  const location = JSON.parse(locationString, {});
  const { latitude, longitude, heading = 0 } = location;

  if (!latitude || !longitude) return null;

  const geojson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        properties: {
          rotation: heading,
        },
      },
    ],
  };

  return (
    <Mapbox.ShapeSource id={`source-${id}`} shape={geojson}>
      <Mapbox.SymbolLayer
        id={`symbol-${id}`}
        style={{
          iconImage: "Angkas",
          iconAllowOverlap: true,
          iconRotate: ["get", "rotation"],
          iconRotationAlignment: "map",
          iconSize: 0.17,
        }}
      />
    </Mapbox.ShapeSource>
  );
}
