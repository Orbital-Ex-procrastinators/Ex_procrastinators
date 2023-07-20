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
      taskTexts.push(taskTextData);
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

  useEffect(() => {
    console.log('Current Date:', currentDate);
    const formattedDate = formatDate(currentDate);
    console.log('Formatted Date:', formattedDate);
    fetchTaskTexts();
  }, [currentDate]);

  const loadItems = async (day) => {
    try {
      const fetchedTaskTexts = await fetchTaskTexts();
      const currentDate = new Date(day.timestamp);
  
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const numDays = new Date(year + 1, month , 0).getDate();
  
      setTimeout(() => {
        setItems((prevItems) => {
          const newItems = { ...prevItems };
  
          for (let i = 1; i <= numDays; i++) {
            const targetDate = new Date(year, month, i);
            const strTargetDate = timeToString(targetDate.getTime());
  
            if (!newItems[strTargetDate]) {
              newItems[strTargetDate] = [];
            }
  
            const tasksForDate = fetchedTaskTexts.filter((taskText) => {
              if (taskText.date) {
                const [day, month, year] = taskText.date.split('/');
                const taskDate = new Date(Number(year), Number(month) - 1, Number(day) + 1);
                const strTaskDate = timeToString(taskDate.getTime());
                return strTaskDate === strTargetDate;
              }
              return false;
            });
  
            if (tasksForDate.length > 0) {
              tasksForDate.forEach((taskText) => {
                //const itemName = `Task: ${taskText.text} (${formatDate(strTargetDate)})`;
                const itemName = `${taskText.text}`;
                newItems[strTargetDate].push({
                  name: itemName,
                  height: Math.max(50, Math.floor(Math.random() * 150)),
                  taskText: taskText.text,
                  // Add other properties of the agenda item as needed
                });
              });
            } else {
              const itemName = `No task`;
              newItems[strTargetDate].push({
                name: itemName,
                height: Math.max(50, Math.floor(Math.random() * 150)),
                taskText: itemName,
                // Add other properties of the agenda item as needed
              });
            }
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
