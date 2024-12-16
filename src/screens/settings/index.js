import Text from "@/src/components/text";
import router from "@/src/services/router";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SignedOut, SignedIn, useAuth, useUser } from "@clerk/clerk-expo";
import { Image } from "expo-image";
import { handleSignInViaGoogle } from "@/src/services/auth/useOAuth";
import { handleSetStatus } from "@/src/services/controller";
import handleResetUser from "@/src/services/util/account/handleResetUser";
import storage from "@/src/services/storage";

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();

  const handleSignOut = () => {
    signOut();
    handleSetStatus("INACTIVE");
    storage.delete("__tmp_trip.request");
    storage.delete("__tmp_trip.active");
    handleResetUser();
    router.navigate({ pathname: "/" });
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <SignedIn>
          <View style={styles.driverContainer}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <View style={styles.driverImageContainer}>
                <Image
                  source={user?.imageUrl}
                  style={{ width: "100%", height: "100%" }}
                />
              </View>

              <View style={{ gap: 4 }}>
                <Text size={18} weight="700">
                  {user?.fullName}
                </Text>
                <Text color="#707070" size={16}>
                  {user?.primaryEmailAddress?.emailAddress}
                </Text>
              </View>
            </View>
          </View>
          <View>
            <Link href="/profile">Profile</Link>
          </View>
        </SignedIn>
        <Link href="/faqs">FAQs</Link>
        <Link href="/privacy-policy">Privacy Policy</Link>
        <Link href="/terms-condition">Terms and Condition</Link>
        <Link href="/contact-us">Contact Us</Link>
        {/* <Link href="/feedback">Send Feedback</Link> */}
        <SignedIn>
          <Link href="/delete-account">Delete Account</Link>
          <Link onPress={handleSignOut}>Sign Out</Link>
        </SignedIn>
        <SignedOut>
          <Link onPress={handleSignInViaGoogle}>Sign In</Link>
        </SignedOut>
      </ScrollView>
    </View>
  );
}

/**
 *
 * @param {ItemProps} props
 * @returns
 */
function Link({
  href,
  children,
  onPress = () => {},
  right, //
  color,
}) {
  const handleOnPress = () => {
    if (href) router.navigate({ pathname: href });
    onPress?.();
  };

  return (
    <TouchableOpacity onPress={handleOnPress} style={styles.link}>
      <Text size={18} color={color}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  driverContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  driverImageContainer: {
    width: 55,
    height: 55,
    borderRadius: 9,
    backgroundColor: "#EFEFEF",
    overflow: "hidden",
  },
  soonBadge: {
    backgroundColor: "#9B282D",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 7,
  },
  link: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderColor: "#EAEAEA",
    borderBottomWidth: 1,
  },
});
