import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Button } from 'react-native-paper';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { auth } from '../firebase'

const ProfileScreen = () => {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profile}>
            <View style={styles.profileAvatarWrapper}>
            <Image style={styles.profileAvatar} source={require("../assets/profile.png")} />
              <TouchableOpacity
                onPress={() => {
                  // edit profile
                }}>
                <View style={styles.profileAction}>
                  <FeatherIcon color="#fff" name="edit-3" size={15} />
                </View>
              </TouchableOpacity>
            </View>
          <View style={styles.profileBody}>
            <Text style={styles.profileName}>{auth.currentUser?.email}</Text>
            <Text style={styles.profileAddress}>
              status message
            </Text>
          </View>
        </View>
        <Button style={styles.button} textColor='black' icon="star" mode= 'contained-tonal' onPress={() => console.log('Pressed')}>
          LeaderBoard
        </Button>
        <Button style={styles.button} textColor='black' icon="calendar-text-outline" mode='contained-tonal' onPress={() => console.log('Pressed')}>
          Calendar
        </Button>
        </ScrollView>
    </View>
  );
}

export default ProfileScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: 20,
  },

  profile: {
    width: "90%",
    padding: 24,
    backgroundColor: '#fff',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10/2,
  },

  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 9999,
  },

  profileAvatarWrapper: {
    position: 'relative',
  },

  profileAction: {
    position: 'absolute',
    right: -4,
    bottom: -10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 9999,
    backgroundColor: '#800080',
  },

  profileName: {
    marginTop: 20,
    fontSize: 19,
    fontWeight: '600',
    color: '#414d63',
    textAlign: 'center',
  },

  profileAddress: {
    marginTop: 5,
    fontSize: 16,
    color: '#989898',
    textAlign: 'center',
  },

  button: {
    width: "90%",
    borderRadius: 10/2,
    alignItems: 'flex-start',
    backgroundColor: "white",
    marginTop: 20,
  }
})