import React, {useContext, useEffect, useLayoutEffect, useState} from 'react';
import Web3 from "web3";
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions, TouchableHighlight, ImageBackground, BackHandler } from 'react-native';
import { AppContext } from '../../utils/AppContext';
import { MetaMaskInfoPageTitle } from '../../utils/titleForUI';

const { width, height } = Dimensions.get('window');

const MetamaskInfoPage = ({navigation}) => {

  const { walletType, walletAddress, setWalletAddress, evmConnector, loginDate } = useContext(AppContext)
  const [ remainAmount, setRemainAmount ] = useState(0)

  useEffect(() => {
    getBalance();
    async function getBalance() {
      const url = walletType === "metamask" ? "https://eth-rpc.gateway.pokt.network" : 'https://rpc.ankr.com/klaytn_testnet' // https://rpc.ankr.com/klaytn
      console.log("url", url)
      const web3 = new Web3(new Web3.providers.HttpProvider(url));
      const balance = await web3.eth.getBalance(walletAddress);
      if(walletType === "metamask") setRemainAmount(balance)
      else setRemainAmount(balance / Math.pow(10, 18))
    }
  }, [walletAddress])

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
          {
            walletType === "metamask" ? <Image source={require('../../assets/metamask_icon.png')} style={styles.metamaskLogo} />
                                      : <Image source={require('../../assets/kaikas2.png')} style={styles.kaikasLogo} />

          }
        </View>
        
        <View style={styles.topContainer}>
          <Text style={styles.IDNumber}>{MetaMaskInfoPageTitle.WalletInfo}</Text>
          <View style={styles.rowLine}>
            <Text style={styles.loginEmail}>{MetaMaskInfoPageTitle.WalletAddress}</Text>
          </View>
          <Text style={styles.walletAddress}>{walletAddress}</Text>

          <View style={styles.rowLine}>
            <Text style={styles.loginEmail}>{MetaMaskInfoPageTitle.RemindAmount}</Text>
          </View>
          <Text style={styles.emailText}>{remainAmount}</Text>
          
          <View style={styles.rowLine}>
            <Text style={styles.loginEmail}>{MetaMaskInfoPageTitle.ConnectedSite}</Text>
          </View>
          <View style={styles.rowImageLine}>
            <Image source={require('../../assets/siteicon.png')} style={styles.lineLogo} />
            <Text style={styles.emailComText}>www.escarenftmarketplace.com</Text>
          </View>

          <View style={styles.rowLine}>
            <Text style={styles.loginEmail}>{MetaMaskInfoPageTitle.ConnectionTime}</Text>
          </View>
          <Text style={styles.emailText}>{ loginDate }</Text>
        </View>
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
    top: "2%",
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
  lineLogo:{
    width: 25,
    height: 25
  },
  metamaskLogo: {
    width: 200,
    height: 180
  },
  kaikasLogo: {
    width: 200,
    height: 180
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subContainer: {
    marginTop: "10%",
    width: "85%",
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topContainer: {
    backgroundColor: "#0a3f92",
    width: "100%",
    borderRadius: 20,
    marginTop: -110,
    paddingBottom: 20,
    paddingRight: 20,
    zIndex: -1,
  },
  QRContainer: {
    padding: 12,
    width: 225,
    backgroundColor: "white",
    borderRadius: 20
  },
  IDNumber: {
    marginTop: 110,
    color: "white",
    fontSize: 22,
    textAlign: "center",
    marginLeft: 20
  },
  rowLine: {
    flexDirection: "row",
    marginTop: 10,
    marginLeft: 30,
    marginRight: 30,
  },
  rowImageLine: {
    flexDirection: "row",
    marginTop: 10,
    marginLeft: 35,
    marginRight: 10,
  },
  lineText: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    marginLeft: 50,
    fontSize: 18,
    color: "white",
    opacity: 0.6

  },
  lineTextDate: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    marginLeft: 18,
    fontSize: 18,
    color: "white",
    opacity: 0.6

  },
  loginEmail: {
    fontSize: 15,
    color: "white",
    opacity: 0.6
  },
  walletAddress: {
    color: "white",
    fontSize: width / 33,
    marginTop: 3,
    marginLeft: 30,
    marginBottom: 2
  },
  emailText: {
    color: "white",
    fontSize: 15,
    marginTop: 3,
    marginLeft: 30,
    marginBottom: 2
  },
  emailComText: {
    color: "white",
    fontSize: 15,
    marginLeft: 15,
    marginBottom: 2
  },
  dateText: {
    color: "white",
    fontSize: 22,
    marginLeft: 30,
    marginBottom: 40
  },
  changePinBtn: {
    marginTop: 45,
    backgroundColor: "#ddecff",
    width: "100%",
    padding: 20,
    borderRadius: 15
  },
  registerBtnText: {
    color: 'black',
    textAlign: 'center',
    fontSize: 20,
    opacity: 0.7
  }
});

export default MetamaskInfoPage
