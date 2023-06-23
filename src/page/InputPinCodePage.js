import React, {useContext, useEffect, useLayoutEffect, useState} from 'react';
import { StyleSheet, Text, View, Image, Alert, TouchableOpacity, Modal, TouchableHighlight, BackHandler } from 'react-native';
import { PinCode, PinCodeT, hasSetPIN, clearPIN } from '../pinCode/index';
import Icon from 'react-native-vector-icons/AntDesign';
import { AppContext } from '../../utils/AppContext';
import axios from 'axios';
import CryptoJS from "react-native-crypto-js";
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hashKey } from '../../utils/pinCodeKey';
import { AlertTitle, inputPinCodepageTitle } from '../../utils/titleForUI';

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { PinManageAPI, RegisterPushTokenAPI } from '../../utils/APIConfig';
import base64 from 'base-64';
import utf8 from 'utf8';
import * as Hashes from 'jshashes'

const encodeSHAAndBase = async (pin) => {
  // const digest = await Crypto.digestStringAsync(
  //   Crypto.CryptoDigestAlgorithm.SHA256,
  //   pin
  // );
  // console.log("digest", digest)
  // // const utf8Bytes = utf8.encode(digest); // utf8 encode it
  // // console.log("utf8", utf8Bytes)

  // const encoded = base64.encode(digest); // base64 encode it
  // console.log("encode", encoded)

  let SHA256 = new Hashes.SHA256;
  let hashedPin = SHA256.b64(pin);
  // console.log("use another", hashedPin)

  return hashedPin;
}

