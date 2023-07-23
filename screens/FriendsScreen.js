import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from 'react-native-paper';
import { db, auth } from '../firebase';
import { useNavigation } from '@react-navigation/native';

const avatarColors = ['#95C4DE', '#F4D06F', '#9FD9B5', '#F8B4D9', '#F9C993', '#B6A5E0'];

const FriendsScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const [friendsData, setFriendsData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserNotFound, setIsUserNotFound] = useState(false);

  useEffect(() => {
    fetchFriendsData();
  }, []);

  const fetchFriendsData = async () => {
    try {
      const usersRef = db.collection('users');
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.log('No authenticated user.');
        return;
      }

      const currentUserId = currentUser.uid;
      const currentUserData = await usersRef.doc(currentUserId).get();
      if (!currentUserData.exists) {
        console.log('Current user data not found.');
        return;
      }

      const currentUserFriends = currentUserData.data().Friends;
      const friendsDataPromises = currentUserFriends.map(async (friendUsername) => {
        const friendSnapshot = await usersRef.where('username', '==', friendUsername).get();
        if (!friendSnapshot.empty) {
          return friendSnapshot.docs[0].data();
        }
        return null;
      });

      const friendsData = await Promise.all(friendsDataPromises);
      const filteredFriendsData = friendsData.filter((friendData) => friendData !== null);
      setFriendsData(filteredFriendsData);
    } catch (error) {
      console.log('Error fetching friends data:', error);
    }
  };

  const handleAddFriends = async () => {
    try {
      // Check if the user exists in the Firebase Firestore collection
      const usersRef = db.collection('users');
      const userSnapshot = await usersRef.where('username', '==', searchQuery).get();
  
      if (userSnapshot.empty) {
        // If the user does not exist, show an error message or handle the situation accordingly
        console.log('User not found.');
        setIsUserNotFound(true); // Set isUserNotFound to true to trigger the Modal
        return;
      }
  
      // If the user exists, add them to the current user's "Friends" array
      const currentUser = auth.currentUser;
      if (currentUser) {
        const currentUserId = currentUser.uid;
        const currentUserRef = usersRef.doc(currentUserId);

        // Get the current user's data to check if the friend is already added
        const currentUserData = await currentUserRef.get();
        if (!currentUserData.exists) {
          console.log('Current user data not found.');
          return;
        }

        const currentFriends = currentUserData.data().Friends;
        if (currentFriends.includes(searchQuery)) {
          // If the friend is already added, show an error message or handle the situation accordingly
          console.log('Friend already added.');
          return;
        }

        // Update the "Friends" array field with the new friend and set it back to the Firestore document
        const updatedFriends = [...currentFriends, searchQuery];
        await currentUserRef.update({ Friends: updatedFriends });

        // Fetch and update the friends data in the state to reflect the changes
        fetchFriendsData();

        // Clear the search query after adding the friend
        setSearchQuery('');
      }
    } catch (error) {
      console.log('Error adding friend:', error);
    }
  };

  const handleRemoveFriend = async (friendUsername) => {
    try {
      // Remove the friend from the current user's "Friends" array
      const currentUser = auth.currentUser;
      if (currentUser) {
        const currentUserId = currentUser.uid;
        const currentUserRef = db.collection('users').doc(currentUserId);

        // Get the current user's data to find the index of the friend in the "Friends" array
        const currentUserData = await currentUserRef.get();
        if (!currentUserData.exists) {
          console.log('Current user data not found.');
          return;
        }

        const currentFriends = currentUserData.data().Friends;
        const updatedFriends = currentFriends.filter((friend) => friend !== friendUsername);

        // Update the "Friends" array field in Firestore to remove the friend
        await currentUserRef.update({ Friends: updatedFriends });

        // Fetch and update the friends data in the state to reflect the changes
        fetchFriendsData();
      }
    } catch (error) {
      console.log('Error removing friend:', error);
    }
  };

  const renderFriendsList = () => {
    if (friendsData.length === 0) {
      return (
        <View style={styles.noFriendsContainer}>
          <Text style={styles.noFriendsText}>You have no friends yet. Add some friends!</Text>
        </View>
      );
    }

    
    return friendsData.map((friend, index) => (
      <View key={index} style={styles.friendItem}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: avatarColors[index % avatarColors.length] }]}>
            <Text style={styles.avatarText}>{friend.username.charAt(0)}</Text>
          </View>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.friendName}>{friend.username}</Text>
        </View>
        <View style={styles.infoContainer}>
          {/* Additional info about the friend (e.g., time, rank, etc.) can be displayed here */}
        </View>
        <TouchableOpacity onPress={() => handleRemoveFriend(friend.username)} style={styles.removeButton}>
          <Icon name="trash-can" size={24} color="#800080" />
        </TouchableOpacity>
      </View>
    ));
  };

  const closeModal = () => {
    setIsUserNotFound(false);
  };


  

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Friends content */}
        <Text style={styles.title}>Friends</Text>
        {renderFriendsList()}

        {/* "Find User" input */}
        <View style={styles.inputContainer}>
          <Icon name="account-search" size={24} color="#800080" style={styles.icon} />
          <TextInput
            style={styles.input}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Find user..."
          />
        </View>

        {/* "Add Friends" button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddFriends}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>

        {/* Modal for user not found */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isUserNotFound}
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>User not found. Please check the username and try again.</Text>
              <Pressable style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addFriendsButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#800080',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -10, // Adjust the margin value as needed to move the button up
    marginBottom: 20,
  },
  addFriendsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#800080',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#800080',
    borderRadius: 15,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: 40,
  },
  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#800080',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#800080',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  removeButton: {
    marginLeft: 'auto', // Align the remove button to the right of the friend item
  },
});

export default FriendsScreen;