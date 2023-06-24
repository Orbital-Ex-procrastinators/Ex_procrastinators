import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { TouchableOpacity } from 'react-native-gesture-handler';

const InsightScreen = () => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    console.warn("A date has been picked: ", date);
    hideDatePicker();
  };

  return (<View style = {{flex: 1, justifyContent:'center',alignItems:'Center'}}>
    <TouchableOpacity 
      style={{
        width:'50%', 
        height: 50,
        borderWidth:.5,
        borderRadius:20,
        alignSelf:'center',
        justifyContent:'center',
        alignItems:'center'
        }}
          onPress={() => {
            showDatePicker();
          }}>
      <Text>Select Date</Text>
    </TouchableOpacity>
    
    </View>
  )
}

export default InsightScreen

const styles = StyleSheet.create({})