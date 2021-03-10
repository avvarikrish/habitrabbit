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
import DatePicker from 'react-native-date-picker';
import {Picker} from '@react-native-picker/picker';
const axios = require('axios');
export class GoalInput extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
        SleepInput: "7",
        SleepGoalInput: "8",
        StepGoalInput: "10000",
        Date: new Date(),
        };

        this.scoreAndGoalInput = this.scoreAndGoalInput.bind(this);

    }

    scoreAndGoalInput() {
        // const url_add = "http://127.0.0.1:5000/scores/add-score";
        const url_add = "https://botsecure.mangocircle.com:8000/scores/add-score";
        axios.post(url_add, {
            username: this.props.username,
            sleep: parseInt(this.state.SleepInput, 10),
        }).then((response) => {
            // this.setState({ CumulativeScore: response.data.cumulative_score })
            console.log(response.data);
        }).catch((response) => {
            console.log(response);
        })

        // const url_goal = "http://127.0.0.1:5000/scores/update-goals";


        // add what time they want to wake up everyday
        const url_goal = "https://botsecure.mangocircle.com:8000/scores/update-goals";
        const goal = 
            {
                "sleep": {
                    "goal": parseInt(this.state.SleepGoalInput, 10),
                    "weight": 0.5,
                    "time": this.state.Date.getHours() + this.state.Date.getMinutes()/60,
        
                },
                "steps": {
                    "goal": parseInt(this.state.StepGoalInput, 10),
                    "weight": 0.5,
                }
            }
        axios.post(url_goal, {
            username: this.props.username, 
            goals: goal,
        }).then((response) => {
            Alert.alert("You have inputted your scores!");
            console.log(response.data);
        }).catch((response) => {
            console.log(response);
        })
    }


    render() {
        return(
            <View style = {{height: '100%'}}>
                <StatusBar barStyle="dark-content" />
                <SafeAreaView>
                <ScrollView
                    contentInsetAdjustmentBehavior="automatic"
                    style={styles.scrollView}
                >
                    <View style = {styles.todayHeader}>
                        <View style= {{backgroundColor: "#024878", width: "95%", alignItems: "center", paddingTop: "2%", paddingBottom: "2%", borderRadius: 10,}}>
                            <Text style={styles.todayText}>Input</Text>
                        </View>
                        <View style= {{flex: 1, flexDirection: "row"}}>
                        <Text style={styles.subTitle}>Amount Slept:</Text>

                            <Picker
                            selectedValue={this.state.SleepInput}
                            style={{height: "30%", width: 100,}}
                            onValueChange={(itemValue, itemIndex) => this.setState({SleepInput: itemValue})}
                            >
                                <Picker.Item label="0" value= "0" />
                                <Picker.Item label="1" value= "1" />
                                <Picker.Item label="2" value= "2" />
                                <Picker.Item label="3" value= "3" />
                                <Picker.Item label="4" value= "4" />
                                <Picker.Item label="5" value= "5" />
                                <Picker.Item label="6" value= "6" />
                                <Picker.Item label="7" value= "7" />
                                <Picker.Item label="8" value= "8" />
                                <Picker.Item label="9" value= "9" />
                                <Picker.Item label="10" value= "10" />
                                <Picker.Item label="11" value= "11" />
                                <Picker.Item label="12" value= "12" />
                                <Picker.Item label="13" value= "13" />
                                <Picker.Item label="14" value= "14" />
                                <Picker.Item label="15" value= "15" />
                                <Picker.Item label="16" value= "16" />
                                <Picker.Item label="17" value= "17" />
                                <Picker.Item label="18" value= "18" />
                                <Picker.Item label="19" value= "19" />
                                <Picker.Item label="20" value= "20" />
                                <Picker.Item label="21" value= "21" />
                                <Picker.Item label="22" value= "22" />
                                <Picker.Item label="23" value= "23" />
                                <Picker.Item label="24" value= "24" />
                            </Picker>
                        </View>
                        <View style = {{flexDirection: "row"}}>
                            <Text style ={{fontSize: 20, marginRight: 10, fontFamily: "Avenir-Light",}}>
                                Sleep Goal Input:
                            </Text>
                            <TextInput
                                autoCaptialize = {"none"}
                                style = {styles.goalInput}
                                placeholder=""
                                textAlign={'center'}
                                value={this.state.SleepGoalInput}
                                onChangeText={(text) => this.setState({SleepGoalInput: text})}
                            />
                        </View>
                        <View style = {{flexDirection: "row", marginTop: 20}}>
                            <Text style ={{fontSize: 20, marginRight: 20, fontFamily: "Avenir-Light",}}>
                                Step Goal Input:
                            </Text>
                            <TextInput
                                autoCaptialize = {"none"}
                                style = {styles.goalInput}
                                placeholder=""
                                textAlign={'center'}
                                value={this.state.StepGoalInput}
                                onChangeText={(text) => this.setState({StepGoalInput: text})}
                            />
                        </View>
                        <View style={{marginTop: "5%"}}>
                            <Text style = {{fontSize: 20, fontFamily: "Avenir-Light",}}>Wake Up Time:</Text>
                        </View>
                        <DatePicker
                            mode={"time"}
                            date={this.state.Date}
                            onDateChange={(day) => this.setState({ Date: day })}
                        />
                        <TouchableOpacity
                            style = {styles.signinButton}
                            onPress = {this.scoreAndGoalInput}
                        >
                            <Text style={styles.signinText}>
                                Submit
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                </SafeAreaView>
        </View>
        
        
        );
        }
}