const InputPinCodepage = ({navigation}) => {

  const { userEmail, setUserEmail, userStatus, setUserStatus, setMemberId, memberId, setLoginDate, setFcmToken, routerHistory, setRouterHistory } = useContext(AppContext)
  const [ mode, setMode ] = useState(PinCodeT.Modes.Enter)
  const [ oldPin, setOldPin ] = useState(null)
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState(null);

  const [titleOption, setTitleOption] = useState({
    enter: {
      title: inputPinCodepageTitle.Enter,
      subTitle: "",
      error: inputPinCodepageTitle.EnterError,
      backSpace: inputPinCodepageTitle.BackSpace,
    },
    set: {
      title: inputPinCodepageTitle.Set,
      subTitle: "",
      repeat: inputPinCodepageTitle.SetRepeat,
      error: inputPinCodepageTitle.SetError,
      cancelText: inputPinCodepageTitle.SetCancel
    },
    locked: {
      title: inputPinCodepageTitle.Locked,
      lockedText: inputPinCodepageTitle.LockedButton
    }
  })

  useEffect(() => {
    if(userStatus === "Login") setMode(PinCodeT.Modes.Enter)
    else if(userStatus === "Register") {
      if(routerHistory === "EmailPassForFindPinCode") {
        setMode(PinCodeT.Modes.Set)
        setTitleOption({
          enter: {
            title: inputPinCodepageTitle.ExistingPinCode,
            subTitle: "",
            error: inputPinCodepageTitle.EnterError,
            backSpace: inputPinCodepageTitle.BackSpace,
          },
          set: {
            title: inputPinCodepageTitle.ResetPinCode,
            subTitle: "",
            repeat: inputPinCodepageTitle.SetRepeat,
            error: inputPinCodepageTitle.SetError,
            cancelText: inputPinCodepageTitle.SetCancel
          },
          locked: {
            title: inputPinCodepageTitle.Locked,
            lockedText: inputPinCodepageTitle.LockedButton
          }
        })
      } else if(routerHistory === "EmailPassForRegister") {
        setMode(PinCodeT.Modes.Set)
      }
    } 
    else if(userStatus === "ResetPin") {
      setMode(PinCodeT.Modes.Enter)
      setTitleOption({
        enter: {
          title: inputPinCodepageTitle.ExistingPinCode,
          subTitle: "",
          error: inputPinCodepageTitle.MismatchingExistingCode,
          backSpace: inputPinCodepageTitle.BackSpace,
        },
        set: {
          title: inputPinCodepageTitle.SetNewPin,
          subTitle: "",
          repeat: inputPinCodepageTitle.SetRepeat,
          error: inputPinCodepageTitle.SetError,
          cancelText: inputPinCodepageTitle.SetCancel
        },
        locked: {
          title: inputPinCodepageTitle.Locked,
          lockedText: inputPinCodepageTitle.LockedButton
        }
      })
    }
    
  }, [userStatus])
  
  const setNewPin = async (pin) => {
    let AESPinCode = CryptoJS.AES.encrypt(pin, hashKey).toString();
    let hashPinCode = await encodeSHAAndBase(pin)

    if(userStatus === "ResetPin") {
      let oldAESPinCode = CryptoJS.AES.encrypt(oldPin, hashKey).toString();
      let oldHashPinCode = await encodeSHAAndBase(oldPin)
      try {
        console.log("new", hashPinCode, oldHashPinCode)
        await axios.patch(`${PinManageAPI}${memberId}/pin`, {
          newHashedPin: hashPinCode,
          oldHashedPin: oldHashPinCode,
          type:"CHANGE"
        }, {
          timeout: 5000
        }).then(response => {
          // console.log("update", response)
        })
      } catch (error) {
        console.log("resetpin", error.response.data)
        if (error.code === 'ECONNABORTED') {
          setError(AlertTitle.ApiRequestFailed)
          setModalVisible(true)
        } else if (error.response.data) {
          setError(error.response.data.errors[0].reason)
          setModalVisible(true)
        } else {
          console.log("PinUpdateFailed", error)
          setError(AlertTitle.PinUpdateFailed);
          setModalVisible(true);
        }
        await AsyncStorage.setItem("@pincode", oldAESPinCode)
        return;
      }    
    } else if(userStatus === "Register") {
      if(routerHistory === "EmailPassForFindPinCode") {
        try {
          await axios.patch(`${PinManageAPI}${memberId}/pin`, {
            newHashedPin: hashPinCode,
            oldHashedPin: "",
            type: "FORGET"
          }, {
            timeout: 5000
          }).then(response => {
            console.log("Register for Find Pin Code", response)
          })
        } catch (error) {
          if (error.code === 'ECONNABORTED') {
            setError(AlertTitle.ApiRequestFailed)
            setModalVisible(true)
          } else {
            console.log("PinUpdateFailed", error)
            setError(AlertTitle.PinUpdateFailed);
            setModalVisible(true);
          }
          return;
        } 
      } else if(routerHistory === "EmailPassForRegister") {
        try {
          await axios.post(`${PinManageAPI}${memberId}/pin`, {
            hashedPin: hashPinCode
          }, {
            timeout: 5000
          }).then(response => {
            console.log("Register for new", response)
          })
        } catch (error) {
          if (error.code === 'ECONNABORTED') {
            setError(AlertTitle.ApiRequestFailed)
            setModalVisible(true)
          } else {
            console.log("PinRegisterFailed", error)
            setError(AlertTitle.PinRegisterFailed);
            setModalVisible(true);
          }
          console.log("eeerrr")
          await AsyncStorage.setItem("@pincode", "")
          return;
        } 
      }
    }
    
    await AsyncStorage.setItem("email", userEmail)
    let hashMemberId = CryptoJS.AES.encrypt(memberId, hashKey).toString();
    await AsyncStorage.setItem("hashMemberId", hashMemberId)
    await AsyncStorage.setItem("@pincode", AESPinCode)

    let hashMemberWithPin = CryptoJS.AES.encrypt(memberId, pin).toString();
    await AsyncStorage.setItem("hashMemberWithPin", hashMemberWithPin)
    navigation.navigate('NewLogin')
  }

  const enterPin = async (pin) => {
    if(userStatus === "ResetPin") {
      setOldPin(pin)
      setMode(PinCodeT.Modes.Set)
      setTitleOption({
        enter: {
          title: inputPinCodepageTitle.ExistingPinCode,
          subTitle: "",
          error: inputPinCodepageTitle.EnterError,
          backSpace: inputPinCodepageTitle.BackSpace,
        },
        set: {
          title: inputPinCodepageTitle.ChangePinCode,
          subTitle: "",
          repeat: inputPinCodepageTitle.SetRepeat,
          error: inputPinCodepageTitle.SetError,
          cancelText: inputPinCodepageTitle.SetCancel
        },
        locked: {
          title: inputPinCodepageTitle.Locked,
          lockedText: inputPinCodepageTitle.LockedButton
        }
      })
    }
    else {
      console.log("enter InputPincodePage set")
      let hashMemberWithPin = await AsyncStorage.getItem("hashMemberWithPin");
      let userMemberId = CryptoJS.AES.decrypt(hashMemberWithPin, pin).toString(CryptoJS.enc.Utf8);
      // setMemberId(userMemberId)
      setMemberId("baorrvLgtyi6-_sToFEEOEuhnMmSYLN9N3Y6XJXi-mA")

      let fcmToken = await AsyncStorage.getItem("fcmToken");
      // setFcmToken(fcmToken)
      setFcmToken("dc8f6cfef5ed820ca10c0d4ced0cb63ef9dd5e4d83ba63cbf2e35e5bbaacdbb1")

      let userEmail = await AsyncStorage.getItem("email");
      setUserEmail(userEmail)
  
      let date = ('0' + new Date().getDate()).slice(-2);
      let month = ('0' + (new Date().getMonth() + 1)).slice(-2);
      let year = new Date().getFullYear();
      let hours = ('0' + new Date().getHours()).slice(-2); //To get the Current Hours
      let min = ('0' + new Date().getMinutes()).slice(-2); //To get the Current Minutes
      let sec = ('0' + new Date().getSeconds()).slice(-2); //To get the Current Seconds

      setLoginDate(`${year}-${month}-${date} ${hours}:${min}:${sec}`)
      navigation.navigate('HomePage')
    }
  }

  const checkPin = async (pin) => {
    const pinHashCode = await AsyncStorage.getItem("@pincode");
    let decryptPin = CryptoJS.AES.decrypt(pinHashCode, hashKey).toString(CryptoJS.enc.Utf8);
    return (decryptPin && decryptPin === pin)
  }

  const onFindPinCode = async () => {
    setUserStatus("ForgetPinRegisterAgain")
    navigation.navigate('Registe')
  }

  const onBack = () => {
    if(userStatus === "ResetPin") {
      navigation.navigate('MyInfoPage')
    } else if(userStatus === "Login") {
      navigation.navigate('NewLogin')
    } else if(userStatus === "Register") {
      navigation.navigate('Registe')
    } else {
      navigation.navigate('NewLogin')
    }
  }

  const onModalOk = async () => {
    userStatus === "ResetPin" ? navigation.navigate('MyInfoPage') : navigation.navigate('NewLogin')
  }
  
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtnContainer} onPress={onBack}>
        <Image source={require('../../assets/backWihiteBtn.png')} style={styles.backbtn} />
      </TouchableOpacity>
      <Image source={require('../../assets/logo.png')} style={styles.logo} /> 
      <PinCode mode={mode} visible={true} 
        styles={pincodeStyle} 
        options={pincodeOption}
        textOptions={titleOption}
        onSetSuccess={(newPin) => setNewPin(newPin)}
        onEnterSuccess={(pin) => enterPin(pin)}
        checkPin={async (pin) => checkPin(pin)}
      />
      {
        userStatus === "ResetPin" || userStatus === "Login" && <TouchableHighlight
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
                  source={require('../../assets/verified.png')}
                  style={styles.walletIconStyle}
            />
            <Text style={styles.walletBigText}>{error}</Text>
            <TouchableHighlight
              style={styles.changePinBtn}
              onPress={onModalOk}
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
  main: { position: 'absolute', left: 0, right: 0, top: "30%", bottom: 0, zIndex: 99, backgroundColor: "transparent", fontFamily: "NotoSansKRRegular" },
  enter: {
    titleContainer: { padding: 0, marginTop: 0, fontFamily: "NotoSansKRRegular" },
    subTitle: {marginTop: 5},
    title: { color: 'white', fontSize: 30, fontFamily: "NotoSansKRRegular" },
    buttonContainer: { width : "120%", backgroundColor: "white", marginTop: "50%", paddingTop: 20, paddingBottom: 30,  },
    buttonText: { color: 'black', fontSize: 30 },
    buttons: { backgroundColor: 'white',   },
    footerText: { color: 'white', margin: 0, paddingLeft: 10, paddingRight: 10, paddingTop: 0, paddingBottom: 5 },
    pinContainer: { marginTop: -20, height: 0 },
  },
  locked: {
    // titleContainer: { borderWidth: 1 },
    title: { color: 'yellow', fontFamily: "NotoSansKRRegular" },
    subTitle: { display: "none" },
    clockContainer: { borderWidth: 1 },
    clockText: { color: 'red' },
    locked: { color: 'yellow' }
  },
  set: {
    repeat: {color: 'red', fontSize: 30, fontFamily: "NotoSansKRRegular" },
    // subTitle: {marginTop: 10},
  },
  reset: {
    titleContainer: { borderWidth: 1 },
    title: { color: 'yellow' },
    subTitle: {marginTop: 10},
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
    margin: 7
  },  
  findPinBtn: {
    position: 'absolute',
    top : 350,
    borderWidth: 0.8,
    borderColor: "white",
    // borderRadius: 10,
    height: 35,
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
    top: "8.5%",
    width :35,
    height : 35,
  }
});

export default InputPinCodepage
