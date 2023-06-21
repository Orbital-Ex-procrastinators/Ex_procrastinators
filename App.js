import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { Settings, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import { DrawerContents } from './screens/DrawerContents';
import PlannerScreen from './screens/PlannerScreen';
import InsightScreen from './screens/InsightScreen';
import ProfileScreen from './screens/ProfileScreen';
import SplashScreen from './screens/SplashScreen';
import SignupScreen from './screens/SignupScreen';
import LeaderBoard from './screens/LeaderBoard';
import TodoListScreen from './screens/ToDoListScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const Nested = createNativeStackNavigator();

function DrawerRoutes() {
  return (
    <Drawer.Navigator drawerContent={props => <DrawerContents {...props} />}>
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Profile" component={ProfileRoutes} />
      <Drawer.Screen name="Planner" component={PlannerScreen}/>
      <Drawer.Screen name="Insight" component={InsightScreen} />
      <Drawer.Screen name="Todolist" component={TodoListScreen} />
    </Drawer.Navigator>
  )
}
function ProfileRoutes() {
  return ( 
  <Nested.Navigator>
    <Nested.Screen options={{ headerShown: false }} name="Profile" component={ProfileScreen}/>
    <Nested.Screen name="Planner" component={PlannerScreen}/>
    <Nested.Screen name="LeaderBoard" component={LeaderBoard}/>
  </Nested.Navigator>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen options={{ headerShown: false }} name="Splash" component={SplashScreen} />
        <Stack.Screen options={{ headerShown: false }} name="Login" component={LoginScreen} />
        <Stack.Screen options={{ headerShown: false }} name="Signup" component={SignupScreen} />
        <Stack.Screen options={{ headerShown: false }} name="Routes" component={DrawerRoutes} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Drawer" component={DrawerContents}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
