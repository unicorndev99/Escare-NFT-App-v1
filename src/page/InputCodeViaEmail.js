import React, {useState, useContext, useRef, useLayoutEffect, useEffect} from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TouchableOpacity, TouchableHighlight, Modal, BackHandler  } from 'react-native';
import CodeInput from 'react-native-confirmation-code-input';
import { AppContext } from '../../utils/AppContext';
import Icon from 'react-native-vector-icons/AntDesign';
import axios from "axios";
import { AlertTitle, InputCodeViaEmailPageTitle } from '../../utils/titleForUI';
import { EmailVerificationAPI } from '../../utils/APIConfig';

const InputCodeViaEmail = ({navigation}) => {

  const { userEmail, userStatus, setUserStatus, routerHistory, setMemberId, setRouterHistory } = useContext(AppContext)
  const [emailCode, setEmailCode] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState(null);

  const ref = useRef();

  const onRegisteContinue = async () => {
    if(routerHistory === "FindPinCode") { // FindPinCode
      axios.post(`${EmailVerificationAPI}${userEmail}/authcode`, {
        authCode: emailCode,
        type: "CHANGEPIN"
      }, {
        timeout: 5000
      }).then(response => {
        setMemberId(response.data.memberId)
        setRouterHistory("EmailPassForFindPinCode")
        navigation.navigate('InputPinCode')
      }).catch(error => {
        if (error.code === 'ECONNABORTED') {
          setError(AlertTitle.ApiRequestFailed)
          setModalVisible(true)
        } else {
          console.log("error register", error.response.data.errors[0].reason)
          let errorText = error.response.data.errors[0].reason
          if(errorText === "Verification Code is Invalid") {
            connsole.log("true")
            setError(errorText)
          }
          else if(errorText === "Already Signed up") {
            setError(InputCodeViaEmailPageTitle.AlreadySignedUp)
            setModalVisible(true)
          }
        }
      })
    } else { // register
      axios.post(`${EmailVerificationAPI}${userEmail}/authcode`, {
        authCode: emailCode,
        type: "SIGNUP"
      }, {
        timeout: 5000
      }).then(response => {
        setMemberId(response.data.memberId)
        setRouterHistory("EmailPassForRegister")
        navigation.navigate('InputPinCode')
      }).catch(error => {
        if (error.code === 'ECONNABORTED') {
          setError(AlertTitle.ApiRequestFailed)
          setModalVisible(true)
        } else {
          let errorText = error.response.data.errors[0].reason
          console.log("error register", errorText)
          if(errorText === "Verification Code is Invalid") 
          {
            setError(errorText)
          }
          else if(errorText === "Already Signed up") {
            setError(InputCodeViaEmailPageTitle.AlreadySignedUp)
            setModalVisible(true)
          } else {
            setError(errorText);
            setModalVisible(true)
          }
        }
      })
    }
  }

  const onCheckCode = async (code) => {
    console.log("first")
    setEmailCode(code)
  }

  const onBack = () => {
    console.log("userStatus", userStatus)
    if(routerHistory === "FindPinCode") {
      setUserStatus("ForgetPinRegisterAgain")
      navigation.navigate('FindPinCode')
    }

    if(userStatus === "ResetPin") {
      navigation.navigate('MyInfoPage')
    } else if(userStatus === "NewLogin") {
      navigation.navigate('NewLogin')
    } else if(userStatus === "Register") {
      navigation.navigate('Registe')
    } else {
      navigation.navigate('NewLogin')
    }
  }

  const onErrorOk = async () => {
    navigation.navigate('Registe')
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtnContainer} onPress={onBack}>
        <Image source={require('../../assets/backWihiteBtn.png')} style={styles.backbtn} />
      </TouchableOpacity>
      <View style={styles.subContainer}>
        <Text style={styles.RegisterText}>{InputCodeViaEmailPageTitle.InputCode}</Text>
        <CodeInput
          ref={ref}
          codeLength={6}
          secureTextEntry
          // compareWithCode='AsDW2d'
          activeColor='white'
          inactiveColor='white'
          autoFocus={false}
          ignoreCase={true}
          inputPosition='center'
          size={50}
          onFulfill={(code) => onCheckCode(code)}
          containerStyle={{ marginTop: 10 }}
          codeInputStyle={{ borderWidth: 1, borderColor: "white", borderRadius: 5, opacity: 0.8 }}
        />
        <View style={styles.errorContainer}>
            {
              error === "Verification Code is Invalid" && <>
                <Icon name="exclamationcircle" size={20} color="#fb9508" style={styles.exclamationcircle}/>
                <Text style={styles.whiteBack}>&nbsp;&nbsp;&nbsp;&nbsp;</Text>
                <Text style={styles.wrongText}>{InputCodeViaEmailPageTitle.WrongCode}</Text>
              </>
            }  
        </View>
        <TouchableHighlight
          style={styles.loginBtn}
          onPress={() => onRegisteContinue()}
          underlayColor='#fff'>
            <Text style={styles.loginBtnText}>{InputCodeViaEmailPageTitle.Continue}</Text>
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
  whiteBack: {
    backgroundColor: "white",
    borderRadius: 50,
    marginBottom: 10,
    width: 15,
    marginTop: 1,
    marginLeft: -18,

  },
  exclamationcircle: {
    zIndex: 10000
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
  errorContainer: {
    flexDirection: 'row',
    marginTop: -20,
    height: 30,
  },
  wrongText: {
    fontSize: 15,
    color: "#fb9508",
    marginLeft: 10
  },  
  container: {
    flex: 1,
    backgroundColor: '#0a3f92',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subContainer: {
    width: "70%",
    position: "absolute",
    top: 0,
    marginTop: "30%"
  },
  RegisterText: {
    fontSize: 20,
    textAlign: "center",
    color: "white",
    fontFamily: "NotoSansKRRegular"
  },  
  inputEmail: {
    marginTop: 30,
    paddingTop: 10,
    paddingLeft: 15,
    paddingBottom: 10,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 6,
  },
  loginBtn: {
    marginTop: 5,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    opacity: 0.8
  },
  loginBtnText: {
    color: 'black',
    textAlign: 'center',
    fontSize: 20
  }
});

export default InputCodeViaEmail
