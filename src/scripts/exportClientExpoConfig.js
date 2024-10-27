import ExpoConfig from "@expo/config";

import path from "path";

const projectDir = path.join(__dirname, '..', '..', 'expo-updates-client');

const { exp } = ExpoConfig.getConfig(projectDir, {
  skipSDKVersionRequirement: true,
  isPublicConfig: true,
});

console.log(JSON.stringify(exp));
