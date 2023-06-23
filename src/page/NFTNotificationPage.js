import React, {useEffect, useState} from 'react';
// import QRCode from 'react-native-qrcode-svg';
import { StyleSheet, Text, View, Image, TextInput, Button, TouchableOpacity, ImageBackground, BackHandler, Alert, Pressable } from 'react-native';
import { NFTNotificationPageTitle } from '../../utils/titleForUI';

const NFTNotificationPage = ({route, navigation}) => {
  const { detailList } = route.params;
  let year = detailList.transTime.slice(0, 4)
  let month = detailList.transTime.slice(4, 6)
  let day = detailList.transTime.slice(6, 8)
  let hour = detailList.transTime.slice(9, 11)
  let min = detailList.transTime.slice(11, 13)
  let second = detailList.transTime.slice(13, 15)
  let date = `${year}-${month}-${day} ${hour}:${min}:${second}`

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

        <Text style={styles.IDNumber}>{NFTNotificationPageTitle.NormalNotificationTitle}</Text>
        
        <View style={styles.topContainer}>
          <View style={styles.rowLine}>
            <Text style={styles.loginEmail}>{NFTNotificationPageTitle.Time}</Text>
            <Text style={styles.lineText}>{date}</Text>
          </View>
          <View style={styles.rowLine}>
            <Text style={styles.loginEmail}>{NFTNotificationPageTitle.Type}</Text>
            <Text style={styles.lineText}>{detailList.title}</Text>
          </View>
          <View style={styles.colLine}>
            <Text style={styles.loginEmail}>{NFTNotificationPageTitle.Detail}</Text>
            <Text style={styles.detailText}>{detailList.body}</Text>
          </View>
        </View>
        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    top: "3%",
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
    position: "absolute",
    top: "30%",
    width: "85%",
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: "60%"
  },
  topContainer: {
    backgroundColor: "#0a3f92",
    width: "100%",
    borderRadius: 20,
    marginTop: 0,
    paddingTop: 20,
    paddingBottom: 30,
    zIndex: -1,
    height: "100%"
  },
  QRContainer: {
    padding: 12,
    width: 225,
    backgroundColor: "white",
    borderRadius: 12
  },
  metamaskLogo: {
    width: 200,
    height: 200
  },
  memberID: {
    color: "white",
    fontSize: 18,
    marginTop: 105,
    textAlign: "center",
    opacity: 0.6
  },
  IDNumber: {
    color: "black",
    fontSize: 25,
    marginBottom: 50,
    textAlign: "center",
  },
  rowLine: {
    flexDirection: "row",
    marginTop: 10,
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
    fontSize: 17,
    color: "white",
    opacity: 0.6

  },
  loginEmail: {
    fontSize: 17,
    width: "32%",
    color: "white",
    opacity: 0.6
  },
  detailText: {
    fontSize: 17,
    color: "white",
    minHeight: 80
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
  acceptPinBtn: {
    marginTop: 25,
    backgroundColor: "#ff9406",
    width: "48%",
    padding: 15,
    borderRadius: 15
  },
  rejectPinBtn: {
    marginTop: 25,
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

export default NFTNotificationPage
