import React, { useState, useEffect, useContext } from 'react';
import { Text, View, StyleSheet, Dimensions, Modal, Image, TouchableHighlight, TouchableOpacity, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { AppContext } from '../../utils/AppContext';
import { AlertTitle, ScanQRCodePageTitle } from '../../utils/titleForUI';
import { Scan3rdVerificationAPI, ScanVerificationAPI } from '../../utils/APIConfig';
import BarcodeMask from 'react-native-barcode-mask';

import axios from 'axios';

export default function ScanQRCodePage({navigation}) {
  const { memberId, userEmail, setUserEmail, userStatus, setUserStatus } = useContext(AppContext)

  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [qrData, setQRData] = useState(null)
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [error, setError] = useState(null)

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setQRData(data)
    console.log("first")
    axios.post(`${ScanVerificationAPI}`, {
      header: {
        pId: "NV001",
        pVersion: "01"
      },
      memberId: memberId,
      requesterId: "",
      verificationCode: data
    }, {
      timeout: 5000
    }).then(response => {
      if(response.data.result.code === "00000") {
        setModalVisible(true)
      } else {
        setError(ScanQRCodePageTitle.Fail)
        setErrorModalVisible(true)
      }
    }).catch(error => {
      console.log("CantSentScannedNFT", error.request.status)
      if (error.code === 'ECONNABORTED') {
        setError(AlertTitle.ApiRequestFailed)
        setErrorModalVisible(true)
      } else {
        // if(error.response.data.result.message === "The given parameters are invalid : verificationCode") {
        //   setError(ScanQRCodePageTitle.QRCodeisInvalid)
        // } else {
        //   // setError(AlertTitle.CantSentScannedNFTInfo)
        //   setError(error.response.data.result.message)
        // }
        if(error.request.status === 403) {
          setError(AlertTitle.NoNFTPermission)
        } else if(error.request.status === 404) {
          setError(AlertTitle.NotFoundNFT)
        } else {
          setError(AlertTitle.UnknownErrorOccur)
        }
        setErrorModalVisible(true)
      }
    })
  };

  const onContinue = async () => {
    navigation.navigate('HomePage')
  }

  if (hasPermission === null) {
    return <Text>{ScanQRCodePageTitle.RequestCamera}</Text>;
  }
  if (hasPermission === false) {
    return <Text>{ScanQRCodePageTitle.NoAccess}</Text>;
  }

  const onBack = () => {
    navigation.navigate('HomePage')
  }

  const onErrorOk = async () => {
    setErrorModalVisible(false)
    navigation.navigate('HomePage')
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtnContainer} onPress={onBack}>
        <Image source={require('../../assets/backWihiteBtn.png')} style={styles.backbtn} />
      </TouchableOpacity>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      <BarcodeMask 
        width={260}
        height={260}
        edgeColor={'#deeaff'}
        showAnimatedLine={true}
        outerMaskOpacity={0.8}
        edgeWidth={0}
        edgeHeight={0}
      />
      <Image source={require('../../assets/scan_icon.png')} style={styles.scanIcon} /> 
      {/* <TouchableOpacity onPress={onCapture}>
        <Image source={require('../../assets/capture.png')} style={styles.capture} />                             
      </TouchableOpacity> */}
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
            <Text style={styles.walletBigText}>{ScanQRCodePageTitle.Success}</Text>
            <TouchableHighlight
              style={styles.changePinBtn}
              onPress={onContinue}
              underlayColor='#fff'>
                <Text style={styles.registerBtnText}>{ScanQRCodePageTitle.Ok}</Text>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
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
                  source={require('../../assets/notverified.png')}
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
    top: 20,
    left: 20,
    width : 28,
    height : 22,
    zIndex: 1000
  },  
  backbtn: {
    width : 18,
    height : 14,
  },
  scanIcon: {
    width: 280,
    height: 280,
    marginTop: 0,
    alignSelf: "center"
  },
  capture: {
    top: 250,
    width : 60,
    height : 60,
    left : "45%"
  },
  absoluteFillObject: {
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height
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
  walletBigText: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 22
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  walletIconStyle: {
    height: 35,
    width: 35,
    resizeMode: 'stretch',
  }
});
