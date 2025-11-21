// import 'dotenv/config';

// export default {
//   expo: {
//     name: 'Habitron',
//     slug: 'Habitron',
//     version: '1.0.0',
//     orientation: 'portrait',
//     icon: './assets/images/lifestyle.png',
//   scheme: 'habitron',
//     userInterfaceStyle: 'automatic',
//     newArchEnabled: true,
//     ios: {
//       supportsTablet: true,
//       bundleIdentifier: "com.yourcompany.habitron",
//       "infoPlist": {
//         "UIBackgroundModes": ["remote-notification"]
//       }
//     },
//     android: {
//       "softwareKeyboardLayoutMode": "pan",
//       adaptiveIcon: {
//         foregroundImage: './assets/images/lifestyle.png',
//         backgroundColor: '#6e6aba',
//       },
//       edgeToEdgeEnabled: true,
//       package: 'com.anonymous.Habitron',
//        "permissions": [
//         "RECEIVE_BOOT_COMPLETED",
//         "VIBRATE",
//         "SCHEDULE_EXACT_ALARM",
//         "USE_EXACT_ALARM"
//       ],
//     },
//     web: {
//       bundler: 'metro',
//       output: 'static',
//       favicon: './assets/images/lifestyle.png',
//     },
//     plugins: [
//      "expo-sqlite",
//       'expo-router',
//         [
//         "expo-notifications",
//         {
//           icon: "./assets/icons/notification-icon.png",
//           color: "#3B82F6",
//           sounds: ["./assets/notification-sound.wav"]
//         }
//       ],

//       [
//         'expo-splash-screen',
//         {
//           image: './assets/images/lifestyle.png',
//           imageWidth: 200,
//           resizeMode: 'contain',
//           backgroundColor: '#6e6aba',
//         },
//       ],
//       'expo-web-browser',
//     ],
//     notifications: {
//        icon: "./assets/icons/notification-icon.png",
//       color: "#3B82F6",
//       androidMode: "default",
//       androidCollapsedTitle: "Habit Reminder"
//     },
//     experiments: {
//       typedRoutes: true,
//     },
//     extra: {
//       SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
//       SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
//       GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
//       GOOGLE_WEB_CLIENT_SECRET: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_SECRET,
//       GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
//       GOOGLE_ANDRIOD_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
//        eas: {
//         projectId: 'be51b57e-ac43-4c5c-a5f7-5b9a209e7b5d',
//       },
//     },

//   },
// };


import "dotenv/config";

export default {
  expo: {
    name: "Habitron",
    slug: "Habitron",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/lifestyle.png",
    scheme: "habitron",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.anonymous.habitron",
      infoPlist: {
        UIBackgroundModes: ["remote-notification"]
      }
    },

    android: {
      softwareKeyboardLayoutMode: "pan",
      adaptiveIcon: {
        foregroundImage: "./assets/images/lifestyle.png",
        backgroundColor: "#6e6aba"
      },
      edgeToEdgeEnabled: true,
      package: "com.anonymous.habitron",
      permissions: [
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE",
        "SCHEDULE_EXACT_ALARM",
        "USE_EXACT_ALARM"
      ]
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/lifestyle.png"
    },

    plugins: [
      "expo-sqlite",
      "expo-router",

      
      [
        "expo-notifications",
        {
          icon: "./assets/icons/notification-icon.png",
          color: "#3B82F6"
        }
      ],

      [
        "expo-splash-screen",
        {
          image: "./assets/images/lifestyle.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#6e6aba"
        }
      ],

      "expo-web-browser"
    ],

    notifications: {
      icon: "./assets/icons/notification-icon.png",
      color: "#3B82F6",
      androidMode: "default",
      androidCollapsedTitle: "Habit Reminder"
    },

    experiments: {
      typedRoutes: true
    },

    extra: {
      SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      GOOGLE_WEB_CLIENT_SECRET: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_SECRET,
      GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      GOOGLE_ANDRIOD_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,

      eas: {
        projectId: "be51b57e-ac43-4c5c-a5f7-5b9a209e7b5d"
      }
    }
  }
};

