import {ImageBackground, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SplashScreen = () => {

    const navigation = useNavigation();

    return (
        <View style={styles.container}>
        <ImageBackground source={require("../assets/TrackIT-splash.png")} resizemode = 'contain' style={styles.image}> 
            <TouchableOpacity
                //Login
                onPress={() => {navigation.replace("Login")}}
                style={styles.login}
            >
                <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
                //Sign-up
                onPress={() => {navigation.replace("Signup")}}
                style={[styles.login, styles.signup]}
            >
                <Text style={styles.signupText} > Sign-up </Text>
            </TouchableOpacity>
        </ImageBackground>
        </View>
  )
}

export default SplashScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#EFDCF9",
    },

    image: {
        flex: 1,
        justifyContent: 'flex-end',
    }, 

    login: {
        alignSelf: 'center',
        width: '70%',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        backgroundColor: "#800080",
        marginBottom: 20,
    },

    signup: {
        backgroundColor: '#EFDCF9',
        alignItems: 'center',
        marginBottom: 150,
    },

    loginText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    }, 

    signupText: {
        color: '#800080',
        fontWeight: '700',
        fontSize: 16,
    },
    
})