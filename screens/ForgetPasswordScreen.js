import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { auth } from "../firebase";

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [resetSent, setResetSent] = useState(false);

    const handlePasswordReset = () => {
        auth
            .sendPasswordResetEmail(email)
            .then(() => {
                setResetSent(true);
            })
            .catch(error => {
                var errorCode = error.code
                if (errorCode == "auth/invalid-email") {
                    alert("The email address is invalid.")
                }
                else if (errorCode === "auth/user-not-found") { 
                    alert("There is no user record corresponding to this email.")
                } 
                else {
                    console.log(errorCode)
                    alert(error.message)
                }
            });
    };

    return (
        <View style={styles.container}>
            {resetSent ? (
                <Text>Password reset instructions sent to your email</Text>
            ) : (
                <>
                    <TextInput
                        placeholder="Email"
                        placeholderTextColor="#800080"
                        value={email}
                        onChangeText={text => setEmail(text)}
                        style={styles.input}
                    />
                    <TouchableOpacity
                        onPress={handlePasswordReset}
                        style={styles.resetButton}
                    >
                        <Text style={styles.resetButtonText}>Reset Password</Text>
                    </TouchableOpacity>
                </>
            )}
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
            >
                <Text style={styles.backButtonText}>Back to Login</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    input: {
        height: 50,
        width: "80%",
        borderColor: "#800080",
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    resetButton: {
        backgroundColor: "#800080",
        padding: 10,
        borderRadius: 10,
    },
    resetButtonText: {
        color: "white",
        fontWeight: "700",
        textAlign: "center",
    },
    backButton: {
        marginTop: 20,
    },
    backButtonText: {
        color: "#800080",
        fontWeight: "700",
        textAlign: "center",
    },
});

export default ForgotPasswordScreen;