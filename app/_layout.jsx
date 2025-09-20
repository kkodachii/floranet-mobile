// app/_layout.jsx

import { Stack, useRouter } from "expo-router";
import {
  View,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
  Vibration,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import * as NavigationBar from "expo-navigation-bar";
import { ThemeProvider, useTheme } from "../Theme/ThemeProvider";
import { NotificationProvider } from "../services/NotificationContext";
import { OneSignal, LogLevel } from "react-native-onesignal";

import { authStorage, setAuthToken } from "../services/api";
import { onesignalService } from "../services/api";

function useOneSignalNotifications(storedUser) {
  const router = useRouter();

  useEffect(() => {
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    OneSignal.initialize("4df5f254-b383-4ac7-80f4-8b3c1afacb06");
    OneSignal.Notifications.requestPermission(true);
    OneSignal.User.pushSubscription.optIn();

    const openedListener = OneSignal.Notifications.addEventListener("click", (event) => {
      Vibration.vibrate(1000);
      const url = event.notification.additionalData?.url;
      if (url) {
        router.push(url);
      } else {
        Alert.alert("Notification", event.notification.body || "You got a message!");
      }
    });

    return () => {
      openedListener.remove();
    };
  }, []);

  useEffect(() => {
    if (storedUser && storedUser.id) {
      (async () => {
        try {
          const externalId = String(storedUser.id);

          await OneSignal.login(externalId);
          await OneSignal.User.addTags({ user_id: externalId });

          
          const onesignalUserId = await OneSignal.User.getOnesignalId();  // check that this exists

          // Only call backend if you got an ID (optional check)
          if (onesignalUserId) {
            await onesignalService.register({
              external_id: externalId,
              onesignal_user_id: onesignalUserId,
            });
          }
        } catch (err) {
          console.error("OneSignal registration error:", err);
        }
      })();
    } else {
      // no user, maybe logged out
      OneSignal.logout();
    }
  }, [storedUser]);
}

function AppLayout() {
  const { colors, theme } = useTheme();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [storedUser, setStoredUser] = useState(null);
  const [tokenLoaded, setTokenLoaded] = useState(false);

  useOneSignalNotifications(storedUser);

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync(colors.background);
      NavigationBar.setButtonStyleAsync(theme === "dark" ? "light" : "dark");
    }
  }, [theme, colors]);

  useEffect(() => {
    (async () => {
      try {
        const { token, user } = await authStorage.load();
        if (token) {
          setAuthToken(token);
        }
        if (user && user.id) {
          setStoredUser(user);
        } else {
          setStoredUser(null);
        }
      } catch (err) {
        console.error("Error loading auth storage:", err);
        setStoredUser(null);
      }
      setCheckingAuth(false);
    })();
  }, []);

  if (checkingAuth) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#28942c" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} backgroundColor={colors.background} />
      <Stack
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          animation: "none",
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </View>
  );
}

export default function LayoutWrapper() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AppLayout />
      </NotificationProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
