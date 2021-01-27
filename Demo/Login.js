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
  Modal,
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
        usernameLogin: "",
        passwordLogin: "",
        usernameSignup: "",
        passwordSignup: "",
        passwordSignupVerify: "",
        firstName: "",
        lastName: "",
        modalVisible: false,
        //   text: "asdfasdf",
        };

    this.modalOpen = this.modalOpen.bind(this);
    this.modalClose = this.modalClose.bind(this);
    this.signup = this.signup.bind(this);

    }

    signup(){

        if (this.state.passwordSignup != this.state.passwordSignupVerify) {
            Alert.alert("Passwords do not match.")
        }
        else{
            this.props.signupHandler(this.state.usernameSignup, this.state.firstName, this.state.lastName, this.state.passwordSignup);
        }

    }

    modalOpen() {
        this.setState({modalVisible: true});
    }

    modalClose() {
        this.setState({modalVisible: false});
    }


    render() {
        return(
            <View style = {styles.loginScreen}>
                <Text style = {styles.title}>Habit Rabbit</Text>
                <TextInput
                    autoCaptialize = {"none"}
                    style = {styles.userInputStyle1}
                    placeholder="Email"
                    value={this.state.usernameLogin}
                    onChangeText={(text) => this.setState({usernameLogin: text})}
                />
                <TextInput
                    style = {styles.userInputStyle1}
                    placeholder="Password"
                    value={this.state.passwordLogin}
                    onChangeText={(text) => this.setState({passwordLogin: text})}
                    secureTextEntry
                />
                <TouchableOpacity
                    style = {styles.signinButton}
                    onPress = {() => this.props.loginHandler(this.state.usernameLogin, this.state.passwordLogin)}
                >
                    <Text style={styles.signinText}>
                        Sign In
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress = {this.modalOpen}
                    style = {styles.signupModalRedirect}
                >
                    <Text style = {styles.signupText}>
                        Don't have an account? Sign Up
                    </Text>
                </TouchableOpacity>
                <Modal
                    animationType="slide"
                    visible={this.state.modalVisible}
                    
                >
                    <View style = {styles.modalTopBlock}/>
                    <View style={styles.modalScreen}>
                        <TextInput
                            style = {styles.userInputStyle1}
                            placeholder="Email"
                            value={this.state.usernameSignup}
                            onChangeText={(text) => this.setState({usernameSignup: text})}
                        />
                        <TextInput
                            style = {styles.userInputStyle1}
                            placeholder="First Name"
                            value={this.state.firstName}
                            onChangeText={(text) => this.setState({firstName: text})}
                        />
                        <TextInput
                            style = {styles.userInputStyle1}
                            placeholder="Last Name"
                            value={this.state.lastName}
                            onChangeText={(text) => this.setState({lastName: text})}
                        />
                        <TextInput
                            style = {styles.userInputStyle1}
                            placeholder="Password"
                            value={this.state.passwordSignup}
                            onChangeText={(text) => this.setState({passwordSignup: text})}
                            secureTextEntry
                        />
                        <TextInput
                            style = {styles.userInputStyle1}
                            placeholder="Re-enter Password"
                            value={this.state.passwordSignupVerify}
                            onChangeText={(text) => this.setState({passwordSignupVerify: text})}
                            secureTextEntry
                        />
                        <TouchableOpacity
                            style = {styles.signupButton}
                            onPress = {this.signup}
                        >
                            <Text style={styles.signinText}>Sign Up</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress = {this.modalClose}
                            style = {styles.signupModalRedirect}
                        >
                            <Text style = {styles.signupText}>
                                Already have an account? Sign In
                            </Text>
                        </TouchableOpacity>
                    </View>

                </Modal>
            
            </View>
        
        
        );
        }
}

const styles = StyleSheet.create({
    modalTopBlock: {
        height: "20%",
        backgroundColor: "#024878",
        marginBottom: "10%",
    },
    title: {
        fontSize: 40,
        marginBottom: "30%",
        fontFamily: "Avenir-Light",
    },
    signupModalRedirect: {
        marginTop: 10,
    },
    signupButton: {
        width: "70%",
        height: "6%",
        backgroundColor: "#024878",
        borderRadius: 10,
        paddingTop: "3%",
    },
    signupText: {
        fontSize: 12,
        color: "blue",
    },
    signinButton: {
        width: "70%",
        height: "5%",
        backgroundColor: "#024878",
        borderRadius: 10,
        paddingTop: "3%",
    },
    signinText: {
        textAlign: "center",
        color: "white",
    },
    userInputStyle1: {
        height: "5%",
        width: "75%",
        borderBottomColor: "#024878",
        borderBottomWidth: 2,
        marginBottom: "10%",
    },
    userInputStyle2: {
        height: 50,
        width: 300,
        borderWidth: 1,
        borderColor: '#FF5722',
        borderRadius: 10 ,
        backgroundColor : "#FFFFFF"
    },
    loginScreen: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalScreen: {
        flex: 1,
        flexDirection: 'column',
        // justifyContent: 'center',
        alignItems: 'center',
    },
    });


export default Login;