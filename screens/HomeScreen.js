import { useNavigation } from '@react-navigation/core'
import React, { useEffect, useRef, useState } from 'react'
import { AppState, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import CountDown from 'react-native-countdown-component'
import { auth, db} from '../firebase'
import { Icon } from 'react-native-elements'
import { ScrollView } from 'react-native-gesture-handler'
import { Card } from 'react-native-paper'
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
  const [tasks, setTasks] = useState([])
  const navigation = useNavigation();
  const [currentDate, setCurrentDate] = useState('');
  const user = auth.currentUser;

  useEffect(() => {
    const getCurrentDate = () => {
      const date = new Date().getDate();
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();
      return `${year}-${month}-${date}`;
    };
  
    const currentDate = getCurrentDate(); // Get the current date
    setCurrentDate(currentDate); // Set the current date in state
  
    // Check if currentDate is valid before proceeding
    if (!currentDate) {
      return; // Exit early if currentDate is empty or undefined
    }
  
    const docRef = db.collection('users').doc(auth.currentUser?.uid);
    const datesDocRef = docRef.collection('Dates').doc(currentDate);
  
    datesDocRef.get().then((docSnapshot) => {
      if (docSnapshot.exists) {
        // setTotalTime
        setTotalTime(docSnapshot.data().time);
      } else {
        docRef.collection('Dates').doc(currentDate).set({
          date: currentDate,
          time: 0,
        });
      }
    }).catch(error => alert(error));
  
  }, [currentDate]); // Add "currentDate" to the dependency array

  useEffect(() => {
    const doc = db.collection('users').doc(auth.currentUser?.uid);
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
        setText('Start');
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
    var date = new Date().getDate(); // Current Date
    var month = new Date().getMonth() + 1; // Current Month
    var year = new Date().getFullYear(); // Current Year
    
    // Format the day and month with leading zeros if necessary
    var formattedDay = String(date).padStart(2, '0');
    var formattedMonth = String(month).padStart(2, '0');

    const formattedDate = `${formattedDay}/${formattedMonth}/${year}`;
      
      //console.log('Formatted Date:', formattedDate); // Log the formatted date
    
      const unsubscribe = db
        .collection('users')
        .doc(auth.currentUser?.uid)
        .collection('Tasks')
        .where('date', '==', formattedDate)
        .onSnapshot((snapshot) => {
          const tasksData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTasks(tasksData);
        });
  
    return () => unsubscribe();
  }, []);
  
  const toggleCheck = (taskId, checked) => {
    if (user) {
      const userRef = db.collection('users').doc(user.uid);
      userRef
        .collection('Tasks')
        .doc(taskId)
        .update({
          checked: !checked,
        })
        .then(() => {
          console.log('Task updated successfully');
        })
        .catch((error) => {
          console.log('Error updating task:', error);
        });
    }
  };

  const deleteTodo = (taskId) => {
    if (user) {
      const userRef = db.collection('users').doc(user.uid);
      userRef
        .collection('Tasks')
        .doc(taskId)
        .delete()
        .then(() => {
          console.log('Task deleted successfully');
        })
        .catch((error) => {
          console.log('Error deleting task:', error);
        });
    }
  };

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
      time: currentTotal() //check
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
        {tasks.filter((task) => !task.checked).length === 0 ? (
          <Text style={styles.noTasksText}>No tasks today!</Text>
        ) : (
          tasks
            .filter((task) => !task.checked)
            .map((task) => (
              <Card key={task.id} style={styles.taskCard}>
                <Card.Content>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TouchableOpacity
                        onPress={() => {
                          toggleCheck(task.id, task.checked);
                        }}
                      >
                        <Icon
                          name={
                            task.checked
                              ? 'check-box'
                              : 'check-box-outline-blank'
                          }
                          size={24}
                          color={task.checked ? 'green' : '#800080'}
                        />
                      </TouchableOpacity>
                      <Text style={{ marginLeft: 8 }}>{task.text}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        deleteTodo(task.id);
                      }}
                    >
                      <Icon name="delete" size={24} color="#800080" />
                    </TouchableOpacity>
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
    },
    taskCard: {
      marginBottom: 10,
      padding: 2,
      backgroundColor: '#F0F0F0',
      borderRadius: 10,
    },
  })