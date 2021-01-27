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
} from 'react-native';

import { NavigationContainer, } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';
import AppleHealthKit from 'rn-apple-healthkit';

export class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    //   userToken: false,
      username: "",
      password: "",
    //   text: "asdfasdf",
    };
    }



  render() {
    return(
        <View >
            <TextInput
                placeholder="Username"
                value={this.state.username}
                onChangeText={(text) => this.setState({username: text})}
            />
            <TextInput
                placeholder="Password"
                value={this.state.password}
                onChangeText={(text) => this.setState({password: text})}
                secureTextEntry
            />
            <Button
                onPress = {() => this.props.loginAuth(this.state.username, this.state.password)}
                title="Sign In"
                color="blue"
            />
            <TextInput
                style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                // onChangeText={(text) => this.setState({text: text})}
                // value={this.state.text}
            />
        
        </View>
    
    
    );
    }
}

const styles = StyleSheet.create({
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


export default Login;