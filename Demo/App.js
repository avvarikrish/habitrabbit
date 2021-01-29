/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Button,
  Alert,
  TextInput,
  AsyncStorage,
} from 'react-native';

import { Login } from './Login.js';
import { Home } from './Home.js';
import { NavigationContainer, } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';
import AppleHealthKit from 'rn-apple-healthkit';

const Stack = createStackNavigator();
const testIDs = require('./testIDs');
const PERMS = AppleHealthKit.Constants.Permissions;
const Tab = createBottomTabNavigator();
export class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      Weight: false,
      Height: false,
      DateOfBirth: false,
      Steps: false,
      items: {'2021-01-20': [{name: 'test'}]},
      userToken: false,
      username: "",
      password: "",
      text: "asdfasdf",

    };
    this.loginHandler = this.loginHandler.bind(this);
    this.signupHandler = this.signupHandler.bind(this);
  }

  loginHandler(username, password) {
    fetch("http://127.0.0.1:5000/users/login-user", 
    {
      method: "POST",
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    })
      .then((response) => {
        console.log(response)
        if (response["status"] == 200) {
          this.setState({userToken: true})
        } else {
          Alert.alert("Invalid Username or Password");
        }
      })
      .catch((error) => {
        console.error(error);
      });

    // this.setState({userToken: true})
  }

  signupHandler(username, first_name, last_name, password){
    fetch("http://127.0.0.1:5000/users/create-user", 
    {
      method: "POST",
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        first_name: first_name,
        last_name: last_name,
        password: password
      })
    })
      .then((response) => {
        console.log(response)
        if (response["status"] == 200) {
          this.setState({userToken: true})
        } else {
          Alert.alert("Invalid Sign Up");
        }
      })
      .catch((error) => {
        console.error(error);
      });
    console.log(username, first_name, last_name, password);
  }

  SignIn() {
    return(
      <Login loginHandler = {this.loginHandler} signupHandler = {this.signupHandler}/>
    );
  }

  MainPage() {
    return(
      <Home/>
    );
  }

  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          {this.state.userToken == false ? (
            <Stack.Screen name = "Login" component={this.SignIn.bind(this)} options = {{headerShown: false}}/>
          ) : (
            <Stack.Screen name = " " component={this.MainPage}/>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

const styles = StyleSheet.create({
    loginScreen: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollView: {
      backgroundColor: '#FFF',
    },
    body: {
      backgroundColor: '#FFF',
    },
    sectionContainer: {
      marginTop: 32,
      paddingHorizontal: 24,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: '600',
      color: '#000',
    },
    sectionDescription: {
      marginTop: 8,
      fontSize: 18,
      fontWeight: '400',
      color: '#555',
    },
    sectionDescriptionError: {
      marginTop: 8,
      fontSize: 18,
      fontWeight: '400',
      color: '#A00000'
    },
    item: {
      backgroundColor: 'white',
      flex: 1,
      borderRadius: 5,
      padding: 10,
      marginRight: 10,
      marginTop: 17
    },
    emptyDate: {
      height: 15,
      flex: 1,
      paddingTop: 30
    }
  });


export default App;