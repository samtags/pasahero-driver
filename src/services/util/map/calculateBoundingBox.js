export default function calculateBoundingBox(coordinates) {
  let minLat, minLon, maxLat, maxLon;

  coordinates.forEach((point) => {
    // if coordinates is an object
    let { latitude, longitude } = point;

    // handle when given coordinates is an array
    if (!latitude && point?.[1]) {
      latitude = point[1];
      longitude = point[0];
    }

    if (minLat === undefined || latitude < minLat) {
      minLat = latitude;
    }

    if (minLon === undefined || longitude < minLon) {
      minLon = longitude;
    }

    if (maxLat === undefined || latitude > maxLat) {
      maxLat = latitude;
    }

    if (maxLon === undefined || longitude > maxLon) {
      maxLon = longitude;
    }
  });

  return [
    [minLon, minLat],
    [maxLon, maxLat],
  ];
}