const styles = StyleSheet.create({
    signinText: {
        textAlign: "center",
        color: "white",
        fontFamily: "Avenir-Light",
        fontSize: 17,
    },
    signinButton: {
        justifyContent: "center",
        width: "70%",
        height: "8%",
        backgroundColor: "#024878",
        borderRadius: 10,
    },
    subTitle: {
        fontFamily: "Avenir-Light",
        fontSize: 20,
        marginTop: "22%",
    },
    goalInput: {
        position: "relative",
        height: 35,
        width: "40%",
        borderColor: "#024878",
        borderRadius: 10,
        borderWidth: 2,
        // borderBottomColor: "#024878",
        // borderBottomWidth: 10,
        // marginBottom: "10%",
    },
    sleepInputModalClose: {
        alignSelf: 'flex-end',
        marginRight: '3%',
    },
    sleepInputModalPlus: {
        textAlign: 'center',
        paddingTop: 15,
        fontSize: 50,
        color: '#FFF'
    },
    sleepInputModalButtonView: {
        alignSelf: 'flex-end',
        justifyContent: 'flex-end',
        marginTop: "10%",
        marginRight: "3%",
    },
    sleepInputModalButton: {
        borderWidth: 2,
        borderColor: 'rgba(0, 0, 0, 0.2)',
        alignItems: 'center',
        width: 100,
        height: 100,
        backgroundColor: '#024878',
        borderRadius: 50,
    },
    progressBarMainText: {
        position: "absolute",
        marginTop: 14,
        marginLeft: "3%",
        color: "black",
        fontSize: 20,
        fontFamily:"Avenir-Light",
    },
    progressBarSubText: {
        position: "absolute",
        marginTop: 42,
        marginLeft: "3%",
        color: "black",
        fontFamily: "Avenir-Light",
    },
    todayText: {
        fontFamily: "Avenir-Light",
        fontSize: 30,
        color: "white"
    },
    todayHeader: {
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "5%",
    },
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        // alignItems: "center",
        height: "100%",
        // backgroundColor: "white",

    },
    progressBar: {
        flexDirection: "row",
        height: 60,
        width: "100%",
        borderWidth: 2,
        borderRadius: 20,
        borderColor: "black",

    },
    progressBarFilling: {
        borderRadius: 20, 
        backgroundColor: "#024878", 
        // width: "50%",
    },
    scrollView: {
        height: "100%",
        // backgroundColor: '#FFF',
    },
    body: {
        // backgroundColor: '#FFF',
    },
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#000',
        width: "100%",
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
        color: '#555',
        width: "100%",
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
        alignItems: 'center',
        flex: 1,
        paddingTop: 30
    }, 
    userInputStyle: {
      height: "5%", 
      width: "75%", 
      borderBottomColor: "#024878",
      borderBottomWidth: 2,
      marginBottom: "10%",
    },
    });


export default GoalInput;