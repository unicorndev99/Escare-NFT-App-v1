import React, {useState, useContext, useEffect, useRef, useLayoutEffect} from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableHighlight, TouchableOpacity, ImageBackground, Modal, Dimensions, ActivityIndicator, BackHandler, Linking } from 'react-native';
import { AppContext } from '../../utils/AppContext';
import { AlertTitle, homePageTitle } from '../../utils/titleForUI';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { CheckPushDetailAPI, CheckPushListAPI, SendPushAPI, WalletManageAPI } from '../../utils/APIConfig';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Test3',
    body: 'And here is the body!',
    data: { someData: 'goes here' },
  };

  let res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
  // console.log("ress", res)
}

const { width, height } = Dimensions.get('window');

const HomePage = ({navigation}) => {

  const { walletType, setWalletType, walletAddress, setWalletAddress, evmConnector, memberId, fcmToken, setFcmToken, msgInqToken, setMsgInqToken } = useContext(AppContext)
  const [notificationData, setNotificationData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [notification, setNotification] = useState(false);
  const [kaikasRequestKey, setKaikasRequestKey] = useState(null);
  const [ errorModalVisible, setErrorModalVisible ] = useState(false);
  const [ error, setError ] = useState(null)
  const [ loading, setLoading ] = useState(true)

  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log("first", notification)
        setNotification(notification);
        saveMsgInqToken(notification.data.msgInqToken)
        setMsgInqToken(notification.data.msgInqToken)
        getPushList(notification.data.msgInqToken);
        // let list = Notifications.getPresentedNotificationsAsync();
        // console.log("list", list)
      });
  
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log("response", response);
        onClickNotification(response.notification.request.content.data)
      });

      async function saveMsgInqToken(token) {
        await AsyncStorage.setItem("msgInqToken", token)
      }

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // useEffect(() => {
  //   getPushList(msgInqToken);
  // }, [memberId, fcmToken])

  const getPushList = async (msgToken) => {
    console.log("getPushList", memberId, fcmToken)
    axios.post(CheckPushListAPI, {
        index: 0,
        memberId: memberId,
        msgInqToken: msgToken,
        searchCount: 10
    }, {
      timeout: 5000
    }).then(response => {
      console.log("verify", response.data)
      const messageList = response.data.messages;
      if(messageList) {
        let pushList = messageList.map((list) => {
          console.log("list", list)
          return list
        })
        setNotificationData(pushList)
      }
      setLoading(false)
    }).catch(error => {
      if (error.code === 'ECONNABORTED') {
        setError(AlertTitle.ApiRequestFailed)
        setErrorModalVisible(true)
      } else {
        console.log("getPushlist error", error.response.data)
        setError(AlertTitle.CantGetPushList)
        setErrorModalVisible(true)
      }
    })
  }

  const onVerifyNFT = async () => {
    // await sendPushNotification(fcmToken)
    // await testPushNotifcation(fcmToken)
    navigation.navigate('ScanQRCodePage')
  }

  const testPushNotifcation = async () => {
    
    axios.post(SendPushAPI, {
      dataMessage: "{\"test\" : \"test data!!!\"}",
      memberId: memberId,
      pushMessage: "Test message",
      pushTitle: "Test Title",
      pushType: "10",
      serviceId: "01234567890"
    }, {
      timeout: 5000
    }).then(response => {
      console.log("sent push", JSON.stringify(response.data.result))
      setError(JSON.stringify(response.data.result))
          setErrorModalVisible(true)
    })
  }

  const onClickNotification = (list) => {
    console.log("list", list)
    axios.post(CheckPushDetailAPI, {
      memberId: memberId,
      // msgInqToken: fcmToken,
      msgInqToken: msgInqToken,
      msg_id: list.msg_id
    }, {
      timeout: 5000
    }).then(response => {
      console.log("first list2", response)
      const detailList = response.data.message;
      if(detailList.data) {
        navigation.navigate('NFTSellNFTPage', { detailList })
      } else {
        navigation.navigate('NFTNotificationPage', { detailList })
      }
    }).catch(error => {
      if (error.code === 'ECONNABORTED') {
        setError(AlertTitle.ApiRequestFailed)
        setErrorModalVisible(true)
      } else {
        console.log("CantGetDetailPush", error)
        setError(AlertTitle.CantGetDetailPush)
        setErrorModalVisible(true)
      }
    })
  }

  const onVerifyOwner = () => {
    navigation.navigate('ScanQRCodePageForOwner')

  }

  const onWalletInfo = () => {
    navigation.navigate('MetamaskInfoPage')

  }

  const onMyInfo = () => {
    navigation.navigate('MyInfoPage')
  }

  const onErrorOk = async () => {
    setErrorModalVisible(false)
  }

  const onCloseBtn = () => {
    setModalVisible(!modalVisible)
  }

  const registerWallet = async (chainType, address) => {
    axios.get(`${WalletManageAPI}${memberId}/wallet`, {
      timeout: 5000
    }).then(response => {
      console.log("get wallet", response.data)
      let registeredWalletList = response.data.walletList.filter((wallet) => wallet.address === address)
      if(registeredWalletList.length === 0) {
        axios.post(`${WalletManageAPI}${memberId}/wallet`, {
          address : address,
          type : chainType // Klaytn
        }, {
          timeout: 5000
        }).then(response => {
          setWalletType(chainType === "ETH" ? "metamask" : "kaikas")
          setWalletAddress(address)
          setModalVisible(false)
        }).catch(error => {
          setWalletType(chainType === "ETH" ? "metamask" : "kaikas")
          setWalletAddress(address)
          setModalVisible(false)
          console.log("register wallet error", error.response.data.errors[0].reason)
          // setError(error.response.data.errors[0].reason) //AlertTitle.WalletRegisterFailed
          // if (error.code === 'ECONNABORTED') {
          //   setError(AlertTitle.ApiRequestFailed)
          //   setErrorModalVisible(true)
          // } else {
          //   if(error.request.status === 400) {
          //     setError(AlertTitle.InvalidWallet)
          //   } else if(error.request.status === 403) {
          //     setError(AlertTitle.NotSignedORAlreadyWallet)
          //   } else if(error.request.status === 500) {
          //     setError(AlertTitle.DatabaseError)
          //   } else {
          //     setError(AlertTitle.UnknownErrorOccur)
          //   }
          //   setErrorModalVisible(true)
          // }
          // setErrorModalVisible(true)
        })
      } else {
        setWalletType(chainType === "ETH" ? "metamask" : "kaikas")
        setWalletAddress(address)
        setModalVisible(false)
      }
    }).catch(error => {
      console.log("get wallet info error", error.response.data.errors[0].reason)
      setError(error.response.data.errors[0].reason)
      setErrorModalVisible(true)
    }) 

  }

  const walletLogin = async (walletType) => {
    if (walletType === "metamask") {
      const wallet = await evmConnector.connect()
      console.log("wallet", wallet)

      // axios.get(`http://218.50.149.74:8545/apis/escare/n2e/kyc/v1/member/${memberId}/wallet`).then(response => {
      //   console.log("wallet register", response.data)
      //   // setUserEmail(email)
      //   // setUserStatus("Register")
      //   // navigation.navigate('InputCodeViaEmail')
      // }).catch(error => console.log("register api error", error))

      setWalletAddress(wallet.accounts[0])
      setWalletType("metamask")
      setModalVisible(false)
    } else if (walletType === "kaikas") {
      let response = await axios.post("https://api.kaikas.io/api/v1/k/prepare", {
        type : "auth",
        bapp: {
          name: "Escare NFT",
          callback: {
            fail: "https://apkcombo.com/kaikas-mobile-crypto-wallet/io.klutch.wallet/"
          }
        },
      })
      console.log("request", response.data)
      let request_key = response.data.request_key
      setKaikasRequestKey(response.data.request_key)
      const kaikasUrl = `kaikas://wallet/api?request_key=${request_key}`;
      
      try {
        await Linking.openURL(kaikasUrl);
        let restwoWallet = await axios.get(`https://api.kaikas.io/api/v1/k/result/${request_key}`)
        let walletAddress = restwoWallet.data.result.klaytn_address

        await registerWallet("KLAY", walletAddress)
      } catch (error) {
        console.log("error message111", error.message)
        if(error.message.indexOf("Could not open URL") !== -1) {
          console.log(`Cannot open URL: ${kaikasUrl}`);
          await Linking.openURL("https://apkcombo.com/kaikas-mobile-crypto-wallet/io.klutch.wallet/");
        }
        setModalVisible(false)
      }
    }
  }

  const convertTime = (wildTime) => {
    let year = wildTime.slice(0, 4)
    let month = wildTime.slice(4, 6)
    let day = wildTime.slice(6, 8)
    let hour = wildTime.slice(9, 11)
    let min = wildTime.slice(11, 13)
    let second = wildTime.slice(13, 15)
    let date = `${year}-${month}-${day} ${hour}:${min}:${second}`
    return date;
  }

  return (
    <View style={styles.container}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
          <TouchableOpacity style={styles.clsBtnContainer} onPress={onCloseBtn}>
            <Image source={require('../../assets/x.png')} style={styles.closebtn} />
          </TouchableOpacity>
            <Image
                  source={require('../../assets/connectwallet_logo.png')}
                  style={styles.walletIconStyle}
            />
            <Text style={styles.walletBigText}>{homePageTitle.ConnectWallet}</Text>
            <Text style={styles.walletSmallText}>{homePageTitle.PleaseSelectMethodToConnect}</Text>
            <TouchableOpacity
              style={[styles.kkWalletConnectBtn, styles.kkWalletConnectBtnClose]}
              onPress={() => walletLogin("kaikas")}>
              <View style={styles.walletContainer}>
                  <Image
                      source={require('../../assets/kaikas.png')}
                      style={styles.kaikasLogoStyle}
                  />
                <Text style={styles.textStyle}>{homePageTitle.Kaikas}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mmWalletConnectBtn, styles.mmWalletConnectBtnClose]}
              onPress={() => walletLogin("metamask")}>
              <View style={styles.walletContainer}>
                <View style={styles.whiteCircle}>
                  <Image
                      source={require('../../assets/metamask.png')}
                      style={styles.metamaskLogoStyle}
                  />
                </View>
                <Text style={styles.metamasktextStyle}>{homePageTitle.Metamask}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Image source={require('../../assets/logo1.png')} style={styles.logo} />
      <ImageBackground source={require('../../assets/top_background_effect.png')} resizeMode="stretch" style={styles.backgroundImage}>
      </ImageBackground>
      <View style={styles.subContainer}>
        <Text style={styles.registerText}>{homePageTitle.MainTopTitle}</Text>

        <View style={styles.topContainer}>
          <View style={styles.topButtonContainer}>
            <TouchableOpacity
            style={styles.buttonTouchStyle}
            activeOpacity={0.2} onPress={onVerifyNFT} >
              <Image
                source={require('../../assets/nftverify.png')}
                style={styles.buttonImageIconStyle}
              />
              <View style={styles.buttonIconSeparatorStyle} />
              <Text style={styles.buttonTextStyle}>{homePageTitle.VerifyNFT}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.topButtonContainer}>
            <TouchableOpacity
            style={styles.buttonTouchStyle}
            activeOpacity={0.2} onPress={onVerifyOwner}>
              <Image
                source={require('../../assets/userverify.png')}
                style={styles.buttonImageIconStyle}
              />
              <View style={styles.buttonIconSeparatorStyle} />
              <Text style={styles.buttonTextStyle}>{homePageTitle.VerifyOwner}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.topButtonContainer}>
            <TouchableOpacity
            style={styles.buttonTouchStyle}
            activeOpacity={0.2} onPress={onMyInfo}>
              <Image
                source={require('../../assets/myinfo.png')}
                style={styles.buttonImageIconStyle}
              />
              <View style={styles.buttonIconSeparatorStyle} />
              <Text style={styles.buttonTextStyle}>{homePageTitle.MyInfo}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.middleContainer}>
          <View style={styles.walletAppContainer}>
            <TouchableOpacity
                style={styles.buttonWalletConnectTouchStyle}
                activeOpacity={0.2} onPress={() => !walletAddress ? setModalVisible(true) : onWalletInfo()}>
                  {
                    walletAddress ? <>
                      {
                        walletType === "metamask" ? <>
                          <Image
                              source={require(`../../assets/metamask.png`)}
                              style={styles.buttonMetamaskIconStyle}
                            />
                            <Text style={styles.connectWalletAddressTextStyle}>{ walletAddress }</Text>
                        </>  
                        : <>
                          <Image
                              source={require(`../../assets/kaikas.png`)}
                              style={styles.buttonKaikasIconStyle}
                            />
                            <Text style={styles.connectWalletAddressTextStyle}>{ walletAddress }</Text>
                        </> 
                      }
                      </>
                      : 
                      <Text style={styles.connectWalletApiTextStyle}>{homePageTitle.ConnectWalletByApp}</Text>
                  }
            </TouchableOpacity>
          </View>

          {
            walletAddress && <View style={styles.walletSecondAppContainer}>
              <TouchableOpacity
                  style={styles.buttonWalletConnectTouchStyle}
                  activeOpacity={0.2} onPress={() => setModalVisible(true)}>
                    <Text style={styles.connectWalletScanningTextStyle}>{homePageTitle.ConnectWalletByScanning}</Text>
              </TouchableOpacity>
            </View>
          }
        </View>
        
        
        <Text style={styles.helloText}>{homePageTitle.PushNotification}</Text>
        <View style={styles.BottomContainer}>
          {
            loading ? <ActivityIndicator size="large" color="#ffffff" />
              : <ScrollView>
              {
                notificationData && notificationData.map((list, index) => (
                  <View style={styles.notfButtonContainer} key={index}>
                    <TouchableOpacity
                    style={styles.notfbuttonTouchStyle}
                    activeOpacity={0.2} onPress={() => onClickNotification(list)}>
                      <View style={styles.notfTitleContainerStyle}>
                        <View style={styles.alamAndDateStyle}>
                          {
                            list.notfType === "sellrequest" ? <Image
                                source={require("../../assets/alert.png")}
                                style={styles.buttonAlertIconStyle}
                              />
                              : <Image
                              source={require("../../assets/mail.png")}
                              style={styles.buttonMailIconStyle}
                            />
                          }
                          {/* <View style={styles.buttonIconSeparatorStyle} /> */}
                          <Text style={styles.notfDateTextStyle}>{convertTime(list.transTime)}</Text>
                        </View>
                          <Text style={styles.notfMesaageTextStyle}>{list.title}</Text>
                      </View>
                      <Image
                          source={require('../../assets/push_more.png')}
                          style={styles.NotfPushIconStyle}
                        />
                    </TouchableOpacity>
                  </View>
                ))
              }
              </ScrollView>
          }
          
          
        </View>
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={errorModalVisible}
        onRequestClose={() => {
          setErrorModalVisible(!errorModalVisible);
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
  clsBtnContainer: {
    alignSelf: "flex-end"
  },
  closebtn: {
    width: 15,
    height: 12
  },
  buttonMetamaskIconStyle:{
    width: 28,
  },
  buttonKaikasIconStyle:{
    width: 28,
    height: 28
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
  mmWalletConnectBtn: {
    marginTop: 8,
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: "98%"
  },
  mmWalletConnectBtnClose: {
    backgroundColor: '#e37624',
  },
  kkWalletConnectBtn: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: "98%"
  },
  kkWalletConnectBtnClose: {
    backgroundColor: '#3266ff',
    // opacity : 0.6
  },
  textStyle: {
    color: 'white',
    marginLeft: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16
  },
  metamasktextStyle: {
    color: 'white',
    marginLeft: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16
  },
  walletContainer: {
    flexDirection: 'row',
    paddingLeft: 50
  },
  kaikasLogoStyle: {
    width: 20,
    height: 20
  },
  whiteCircle: {
    padding: 4,
    backgroundColor: "white",
    borderRadius: 100,
    margin: -3
  },
  metamaskLogoStyle: {
    width: 20,
    height: 20
  },
  walletSmallText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.6
  },
  walletBigText: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 22
  },

  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subContainer: {
    width: "85%",
    // flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  registerText: {
    // alignItems: "flex-end",
    margin : 8,
    marginTop: "14%",
    fontSize: 20
  },
  helloText: {
    // alignItems: "flex-end",
    margin : 6,
    marginTop: 10,
    fontSize: 20
  },
  topContainer: {
    flexDirection: 'row',
    alignItems: "center",
    verticalAlign: "middle",
    backgroundColor: "#0a3f92",
    height: "24%",
    width: "100%",
    borderRadius: 10,
    paddingHorizontal: "7%",
    paddingVertical: "3%"
  },
  BottomContainer: {
    backgroundColor: "#0a3f92",
    minHeight: 240,
    maxHeight: 240,
    width: "100%",
    borderRadius: 10,
    padding: 20,
    paddingTop: 10,
    paddingBottom: 10,
    // paddingTop: 15,
    // paddingLeft: 12,
    marginTop: 0,
    justifyContent: 'center',
  },
  middleContainer: {
    height: "20%",
    verticalAlign: "middle",
    justifyContent: 'center'
  },  
  walletAppContainer: {
    backgroundColor: "#0a3f92",
    height: '37%',
    width: "100%",
    borderRadius: 10,
    paddingHorizontal: "2%",
    paddingTop: "3.5%",
    marginTop: "5%",
  },
  walletSecondAppContainer: {
    backgroundColor: "#0a3f92",
    height: '37%',
    width: "100%",
    borderRadius: 10,
    paddingHorizontal: "2%",
    paddingTop: "3.5%",
    marginTop: "3%",
  },
  connectWalletApiTextStyle: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    width: "100%"
  },
  connectWalletScanningTextStyle: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    width: "100%"
  },
  connectWalletAddressTextStyle: {
    color: "white",
    fontSize: width / 33,
    // width: "90%",
    // textAlign: "center",
    marginLeft: 10
  },
  topButtonContainer: {
    flex: 1,
    width: "30%",
    height: "88%"
  },
  notfButtonContainer: {
    width: "100%",
  },
  buttonTouchStyle: {
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonWalletConnectTouchStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
    margin: 0,
  },
  alamAndDateStyle: {
    flexDirection: 'row',
  },
  notfTitleContainerStyle: {
    width: "80%"
  },
  notfbuttonTouchStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22529d',
    height: 60,
    borderRadius: 10,
    paddingLeft: 30,
    marginTop: 8,
    marginBottom: 8
  },
  buttonAlertIconStyle: {
    // padding: 10,
    // margin: 5,
    marginTop: 2,
    marginRight: 16,
    height: 16,
    width: 16,
    resizeMode: 'stretch',
  },
  buttonMailIconStyle: {
    // padding: 10,
    // margin: 5,
    marginTop: 3,
    marginRight: 16,
    height: 14,
    width: 20,
    resizeMode: 'stretch',
  },
  NotfPushIconStyle: {
    // padding: 10,
    // margin: 5,
    // marginTop: 2,
    marginRight: 20,
    height: 24,
    width: 28,
    resizeMode: 'stretch',
  },
  buttonImageIconStyle: {
    // padding: 10,
    margin: 5,
    height: "75%",
    width: "90%",
    resizeMode: 'stretch',
  },
  walletIconStyle: {
    // padding: 10,
    // margin: 5,
    height: 35,
    width: 35,
    resizeMode: 'stretch',
  },
  buttonTextStyle: {
    color: "white",
  },
  notfDateTextStyle: {
    color: "white",
    opacity: 0.5
  },
  notfMesaageTextStyle: {
    color: "white",
    marginTop: 7
  },

  backgroundImage: {
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    width: "100%",
    height: 220,
    top: 80
  },
  logo: {
    position: 'absolute',
    top: "1%",
    width : 40,
    height : 45,
  }
});

export default HomePage
