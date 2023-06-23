import React, {useContext, useEffect, useLayoutEffect, useState} from 'react';
import { StyleSheet, Text, View, Image, Modal, TouchableHighlight, BackHandler, Platform } from 'react-native';
import { PinCode, PinCodeT, hasSetPIN, clearPIN } from '../pinCode/index';
import Icon from 'react-native-vector-icons/AntDesign';
import { AppContext } from '../../utils/AppContext';
import axios from 'axios';
import CryptoJS from "react-native-crypto-js";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hashKey } from '../../utils/pinCodeKey';
import { AlertTitle, inputPinCodepageTitle, loginPageTitle } from '../../utils/titleForUI';
import CircleCheckBox, {LABEL_POSITION} from 'react-native-circle-checkbox'; 

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { PinManageAPI, RegisterPushTokenAPI } from '../../utils/APIConfig';

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getDevicePushTokenAsync()).data;
    // token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

const InputPinCodepage = ({navigation}) => {

  const { userEmail, setUserEmail, userStatus, setUserStatus, setMemberId, memberId, setLoginDate, setFcmToken, routerHistory, setRouterHistory, msgInqToken, setMsgInqToken } = useContext(AppContext)
  const [ mode, setMode ] = useState(PinCodeT.Modes.Enter);
  const [ autologinShow, setAutologinShow ] = useState(true);
  const [ autoLogin, setAutoLogin ] = useState(false);
  const [ modalVisible, setModalVisible ] = useState(false);
  const [ error, setError ] = useState(null)

  // useLayoutEffect(() => {
  //   navigation.setOptions({
  //     headerLeft: () => null,
  //   });
  // }, [navigation]);

  // useEffect(() => {
  //   const backHandler = BackHandler.addEventListener(
  //     'hardwareBackPress',
  //     () => {
  //       return true;
  //     },
  //   );

  //   return () => backHandler.remove();
  // }, [navigation])

  useEffect(() => {
    checkAutoLogin();

    async function checkAutoLogin() {
      // let ddd = await AsyncStorage.getItem("@pincode");
      // let decryptPin = CryptoJS.AES.decrypt(ddd, hashKey).toString(CryptoJS.enc.Utf8);
      // console.log("test", decryptPin)
      // let hashPinCode = CryptoJS.AES.encrypt("111112", hashKey).toString();
      // await AsyncStorage.setItem("@pincode", hashPinCode)
      let isAutologin = await AsyncStorage.getItem("autoLogin");
      onAutoLogin(isAutologin === "Yes" ? true : false) 
      setAutoLogin(isAutologin === "Yes" ? true : false)
    }
  }, [])

  const [titleOption, setTitleOption] = useState({
    enter: {
      title: inputPinCodepageTitle.Login,
      subTitle: inputPinCodepageTitle.PleaseinputPINCode,
      error: inputPinCodepageTitle.EnterError,
      backSpace: inputPinCodepageTitle.BackSpace,
    },
    locked: {
      title: inputPinCodepageTitle.Locked,
      lockedText: inputPinCodepageTitle.LockedButton
    }
  })

  const onErrorOk = async () => {
    setModalVisible(!modalVisible)
  }

  const onChangeAutoLogin = async (checked) => {
    await AsyncStorage.setItem("autoLogin", checked ? "Yes" : "No")
    setAutoLogin(checked)
  }

  const onAutoLogin = async (checked) => {
    if(checked) {
      let AESPinCode = await AsyncStorage.getItem("@pincode");
      let decryptPin = CryptoJS.AES.decrypt(AESPinCode, hashKey).toString(CryptoJS.enc.Utf8);
      
      let hashMemberWithPin = await AsyncStorage.getItem("hashMemberWithPin");
      let userMemberIdFromMemberPin = CryptoJS.AES.decrypt(hashMemberWithPin, decryptPin).toString(CryptoJS.enc.Utf8);

      let hashMemberId = await AsyncStorage.getItem("hashMemberId");
      let userMemberId = CryptoJS.AES.decrypt(hashMemberId, hashKey).toString(CryptoJS.enc.Utf8);

      if(userMemberIdFromMemberPin === userMemberId) {
        

        setMemberId(userMemberId)
        // setMemberId("baorrvLgtyi6-_sToFEEOEuhnMmSYLN9N3Y6XJXi-mA")

        ////////////////////// set fcmToken to kyc server /////////////////////////
        
        let fcmToken = await registerForPushNotificationsAsync()
        try {
          let res = await axios.post(RegisterPushTokenAPI, {
            memberId : userMemberId,
            pushToken : fcmToken
          }, {
            timeout: 5000
          })
        } catch (error) {
          if (error.code === 'ECONNABORTED') {
            setError(AlertTitle.ApiRequestFailed)
            setModalVisible(true)
          } else {
            console.log("FCMTokenRegisterFailed", error.response.data)
            setError(AlertTitle.FCMTokenRegisterFailed)
            setModalVisible(true)
          }
          return;
        }
        setFcmToken(fcmToken) /// here check/
        // setFcmToken("dc8f6cfef5ed820ca10c0d4ced0cb63ef9dd5e4d83ba63cbf2e35e5bbaacdbb1")
        ///////////////////////////////////////////////////////////////////////////

        let userEmail = await AsyncStorage.getItem("email");
        setUserEmail(userEmail)

        let msgToken = await AsyncStorage.getItem("msgInqToken");
        setMsgInqToken(msgToken)

        let date = ('0' + new Date().getDate()).slice(-2);
        let month = ('0' + (new Date().getMonth() + 1)).slice(-2);
        let year = new Date().getFullYear();
        let hours = ('0' + new Date().getHours()).slice(-2); //To get the Current Hours
        let min = ('0' + new Date().getMinutes()).slice(-2); //To get the Current Minutes
        let sec = ('0' + new Date().getSeconds()).slice(-2); //To get the Current Seconds
  
        setLoginDate(`${year}-${month}-${date} ${hours}:${min}:${sec}`)
        navigation.navigate('HomePage')  // do autologin Auth
      }
    } else {
    }
  }

  const enterPin = async (pin) => {
      let hashMemberWithPin = await AsyncStorage.getItem("hashMemberWithPin");
      let userMemberId = CryptoJS.AES.decrypt(hashMemberWithPin, pin).toString(CryptoJS.enc.Utf8);
      console.log("decrypt", userMemberId)
      setMemberId(userMemberId)
      // setMemberId("baorrvLgtyi6-_sToFEEOEuhnMmSYLN9N3Y6XJXi-mA")
      ////////////////////// set fcmToken to kyc server /////////////////////////
      let fcmToken = await registerForPushNotificationsAsync()

      try {
        let res = await axios.post(RegisterPushTokenAPI, {
          memberId : userMemberId,
          pushToken : fcmToken
        }, {
          timeout: 5000
        })
      } catch (error) {
        if (error.code === 'ECONNABORTED') {
          setError(AlertTitle.ApiRequestFailed)
          setModalVisible(true)
        } else {
          console.log("FCMTokenRegisterFailed", error.response.data)
          setError(AlertTitle.FCMTokenRegisterFailed)
          setModalVisible(true)
        }
        return;
      }

      console.log("fcmFirst", fcmToken)
      setFcmToken(fcmToken) /// here check
      // setFcmToken("dc8f6cfef5ed820ca10c0d4ced0cb63ef9dd5e4d83ba63cbf2e35e5bbaacdbb1")
      ///////////////////////////////////////////////////////////////////////////

      let userEmail = await AsyncStorage.getItem("email");
      setUserEmail(userEmail)

      let msgToken = await AsyncStorage.getItem("msgInqToken");
      setMsgInqToken(msgToken)
  
      let date = ('0' + new Date().getDate()).slice(-2);
      let month = ('0' + (new Date().getMonth() + 1)).slice(-2);
      let year = new Date().getFullYear();
      let hours = ('0' + new Date().getHours()).slice(-2); //To get the Current Hours
      let min = ('0' + new Date().getMinutes()).slice(-2); //To get the Current Minutes
      let sec = ('0' + new Date().getSeconds()).slice(-2); //To get the Current Seconds

      setLoginDate(`${year}-${month}-${date} ${hours}:${min}:${sec}`)
      navigation.navigate('HomePage')
  }

  const showStrage = async (pin) => {
    const keys = await AsyncStorage.getAllKeys();
    const result = await AsyncStorage.multiGet(keys);
  }

  const checkPin = async (pin) => {
    const pinHashCode = await AsyncStorage.getItem("@pincode");
    let decryptPin = CryptoJS.AES.decrypt(pinHashCode, hashKey).toString(CryptoJS.enc.Utf8);
    return (decryptPin && decryptPin === pin)
  }

  const onFindPinCode = async () => {
    setUserStatus("ForgetPinRegisterAgain")
    navigation.navigate('FindPinCode')
  }

  const onModeChanged = (lastMode, newMode) => {
    console.log("current mode", lastMode, newMode)
    if(newMode === "locked") {
      setAutologinShow(false)
    } else {
      setAutologinShow(true)
    }
  }
  
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/shortLogo.png')} style={styles.logo} />
      {
        autologinShow && <View style={styles.checkboxContainer}>
            <CircleCheckBox
              checked={autoLogin}
              onToggle={(checked) => onChangeAutoLogin(checked)}
              labelPosition={LABEL_POSITION.RIGHT}
              label={loginPageTitle.AutoLogin}
              outerSize={19}
              filterSize={15}
              innerSize={15}
              outerColor="#8d8d8d"
              styleLabel={{color: "white", fontFamily: "NotoSansKRMedium", opacity: 0.8, fontWeight: 100}}
            />
        </View>
      }
       
      <PinCode mode={mode} visible={true} 
        styles={pincodeStyle} 
        options={pincodeOption}
        textOptions={titleOption}
        onEnterSuccess={(pin) => enterPin(pin)}
        checkPin={(pin) => checkPin(pin)}
        onModeChanged={(lastMode, newMode) => onModeChanged(lastMode, newMode)}
      />
      {
        autologinShow && <TouchableHighlight
            style={styles.findPinBtn}
            onPress={() => onFindPinCode()}
            underlayColor='#fff'>
              <Text style={styles.FindPinBtnText}>{inputPinCodepageTitle.FindPinCode}</Text>
        </TouchableHighlight>
      }
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Image
                  source={require('../../assets/error.png')}
                  style={styles.walletIconStyle}
            />
            <Text style={styles.walletBigText}>{error}</Text>
            <TouchableHighlight
              style={styles.changePinBtn}
              onPress={onErrorOk}
              underlayColor='#fff'>
                <Text style={styles.registerBtnText}>{AlertTitle.OkButton}</Text>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const pincodeOption = {
  pinLength: 6,
  maxAttempt: 5,
  lockDuration: 10000,
  allowedReset: true,
  disableLock: false,
  backSpace: <Icon name='close' size={24} color="black" />,
  lockIcon: <Icon name='lock' size={24} color='black' />
}

const pincodeStyle = {
  main: { position: 'absolute', left: 0, right: 0, top: '27%', bottom: 0, zIndex: 99, backgroundColor: "transparent", fontFamily: "NotoSansKRRegular" },
  enter: {
    titleContainer: { padding: 15, marginTop: "0%", fontFamily: "NotoSansKRRegular" },
    title: { color: 'white', fontSize: 30, fontFamily: "NotoSansKRRegular" },
    buttonContainer: { width : "120%", backgroundColor: "white", marginTop: "50%", paddingTop: 0, paddingBottom:50,  },
    buttonText: { color: 'black', fontSize: 30 },
    buttons: { backgroundColor: 'white',   },
    footer: {  },
    subTitle: { marginTop: 5, marginBottom: 25},
    footerText: { color: 'white', margin: 0, paddingLeft: 10, paddingRight: 10, paddingTop: 5, paddingBottom: 5 },
    pinContainer: { height : 0 },
  },
  locked: {
    titleContainer: { marginTop: -200 },
    title: { color: 'white', fontFamily: "NotoSansKRRegular", top: 0 },
    subTitle: { display: "none" },
    clockContainer: { borderWidth: 1 },
    clockText: { color: 'red' },
    locked: { color: 'yellow' }
  },
  set: {
    repeat: {color: 'red', fontSize: 30, fontFamily: "NotoSansKRRegular" }
  },
  reset: {
    titleContainer: { borderWidth: 1 },
    title: { color: 'yellow' },
    subTitle: { color: 'red' },
    buttons: { backgroundColor: 'green' }
  }
}
const styles = StyleSheet.create({
  /////////////////////
  walletIconStyle: {
    height: 35,
    width: 35,
    resizeMode: 'stretch',
  },
  walletBigText: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 22
  },
  changePinBtn: {
    marginTop: 35,
    backgroundColor: "#ddecff",
    width: "100%",
    padding:20,
    borderRadius: 15
  },
  changePinBtn: {
    marginTop: 35,
    backgroundColor: "#ddecff",
    width: "100%",
    padding:20,
    borderRadius: 15
  },
  registerBtnText: {
    color: 'black',
    textAlign: 'center',
    fontSize: 20,
    opacity: 0.7
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "85%"
  },
  ///////////////////////
  checkboxContainer: {
    position: "absolute",
    top : "42%",
    zIndex: 1000
  },
  backBtnContainer:{
    position: 'absolute',
    top: 40,
    left: 25,
    width : 28,
    height : 22,
    zIndex: 1000,
  },  
  backbtn: {
    width : 18,
    height : 14,
  },
  FindPinBtnText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 15,
    margin: 5
  },  
  findPinBtn: {
    position: 'absolute',
    top : "50%",
    borderWidth: 0.4,
    borderColor: "white",
    borderRadius: 10,
    height: 33,
    paddingLeft: 20,
    paddingRight: 20,
    zIndex: 1000
  },
  container: {
    flex: 1,
    backgroundColor: '#0a3f92',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    position: 'absolute',
    top: '8%',
    width : 125,
    height : 65,
  }
});

export default InputPinCodepage
