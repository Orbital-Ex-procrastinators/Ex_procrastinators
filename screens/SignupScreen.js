import { useNavigation } from "@react-navigation/core";
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
import { SafeAreaView } from "react-native-safe-area-context";

const SignupScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigation = useNavigation()

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
          if (user) {
            navigation.replace("Routes")
          }
        })

        return unsubscribe
      }, [])

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
                    //Sign-up
                    onPress={handleSignUp}
                    style={[styles.login, styles.signup]}
                >
                    <Text style={styles.signupText} > Sign-up </Text>
                </TouchableOpacity>
            </View>

            <View flexDirection='row' alignItems='center'>
                <Text> Already have an account? </Text>
                <TouchableOpacity
                    //Sign-up
                    onPress={() => {navigation.replace("Login")}}
                >
                    <Text style={styles.signupText} > Login </Text>
                </TouchableOpacity>
            </View>
        </View>
    </KeyboardAvoidingView>
  )
}

export default SignupScreen;

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
});
