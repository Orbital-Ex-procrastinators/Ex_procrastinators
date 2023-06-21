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

const TodoListScreen = () => {
  const [todoList, setTodoList] = useState([]);
  const [todoText, setTodoText] = useState('');
  const currentDate = new Date().toLocaleDateString();
  const user = auth.currentUser;
  const navigation = useNavigation();

  useEffect(() => {
    if (user) {
      const userRef = db.collection('users').doc(user.uid);
      const unsubscribe = userRef
        .collection('Tasks') 
        .onSnapshot((snapshot) => {
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
      const userRef = db.collection('users').doc(user.uid);
      userRef
        .collection('Tasks')
        .add({
          text: todoText,
          checked: false,
        })
        .then(() => {
          setTodoText('');
        })
        .catch((error) => {
          console.log('Error adding task:', error);
        });
    }
  };

  const deleteTodo = (index) => {
    if (user) {
      const task = todoList[index];
      const userRef = db.collection('users').doc(user.uid);
      userRef
        .collection('Tasks') 
        .doc(task.id)
        .delete()
        .then(() => {
          console.log('Task deleted successfully');
        })
        .catch((error) => {
          console.log('Error deleting task:', error);
        });
    }
  };

  const toggleCheck = (index) => {
    if (user) {
      const task = todoList[index];
      const userRef = db.collection('users').doc(user.uid);
      userRef
        .collection('Tasks') 
        .doc(task.id)
        .update({
          checked: !task.checked,
        })
        .then(() => {
          console.log('Task updated successfully');
        })
        .catch((error) => {
          console.log('Error updating task:', error);
        });
    }
  };

return (
  <View style={styles.container}>
    <Text style={styles.date}>{currentDate}</Text>
    <View style={styles.inputContainer}>
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
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {todoList.map((todo, index) => (
        <View key={index} style={styles.todoItem}>
          <TouchableOpacity
            onPress={() => toggleCheck(index)}
            style={styles.checkButton}
          >
            <Icon
              name={todo.checked ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color="#800080"
            />
          </TouchableOpacity>
          <Text
            style={[
              styles.todoText,
              { textDecorationLine: todo.checked ? 'line-through' : 'none' },
            ]}
          >
            {todo.text} {/* Display the task text */}
          </Text>
          <TouchableOpacity
            onPress={() => deleteTodo(index)}
            style={styles.deleteButton}
          >
            <Icon name="delete" size={24} color="#800080" />
          </TouchableOpacity>
        </View>
      ))}
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
  date: {
    fontSize: 25,
    fontWeight: 'bold',
    marginVertical: 10,
    marginHorizontal: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
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
  },
  addButton: {
    marginLeft: 12,
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
  scrollContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkButton: {
    padding: 8,
  },
  todoText: {
    flex: 1,
    fontSize: 16,
    color: '#414d63',
  },
  deleteButton: {
    padding: 8,
  },
});
