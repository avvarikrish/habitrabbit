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
  Animated,
  Modal,
  DatePickerIOS,
  RefreshControl,
} from 'react-native';

import { Login } from './Login.js';
import * as Progress from 'react-native-progress';
import { NavigationContainer, } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import AppleHealthKit from 'rn-apple-healthkit';
import GoalInput from './GoalInput.js';

const axios = require('axios');
const Stack = createStackNavigator();
const testIDs = require('./testIDs');
const PERMS = AppleHealthKit.Constants.Permissions;
const Tab = createBottomTabNavigator();
const StepGoal = 10000;
const dynamicItems = {'2021-01-20': [{name: 'test'}]};
const sleepNumbers = [{ id: "sleep", label: "", min: 0, max: 24 }];

export class Home extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      Steps: false,
      StepWeight: false,
      StepGoal: false,
      items: dynamicItems,
      StepProgressBar: "",
      modalVisible: false,
      Sleep: false,
      SleepWeight: false,
      SleepGoal: false,
      SleepInput: "0",
      SleepGoalInput: "",
      modalScoreVisible: false,
      CumulativeScore: false,
      refreshing: false,
    };

    this.modalOpen = this.modalOpen.bind(this);
    this.modalClose = this.modalClose.bind(this);
    this.modalScoreOpen = this.modalScoreOpen.bind(this);
    this.modalScoreClose = this.modalScoreClose.bind(this);
    this.getAppleHealthData = this.getAppleHealthData.bind(this);
    this.getDataFromDatabase = this.getDataFromDatabase.bind(this);
    this.refreshScreen = this.refreshScreen.bind(this);
    this.inputAppleHealthIntoDatabase = this.inputAppleHealthIntoDatabase.bind(this);
  }

    modalOpen() {
        this.setState({ modalVisible: true });
    }

    modalClose() {
        this.setState({ modalVisible: false });
    }

    modalScoreOpen() {
        this.setState({ modalScoreVisible: true });
    }

    modalScoreClose() {
        this.setState({ modalScoreVisible: false });
    }

    async getAppleHealthData() {
        const healthKitOptions = {
            permissions: {
                read:  [
                    PERMS.DateOfBirth,
                    PERMS.Weight,
                    PERMS.StepCount
                ]
            }
        };

        AppleHealthKit.initHealthKit(healthKitOptions, (err, results) => {
            if (err) {
            console.log("error initializing Healthkit: ", err);
            return;
            }

            AppleHealthKit.getStepCount(null, (err, results) => {
                this.setState({
                    Steps: results
                });
            })
        })
    }

    async getDataFromDatabase() {
        const url = "http://127.0.0.1:5000/scores/get-scores";
        await axios.get(url, {
            params: {
                username: this.props.username, 
            },
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            if (response.data != []){
                this.setState({Sleep: response.data[0].subscores.sleep.value, SleepWeight: response.data[0].subscores.sleep.weight, 
                    SleepGoal: response.data[0].subscores.sleep.goal, StepGoal: response.data[0].subscores.steps.goal, StepWeight: response.data[0].subscores.steps.weight,
                    CumulativeScore: response.data[0].cumulative_score,
                
                })
            }
        }).catch((response) => {
            console.log(response);
        })
    }

    async componentDidMount() {
        //API calls to data base getting sleep and weights etc.
        await this.getAppleHealthData();
        await this.getDataFromDatabase();
        console.log(this.state);
    }

    async inputAppleHealthIntoDatabase() {
        const url = "http://127.0.0.1:5000/scores/add-score";
        const healthKitOptions = {
            permissions: {
                read:  [
                    PERMS.DateOfBirth,
                    PERMS.Weight,
                    PERMS.StepCount
                ]
            }
        };

        AppleHealthKit.initHealthKit(healthKitOptions, (err, results) => {
            if (err) {
                console.log("error initializing Healthkit: ", err);
                return;
            }

            AppleHealthKit.getStepCount(null, (err, results) => {
                this.setState({
                    Steps: results,
                    refreshing: false,
                });
                //api post request here posting it to the database
                console.log(this.state.Steps);
                // let sleep_temp;
                // if (this.state.Sleep){
                //     sleep_temp = this.state.Sleep
                // }
                // else{
                //     sleep_temp = 0
                // }

                if (this.state.Steps){
                    axios.post(url, {
                        username: this.props.username,
                        steps: this.state.Steps.value,
                    }).then((response) => {
                        // this.setState({ CumulativeScore: response.data.cumulative_score })
                        console.log(response.data);
                        this.setState({Sleep: response.data.subscores.sleep.value, SleepWeight: response.data.subscores.sleep.weight, 
                            SleepGoal: response.data.subscores.sleep.goal, StepGoal: response.data.subscores.steps.goal, StepWeight: response.data.subscores.steps.weight,
                            CumulativeScore: response.data.cumulative_score,
                        })
                    }).catch((response) => {
                        console.log(response);
                    })
                }
            })
        })
    }

    async refreshScreen() {
        await this.inputAppleHealthIntoDatabase();
    }

    HomeScreen() {
    
        return (
            <View style = {{height: '100%'}}>
                <StatusBar barStyle="dark-content" />
                <SafeAreaView>
                <ScrollView
                    contentInsetAdjustmentBehavior="automatic"
                    style={styles.scrollView}
                    refreshControl={
                        <RefreshControl
                          refreshing={this.state.refreshing}
                          onRefresh={this.refreshScreen}
                        />
                    }>
                    <View style = {styles.todayHeader}>
                        <Text style={styles.todayText}>Today</Text>
                    </View>
                    <View style = {styles.container}>
                        
                        {(this.state.CumulativeScore) !== false ?
                        <View style = {styles.todayHeader}>
                            <Text>Current Score: {this.state.CumulativeScore}</Text>
                        </View> : []
                        }
                        <View style={styles.body}>
                            <View style={styles.sectionContainer}>
                                {(this.state.Steps === 0 || this.state.Steps) ?
                                <View style = {{width: "100%"}}>
                                    <Progress.Bar style = {{width: "100%"}} progress={this.state.Steps.value/this.state.StepGoal} width={null} height={70} borderRadius={10} color={"#4287f5"}>
                                        <Text style = {styles.progressBarMainText}>Steps</Text>
                                        <Text style = {styles.progressBarSubText}>Today: {this.state.Steps.value} / {this.state.StepGoal}</Text>
                                    </Progress.Bar>
                                </View> : []
                                }
                                {(!this.state.Steps) &&
                                <Text style={styles.sectionDescriptionError}>
                                    Add your steps to Health App!
                                </Text>
                                }
                            </View>
                            <View style={styles.sectionContainer}>
                                {(this.state.Sleep !== false && this.state.SleepGoal !== false) ?
                                <View style = {{width: "100%"}}>
                                    <Progress.Bar style = {{width: "100%"}} progress={this.state.Sleep/this.state.SleepGoal} width={null} height={70} borderRadius={10} color={"#4287f5"}>
                                        <Text style = {styles.progressBarMainText}>Sleep</Text>
                                        <Text style = {styles.progressBarSubText}>Today: {this.state.Sleep} / {this.state.SleepGoal}</Text>
                                    </Progress.Bar>
                                </View> : []
                                }
                                {(this.state.Sleep === false || this.state.SleepGoal === false) ? 
                                <Text style={styles.sectionDescriptionError}>
                                    Add your sleep data to the App!
                                </Text> : []
                                }
                            </View>
                        </View>
                        {/* <View style={styles.sleepInputModalButtonView}>
                            <TouchableOpacity onPress={this.modalScoreOpen} style={styles.sleepInputModalButton}>
                                <Text style={styles.sleepInputModalPlus}>
                                    +
                                </Text>   
                            </TouchableOpacity>
                        </View> */}
                    </View>
                </ScrollView>
                </SafeAreaView>
            </View>
    );
  }

  InputScreen() {
      return (
        <GoalInput username = {this.props.username}/>
      );
  }

  // loadItems = (day) => {
  //   setTimeout(() => {
  //     for (let i = -15; i < 85; i++) {
  //       const time = day.timestamp + i * 24 * 60 * 60 * 1000;
  //       const strTime = this.timeToString(time);
  //       if (!this.state.items[strTime]) {
  //         this.state.items[strTime] = [];
  //         const numItems = Math.floor(Math.random() * 3 + 1);
  //         for (let j = 0; j < numItems; j++) {
  //           this.state.items[strTime].push({
  //             name: 'Item for ' + strTime + ' #' + j,
  //             height: Math.max(50, Math.floor(Math.random() * 150))
  //           });
  //         }
  //       }
  //     }
  //     const newItems = {};
  //     Object.keys(this.state.items).forEach(key => {
  //       newItems[key] = this.state.items[key];
  //     });
  //     this.setState({
  //       items: newItems
  //     });
  //   }, 1000);
  // }

  renderItem(item) {
    return (
      <TouchableOpacity
        testID={testIDs.agenda.ITEM}
        style={[styles.item, {height: item.height}]}
        // onPress={() => Alert.alert(item.name)}
      >
        <Text>{item.name}</Text>
      </TouchableOpacity>
    );
  }

  renderEmptyDate() {
    return (
      <View style={styles.emptyDate}>
            <Text style={{ color: '#cccccc', }}>
                There's nothing here
            </Text>
      </View>
    );
  }

  rowHasChanged(r1, r2) {
    return r1.name !== r2.name;
  }

  timeToString(time) {
    const date = new Date(time);
    return date.toISOString().split('T')[0];
  }


  // loadItems = (day) => {
  //   // setTimeout(() => {
  //     const newItems = {'2021-01-20': [{name: 'test'}], '2021-01-21': [{name: 'test2'}]};
  //     // Object.keys(this.state.items).forEach(key => {
  //     //   newItems[key] = this.state.items[key];
  //     // });
  //     this.setState({
  //       items: newItems
  //     });
  //   // }, 10);
  // }

  onDayPress(day) {
    console.log(day);
    axios.get('http://127.0.0.1:5000/scores/get-scores', {
      params: {
        username: 'a', 
        month: day.month, 
        day: day.day, 
        year: day.year,
      },
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    })
    .then(function () {
      // always executed
    });
  }

  CalendarScreen() {
    return (
      <View style={{ flex: 1}}>
          
        <Agenda 
          testID={testIDs.agenda.CONTAINER}
          items={this.state.items}
          renderEmptyData={this.renderEmptyDate.bind(this)}
          renderItem={this.renderItem.bind(this)}
          // loadItemsForMonth={this.loadItems.bind(this)}
          rowHasChanged={this.rowHasChanged.bind(this)}
          renderItem={this.renderItem.bind(this)}
          onDayPress={this.onDayPress.bind(this)}
                
        />
        <View
          style={{
              alignSelf: 'flex-end',
              paddingBottom: 10,
              paddingRight: 10,
          }}
        >
          <TouchableOpacity
            onPress={this.modalOpen}
            style={{
                borderWidth: 2,
                borderColor: 'rgba(0, 0, 0, 0.2)',
                alignItems: 'center',
                width: 100,
                height: 100,
                backgroundColor: '#024878',
                borderRadius: 50,
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                paddingTop: 15,
                fontSize: 50,
                color: '#FFF'   
              }}
            >
              +
            </Text>   
          </TouchableOpacity>
          <Modal
            animationType="slide"
            visible={this.state.modalVisible}
          >
            <SafeAreaView>
                <TouchableOpacity
                style = {{
                    alignItems: 'center',
                }}
                onPress = {this.modalClose}
                >
                    <Text>Done</Text>
                </TouchableOpacity>
            </SafeAreaView>
          </Modal>
        </View>
      </View>
    );
  }

  render() {
    return (
        <Tab.Navigator>
          <Tab.Screen name="Home" component={this.HomeScreen.bind(this)} options={{ tabBarBadge: 3 }}/>
          <Tab.Screen name="Input" component={this.InputScreen.bind(this)} />
          <Tab.Screen name="Calendar" component={this.CalendarScreen.bind(this)} />
        </Tab.Navigator>  
      );
  }
}

const styles = StyleSheet.create({
    goalInput: {
        height: "30%",
        width: "75%",
        borderBottomColor: "#024878",
        borderBottomWidth: 2,
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
    },
    todayHeader: {
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10
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

const Dynamic = ({ text, changeText }) => {
  return (
    <TextInput
      key="textinput1"
      style={{
        width: "100%",
        padding: 10,
        borderWidth: 1,
        marginTop: 20,
        marginBottom: 20
      }}
      onChangeText={changeText}
      value={text}
    />
  );
};

export default Home;