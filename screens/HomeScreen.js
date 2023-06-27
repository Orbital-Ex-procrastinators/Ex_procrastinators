import { useNavigation } from '@react-navigation/core'
import React, { useEffect, useRef, useState } from 'react'
import { AppState, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import CountDown from 'react-native-countdown-component'
import { auth, db} from '../firebase'
import { Icon } from 'react-native-elements'
import { ScrollView } from 'react-native-gesture-handler'
import { Avatar, Card } from 'react-native-paper'
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { Alert } from 'react-native'

const HomeScreen = () => {
  const [time, setTime] = useState(0);
  const [countDownId, setCountDownId] = useState(undefined);
  const [start, setStart] = useState(false);
  const [text, setText] = useState('Start');
  const [username, setUsername] = useState('');
  const [totalTime, setTotalTime]  = useState(0);
  const appState = useRef(AppState.currentState);
  // const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [tasks, setTasks] = useState([])
  const navigation = useNavigation();

  // create subcollection 
  var date = new Date().getDate(); //Current Date
  var month = new Date().getMonth() + 1; //Current Month
  var year = new Date().getFullYear(); //Current Year
  const currentDate = year + '-' + month + '-' + date;
  const doc = db.collection('users').doc(auth.currentUser?.uid)
  const datesDoc = doc.collection("Dates").doc(currentDate)

  datesDoc.get().then((docSnapShot) => {
    if (docSnapShot.exists) {
      //setTotalTime
      setTotalTime(docSnapShot.data().time)
    } else {
      doc.collection("Dates").doc(currentDate).set({
        time : 0
      })
    }
  }).catch(error => alert(error))

  useEffect(() => {
    doc.get().then(doc => [
      setUsername(doc.data().username)
    ]);

    // Generate new id based on unix timestamp (string)
    const id = new Date().getTime().toString()
    // Set id to state
    setCountDownId(id)
  }, [time])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {

      if (appState.current == 'inactive') {
        // Stop Timer
        setStart(false);
        setText('Start')
        console.log('AppState', appState.current);
      }
      console.log('AppState', appState.current);
      appState.current = nextAppState;
      // setAppStateVisible(appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = db
      .collection('users')
      .doc(auth.currentUser?.uid)
      .collection('Tasks')
      .onSnapshot((snapshot) => {
        const tasksData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTasks(tasksData);
      });
      return () => unsubscribe();
  }, []);
  
  const enableKeepAwake = async () => {
    await activateKeepAwakeAsync();
  }

  const currentTotal = () => { totalTime + time } ; 

  const resetCountDown = () => {
    setText('Start')
    setStart(false);
    setTime(prevtime => prevtime * 0)
    deactivateKeepAwake();
  }

  
  const updateTime = () => {
    setTotalTime(currentTotal())
    datesDoc.update({
      time: currentTotal()
    })
  }

  return ( 
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Welcome Back, {username}!</Text>
        <Text style={styles.subtitle}>Let's Start Tracking...</Text>
        <Text style={styles.header}>Study Timer</Text>

        <View style={styles.countdown}>
        <Text style={styles.text}>You have studied 
          {'\n'}for {Math.floor(totalTime/3600)} hrs {(totalTime - Math.floor(totalTime/3600) * 3600)/60} mins today!
        </Text>
        <Text>Click time to add 15 mins...</Text>
        <CountDown
          id={countDownId}
          running={start}
          size={40}
          until={time}
          digitStyle={{backgroundColor: '#EFDCF9'}}
          digitTxtStyle={{color: '#800080'}}
          timeToShow={['H', 'M', 'S']}
          showSeparator={true}
          separatorStyle={{color: '#800080'}}
          timeLabels={{h:'', m: '', s: ''}}
          onFinish={() => {
            updateTime();
            resetCountDown();
            alert('Your Timer is Finished! Time to take a break!')
          }}
          onPress = {() => {
            if (!start) {
              if (time >= 7200) {
                setTime(prevtime => prevtime * 0)
              } else {
                setTime(prevtime => prevtime + 900)}
              }
            }
          }
        />

        <TouchableOpacity
            onPress={() => {
              if (time == 0) {
                alert("Set Time to Start Studying")
              } else {
                if (start) {
                  Alert.alert("Warning!", "Are you sure you want to Give Up ?", [
                    {text: 'Cancel', onPress: () => {}},
                    {text: 'Confirm ', onPress: () => resetCountDown()}
                  ])
                } else {
                  setStart(true)
                  enableKeepAwake();
                  setText('Give Up');
                }
              }
            }}
            style={styles.start}
        > 
          <Text style={styles.startText}>{text}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.header}>Today's To-Do List</Text>

      <ScrollView style={styles.todo}>
      {tasks.filter((task) => !task.checked).length === 0 ? ( // Check if there are any unchecked tasks
          <Text style={styles.noTasksText}>No tasks today!</Text>
        ) : (
          tasks
            .filter((task) => !task.checked) // Filter out the checked tasks
            .map((task, index) => (
              <Card key={task.id} style={index !== 0 && styles.taskGap}>
                <Card.Content>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text>{task.text}</Text>
          </View>
        </Card.Content>
      </Card>
    ))
  )}
  </ScrollView>

        <TouchableOpacity 
          style={styles.addbutton}
          onPress={() => {navigation.navigate("Todolist")}}
        >
          <Icon
            name="add"
            color={'black'}
          />
          <Text style={styles.addText}> add to-do</Text>
        </TouchableOpacity>

      </ScrollView>
    )
  }
  
  export default HomeScreen;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:'white'
    },

    title: {
      paddingLeft: 25,
      alignSelf:"flex-start",
      color: 'black',
      fontWeight: '600',
      fontSize: 27,
      marginTop: 10,
      marginBottom: 5
    },

    subtitle: {
      paddingLeft: 25,
      alignSelf:"flex-start",
      color: '#800080',
      fontWeight: '300',
      fontSize: 15,
      marginBottom: 15,
    },

    countdown: {
      padding: 20,
      backgroundColor: "#EFDCF9",
      borderRadius: 50/2,
      justifyContent: 'center',
      alignSelf: 'center',
      alignItems: 'center',
      width: '90%'
    },

    text: {
      textAlign: 'center',
      marginTop: 10,
      marginBottom: 50,
    },

    header: {
      paddingLeft: 25,
      alignSelf:"flex-start",
      color: 'black',
      fontWeight: '500',
      fontSize: 17,
      marginTop: 10,
      marginBottom: 10,
    },

    todo: {
      alignSelf: 'center',
      padding: 20,
      marginBottom: 10,
      backgroundColor: "#EFDCF9",
      borderRadius: 50/2,
      width: '90%',
    },

    start: {
      width: '40%',
      padding: 10,
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 30,
      backgroundColor: '#800080',
      borderRadius: 5
    },

    startText: {
      color: 'white',
      fontWeight: '500',
      fontSize: 16,
    }, 

    addbutton: {
      backgroundColor: '#EDEDED',
      flexDirection: 'row',
      alignItems: 'center',
      width: '30%',
      padding: 5,
      borderRadius: 20,
      marginLeft: 20,
    },

    addText: {
      color:'black',
      borderRadius: 12
    },

    date: {
      paddingLeft: 25,
      alignSelf: "flex-start",
      color: 'black',
      fontWeight: '500',
      fontSize: 20,
      marginBottom: 10,
    },

    taskGap: {
      marginTop: 10,
    }
  })