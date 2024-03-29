import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { db, auth } from '../firebase';
import { useNavigation } from '@react-navigation/core';
import DateTimePickerModal from 'react-native-modal-datetime-picker';


const TodoListScreen = () => {
  const [todoList, setTodoList] = useState([]);
  const [todoText, setTodoText] = useState('');
  const currentDate = new Date().toLocaleDateString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  
  const user = auth.currentUser;
  const navigation = useNavigation();

  const [todaySelected, setTodaySelected] = useState(true);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState('Select Date');

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    console.warn("A date has been picked: ", date);
    const dt = new Date(date);
    const x = dt.toISOString().split("T");
    const x1 = x[0].split('-');
    console.log(x1[2] + '/' + x1[1] + '/' + x1[0]);
    setSelectedDate(x1[2] + '/' + x1[1] + '/' + x1[0]);
    hideDatePicker();
    setTodaySelected(false);
  };

  useEffect(() => {
    if (user) {
      const userRef = db.collection('users').doc(user.uid);
      const unsubscribe = userRef.collection('Tasks').onSnapshot((snapshot) => {
        const tasksData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTodoList(tasksData);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const addTodo = () => {
    if (todoText && user) {
      if (todaySelected || selectedDate !== 'Select Date') {
        const userRef = db.collection('users').doc(user.uid);
        const taskDate = todaySelected ? currentDate : selectedDate;
        userRef
          .collection('Tasks')
          .add({
            text: todoText,
            checked: false,
            date: taskDate,
          })
          .then(() => {
            setTodoText('');
            if (!todaySelected) {
              setSelectedDate('Select Date');
            }
            setTodaySelected(true);
          })
          .catch((error) => {
            console.log('Error adding task:', error);
          });
      } else {
        // Handle the case where "Select Date" is not a valid date
        // You can display an error message or prompt the user to select a valid date
        console.log('Please select a valid date');
      }
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

  const renderTaskItem = (task) => {
    return (
      <TouchableOpacity
        key={task.id}
        style={[
          styles.taskContainer,
          { backgroundColor: task.date === currentDate ? '#fff' : '#fff' },
        ]}
        onPress={() => toggleCheck(task.id, task.checked)}
      >
        <Text
          style={[
            styles.todoText,
            { textDecorationLine: task.checked ? 'line-through' : 'none' },
          ]}
        >
          {task.text}
        </Text>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            onPress={() => deleteTodo(task.id)}
            style={styles.deleteButton}
          >
            <Icon name="delete" size={24} color="#800080" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => toggleCheck(task.id, task.checked)}
            style={styles.checkButton}
          >
            <Icon
              name={task.checked ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color="#800080"
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTaskGroup = (tasks, date) => {
    return (
      <View key={date}>
        <View style={styles.dateContainer}>
          <Text style={styles.date}>{date}</Text>
        </View>
        {tasks.map((task) => renderTaskItem(task))}
      </View>
    );
  };

  const renderTodoList = () => {
    const groupedTasks = {};
  
    todoList.forEach((task) => {
      if (!groupedTasks[task.date]) {
        groupedTasks[task.date] = [task];
      } else {
        groupedTasks[task.date].push(task);
      }
    });
  
    const sortedGroupedTasks = Object.entries(groupedTasks).sort(
      (a, b) => {
        const dateA = new Date(
          a[0].split('/').reverse().join('-')
        );
        const dateB = new Date(
          b[0].split('/').reverse().join('-')
        );
        return dateB - dateA;
      }
    );
  
    return sortedGroupedTasks
      .reverse() // Reverse the order of task groups
      .map(([date, tasks]) => renderTaskGroup(tasks, date));
  };
  
  
  const handleTodayPress = () => {
    setTodaySelected(true);
    setSelectedDate('Select Date'); 
  };

  const handleSelectDatePress = () => {
    setTodaySelected(false);
  };


  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Icon name="create" size={24} color="#800080" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={todoText}
          onChangeText={setTodoText}
          placeholder="Add a task..."
        />
        <TouchableOpacity style={styles.addButton} onPress={addTodo}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonRow}>
        <Icon name="today" size={24} color="#800080" style={styles.Icon} />
        <TouchableOpacity
          style={[
            styles.button,
            todaySelected ? styles.buttonSelected : null,
          ]}
          onPress={handleTodayPress}
        >
          <Text
            style={[
              styles.buttonText,
              todaySelected ? styles.buttonTextSelected : null,
            ]}
          >
            Today
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            !todaySelected ? styles.buttonSelected : null,
          ]}
          onPress={() => {
            showDatePicker();
          }}>

          <Text
            style={[
              styles.buttonText,
              !todaySelected ? styles.buttonTextSelected : null,
            ]}
          >
            {selectedDate}
          </Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {renderTodoList()}
      </ScrollView>
    </View>
  );
};


export default TodoListScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  icon: {
    marginRight: 5,
  },

  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 17,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',

  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 5,
  },
  addButton: {
    marginLeft: 2,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#800080',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 0,
    marginBottom: 16,
  },
  button: {
    flex: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#800080',
    marginHorizontal: 3,
  },
  buttonText: {
    color: '#800080',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonSelected: {
    backgroundColor: '#80008033',
  },
  buttonTextSelected: {
    color: '#800080',
  },
  scrollContainer: {
    paddingBottom: 16,
  },
  dateContainer: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#808080',
  },

  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  todoText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
  deleteButton: {
    paddingHorizontal: 8,
  },
  checkButton: {
    paddingHorizontal: 8,
  },

  Icon: {
    marginRight: 5,
  },
});