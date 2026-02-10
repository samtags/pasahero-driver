import { useEffect } from "react";
import getNearbyDrivers from "@/src/services/api/getNearbyDrivers";
import storage from "@/src/services/storage";
import { useMMKVString } from "react-native-mmkv";
import subscribe from "@/src/services/realtime";
import JSON from "@/src/services/json";

export default function useGetDrivers(latitude, longitude) {
  const [keys] = useMMKVString("__tmp_drivers");

  useEffect(() => {
    console.debug("Detected a change in the location. Getting nearby drivers.", { latitude, longitude }); // prettier-ignore

    // check if the drivers id in the store is already configured.
    const drivers = storage.getString("__tmp_drivers");
    if (!drivers) storage.set("__tmp_drivers", "");

    (async () => {
      const drivers = await getNearbyDrivers(latitude, longitude);

      drivers?.forEach((driver) => {
        // check if the driver is already in the set
        const subscriptionKeys = storage.getString("__tmp_drivers");

        // if not, add it to the store
        if (subscriptionKeys.includes(driver.driver_id) === false) {
          let toAppend = "";
          if (subscriptionKeys !== "") toAppend += ",";

          const key = `__tmp_location.${driver.driver_id}`;
          toAppend += key;

          // add key to the subscription keys in the store
          storage.set("__tmp_drivers", subscriptionKeys + toAppend); // __tmp_drivers = "__tmp_location.1, __tmp_location.2, ..."

          // add driver location to the store
          storage.set(key, JSON.stringify(driver)); // __tmp_location.1 = "{"\latitude\": 12.9722, ... }"

          function handleRemoveToStore() {
            console.debug("Removing to store", key);

            // remove subscription key
            let subscriptionKeys = storage.getString("__tmp_drivers");

            function removeKey(k) {
              subscriptionKeys = subscriptionKeys.replace(k, ""); // prettier-ignore
              storage.set("__tmp_drivers", subscriptionKeys);
              console.debug(k, "removed from subscription keys in storage");
            }

            if (subscriptionKeys.includes(`${key},`)) {
              console.debug("Detected key with comma", key);
              removeKey(`${key},`);
            }

            if (subscriptionKeys.includes(key)) {
              console.debug("Detected key without comma", key);
              removeKey(key);
            }

            // remove storage data
            storage.delete(key);
            console.debug(key, "was data removed from storage");
          }

          let timeout = setTimeout(handleRemoveToStore, 15 * 1000);
          console.debug("Subscribe to", `locations.${driver.driver_id}`);
          subscribe(`locations.${driver.driver_id}`, (incomingData) => {
            // remove the previous timeout
            clearTimeout(timeout);
            // reset the timeout
            timeout = setTimeout(handleRemoveToStore, 15 * 1000);

            // update the data on store
            storage.set(key, JSON.stringify(incomingData));
          });
        }
      });
    })();
  }, [latitude, longitude]);

  if (keys === "") return [];
  return keys?.split?.(",")?.filter(Boolean) || [];
}
