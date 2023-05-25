import { useNavigation } from '@react-navigation/core'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import CountDown from 'react-native-countdown-component'
import { SafeAreaView } from 'react-native-safe-area-context'
import { auth } from '../firebase'


const totalDuration = 6 // controls time 

const HomeScreen = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.title}> Welcome Back!</Text>
        <View style={styles.countdown}>
        <CountDown
          size={40}
          until={totalDuration}
          digitStyle={{backgroundColor: 'white'}}
          digitTxtStyle={{color: '#800080'}}
          timeToShow={['H', 'M', 'S']}
          showSeparator='true'
          separatorStyle={{color: '#800080'}}
          timeLabels={{h:'', m: '', s: ''}}
          onPress={() => {}}
          onFinish={() => alert('Your Timer is Finished')}
        />
        <TouchableOpacity
            onPress={() => {}}
            style={styles.start}
        >
          <Text style={styles.startText}>Start</Text>
        </TouchableOpacity>
        </View>
      </View>
    )
  }
  
  export default HomeScreen;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems:'center',
      backgroundColor: "#EFDCF9"
    },

    title: {
      color: '#800080',
      fontWeight: '700',
      fontVariant: 'small-caps',
      fontSize: 30,
      marginTop: 20,
      marginBottom: 20,
    },

    countdown: {
      padding: 20,
      backgroundColor: "white",
      borderRadius: 50/2,
      justifyContent: 'center',
      alignItems: 'center',
      width: '90%'
    },

    start: {
      width: '30%',
      padding: 15,
      borderRadius: 20,
      alignItems: 'center',
      marginTop: 10,
    },

    startText: {
      color: '#800080',
      fontWeight: '700',
      fontSize: 16,
    }, 

  })