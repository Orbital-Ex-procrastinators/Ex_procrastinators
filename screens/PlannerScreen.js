import { StyleSheet, Text, View, TouchableOpacity} from 'react-native'
import React from 'react'
import { useState } from 'react';
import { Agenda } from 'react-native-calendars';
import {Card, Avatar} from 'react-native-paper';
import { useEffect } from 'react';


const timeToString = (time) => {
  const date = new Date(time);
  return date.toISOString().split('T')[0];
};

const PlannerScreen = () => {
  const [items, setItems] = useState({});
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    var date = new Date().getDate(); //Current Date
    var month = new Date().getMonth() + 1; //Current Month
    var year = new Date().getFullYear(); //Current Year
    var hours = new Date().getHours(); //Current Hours
    var min = new Date().getMinutes(); //Current Minutes
    var sec = new Date().getSeconds(); //Current Seconds
    setCurrentDate(
      year + '-' + month + '-' + date
    );
    setCurrentTime(
      hours + ':' + min + ':' + sec
    )
  }, []);

  const loadItems = (day) => {
    setTimeout(() => {
      for (let i = -15; i < 85; i++) {
        const time = day.timestamp + i * 24 * 60 * 60 * 1000;
        const strTime = timeToString(time);
        if (!items[strTime]) {
          items[strTime] = [];
          const numItems = Math.floor(Math.random() * 3 + 1);
          for (let j = 0; j < numItems; j++) {
            items[strTime].push({
              name: 'Item for ' + strTime + ' #' + j,
              height: Math.max(50, Math.floor(Math.random() * 150)),
            });
          }
        }
      }
      const newItems = {};
      Object.keys(items).forEach((key) => {
        newItems[key] = items[key];
      });
      setItems(newItems);
    }, 1000);
  }

  const renderItem = (item) => {
    return (
      <TouchableOpacity style={{marginRight: 10, marginTop: 17}}>
        <Card>
          <Card.Content>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Text>{item.name}</Text>
              <Avatar.Text label="J" />
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };


  return (
    <View style={{flex: 1}}>
      <Agenda
        items={items}
        loadItemsForMonth={loadItems}
        selected={currentDate}
        renderItem={renderItem}
      />
    </View>
  )
}

export default PlannerScreen;

const styles = StyleSheet.create({})