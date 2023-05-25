import { useNavigation } from "@react-navigation/core";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import { auth } from "../firebase";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigation = useNavigation()

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
          if (user) {
            navigation.replace("Home")
          }
        })

        return unsubscribe
      }, [])

    const handleLogin = () => {
        auth
          .signInWithEmailAndPassword(email, password)
          .then(userCredentials => {
            const user = userCredentials.user;
            console.log('Logged in with:', user.email);
          })
          .catch(error => alert(error.message))
    }

    const handleSignUp = () => {
        auth
          .createUserWithEmailAndPassword(email, password)
          .then(userCredentials => {
            const user = userCredentials.user;
            console.log('Sign-up with:', user.email);
          })
          .catch(error => alert(error.message))
    }


    
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
    >
        <Image style={styles.image} source={require("../assets/logo2.png")} />

            <View style={styles.inputContainer}>
            <TextInput
                // Get Email
                placeholder="Email"
                placeholderTextColor="#800080"
                value={email}
                onChangeText={text => setEmail(text)}
                style={styles.input}
            />
        </View>

        <View style={styles.inputContainer}>
            <TextInput
                //Get Password
                placeholder="Password"
                placeholderTextColor="#800080"
                value={password}
                onChangeText={text => setPassword(text)}
                style={styles.input}
                secureTextEntry
            />
            </View>

        <View style={styles.buttonContainer}>
            <TouchableOpacity
                //Login
                onPress={handleLogin}
                style={styles.login}
            >
                <Text style={styles.loginText} >Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
                //Sign-up
                onPress={handleSignUp}
                style={[styles.login, styles.signup]}
            >
                <Text style={styles.signupText} > Sign-up </Text>
            </TouchableOpacity>

            {/* <TouchableOpacity
                // Google 
                onPress={signInWithGoggle}
                style={styles.google}
            >
                <Icon 
                    name="google" 
                />
                <Text> Sign in with Google</Text>
            </TouchableOpacity> */}
        </View>
    </KeyboardAvoidingView>
  )
}

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    image: {
        marginBottom: 20,
        width: 150,
        height: 150,
        resizeMode: 'contain',
        borderRadius: 100/2,
    }, 

    inputContainer: {
        backgroundColor: "#EFDCF9",
        borderRadius: 30,
        width: "70%",
        height: 45,
        marginBottom: 20,
    },

    input: {
        height: 50,
        flex: 1,
        padding: 10,
        marginLeft: 20,
    },

    buttonContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },

    login: {
        width: '70%',
        padding: 15,
        borderRadius: 20,
        alignItems: 'center',
        backgroundColor: "#800080",
        marginBottom: 20,
    },

    signup: {
        backgroundColor: 'white',
        alignItems: 'center',
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

    google: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', 
    }
});
