import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Agenda } from 'react-native-calendars';
import { Card, Avatar } from 'react-native-paper';
import { auth, db } from '../firebase';

const timeToString = (time) => {
  const date = new Date(time);
  return date.toISOString().split('T')[0];
};

const PlannerScreen = () => {
  const [items, setItems] = useState({});
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [username, setUsername] = useState('');

 // Fetch tasks from the "Tasks" collection for the current user
const fetchTaskTexts = async () => {
  try {
    const taskTextsSnapshot = await db
      .collection('users')
      .doc(auth.currentUser?.uid)
      .collection('Tasks')
      .get();

    const taskTexts = [];
    taskTextsSnapshot.forEach((taskTextDoc) => {
      const taskTextData = taskTextDoc.data();
      taskTexts.push(taskTextData.text);
    });

    return taskTexts;
  } catch (error) {
    console.log('Error fetching task texts:', error);
    return [];
  }
};

  useEffect(() => {
    var date = new Date().getDate(); //Current Date
    var month = new Date().getMonth() + 1; //Current Month
    var year = new Date().getFullYear(); //Current Year
    var hours = new Date().getHours(); //Current Hours
    var min = new Date().getMinutes(); //Current Minutes
    var sec = new Date().getSeconds(); //Current Seconds
    setCurrentDate(year + '-' + month + '-' + date);
    setCurrentTime(hours + ':' + min + ':' + sec);

    fetchTaskTexts();
  }, []);

  const loadItems = async (day) => {
    try {
      const fetchedTaskTexts = await fetchTaskTexts();
  
      setTimeout(() => {
        setItems((prevItems) => {
          const newItems = { ...prevItems };
  
          // Define the range of dates for which to create agenda items
          const startDate = new Date(2023, 0, 1); // Start date (January 1, 2023)
          const endDate = new Date(2023, 11, 31); // End date (December 31, 2023)
  
          // Iterate over the range of dates
          let currentDate = new Date(startDate);
          while (currentDate <= endDate) {
            const strTime = timeToString(currentDate.getTime());
            if (!newItems[strTime]) {
              newItems[strTime] = [];
              for (let j = 0; j < fetchedTaskTexts.length; j++) {
                const taskText = fetchedTaskTexts[j];
                const itemName = `Task: ${taskText} (${formatDate(strTime)})`;
                newItems[strTime].push({
                  name: itemName,
                  height: Math.max(50, Math.floor(Math.random() * 150)),
                  taskText: taskText,
                  // Add other properties of the agenda item as needed
                });
              }
            }
            currentDate.setDate(currentDate.getDate() + 1);
          }
  
          return newItems;
        });
      }, 1000);
    } catch (error) {
      console.log('Error loading items:', error);
    }
  };
  
  

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const renderItem = (item) => {
    return (
      <TouchableOpacity style={{ marginRight: 10, marginTop: 17 }}>
        <Card>
          <Card.Content>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text>{item.name}</Text>
              <Avatar.Text label="J" />
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Agenda
        items={items}
        loadItemsForMonth={loadItems}
        selected={currentDate}
        renderItem={renderItem}
      />
    </View>
  );
};

export default PlannerScreen;

const styles = StyleSheet.create({});
