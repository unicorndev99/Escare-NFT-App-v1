import React, {useContext, useEffect, useLayoutEffect, useState} from 'react';
import QRCode from 'react-native-qrcode-svg';
import { StyleSheet, Text, View, Image, TouchableOpacity, Button, TouchableHighlight, ImageBackground, BackHandler } from 'react-native';
import { AppContext } from '../../utils/AppContext';
import { MyInfoPageTitle } from '../../utils/titleForUI';

const MyInfoPage = ({navigation}) => {

  const { setUserStatus, memberId, userEmail, loginDate, setRouterHistory } = useContext(AppContext)

  const onChangePinCode = () => {
    setUserStatus("ResetPin")
    navigation.navigate('InputPinCode')
  }

  const onBack = () => {
    navigation.navigate('HomePage')
  }

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
          <QRCode
            size={200}
            value={memberId}
          />
        </View>
        
        <View style={styles.topContainer}>
          <Text style={styles.memberID}>{MyInfoPageTitle.MemberID}</Text>
          <Text style={styles.IDNumber}>{memberId}</Text>
          <View style={styles.rowLine}>
            <Text style={styles.loginEmail}>{MyInfoPageTitle.LoginEmail}</Text>
            <Text style={styles.lineText}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Text>
          </View>
          <Text style={styles.emailText}>{userEmail}</Text>
          <View style={styles.rowLine}>
            <Text style={styles.loginEmail}>{MyInfoPageTitle.LoginDateTime}</Text>
            <Text style={styles.lineTextDate}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Text>
          </View>
          <Text style={styles.dateText}>{loginDate}</Text>
        </View>

        <TouchableHighlight
          style={styles.changePinBtn}
          onPress={onChangePinCode}
          underlayColor='#fff'>
            <Text style={styles.registerBtnText}>{MyInfoPageTitle.ChangePinCode}</Text>
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
    height: 220,
    top: 80
  },
  logo: {
    position: 'absolute',
    top: "7%",
    width : 30,
    height : 35,
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
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subContainer: {
    marginTop: 100,
    width: "80%",
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topContainer: {
    backgroundColor: "#0a3f92",
    width: "100%",
    borderRadius: 15,
    marginTop: -100,
    paddingHorizontal: 30,
    zIndex: -1,
  },
  QRContainer: {
    padding: 12,
    width: 225,
    backgroundColor: "white",
    borderRadius: 12
  },
  memberID: {
    color: "white",
    fontSize: 20,
    marginTop: 105,
    textAlign: "center",
    opacity: 0.6
  },
  IDNumber: {
    color: "white",
    fontSize: 20,
    textAlign: "center",
  },
  rowLine: {
    flexDirection: "row",
    marginTop: 20
  },
  lineText: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    marginLeft: 35,
    fontSize: 18,
    color: "white",
    opacity: 0.6

  },
  lineTextDate: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    marginLeft: 3,
    fontSize: 18,
    color: "white",
    opacity: 0.6

  },
  loginEmail: {
    fontSize: 17,
    color: "white",
    opacity: 0.6
  },
  emailText: {
    color: "white",
    fontSize: 20,
    marginBottom: 0
  },
  dateText: {
    color: "white",
    fontSize: 20,
    marginBottom: 20
  },
  changePinBtn: {
    marginTop: "10%",
    marginBottom: "15%",
    backgroundColor: "#ddecff",
    width: "100%",
    padding: 15,
    borderRadius: 15
  },
  registerBtnText: {
    color: 'black',
    textAlign: 'center',
    fontSize: 20,
    opacity: 0.7
  }
});

export default MyInfoPage
