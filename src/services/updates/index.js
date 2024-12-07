import * as Updates from "expo-updates";
import storage from "../storage";
import log from "../log";

export default async function onFetchUpdateAsync() {
  log.debug("Checking for updates.");

  if (__DEV__) {
    log.debug("Detecting app is development mode. Skipping update check.");
    return;
  }

  try {
    const update = await Updates.checkForUpdateAsync();
    log.debug("Checking for updates", { update });

    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      // await Updates.reloadAsync();
      storage.set("app.updateAvailable", true);
      log.debug("Update is now available. ", { update });
    }
  } catch (error) {
    // You can also add an alert() here if needed for your purposes
    console.debug(`Error fetching latest Expo update: ${error}`);
  }
}
