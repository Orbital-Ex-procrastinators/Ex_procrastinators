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
import { auth, db } from "../firebase";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from "react-native-safe-area-context";

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [currentDate, setCurrentDate] = useState('');

    const navigation = useNavigation()

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
          if (user) {
            navigation.replace("Routes")
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
          .catch(error => { 
            var errorCode = error.code
            if (errorCode == "auth/invalid-email") {
                alert("The email address is invalid.")
            }
            else if (errorCode === "auth/user-not-found") { 
                alert("There is no user record corresponding to this email.")
            } 
            else if (error.code == 'auth/wrong-password') {
                alert("The email or password is invalid. Please enter the correct email or password.")
            }
            else if (error.code == 'auth/missing-password') {
                alert("The password should not be empty. Please enter a valid password.")
            }
            else if (error.code == 'auth/weak-password') {
                alert("The password must be 6 characters long or more.")
            }
            else {
                console.log(errorCode)
                alert(error.message)
            }})
    }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
    >   
    <SafeAreaView style={styles.back} >
        <Icon 
            name="keyboard-backspace" 
            size={40} color="#800080" 
            onPress={() => {navigation.replace('Splash')}}/>
    </SafeAreaView>
        
        <View style={styles.box}>
            <Image style={styles.image} source={require("../assets/TrackIT.png")} />

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
        </View>    
        <View flexDirection='row'>
            <Text> Don't have an account? </Text>
            <TouchableOpacity
                //Sign-up
                onPress={() => {navigation.replace("Signup")}}
            >
                <Text style={styles.signupText} > Sign-up </Text>
            </TouchableOpacity>
        </View>
        </View>
    </KeyboardAvoidingView>
  )
}

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        rowGap: 100
    },

    back: {
        alignItems: 'flex-start',
        top: 25,
        left: 25,
    }, 

    box: {
        flex: 1,
        alignItems: 'center',
    },

    image: {
        marginBottom: 20,
        width: 120,
        height: 120,
        resizeMode: 'contain',
        borderRadius: 30,
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

    loginText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    }, 

    signupText: {
        color: '#800080',
        fontWeight: '700',
    },
});
