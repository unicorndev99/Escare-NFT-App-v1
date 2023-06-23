import React, {useContext, useState} from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TextInput, ImageBackground, TouchableHighlight, Alert } from 'react-native';
import CheckBox from 'expo-checkbox';
import { AppContext } from '../../utils/AppContext';
import { loginPageTitle } from '../../utils/titleForUI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CircleCheckBox, {LABEL_POSITION} from 'react-native-circle-checkbox'; 
import { PinManageAPI, Scan3rdVerificationAPI, ScanVerificationAPI } from '../../utils/APIConfig';
import axios from 'axios';

export default function LoginPage({navigation}) {
  const [autoLogin, setAutoLogin] = useState(false);

  const { userEmail, setUserEmail, setUserStatus, setMemberId, setRouterHistory } = useContext(AppContext)

  const onLogin = async () => {
    let hashMemberWithPin = await AsyncStorage.getItem("hashMemberId"); //convert below line
    // let hashMemberWithPin = await AsyncStorage.getItem("hashMemberWithPin");
    if(hashMemberWithPin) {
      autoLogin ? setUserStatus("AutoLogin") : setUserStatus("Login")
      navigation.navigate('InputPinCode')
    } else {
      navigation.navigate('Registe')
    }
    
  }

  const onRegister = () => {
    navigation.navigate('Registe') 
  }

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/escare_nft_logo.png')} style={{width: 140, height: 100}} />  
      <ImageBackground source={require('../../assets/top_background_effect.png')} resizeMode="stretch" style={styles.backgroundImage}></ImageBackground>
      <View style={styles.subContainer}>
        <View style={styles.checkboxContainer}>
          <CircleCheckBox
            checked={autoLogin}
            onToggle={(checked) => setAutoLogin(checked)}
            labelPosition={LABEL_POSITION.RIGHT}
            label={loginPageTitle.AutoLogin}
            outerSize={19}
            filterSize={15}

            innerSize={15}
            outerColor="#8d8d8d"
            // innerColor="#0a3f92"
            styleLabel={{color: "white", fontFamily: "NotoSansKRMedium", opacity: 0.8, fontWeight: 100}}
          />
        </View>
        <TouchableHighlight
          style={styles.loginBtn}
          onPress={() => onLogin()}
          underlayColor='#fff'>
            <Text style={styles.loginBtnText}>{loginPageTitle.Login}</Text>
        </TouchableHighlight>
        <TouchableHighlight
          style={styles.registerBtn}
          onPress={() => onRegister()}
          underlayColor='#fff'>
            <Text style={styles.registerBtnText}>{loginPageTitle.Register}</Text>
        </TouchableHighlight>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    width: "100%",
    height: 350,
    top: 380,
    opacity: 0.3
  },
  container: {
    flex: 1,
    backgroundColor: '#0a3f92',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subContainer: {
    marginTop: 60,
    width: "60%",
    marginBottom: 220
  },
  
  checkboxContainer: {
    marginTop: 20,
    alignItems: 'flex-end'
  },
  inputEmail: {
    marginTop: 60,
    paddingTop: 10,
    paddingLeft: 15,
    paddingBottom: 10,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 6,
  },
  autoLogin: {
    marginLeft: 175
  },
  autoLoginText: {
    marginLeft: 10,
    color: "white"
  },
  loginBtn: {
    marginTop: 12,
    backgroundColor: 'white',
    opacity: 0.8,
    borderRadius: 10,
  },
  loginBtnText: {
    color: 'black',
    textAlign: 'center',
    fontSize: 18,
    fontFamily: "NotoSansKRRegular"
  },
  registerBtn: {
    marginTop: 15,
    backgroundColor: 'transparent',
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: "white",
    marginLeft: 70,
    marginRight: 70
  },
  registerBtnText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: "NotoSansKRRegular",
    fontWeight: 100
  }
});
