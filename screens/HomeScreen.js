import { useNavigation } from '@react-navigation/core'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import CountDown from 'react-native-countdown-component'
import { SafeAreaView } from 'react-native-safe-area-context'
import { auth, db} from '../firebase'
import { Icon, Slider} from 'react-native-elements'
import { ScrollView } from 'react-native-gesture-handler'
import { Avatar, Card } from 'react-native-paper'

const HomeScreen = () => {
  const [time, setTime] = useState(0)
  const [start, setStart] = useState(false)
  const [text, setText] = useState('Start')
  const [username, setUsername] = useState('')
  const[tasks, setTasks] = useState([])

  const navigation = useNavigation();

  useEffect(() => {
    db.collection('users').doc(auth.currentUser?.uid).get().then( doc => [
      setUsername(doc.data().username)
    ])
  })

    return ( 
      <ScrollView style={styles.container}>

        <Text style={styles.title}>Welcome Back, {username}!</Text>
        <Text style={styles.subtitle}>Let's Start Tracking...</Text>
        <Text style={styles.header}>Study Timer</Text>

        <View style={styles.countdown}>
        <CountDown
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
            // store time into firebase
            setStart(false)
            setText('Start')
            alert('Your Timer is Finished! Time to take a break!')
          }
          }
        />
        <Slider
          style={{width: 200, height: 40}}
          thumbStyle={{ height: 10, width: 10, backgroundColor: 'purple'}}
          minimumValue={0}
          maximumValue={100}
          step={1}
          minimumTrackTintColor="#800080"
          maximumTrackTintColor="white"
          value={time}
          onValueChange={value => setTime(value)}
        />
        <Text>{time}</Text>
        <TouchableOpacity
            onPress={() => {
              setStart(!start)
              if (start) {
                setText('Start')
              } else {
                setText('Stop')
              }
            }
            }
            style={styles.start}
        > 
          <Text style={styles.startText}>{text}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.header}>Today's To-Do List</Text>

        <ScrollView style={styles.todo}>
        <Card>
          <Card.Content>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Text>HomeWork</Text>
              <Avatar.Text label="J" />
            </View>
          </Card.Content>
        </Card>
        </ScrollView> 

        <TouchableOpacity 
          style={styles.addbutton}
          onPress={() => {navigation.navigate("Planner")}}
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
      width: '30%',
      padding: 15,
      borderRadius: 20,
      alignItems: 'center',
      marginTop: 10,
    },

    startText: {
      color: '#800080',
      fontWeight: '700',
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
      borderRadius: '12'
    }
  })