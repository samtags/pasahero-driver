import Home from "@/src/screens/home";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import { useEffect } from "react";
import storage from "@/src/services/storage";

export default function App(props) {
  const isMaintenance = useFeatureIsOn("phd-show-maintenance", false);
  const showForceUpdate = useFeatureIsOn("phd-show-force-update", false);

  useEffect(() => {
    storage.set("app.showMaintenance", isMaintenance);
    storage.set("app.showForceUpdate", showForceUpdate);
  }, [isMaintenance, showForceUpdate]);

  return <Home {...props} />;
}
