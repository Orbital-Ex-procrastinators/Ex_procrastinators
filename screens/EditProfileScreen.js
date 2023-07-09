import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Button, Text } from 'react-native';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigation } from '@react-navigation/native';

const EditProfileScreen = () => {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigation();

  const handleSaveProfile = () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userUpdates = {};

      // Update username and bio in Firestore
      userUpdates.username = username;
      userUpdates.bio = bio;

      // Update email if a new email is provided
      if (newEmail) {
        currentUser
          .updateEmail(newEmail)
          .then(() => {
            console.log('Email updated successfully.');
          })
          .catch((error) => {
            console.error('Error updating email:', error);
            var errorCode = error.code
            if (errorCode == "auth/invalid-email" || errorCode == "auth/missing-email") {
                alert("The email address is invalid.")
            }
            else if (errorCode === "auth/email-already-in-use") { 
                alert("The email address is already in use by another account.")
            } else {
                alert(error.message)
            }
          });
      }

      // Update password if a new password is provided
      if (newPassword) {
        currentUser
          .updatePassword(newPassword)
          .then(() => {
            console.log('Password updated successfully.');
          })
          .catch((error) => {
            if (error.code == 'auth/missing-password') {
                alert("The password should not be empty. Please enter a valid password.")
            }
            else if (error.code == 'auth/weak-password') {
                alert("The password must be 6 characters long or more.")
            }
            else {
                alert(error.message)
            }
          });
      }

      // Update username and bio in Firestore
      if (Object.keys(userUpdates).length > 0) {
        const userRef = db.collection('users').doc(currentUser.uid);

        userRef
          .update(userUpdates)
          .then(() => {
            console.log('Profile updated successfully.');
            // Signing out and return to the Splash Screen
            auth
            .signOut()
            .then(() => {
                console.log('User signed out successfully.');
                navigate.navigate('Splash');
            })
            .catch((error) => {
                console.error('Error signing out:', error);
            });
          })
          .catch((error) => {
            console.error('Error updating profile:', error);
          });
      }
    }
  };

  return (
    <View style={styles.container}>
        <Text style={styles.text}>Username: </Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={(text) => setUsername(text)}
        placeholder="Enter your username"
      />
      <Text style={styles.text}>One Line Bio: </Text>
      <TextInput
        style={styles.input}
        value={bio}
        onChangeText={(text) => setBio(text)}
        placeholder="Enter your bio"
      />
      <Text style={styles.text}>Email: </Text>
      <TextInput
        style={styles.input}
        value={newEmail}
        onChangeText={(text) => setNewEmail(text)}
        placeholder="Enter your new email"
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Text style={styles.text}>Password: </Text>
      <TextInput
        style={styles.input}
        value={newPassword}
        onChangeText={(text) => setNewPassword(text)}
        placeholder="Enter your new password"
        secureTextEntry
      />
      <Button title="Save Profile" onPress={handleSaveProfile} />
    </View>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:'white',
        alignContent: 'center',
    },

    input: {
        backgroundColor: "#EFDCF9",
        padding: 15,
        borderRadius: 5,
        marginBottom: 20,
        marginHorizontal: 30,
    },

    text: {
        paddingLeft: 30,
        alignSelf:"flex-start",
        color: '#800080',
        fontWeight: '300',
        fontSize: 15,
        marginVertical: 10,
    }
});
