import { useEffect, useRef, useState } from "react";
import getMatchById from "../api/getMatchById";
import log from "../log";
import useWatchDriverLocation from "./useDriverLocations";
import getDirections from "../api/getDirections";
import * as Polyline from "@mapbox/polyline";
import useOnUpdateSnapshot from "./useOnUpdateSnapshot";
import getDistance from "../util/haversine/getDistance";
import moment from "moment";

/**
 *
 * @param {Props} props
 * @returns {Return}
 */
export default function useOnTheWayRoute({ match_id }) {
  const originalCoordinatesRef = useRef();
  const matchRef = useRef();

  const [coordinates, setCoordinates] = useState([]);

  const [isStarted, setIsStarted] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState("");
  const [eta, setEta] = useState();

  const [first, setFirst] = useState();
  const [last, setLast] = useState();

  const [driverId, setDriverId] = useState();

  const {
    coordinates: driverLocation,
    handleStop: handleStopWatchDriverLocation,
    handleStart: handleWatchDriverLocation,
  } = useWatchDriverLocation(driverId);

  useEffect(() => handleStop, []);
  useOnUpdateSnapshot(incomingLocationProcedure, { driverLocation });

  async function handleStart() {
    log.debug("Driver assigned route hook initiated.", { match_id });
    setIsStarted(true);
    setIsPending(true);

    const match = await getMatchById(match_id);

    let _first, _last;

    if (match) {
      matchRef.current = match;

      _first = match.driver_location;
      _last = match.last_point;

      setFirst(_first);
      setLast(_last);

      // for subscription
      setDriverId(match.driver_id);
      handleWatchDriverLocation(match.driver_id);

      log.debug("Initial driver location", { _first, _last, match });

      if (_first && _last) {
        const origin = `${_first.latitude},${_first.longitude}`;
        const destination = `${_last.latitude},${_last.longitude}`;

        log.debug("Getting directions", { origin, destination });
        const direction = await handleGetDirections(origin, destination);

        const _eta = direction?.legs?.[0]?.duration?.value;

        if (_eta) {
          setEta(moment().add(_eta, "seconds").format("hh:mm A"));
        }

        if (direction) {
          const encoded = direction?.overview_polyline?.points;
          log.debug("Decoding encounted polyline", { encoded, direction });
          const points = Polyline.decode(encoded);
          log.debug("Decoded completed!", { points, encoded, direction });

          const _coordinates = points.map((point) => ({
            latitude: point[0],
            longitude: point[1],
          }));

          originalCoordinatesRef.current = _coordinates;
          setCoordinates(_coordinates);

          log.debug("Initial coordinates", {coordinates: _coordinates, points, encoded, direction}); // prettier-ignore
        } else {
          setIsError(true);
          setError("NO_DIRECTION_FOUND");
          log.warn(
            "No direction found. No route is displayed upon driver assigned.",
            { match_id, match, _first, _last, origin, destination }
          );
        }
      }
    }

    setIsPending(false);
  }

  function handleStop() {
    setIsStopped(true);
    handleStopWatchDriverLocation();
  }

  async function incomingLocationProcedure(prev, curr) {
    const previousLocation = prev.driverLocation;
    const incomingLocation = curr.driverLocation;

    if (!previousLocation) {
      log.debug("Previous location is not available.", { previousLocation, incomingLocation }); // prettier-ignore
      if (matchRef.current) {
        const _first = incomingLocation;
        const _last = matchRef?.current?.last_point;

        if (_first && _last) {
          setFirst(_first);

          const origin = `${_first.latitude},${_first.longitude}`;
          const destination = `${_last.latitude},${_last.longitude}`;

          log.debug("Incoming Procedure. Getting directions", {
            origin,
            destination,
          });
          const direction = await handleGetDirections(origin, destination);

          const _eta = direction?.legs?.[0]?.duration?.value;

          if (_eta) {
            setEta(moment().add(_eta, "seconds").format("hh:mm A"));
          }

          if (direction) {
            const encoded = direction?.overview_polyline?.points;
            log.debug("Incoming Procedure. Decoding encounted polyline", { encoded, direction }); // prettier-ignore
            const points = Polyline.decode(encoded);
            log.debug("Incoming Procedure. Decoded completed!", { points, encoded, direction }); // prettier-ignore

            const _coordinates = points.map((point) => ({
              latitude: point[0],
              longitude: point[1],
            }));

            originalCoordinatesRef.current = _coordinates;
            setCoordinates(_coordinates);

            log.debug("Incoming Procedure. Overwrite initial coordinates", { coordinates: _coordinates, points, encoded, direction }); // prettier-ignore
          } else {
            log.warn("No direction found. Unable to draw route.", { _first, _last, origin, destination }); // prettier-ignore
          }
        } else {
          log.warn("Unable to draw route.", {
            _first,
            _last,
            matchRef: matchRef.current,
            incomingLocation,
          });
        }
      } else {
        log.warn(
          "Match is not available. Unable to draw route based on the incoming location."
        );
      }

      return;
    }

    log.debug("Incoming location procedure initiated.", {previousLocation, incomingLocation}); // prettier-ignore

    // create distance representation of the coordinates
    const distanceRepresentation = coordinates.map((item) => {
      return getDistance(
        previousLocation.latitude,
        previousLocation.longitude,
        item.latitude,
        item.longitude
      );
    });

    log.debug("Created distance representation of the coordinates", {
      distanceRepresentation,
      previousLocation,
      incomingLocation,
    });

    // get distance between previousLocation and incomingLocation
    const distance = getDistance(
      previousLocation.latitude,
      previousLocation.longitude,
      incomingLocation.latitude,
      incomingLocation.longitude
    );

    log.debug("Got distance between previousLocation and incomingLocation", { distance, previousLocation, incomingLocation, }); // prettier-ignore

    // in distance representation, get the first index where the value is greater than the distance of previousLocation from incomingLocation
    const index = distanceRepresentation.findIndex((value) => value > distance);
    log.debug("Distance index found.", { index, distance, distanceRepresentation, coordinates }); // prettier-ignore

    // recreate the coordinates where the start of the new coordinates is the index we get from the previous step
    const newCoordinates = coordinates.slice(index);
    log.debug("New coordinates created.", { newCoordinates, index, coordinates }); // prettier-ignore

    // insert the incoming location to the start of the new coordinates
    newCoordinates.unshift(incomingLocation);
    log.debug("Incoming location inserted to the start of the new coordinates.", { newCoordinates, incomingLocation }); // prettier-ignore

    // set the new coordinates to the state
    setCoordinates(newCoordinates);
  }

  return {
    handleStart,
    handleStop,
    coordinates,
    isPending,
    isStarted,
    isStopped,
    isError,
    error,
    first,
    last,
    eta,
  };
}

/**
 *
 * @param {string} origin
 * @param {string} destination
 */
async function handleGetDirections(origin, destination) {
  const directions = await getDirections(origin, destination);
  return directions?.routes?.[0];
}

/**
 * @typedef {Object} Props
 * @property {string} match_id
 *
 * @typedef {Object} Coordinates
 * @property {number} latitude
 * @property {number} longitude
 * @property {number} [heading]
 *
 * @typedef {Object} Return
 * @property {Function} handleStart
 * @property {Function} handleStop
 * @property {Coordinates[]} coordinates
 * @property {boolean} isPending
 * @property {boolean} isStarted
 * @property {boolean} isStopped
 * @property {boolean} isError
 * @property {string} error
 * @property {Coordinates} [first]
 * @property {Coordinates} [last]
 * @property {string} eta
 */
