import { useEffect, useState } from 'react';
import "./global";
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { withWalletConnect, useWalletConnect } from '@walletconnect/react-native-dapp';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from "expo-font";
import { AppContext } from './utils/AppContext';
import InterBold from "./assets/fonts/Inter-Bold.ttf";
import InterRegular from "./assets/fonts/Inter-Regular.ttf";
import Knewave from "./assets/fonts/knewave.ttf";
import NotoSansKRBlack from "./assets/fonts/NotoSansKR-Black.otf";
import NotoSansKRBold from "./assets/fonts/NotoSansKR-Bold.otf";
import NotoSansKRLight from "./assets/fonts/NotoSansKR-Light.otf";
import NotoSansKRMedium from "./assets/fonts/NotoSansKR-Medium.otf";
import NotoSansKRRegular from "./assets/fonts/NotoSansKR-Regular.otf";
import NotoSansKRThin from "./assets/fonts/NotoSansKR-Thin.otf";

import LoginPage from './src/page/LoginPage';
import NewLoginPage from './src/page/NewLoginPage';
import RegistePage from './src/page/RegistePage';
import FindPinCodePage from './src/page/FindPinCodePage';
import InputPinCodepage from './src/page/InputPinCodePage';
import Homepage from './src/page/HomePage';
import MyInfoPage from './src/page/MyInfoPage';
import ScanQRCodePage from './src/page/ScanQRCodePage';
import MetamaskInfoPage from './src/page/MetamaskInfoPage';
import NFTNotificationPage from './src/page/NFTNotificationPage';
import InputCodeViaEmail from './src/page/InputCodeViaEmail';
import ScanQRCodePageForOwner from './src/page/ScanQRCodePageForOwner';
import NFTSellNFTPage from './src/page/NFTSellNFTPage';

const Stack = createNativeStackNavigator();

function App() {
  const [walletAddress, setWalletAddress] = useState(null); 
  const [walletType, setWalletType] = useState(null); 
  const [chainID, setChainID] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [memberId, setMemberId] = useState(null);
  const [loginDate, setLoginDate] = useState(null);
  const [fcmToken, setFcmToken] = useState(null);
  const [msgInqToken, setMsgInqToken] = useState(null);
  const [routerHistory, setRouterHistory] = useState(null);
  const [initialRouter, setInitialRouter] = useState("Registe")
  const [loading, setLoading] = useState(true);
  const evmConnector = useWalletConnect();

  useEffect(() => {
    checkAsyncStorage();

    async function checkAsyncStorage() {
      let hashMemberWithPin = await AsyncStorage.getItem("hashMemberWithPin");
      let pinCode = await AsyncStorage.getItem("@pincode");
      if(hashMemberWithPin && pinCode) setInitialRouter("NewLogin")
      else setInitialRouter("Registe")
      setLoading(false);
    }
  }, [])

  const [loaded] = useFonts({
    InterRegularFont: InterRegular,
    InterBoldFont: InterBold,
    KnewaveFont: Knewave,
    'material-community': Knewave,
    NotoSansKRBlack: NotoSansKRBlack,
    NotoSansKRBold: NotoSansKRBold,
    NotoSansKRLight: NotoSansKRLight,
    NotoSansKRMedium: NotoSansKRMedium,
    NotoSansKRRegular: NotoSansKRRegular,
    NotoSansKRThin: NotoSansKRThin
  })

  if (!loaded) {
    return ;
  }
  if(loading) return null;
  console.log("init", initialRouter)
  return (
    <SafeAreaView style={{flex: 1}}>
      <AppContext.Provider value={{walletAddress, setWalletAddress, chainID, setChainID, evmConnector, userEmail, setUserEmail, userStatus, setUserStatus, memberId, setMemberId, walletType, setWalletType, loginDate, setLoginDate, fcmToken, setFcmToken, routerHistory, setRouterHistory, msgInqToken, setMsgInqToken }}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName={initialRouter} screenOptions={{headerShown: false}}>
            <Stack.Screen
              name="Login"
              component={LoginPage}
              options={{}}
            />
            <Stack.Screen
              name="NewLogin"
              component={NewLoginPage}
              options={{}}
            />
            <Stack.Screen name="Registe" component={RegistePage} />
            <Stack.Screen name="FindPinCode" component={FindPinCodePage} />
            <Stack.Screen name="InputPinCode" component={InputPinCodepage} />
            <Stack.Screen name="HomePage" component={Homepage} />
            <Stack.Screen name="InputCodeViaEmail" component={InputCodeViaEmail} />
            <Stack.Screen name="MyInfoPage" component={MyInfoPage} />
            <Stack.Screen name="MetamaskInfoPage" component={MetamaskInfoPage} />
            <Stack.Screen name="ScanQRCodePage" component={ScanQRCodePage} />
            <Stack.Screen name="ScanQRCodePageForOwner" component={ScanQRCodePageForOwner} />
            <Stack.Screen name="NFTNotificationPage" component={NFTNotificationPage} />
            <Stack.Screen name="NFTSellNFTPage" component={NFTSellNFTPage} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppContext.Provider>
    </SafeAreaView>
  );
}

export default withWalletConnect (App, {
  clientMeta: {
    description: "Connect with WalletConnect",
  },
  redirectUrl:
    Platform.OS === "web" ? window.location.origin : "yourappscheme://",
  storageOptions: {
    asyncStorage: AsyncStorage,
  },
})
