import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {
    DrawerContentScrollView,
    DrawerItem
  } from '@react-navigation/drawer';
import {
    useTheme,
    Title,
    Caption,
    Paragraph,
    Drawer,
    TouchableRipple
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { auth } from '../firebase'
import { useNavigation } from '@react-navigation/core'

export function DrawerContents(props) {
    const navigation = useNavigation()

    const handleSignOut = () => {
        auth
        .signOut()
        .then(() => {
            navigation.navigate("Splash")
        })
        .catch(error => alert(error.message))
    }

    return (
        <View style={{flex:1}}>
           <DrawerContentScrollView>
           <Drawer.Section style={styles.drawerSection}>
            <DrawerItem 
                icon={({color, size}) => (
                    <Icon 
                    name="account-tie" 
                    color={color}
                    size={size}
                    />
                )}
                label="Profile"
                onPress={() => {props.navigation.navigate('Profile')}}
            />
            <DrawerItem 
                icon={({color, size}) => (
                    <Icon 
                    name="home-outline" 
                    color={color}
                    size={size}
                    />
                )}
                label="Home"
                onPress={() => {props.navigation.navigate('Home')}}
            />
            <DrawerItem 
                icon={({color, size}) => (
                    <Icon 
                    name="chart-line" 
                    color={color}
                    size={size}
                    />
                )}
                label="Insights"
                onPress={() => {props.navigation.navigate('Insight')}}
            />
            <DrawerItem 
                icon={({color, size}) => (
                    <Icon 
                    name="view-list" 
                    color={color}
                    size={size}
                    />
                )}
                label="To do list"
                onPress={() => {props.navigation.navigate('Todolist')}}
            />
            </Drawer.Section>
            </DrawerContentScrollView> 
            <Drawer.Section style={styles.bottomDrawerSection}>
            <DrawerItem
                icon={({color, size}) => (
                    <Icon 
                    name="exit-to-app" 
                    color={color}
                    size={size}
                    />
                )}
                label="Sign Out"
                onPress={handleSignOut}
            />
            </Drawer.Section>
        </View>
    );
}

const styles = StyleSheet.create({
    drawerSection: {
        marginTop: 15,
    },
    
    bottomDrawerSection: {
        marginBottom: 15,
        borderTopColor: '#f4f4f4',
        borderTopWidth: 1
    },
})