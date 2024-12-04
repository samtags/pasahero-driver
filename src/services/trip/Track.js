import calculateBearing from "@/src/services/util/locations/calculateBearing";
import subscribe from "@/src/services/realtime";
import getLocation from "@/src/services/api/getLocation";
import getTrack from "@/src/services/api/getTrack";
import * as turf from "@turf/turf";
import moment from "moment";

export default class Track {
  id = null; // user id of location to subscribe

  snapshots = [];
  coordinates = [];
  bufferZone = undefined;

  destination = null;
  offRouteSnapshot = [];
  routine = null;
  unsubscribe = null;
  listeners = new Set();
  bufferSizeInMeters = 25;

  location = null;
  eta = null;

  constructor(id, destination) {
    this.id = id;
    this.destination = destination;

    this.initialize();
    this.startRoutine();
  }

  async initialize() {
    console.log("Initializing track.", this);

    // get the user coordinates
    const origin = await getLocation(this.id);
    this.location = origin;
    console.log("Driver location:", origin);

    const trackRequest = await getTrack(
      `${origin.latitude},${origin.longitude}`,
      `${this.destination.latitude},${this.destination.longitude}`
    );

    if (trackRequest?.duration?.value) {
      const seconds = trackRequest?.duration?.value;
      this.eta = moment().add(seconds, "seconds").format("hh:mm A");
    }

    const track = trackRequest.coordinates || [];
    console.log("getTrack:", track);

    // get directions
    if (track) this.coordinates = track;

    // re-initialize the off route snapshot
    this.offRouteSnapshot = [];
    this.snapshots = [];

    // create a snapshot
    console.log("Creating snapshots");
    const snapshot = this.createSnapshot(track);
    console.log("Created snapshot", snapshot);

    this.snapshots.push(snapshot);

    this.commit();

    this.unsubscribe = subscribe(
      `locations.${this.id}`,
      this.onUpdate.bind(this)
    );
  }

  createBufferZone(coordinates) {
    const zones = [];
    let createdBufferZone;

    coordinates.forEach((coord, index) => {
      const zone = turf.buffer(turf.point(coord), this.bufferSizeInMeters, {
        units: "meters",
      });

      if (index === 0) {
        zones.push(zone);
        return;
      }

      const nextCoordinate = coordinates[index + 1];
      if (!nextCoordinate) return;

      const next = turf.buffer(
        turf.point(nextCoordinate),
        this.bufferSizeInMeters,
        { units: "meters" }
      );

      if (turf.booleanIntersects(zone, next) === true) {
        return zones.push(zone);
      }

      zones.push(
        turf.convex(turf.featureCollection([zone, next]))
      ); // prettier-ignore
    });

    if (zones.length > 1) {
      const fc = turf.featureCollection(zones);

      createdBufferZone = turf.union(fc);
    } else {
      console.log("No buffer zone created.");
    }

    return createdBufferZone;
  }

  async startRoutine() {
    this.routine = setInterval(() => {
      // triggers *commit*
      this.commit();

      // checks the off route snapshot
      if (this.offRouteSnapshot.length > 2) {
        this.initialize();
      }
    }, 1000 * 15); // 15 seconds
  }

  commit() {
    const current = this.snapshots.at(-1);
    console.log("Received commit event.");

    if (!current) {
      console.log("No current snapshot found.");
      return;
    }

    if (current.coordinates) {
      // update the coordinates
      this.coordinates = current.coordinates;
      console.log("Coordinates updated.", this.coordinates);
    }

    if (current.bufferZone) {
      // update the bufferZone
      this.bufferZone = current.bufferZone;
      console.log("Buffer zone updated.", this.bufferZone);
    }

    // triggers all the listeners and pass the coordinates of last snapshot snapshot
    this.listeners.forEach((callback) => {
      callback({
        ...current,
        location: this.location,
        eta: this.eta,
      });
    });
  }

  on(_, callback) {
    this.listeners.add(callback);
  }

  onUpdate(location) {
    this.location = location;
    console.log("Location received.", location);

    // triggers commit
    this.commit();

    // validate if in route or off route
    const latitude = location.latitude;
    const longitude = location.longitude;

    const point = turf.point([longitude, latitude], {
      heading: location.heading, // how to add heading to point
    });

    const isWithinBufferZone = turf.booleanPointInPolygon(point, this.bufferZone); // prettier-ignore
    console.log("Incoming location is within buffer zone?", isWithinBufferZone);

    let nextCoordinates = [...this.coordinates];

    // find the nearest point in the route
    const nearestPoint = turf.nearestPointOnLine(
      turf.lineString(nextCoordinates),
      point,
      { units: "meters" }
    );
    console.log("Nearest point:", nearestPoint.properties.index);

    // add incoming location to the coordinates
    nextCoordinates = nextCoordinates.slice(nearestPoint.properties.index);

    // create snapshot
    const snapshot = this.createSnapshot(nextCoordinates);

    if (isWithinBufferZone) {
      // add to snapshot/offRouteSnapshot
      this.snapshots.push(snapshot);
    } else {
      // add to offRouteSnapshot
      console.warn("Off route snapshot detected.", snapshot);
      this.offRouteSnapshot.push(snapshot);
    }
  }

  createSnapshot(coordinates) {
    if (coordinates.length < 2) {
      console.log(
        "Unable to create snapshot. Coordinates length is less than 2."
      );
      return;
    }

    const originPoint = coordinates.at();
    const nextPoint = coordinates.at(1);
    const destinationPoint = coordinates.at(-1);

    const originPointBearing = calculateBearing(originPoint, nextPoint);

    const origin = turf.point(originPoint, {
      rotation: originPointBearing,
    });

    const destination = turf.point(destinationPoint, {});

    const lineString = turf.lineString(coordinates);
    const bufferZone = this.createBufferZone(coordinates);

    return {
      coordinates,
      bufferZone,
      origin,
      lineString,
      destination,
    };
  }

  setBufferZoneSizeInMeters(size) {
    this.bufferSizeInMeters = size;
  }

  close() {
    // clears the routine
    clearInterval(this.routine);
  }
}
