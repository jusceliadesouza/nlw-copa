import { NativeBaseProvider, StatusBar } from "native-base";
import {
  useFonts,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
} from "@expo-google-fonts/roboto";

import { Find } from "./src/screen/Find";
import { Loading } from "./src/components/Loading";
import { New } from "./src/screen/New";
import { SignIn } from "./src/screen/SignIn";

import { THEME } from "./src/styles/theme";
import { AuthContextProvider } from "./src/contexts/AuthContext";

export default function App() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
  });

  return (
    <NativeBaseProvider theme={THEME}>
      <AuthContextProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />

        {fontsLoaded ? <Find /> : <Loading />}
      </AuthContextProvider>
    </NativeBaseProvider>
  );
}
