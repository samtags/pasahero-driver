import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import Text from "@/src/components/text";
import { SignedOut, SignedIn, useOAuth, useAuth } from "@clerk/clerk-expo";
import log from "@/src/services/log";
import handleResetUser from "@/src/services/util/account/handleResetUser";
import router from "@/src/services/router";
import { resetTransactions } from "@/src/services/queries/useTransactions";
import { resetWallet } from "@/src/services/queries/useWallet";

export default function Account() {
  const { signOut } = useAuth();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const handleSignIn = async () => {
    try {
      const flow = await startOAuthFlow();

      const { createdSessionId, signUp, setActive } = flow;

      if (createdSessionId) {
        setActive({ session: createdSessionId });
      } else {
        setActive({ session: signUp.createdSessionId });
      }
    } catch (err) {
      log.error("OAuth error", { error: err });
    }
  };

  const handleSignOut = () => {
    signOut();
    handleResetUser();
    resetTransactions();
    resetWallet();
  };

  return (
    <View style={[styles.full, { backgroundColor: "white" }]}>
      <ScrollView
        style={styles.full}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View style={styles.container}>
          <SignedIn>
            {/* <Link href="/wallet">My Wallet</Link> */}
            <Link href="/trips">Trips</Link>
          </SignedIn>
          {/* <Link href="/account">Saved Locations</Link> */}
          <Link href="/faqs">FAQs</Link>
          {/* <Link href="/account">Privacy Policy</Link> */}
          <Link href="/feedback">Send Feedback</Link>
          <Link href="/contact-us">Contact Us</Link>
          <SignedIn>
            <Link onPress={handleSignOut} href="/account">
              Sign Out
            </Link>
          </SignedIn>
          <SignedOut>
            <Link onPress={handleSignIn} href="/account">
              Sign In
            </Link>
          </SignedOut>
        </View>
      </ScrollView>
      <View style={{ padding: 24 }}>
        <Text color="#bbbbbb">1.1.9-beta</Text>
      </View>
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
  onPress = () => {}, //
}) {
  const handleOnPress = () => {
    if (href) router.navigate({ pathname: href });
    onPress?.();
  };

  return (
    <View style={styles.item}>
      <TouchableOpacity onPress={handleOnPress} style={styles.link}>
        <Text size={18} color="#353579">
          {children}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * @typedef ItemProps
 *
 */

const styles = StyleSheet.create({
  link: {
    borderBottomWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderColor: "#EAEAEA",
  },
  item: { paddingHorizontal: 16 },
  full: {
    flex: 1,
  },
  container: { backgroundColor: "white", flex: 1 },
});
