import Mapbox from "@rnmapbox/maps";

export default function DisplayLocation({ latitude, longitude }) {
  const geojson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
      },
    ],
  };

  if (!latitude || !longitude) return null;

  return (
    <Mapbox.ShapeSource id="current-location-source" shape={geojson}>
      <Mapbox.SymbolLayer
        id={`current-location-symbol`}
        style={{
          iconImage: "currentLocationIndicator",
          iconAllowOverlap: true,
          iconRotate: ["get", "rotation"],
          iconRotationAlignment: "map",
          iconSize: 0.25,
        }}
      />
    </Mapbox.ShapeSource>
  );
}
