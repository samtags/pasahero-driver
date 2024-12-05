import { Alert } from "react-native";
import { useOAuth, useUser } from "@clerk/clerk-expo";
import {
  UNSAFE_registerMethod,
  UNSAFE_retrieveProperty,
} from "@/src/services/global";
import log from "@/src/services/log";
import storage from "@/src/services/storage";
import useOnUpdate from "@/src/services/hooks/useOnUpdate";

export const startOAuthFlow = async () => {
  const oAuth = UNSAFE_retrieveProperty("startOAuthFlow");
  return await oAuth();
};

export default function OAuthProvider({ children }) {
  const { startOAuthFlow: oAuthFlow } = useOAuth({ strategy: "oauth_google" }); // prettier-ignore
  UNSAFE_registerMethod("startOAuthFlow", oAuthFlow);

  return <UserProvider>{children}</UserProvider>;
}

function UserProvider({ children }) {
  const user = useUser();

  useOnUpdate(() => {
    if (user?.user) {
      handleInitializeUser(user.user);
    }
  }, [user?.user]);

  return children;
}

export async function handleSignInViaGoogle() {
  let flow;
  try {
    flow = await startOAuthFlow();

    if (!flow) {
      Alert.alert(
        "Sign in Error",
        "Unable to sign in via google. Please try again."
      );

      return log.error("There's no flow to sign in via google.");
    }

    const { createdSessionId, signUp, setActive, authSessionResult } = flow;

    if (createdSessionId) {
      setActive({ session: createdSessionId });
    } else {
      if (signUp?.createdSessionId) {
        setActive({ session: signUp.createdSessionId });
      }
    }

    if (authSessionResult?.type === "success") {
      return true;
    } else if (authSessionResult?.type === "dismiss") {
      return false;
    } else {
      Alert.alert(
        "Unable to sign in",
        "Waiting for stable connection. Please try again later."
      );

      log.warn("Unable to sign in. Auth is not ready yet.", { flow });

      return false;
    }
  } catch (err) {
    Alert.alert(
      "Sign in Error",
      "Unable to sign in via google. Please try again."
    );

    log.error("Sign in auth error in trip control.", { error: err, flow });
    return false;
  }
}

function handleInitializeUser(userInfo) {
  log.debug("Initializing user data.", { userInfo });

  if (userInfo) {
    const id = userInfo.id;
    const name = userInfo.fullName;
    const firstName = userInfo.firstName;
    const lastName = userInfo.lastName;
    const imageUrl = userInfo.imageUrl;
    const email = userInfo.primaryEmailAddress?.emailAddress;

    log.debug("Storing user data to state.", { userInfo, id, name, firstName, lastName, imageUrl, email }); // prettier-ignore

    if (id) storage.set("user.id", id);
    if (name) storage.set("user.name", name);
    if (firstName) storage.set("user.firstName", firstName);
    if (lastName) storage.set("user.lastName", lastName);
    if (imageUrl) storage.set("user.imageUrl", imageUrl);
    if (email) storage.set("user.email", email);

    // updateUser({ id, image_url: imageUrl, name });
  }
}
