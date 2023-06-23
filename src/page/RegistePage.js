import React, {useContext, useEffect, useLayoutEffect, useState} from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Modal, TextInput, TouchableHighlight, TouchableOpacity, Image, BackHandler } from 'react-native';
import { AppContext } from '../../utils/AppContext';
import axios from "axios";
import { AlertTitle, registePageTitle } from '../../utils/titleForUI';
import { EmailVerificationAPI } from '../../utils/APIConfig';

const RegistePage = ({navigation}) => {

  const [ email, setEmail ] = useState("");
  const [ modalVisible, setModalVisible ] = useState(false);
  const [ error, setError ] = useState(null)
  const { setUserEmail, userStatus, setUserStatus, setRouterHistory } = useContext(AppContext)
  
  const onChangeEmail = (input) => {
    setEmail(input.trim())
  }

  const onBack = () => {
    navigation.navigate('NewLogin')
  }

  const onErrorOk = async () => {
    setModalVisible(!modalVisible)
  }

  const onRegisteContinue = async () => {
    if(email) {
      axios.get(`${EmailVerificationAPI}${email}/authcode`, {
        timeout: 5000
      }).then(response => {
        setUserEmail(email)
        if(userStatus === "ForgetPinRegisterAgain") setRouterHistory('FindPinCode')
        setUserStatus("Register")
        navigation.navigate('InputCodeViaEmail')
      }).catch(error => {
        if (error.code === 'ECONNABORTED') {
          setError(AlertTitle.ApiRequestFailed)
          setModalVisible(true)
        } else {
          console.log("RegistePage Error", error)
          setError(AlertTitle.MailRegisterFailed)
          setModalVisible(true)
        }
      })
    } else return;
    
  }

  return (
    <View style={styles.container}>
      {
        userStatus === "ForgetPinRegisterAgain" && <TouchableOpacity style={styles.backBtnContainer} onPress={onBack}>
          <Image source={require('../../assets/backWihiteBtn.png')} style={styles.backbtn} />
        </TouchableOpacity>
      }
      <View style={styles.subContainer}>
        <Text style={styles.RegisterText}>
          {
            userStatus === "ForgetPinRegisterAgain" ? `${registePageTitle.FindPinCode}` : `${registePageTitle.Register}`
          }
        </Text>
        <TextInput
          style={styles.inputEmail}
          onChangeText={onChangeEmail}
          value={email}
          placeholder={registePageTitle.Email}
          placeholderTextColor="white"
        />
        <TouchableHighlight
          style={styles.loginBtn}
          onPress={() => onRegisteContinue()}
          underlayColor='#fff'>
            <Text style={styles.loginBtnText}>{registePageTitle.Continue}</Text>
        </TouchableHighlight>
      </View>
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
  container: {
    flex: 1,
    backgroundColor: '#0a3f92',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subContainer: {
    width: "65%",
    position: "absolute",
    top: 0,
    marginTop: "40%"
  },
  RegisterText: {
    fontSize: 30,
    textAlign: "center",
    color: "white"
  },  
  inputEmail: {
    marginTop: 30,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 15,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 6,
    fontSize: 17,
    color: "white",
    opacity: 0.8
  },
  loginBtn: {
    marginTop: "12%", 
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    opacity: 0.9
  },
  loginBtnText: {
    marginVertical : -5,
    color: 'black',
    textAlign: 'center',
    fontSize: 19,
    fontFamily: "NotoSansKRRegular"
  }
});

export default RegistePage
