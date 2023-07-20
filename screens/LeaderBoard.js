import React, { startTransition, useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from 'react-native-paper';
import { db } from '../firebase';

const LeaderboardScreen = () => {
  const theme = useTheme();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [selectedButton, setSelectedButton] = useState(1);

  useEffect(() => {
    fetchLeaderboardData();
  }, [selectedButton]);

  const fetchLeaderboardData = async () => {
    try {
      const usersRef = db.collection('users');
      const snapshot = await usersRef.get();
      const currentDate = getCurrentDateFormatted();
  
      // Choose the date range based on the selectedButton value
      let startDate, endDate;
      if (selectedButton === 2) {
        startDate = getStartDateOfWeek();
        endDate = currentDate;
      } else if (selectedButton === 3) {
        startDate = getStartDateOfMonth();
        endDate = currentDate;
      } else {
        startDate = currentDate;
        endDate = currentDate;
      }
  
      const leaderboardData = [];
      console.log(startDate)
      console.log(endDate)

      // Loop through each user to fetch the data within the date range
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const dateDocs = await doc.ref
          .collection('Dates')
          .where('date', '>=', startDate)
          .where('date', '<=', endDate)
          .get();
  
        let totalTime = 0;
        dateDocs.forEach((dateDoc) => {
          totalTime += dateDoc.exists ? dateDoc.data().time : 0;
        });
  
        leaderboardData.push({ ...data, time: totalTime });
      }
  
      // Sort the leaderboardData based on time (seconds) in descending order
      leaderboardData.sort((a, b) => b.time - a.time);
  
      // Assign ranks to the sorted data
      leaderboardData.forEach((data, index) => {
        data.rank = index + 1;
      });
  
      setLeaderboardData(leaderboardData);
    } catch (error) {
      console.log('Error fetching leaderboard data:', error);
    }
  };


  const getCurrentDateFormatted = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1);
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getStartDateOfWeek = () => {
    const date = new Date();
    const day = date.getDay();
    const startDate = new Date(date);
    startDate.setDate(date.getDate() - day); // Set the start date to the first day of the week (Sunday)

    const year = startDate.getFullYear();
    const month = startDate.getMonth() + 1;
    const dayOfMonth = startDate.getDate();

    return `${year}-${month}-${dayOfMonth}`;
  };

  const getStartDateOfMonth = () => {
    const date = new Date();
    date.setDate(1); // Set the day of the month to 1

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const dayOfMonth = date.getDate();

    return `${year}-${month}-${dayOfMonth}`;
  };
  
  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleButtonPress = (buttonNumber) => {
    setSelectedButton(buttonNumber);
    // Add additional logic as needed for each button press
    console.log(`Button ${buttonNumber} pressed`);
  };

  const getFormattedDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  };
  
  const avatarColors = ['#95C4DE', '#F4D06F', '#9FD9B5', '#F8B4D9', '#F9C993', '#B6A5E0'];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      <Text style={styles.dateRangeText}>
        {getFormattedDate(selectedButton === 1 ? getCurrentDateFormatted() : selectedButton === 2 ? getStartDateOfWeek() : getStartDateOfMonth())} -{' '}
        {getFormattedDate(getCurrentDateFormatted())}
      </Text>
      <View style={styles.buttonRow}>
      <TouchableOpacity
          style={[
            styles.leaderboardButton,
            selectedButton === 1 ? styles.buttonSelected : null,
          ]}
          onPress={() => handleButtonPress(1)}
        >
          <Text style={styles.leaderboardButtonText}>Daily</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.leaderboardButton,
            selectedButton === 2 ? styles.buttonSelected : null,
          ]}
          onPress={() => handleButtonPress(2)}
        >
          <Text style={styles.leaderboardButtonText}>Weekly</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.leaderboardButton,
            selectedButton === 3 ? styles.buttonSelected : null,
          ]}
          onPress={() => handleButtonPress(3)}
        >
          <Text style={styles.leaderboardButtonText}>Monthly</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.trophiesContainer}>
        {leaderboardData.slice(0, 3).map((item, index) => (
          <View
            key={index}
            style={[
              styles.trophyContainer,
              styles.border,
              index === 1 && styles.secondPlace,
              index === 0 && styles.firstPlace,
              index === 2 && styles.thirdPlace,
            ]}
          >
            <Icon
              name="trophy"
              size={50}
              color={index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'}
            />
            <Text style={styles.trophyPosition}>{index + 1}</Text>
            <Text style={[styles.trophyName, { fontSize: 14 }]}>{item.username}</Text>
            <Text style={styles.timeText}>{formatTime(item.time)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.headerContainer}>
        <View style={styles.headerBox}>
          <Text style={[styles.headerRank, { marginRight: 54 }]}>Rank</Text>
          <Text style={[styles.headerName, { marginRight: 110 }]}>User</Text>
          <Text style={styles.headerName}>Hours</Text>
        </View>
      </View>
      <ScrollView style={styles.friendsContainer} showsVerticalScrollIndicator={false}>
        {leaderboardData.slice(3).map((item, index) => (
          <View
            key={index}
            style={[
              styles.friendItem,
              styles.rankBox,
              index >= 1 && styles.friendItemSpacing,
            ]}
          >
            <View style={styles.rankContainer}>
              <Text style={styles.rankPosition}>{index + 4}</Text>
            </View>
            <View style={styles.avatarContainer}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: avatarColors[index % avatarColors.length] },
                ]}
              >
                <Text style={styles.avatarText}>{item.username.charAt(0)}</Text>
              </View>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.friendName}>{item.username}</Text>
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(item.time)}</Text>
            </View>
          </View>
        ))}
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
  trophiesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  trophyContainer: {
    alignItems: 'center',
  },
  border: {
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 8,
  },
  trophyBackground: {
    backgroundColor: '#EFDCF9',
  },
  trophyPosition: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  trophyName: {
    fontSize: 16,
    marginTop: 5,
    textAlign: 'center',
  },
  friendsContainer: {
    flex: 1,
    marginBottom: 20,
  },
  headerContainer: {
    marginBottom: 10,
  },
  headerBox: {
    backgroundColor: '#800080',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  headerRank: {
    width: 50,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  friendItemSpacing: {
    marginBottom: 12,
  },
  rankBox: {
    backgroundColor: '#EFDCF9',
    padding: 10,
    borderRadius: 8,
  },
  rankContainer: {
    backgroundColor: '#EFDCF9',
    padding: 9,
    borderRadius: 4,
    marginRight: 10,
    width: 47, // Add a fixed width to align the names
  },
  rankPosition: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
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
  },
  timeContainer: {
    marginLeft: 'auto',
    backgroundColor: '#EFDCF9',
    padding: 9,
    borderRadius: 4,
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  firstPlace: {
    backgroundColor: '#EFDCF9',
    width: 110,
    borderColor: '#EFDCF9', // Set the borderColor to match the background color
  },
  secondPlace: {
    backgroundColor: '#EFDCF9',
    width: 110,
    borderColor: '#EFDCF9', // Set the borderColor to match the background color
  },
  thirdPlace: {
    backgroundColor: '#EFDCF9',
    width: 110,
    borderColor: '#EFDCF9', // Set the borderColor to match the background color
  },
  trophyIcon: {
    position: 'absolute',
    top: -20,
    right: -20,
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 5,
    marginBottom: 20,
    marginHorizontal: 10,
  },
  leaderboardButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#800080',
    marginHorizontal: 5,
  },
  leaderboardButtonText: {
    color: '#800080',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  buttonSelected: {
    backgroundColor: '#80008033',
  },
  dateRangeText: {
    alignSelf:"center",
    color: '#800080',
    fontWeight: '300',
    fontSize: 15,
    marginBottom: 10,
  },
});

export default LeaderboardScreen;