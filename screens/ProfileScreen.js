import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { auth, db } from '../firebase'
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useEffect } from 'react';


const ProfileScreen = () => {
  const navigate = useNavigation();
  const [bio, setBio] = useState('');
  const [username, setUsername] = useState('')

  const deleteSubcollection = async (subcollectionId) => {
    try {

      const parentDocRef = db.collection('users').doc(auth.currentUser?.uid);
      const subcollectionRef = parentDocRef.collection(subcollectionId);
      const subcollectionSnapshot = await subcollectionRef.get();
  
      const batch = db.batch();
  
      subcollectionSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
  
      await batch.commit();
  
      console.log('Subcollection deleted successfully.');
    } catch (error) {
      console.error('Error deleting subcollection:', error);
    }
  };

  useEffect(() => {
    db.collection('users').doc(auth.currentUser?.uid).get().then(doc => [
      setBio(doc.data().bio),
      setUsername(doc.data().username)
    ])
  })

  const handledeleteUser = async () => {
    try {
      // Delete subcollections
      await deleteSubcollection('Tasks');
      await deleteSubcollection('Dates');
  
      // Delete parent document
      await db.collection('users').doc(auth.currentUser?.uid).delete();
  
      // Delete user
      await auth.currentUser.delete();
      
      console.log('Successfully deleted user');
      navigate.navigate('Splash');
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

   return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profile}>
            <View style={styles.profileAvatarWrapper}>
            <Image style={styles.profileAvatar} source={require("../assets/profile.png")} />
              <TouchableOpacity
                onPress={() => {navigate.navigate("Edit Profile")}}>
                <View style={styles.profileAction}>
                  <FeatherIcon color="#fff" name="edit-3" size={15} />
                </View>
              </TouchableOpacity>
            </View>
          <View style={styles.profileBody}>
            <Text style={styles.profileName}>{username}</Text>
            <Text style={styles.profileAddress}>
              {bio}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.button} textColor='black' onPress={() => {navigate.navigate("LeaderBoard")}}>
            <Icon name='trophy'size={20}/>
            <Text> LeaderBoard </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} textColor='black' mode='contained-tonal' onPress={() => {navigate.navigate("Planner")}}>
        <Icon name="calendar-text-outline" size={20}/>
            <Text> Planner </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} textColor='black' mode='contained-tonal' onPress={() => {navigate.navigate("Friends")}}>
        <Icon name="account-group" size={20}/>
            <Text> Friends </Text>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
            <TouchableOpacity
                //Login
                onPress={handledeleteUser}
                style={styles.delete}
            >
                <Text style={styles.deleteText} >Delete Account</Text>
            </TouchableOpacity>
        </View>  

        </ScrollView>
    </View>
  );
}

export default ProfileScreen;

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
    padding: 10,
    borderRadius: 10/2,
    alignItems: 'center',
    gap: 10,
    backgroundColor: "white",
    marginTop: 20,
    flexDirection: 'row',
  },

  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },

  delete: {
    width: '90%',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: "#800080",
    marginBottom: 20,
  },

  deleteText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  }, 

  extraButton: {
    width: '90%',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: "#800080",
    marginBottom: 20,
  },
  
  extraButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },

})