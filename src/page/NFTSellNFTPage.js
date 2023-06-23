import React, {useContext, useEffect, useState} from 'react';
// import QRCode from 'react-native-qrcode-svg';
import { StyleSheet, Text, View, Image, Modal, TouchableOpacity, TouchableHighlight, ImageBackground, BackHandler, Alert, Pressable } from 'react-native';
import { AlertTitle, NFTNotificationPageTitle } from '../../utils/titleForUI';
import axios from 'axios';
import { GetNFTInfoFromBackendAPI, acceptNFTRequest, rejectNFTRequest } from '../../utils/APIConfig';
import { AppContext } from '../../utils/AppContext';
import { Video, ResizeMode } from 'expo-av';

const NFTSellNFTPage = ({route, navigation}) => {
  const [detailInfo, setDetailInfo] = useState(null)
  const { detailList } = route.params;
  const { memberId, fcmToken } = useContext(AppContext)
  const [confirmStep, setConfirmStep] = useState(false)
  const video = React.useRef(null);
  const [status, setStatus] = useState({});
  const [ modalVisible, setModalVisible ] = useState(false);
  const [ error, setError ] = useState(null)

  let year = detailList.transTime.slice(0, 4)
  let month = detailList.transTime.slice(4, 6)
  let day = detailList.transTime.slice(6, 8)
  let hour = detailList.transTime.slice(9, 11)
  let min = detailList.transTime.slice(11, 13)
  let second = detailList.transTime.slice(13, 15)
  let date = `${year}-${month}-${day} ${hour}:${min}:${second}`

  const onAccept = () => {
    axios.post(acceptNFTRequest, {
      hPIN: "HvUBz2F7Sgf10YSsS56Ho++WddziXBy2BfO//l2OFeU=",
      header: {
        pId: "NV001",
        pVersion: "01"
      },    
      memberId: memberId,
      requestId: detailList.data.requestId
    }, {
      timeout: 5000
    }).then(response => {
      setConfirmStep(true)
    }).catch(error => {
      if (error.code === 'ECONNABORTED') {
        setError(AlertTitle.ApiRequestFailed)
        setModalVisible(true)
      } else {
        console.log("CantSendAcceptNFTRequest", error)
        setError(AlertTitle.CantSendAcceptNFTRequest)
        setModalVisible(true)
      }
    })
  }

  const onReject = () => {
    axios.post(rejectNFTRequest, {
      hPIN: "HvUBz2F7Sgf10YSsS56Ho++WddziXBy2BfO//l2OFeU=",
      header: {
        pId: "NV001",
        pVersion: "01"
      },    
      memberId: memberId,
      requestId: detailList.data.requestId
    }, {
      timeout: 5000
    }).then(response => {
      navigation.navigate('HomePage')
    }).catch(error => {
      if (error.code === 'ECONNABORTED') {
        setError(AlertTitle.ApiRequestFailed)
        setModalVisible(true)
      } else {
        console.log("CantSendRejectNFTRequest", error)
        setError(AlertTitle.CantSendRejectNFTRequest)
        setModalVisible(true)
      }
    })
  }

  const onErrorOk = async () => {
    setModalVisible(!modalVisible)
  }

  const onBack = () => {
    navigation.navigate('HomePage')
  }

  useEffect(() => {
    getDetailInfoFromBackend();
    
    async function getDetailInfoFromBackend() {
      axios.post(GetNFTInfoFromBackendAPI, {
          nftID: detailList.data.tokenId,
          chainId: detailList.data.chainId
      }, {
        timeout: 5000
      }).then(response => {
        setDetailInfo(response.data[0])
      }).catch(error => {
        if (error.code === 'ECONNABORTED') {
          setError(AlertTitle.ApiRequestFailed)
          setModalVisible(true)
        } else {
          console.log("CantGetDetailPush", error)
          setError(AlertTitle.CantGetDetailPush)
          setModalVisible(true)
        }
      })
    }
  }, [])

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtnContainer} onPress={onBack}>
        <Image source={require('../../assets/backbtn1.png')} style={styles.backbtn} />
      </TouchableOpacity>
      <Image source={require('../../assets/logo1.png')} style={styles.logo} />
      <ImageBackground source={require('../../assets/top_background_effect.png')} resizeMode="stretch" style={styles.backgroundImage}>
      </ImageBackground>
      <View style={styles.subContainer}>
        <View style={styles.QRContainer}>
          { detailInfo && detailInfo.mediaType === "Image" && <Image source={{uri : `https://ipfs.io/ipfs/${detailInfo.mediaIpfs}` }} style={styles.metamaskLogo} /> }
          {
            detailInfo && detailInfo.mediaType === "Video" && <Video
              ref={video}
              style={styles.video}
              source={{uri : `https://ipfs.io/ipfs/${detailInfo.mediaIpfs}` }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping
              onPlaybackStatusUpdate={status => setStatus(() => status)}
            />
          }
        </View>
        
        <View style={styles.topContainer}>
          <Text style={styles.IDNumber}>{ confirmStep ? `${NFTNotificationPageTitle.NFTInfo}` : `${NFTNotificationPageTitle.NFTNotification}`}</Text>
          <View style={styles.rowLine}>
            <Text style={styles.loginEmail}>{NFTNotificationPageTitle.Time }</Text>
            <Text style={styles.lineText}>{date}</Text>
          </View>
          <View style={styles.rowLine}>
            <Text style={styles.loginEmail}>{NFTNotificationPageTitle.Type}</Text>
            <Text style={styles.lineText}>
              { 
                confirmStep ? detailInfo.mediaType : detailList.title
              }
            </Text>
          </View>
          <View style={styles.rowLine}>
            <Text style={styles.loginEmail}>{NFTNotificationPageTitle.NFTID}</Text>
            <Text style={styles.lineText}>{detailList.data.tokenId}</Text>
          </View>
          <View style={styles.rowLine}>
            <Text style={styles.loginEmail}>{NFTNotificationPageTitle.NFTName}</Text>
            <Text style={styles.lineText}>{detailInfo && detailInfo.name}</Text>
          </View>
          <View style={styles.rowLine}>
            <Text style={styles.loginEmail}>{confirmStep ? NFTNotificationPageTitle.SalePrice : NFTNotificationPageTitle.SellPrice}</Text>
            <Text style={styles.lineText}>{detailInfo && detailInfo.salePrice}</Text>
          </View>
          <View style={styles.colLine}>
            <Text style={styles.loginEmail}>{NFTNotificationPageTitle.Detail}</Text>
            <Text style={styles.detailText}>{detailList.body}</Text>
          </View>
        </View>
        
        <View style={styles.rowBtnline}>
          {
            confirmStep ? <TouchableHighlight
                            style={styles.confirmBtn}
                            onPress={onAccept}
                            underlayColor='#fff'>
                              <Text style={styles.registerBtnText}>{NFTNotificationPageTitle.Confirm}</Text>
                          </TouchableHighlight>
              : <>
                <TouchableHighlight
                  style={styles.acceptPinBtn}
                  onPress={onAccept}
                  underlayColor='#fff'>
                    <Text style={styles.registerBtnText}>{NFTNotificationPageTitle.Accept}</Text>
                </TouchableHighlight>

                <TouchableHighlight
                  style={styles.rejectPinBtn}
                  onPress={onReject}
                  underlayColor='#fff'>
                    <Text style={styles.registerBtnText}>{NFTNotificationPageTitle.Reject}</Text>
                </TouchableHighlight>
              </>
          }
        </View>
        
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
                <Text style={styles.registerBottomBtnText}>{AlertTitle.OkButton}</Text>
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
  registerBottomBtnText: {
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
  video: {
    width: 200,
    height: 200
  },  
  backBtnContainer:{
    position: 'absolute',
    top: 20,
    left: 20,
    width : 28,
    height : 22,
  },  
  backbtn: {
    width : 18,
    height : 14,
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
    top: "2%",
    width : 40,
    height : 45,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subContainer: {
    marginTop: "18%",
    width: "85%",
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topContainer: {
    backgroundColor: "#0a3f92",
    width: "100%",
    borderRadius: 20,
    marginTop: -100,
    paddingBottom: 30,
    zIndex: -1,
  },
  QRContainer: {
    padding: 12,
    width: 225,
    height: 200,
    backgroundColor: "white",
    borderRadius: 12
  },
  metamaskLogo: {
    Width: 200,
    Height: 200
  },
  memberID: {
    color: "white",
    fontSize: 18,
    marginTop: 105,
    textAlign: "center",
    opacity: 0.6
  },
  IDNumber: {
    color: "white",
    fontSize: 25,
    marginTop: 110,
    textAlign: "center",
  },
  rowLine: {
    flexDirection: "row",
    marginTop: 5,
    marginHorizontal: "8%"
  },
  colLine: {
    marginTop: 10,
    marginHorizontal: "8%"
  },
  rowBtnline: {
    flexDirection: "row"
  },
  lineText: {
    fontSize: 17,
    color: "white",
    textAlign: "right",
    width: "68%"
  },
  lineTextDate: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    marginLeft: 18,
    fontSize: 17,
    color: "white",
    opacity: 0.6

  },
  loginEmail: {
    fontSize: 17,
    width: '32%',
    color: "white",
    opacity: 0.6
  },
  detailText: {
    fontSize: 18,
    width: "100%",
    color: "white",
  },
  emailText: {
    color: "white",
    fontSize: 22,
    marginLeft: 30,
    marginBottom: 10
  },
  dateText: {
    color: "white",
    fontSize: 22,
    marginLeft: 30,
    marginBottom: 40
  },
  confirmBtn: {
    marginTop: "8%",
    backgroundColor: "grey",
    width: "96%",
    padding: 15,
    borderRadius: 15
  },
  acceptPinBtn: {
    marginTop: "8%",
    backgroundColor: "#ff9406",
    width: "48%",
    padding: 15,
    borderRadius: 15
  },
  rejectPinBtn: {
    marginTop: "8%",
    marginLeft: 15,
    backgroundColor: "#7d7d7d",
    width: "48%",
    padding: 15,
    borderRadius: 15
  },
  registerBtnText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 20,
    opacity: 0.7
  }
});

export default NFTSellNFTPage
