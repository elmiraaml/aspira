import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { View, TouchableOpacity, StyleSheet } from "react-native";

function FloatingAddButton({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.floatingButton}>
      <View style={styles.floatingButtonInner}>
        <Feather name="plus" size={28} color="#ffffff" />
      </View>
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          backgroundColor: "#ffffff",
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="active-cases"
        options={{
          title: "Kasus Aktif",
          tabBarIcon: ({ color }) => (
            <Feather name="alert-circle" size={22} color={color} />
          ),
        }}
      />

      {/* Center floating "+" button */}
      <Tabs.Screen
        name="create"
        options={{
          title: "",
          tabBarIcon: () => null,
          tabBarButton: (props) => (
            <FloatingAddButton onPress={props.onPress} />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "Riwayat",
          tabBarIcon: ({ color }) => (
            <Feather name="clock" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    top: -20,           // lifts the button above the tab bar
    justifyContent: "center",
    alignItems: "center",
  },
  floatingButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    // Shadow for iOS
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    // Shadow for Android
    elevation: 8,
  },
});