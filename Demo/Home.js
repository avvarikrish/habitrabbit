/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useState } from 'react';
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
import Dialog, { DialogContent } from 'react-native-popup-dialog';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import AppleHealthKit from 'rn-apple-healthkit';
import GoalInput from './GoalInput.js';
import Recommendation from './Recommendation.js';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import openMap from 'react-native-open-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { and } from 'react-native-reanimated';

navigator.geolocation = require('@react-native-community/geolocation');
const axios = require('axios');
const Stack = createStackNavigator();
const testIDs = require('./testIDs');
const PERMS = AppleHealthKit.Constants.Permissions;
const Tab = createBottomTabNavigator();
const StepGoal = 10000;
const dynamicItems = {'2021-02-17': [{name: 'February 17, 2021', score: 84.25, sleep: 7, steps: 700}]};
const sleepNumbers = [{ id: "sleep", label: "", min: 0, max: 24 }];

export class Home extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      Height: false,
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
      location: null,
      weatherIndex: 0,
      sleepBedtime: false,
      places: false,
    };


    // binding all of the functions to make them point to 
    // the same "this"
    this.modalOpen = this.modalOpen.bind(this);
    this.modalClose = this.modalClose.bind(this);
    this.modalScoreOpen = this.modalScoreOpen.bind(this);
    this.modalScoreClose = this.modalScoreClose.bind(this);
    this.getAppleHealthData = this.getAppleHealthData.bind(this);
    this.getDataFromDatabase = this.getDataFromDatabase.bind(this);
    this.getAllScores = this.getAllScores.bind(this);
    this.refreshScreen = this.refreshScreen.bind(this);
    this.inputAppleHealthIntoDatabase = this.inputAppleHealthIntoDatabase.bind(this);
    this.getLocation = this.getLocation.bind(this);
    this.RecommendationScreen = this.RecommendationScreen.bind(this);
    this.todayScoreWdiget = this.todayScoreWidget.bind(this);
    this.bedtimeWidget = this.bedtimeWidget.bind(this);
    this.recommendedWalkWidget = this.recommendedWalkWidget.bind(this);
    this.weatherIntervalBar = this.weatherIntervalBar.bind(this);
    this.getSleep = this.getSleep.bind(this);
    this.goToLocation = this.goToLocation.bind(this);
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

        // function that retrieves Apple Health data for steps and height

        const healthKitOptions = {
            permissions: {
                read:  [
                    PERMS.DateOfBirth,
                    PERMS.Weight,
                    PERMS.StepCount,
                    PERMS.Height,
                ]
            }
        };

        AppleHealthKit.initHealthKit(healthKitOptions, (err, results) => {
            if (err) {
            console.log("error initializing Healthkit: ", err);
            return;
            }

            AppleHealthKit.getStepCount(null, (err, results) => {
                this.setState({ Steps: results });
            })

            AppleHealthKit.getLatestHeight(null, (err, results) => {
                this.setState({ Height: results });
            })
        })
    }

    async getDataFromDatabase() {

        // API call to the database that retrieves all of the data that the user has previously inputed, 
        // sleep, goals and scores.

        const url = "https://botsecure.mangocircle.com:8000/scores/get-scores";
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

    async getAllScores() {

    //   API call to retrieve all the past scores to load up in the calendar
    
      const url = "https://botsecure.mangocircle.com:8000/scores/get-scores";
      await axios.get(url, {
          params: {
              username: this.props.username, 
              year: '2021'
          },
          headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
          }
      }).then((response) => {
          if (response.data != []){
              var dict = {}
              for (var i = 0; i < response.data.length; i++) {
                var day = '';
                var month = '';
                if (response.data[i].day < 10) {
                  day = '0' + response.data[i].day.toString();
                }
                else {
                  day = response.data[i].day.toString();
                }
                if (response.data[i].month < 10) {
                  month = '0' + response.data[i].month.toString();
                }
                else {
                  month = response.data[i].month.toString();
                }
                var date = response.data[i].year.toString() + '-' + month + '-' + day;
                dict[date] = [{score: response.data[i].cumulative_score, sleep: response.data[i].subscores.sleep.value, sleep_goal: response.data[i].subscores.sleep.goal, steps: response.data[i].subscores.steps.value, steps_goal: response.data[i].subscores.steps.goal}];
              }
              this.setState({items: dict});
              
          }
      }).catch((response) => {
          console.log(response);
      })
  }
    async getLocation() {

        // function that gets the current location of the user and passes in the latitude and
        // longitude to an API call that retrieves the recommended locations to walk to.

        navigator.geolocation.requestAuthorization();
        navigator.geolocation.getCurrentPosition(
            position => {
                const location = JSON.stringify(position);
          
                this.setState({ location });
            
                const coords = JSON.parse(this.state.location).coords;
                const url = "https://botsecure.mangocircle.com:8000/index/get-locations";

                let goal = 10000;
                let height = 68;
                if (this.state.Steps && this.state.StepGoal){
                    goal = this.state.StepGoal - this.state.Steps.value;
                }
                else if (!this.state.Steps && this.state.StepGoal){
                    goal = this.state.StepGoal
                }

                if (this.state.height !== false){
                    height = this.state.Height.value;
                }

                axios.get(url, {
                params: {
                    longitude: coords.longitude,
                    latitude: coords.latitude,
                    steps: goal,
                    username: this.props.username,
                    height: height,
                },
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                }
                })
                .then((response) => {
                    this.setState({ places: response.data });                    
                })
                .catch((error) => {
                    console.log(error);
                })
            },
            error => Alert.alert(error.message),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
          );
    }

    async getSleep() {

        // function that gets the recommended bedtime for the user, taking into
        // account the user's sleep goal.

        const url  = "https://botsecure.mangocircle.com:8000/index/get-sleep"
        axios.get(url, {
            params: {
                username: this.props.username,
            },
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
            })
            .then((response) => {
                this.setState({ sleepBedtime: response.data });
            })
            .catch((error) => {
                console.log(error);
            })
    }


    async componentDidMount() {

        // Functions to retrieve all the data required for the application to function,
        // making sure they are async since each call should be sequential.

        await this.getAppleHealthData();
        await this.getDataFromDatabase();
        await this.getAllScores();
        await this.getLocation();
        await this.getSleep();
    }

    async inputAppleHealthIntoDatabase() {

        // function that posts the step data from Apple Health into the database storing
        // all of the user data.

        const url = "https://botsecure.mangocircle.com:8000/scores/add-score";
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

                if (this.state.Steps){
                    axios.post(url, {
                        username: this.props.username,
                        steps: this.state.Steps.value,
                    }).then((response) => {
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
        
        // Updates the database with API calls from Apple Health when refreshing the screen,
        // as well as getting an updated location and sleep time.

        await this.inputAppleHealthIntoDatabase();
        await this.getLocation();
        await this.getSleep();

    }

    goToLocation(data) {

        // function that opens the map app to get the directions to 
        // reach the location recommended by our app.

        axios.post("https://botsecure.mangocircle.com:8000/index/add-location", 
        {
            latitude: data.latitude,
            longitude: data.longitude,
        }).then((response) => {
            openMap({ end: data.address });
        }).catch((response) => {
            console.log(response);
        })
      }

    todayScoreWidget() {

        // function that renders the TODAY widget, showing the progress bars for steps
        // and sleep, as well as the score for the day.

        return (
            <View style={styles.card}>
                <View style = {styles.todayHeader}>
                    <Text style={styles.todayText}>Today</Text>
                </View>
                <View style = {styles.container}>
                {(this.state.CumulativeScore) !== false ?
                        <View style={styles.scoreHeader}>
                            <Text style = {styles.scoreText}>Score: </Text>
                            <Text style={styles.scoreValue}>{this.state.CumulativeScore.toFixed(2)}</Text>
                        </View>
                    : []
                    }
                    <View style={styles.body}>
                        <View style={styles.sectionContainer}>
                            {(this.state.Steps === 0 || this.state.Steps) ?
                            <View style = {{width: "100%"}}>
                                <Progress.Bar style = {{width: "100%"}} progress={this.state.Steps.value/this.state.StepGoal} width={null} height={70} borderRadius={10} color={"#4287f5"} unfilledColor={"white"}>
                                    <Text style = {styles.progressBarMainText}>Steps</Text>
                                    <Text style = {styles.progressBarSubText}>Today: {this.state.Steps.value} / {this.state.StepGoal}</Text>
                                </Progress.Bar>
                            </View> : []
                            }
                            {(!this.state.Steps) ?
                            <View style = {{width: "100%"}}>
                                <Progress.Bar style = {{width: "100%"}} progress={0/10000} width={null} height={70} borderRadius={10} color={"#4287f5"} unfilledColor={"white"}>
                                    <Text style = {styles.progressBarMainText}>Steps</Text>
                                    <Text style = {styles.progressBarSubText}>Today: 0 / 10000</Text>
                                </Progress.Bar>
                            </View> : []
                            }
                        </View>
                        <View style={styles.sectionContainer}>
                            {(this.state.Sleep !== false && this.state.SleepGoal !== false) ?
                            <View style = {{width: "100%"}}>
                                <Progress.Bar style = {{width: "100%"}} progress={this.state.Sleep/this.state.SleepGoal} width={null} height={70} borderRadius={10} color={"#4287f5"} unfilledColor={"white"}>
                                    <Text style = {styles.progressBarMainText}>Sleep</Text>
                                    <Text style = {styles.progressBarSubText}>Today: {this.state.Sleep} / {this.state.SleepGoal}</Text>
                                </Progress.Bar>
                            </View> : []
                            }
                            {(this.state.Sleep === false || this.state.SleepGoal === false) ? 
                            <View style = {{width: "100%"}}>
                                <Progress.Bar style = {{width: "100%"}} progress={0/8} width={null} height={70} borderRadius={10} color={"#4287f5"} unfilledColor={"white"}>
                                    <Text style = {styles.progressBarMainText}>Sleep</Text>
                                    <Text style = {styles.progressBarSubText}>Today: 0 / 8</Text>
                                </Progress.Bar>
                            </View> : []
                            }
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    weatherIntervalBar() {

        // function that renders the bar to show the user what times are valid to walk,
        // grey means to not walk, 

        // value to divide by to make sure the valid time bar is the same size, and 
        // resizes based on the times given.
        const denominator = 4.16;
        let percent_width;
        const percent_height = 20;
        
        if (this.state.places !== false){
            return this.state.places[0].valid_weather_times.map(data => {
                percent_width = (data.end - data.start) * denominator;
                const [open, setOpen] = useState(false);
                var str_width = percent_width.toString() + "%";
                
                if (data.valid){
                    let style_color;
                    let start;
                    let color;
                    let end;
                    if (data.start === 12){
                        start = "12 P.M.";
                    } 
                    else if (data.start > 12){
                        start = (data.start - 12).toString() + " P.M.";
                    }
                    else{
                        start = (data.start).toString() + " A.M.";
                    }

                    if (data.end === 12){
                        end = "12 P.M.";
                    } 
                    else if (data.end === 24){
                        end = "Midnight"
                    }
                    else if (data.end > 12){
                        end = (data.end - 12).toString() + " P.M.";
                    }
                    else{
                        end = (data.end).toString() + " A.M.";
                    }

                    if (data.description == "Clear"){
                        style_color = styles.weatherWidgetPopupClear;
                        color = "#ffd571";
                    }
                    else {
                        style_color = styles.weatherWidgetPopupClouds;
                        // color = "#d3d3d3";
                        color = "#ffd571";
                    }
                    return(
                        <TouchableOpacity key = {data.start} onPress = {() => setOpen(true)}  style={{width: str_width, height: percent_height, backgroundColor: color, borderRadius: 2}}>
                        
                            <Dialog
                                width = {0.9}
                                height = {.2}
                                visible={open}
                                onTouchOutside={() => setOpen(false)}
                            >
                                <View style = {style_color}>
                                    <Text style={styles.weatherWidgetTitle}>{start} - {end}</Text>
                                    <View>
                                        <Text style = {styles.weatherTempNumberText}>{data.description} {Math.round(data.temp)}°</Text>
                                    </View>
                                    
                                </View>
                            </Dialog>
                        </TouchableOpacity>
                    );
                }
                else{
                    return(
                        <View key = {data.start} style={{width: str_width, height: percent_height, backgroundColor: "#b5b5b5", borderRadius: 2}} />
                    );
                }
            });
        }
        else{
            return (
                <View></View>
            );
        }
    }

    recommendedWalkWidget() {

        // function that renders the recommended walk widget, along with the weather. 
        // this shows the user the top recommended place to walk to given the current conditions.

        return (
            <View style={styles.walkCardContainer}>

                <View style = {styles.todayHeader}>
                    <View style={{alignItems: "center"}}>
                        <Text style={styles.todayText}>Recommended Walk</Text>
                    </View>
                    
                </View>

                {(this.state.places !== false) ?
                    <TouchableOpacity style ={styles.weatherCardCenter} onPress={() => this.goToLocation(this.state.places[0])}>
                        <View>
                            <Text style = {styles.cardText}>{this.state.places[0].address}</Text>
                        </View>
                        
                        <View style={styles.cardBottom}>
                            <View style={styles.cardBottomItem1}>
                                <Text style = {styles.cardText}>Steps: {Math.floor(this.state.places[0].steps)}</Text>
                            </View>
                            <View style={styles.cardBottomItem2}>
                                <Text style = {styles.cardText}>Time: {this.state.places[0].time_str}</Text>
                            </View>
                        </View>
                    </TouchableOpacity> : []
                
                }
                
                <View style= {styles.weatherForecast}>
                    <Text style={styles.weatherForcastTitle}>Forecast</Text>
                </View>
                <View style={styles.cardBottom}>
                    <View style={styles.weatherTempNumber}>
                        <Text style = {styles.weatherHourStart}>12 A.M.</Text>
                    </View>
                    <View style={styles.weatherTempString}>
                        <Text style = {styles.weatherHourEnd}>12 A.M.</Text>
                    </View>
                </View>

                {(this.state.places !== false) ?
                    <View style={{flex: 1, flexDirection: 'row', width: "90%", backgroundColor: "#c7f5ff"}}>
                        {this.weatherIntervalBar()}
                    </View> : []
                }
            </View>

        );
    }

    bedtimeWidget() {

        // this function returns the recommended bedtime for the user, showing
        // the projected sleep subscore based on the current time.

        let hour_first;
        let hour_second;
        let minute_first;
        let minute_second;
        let time_of_day;

        if (this.state.sleepBedtime !== false){

            let start_hour = Math.floor(this.state.sleepBedtime.start_hour);
            let start_minute = Math.floor(this.state.sleepBedtime.start_min);

            if (start_hour < 10){
                hour_first = 0;
                hour_second = start_hour;
            }
            else{
                if (start_hour > 12){
                    start_hour = start_hour - 12;
                }
                hour_first = Math.floor(start_hour/10);
                hour_second = start_hour%10;
            }



            if (start_minute < 10){
                minute_first = 0;
                minute_second = start_minute;
            }
            else{
                minute_first = Math.floor(start_minute/10);
                minute_second = start_minute%10;
            }

            if (this.state.sleepBedtime.start_hour >= 12){
                time_of_day = "P.M.";
            }
            else{
                time_of_day = "A.M.";
            }
        }


        return (
            <View style={styles.cardCenter}>
                <View style = {styles.todayHeader}>
                    <Text style={styles.todayText}>Recommended Sleep</Text>
                </View>
                {(this.state.sleepBedtime !== false) ?
                    <View style={{flex: 1, flexDirection: 'row', marginTop: "5%"}}>

                        <View style={{width: "10%", height: 50, marginRight: "1%", backgroundColor: '#e6e6e6', alignItems: "center", justifyContent: "center"}}>
                            <Text style = {styles.weatherForcastTitle}>{hour_first}</Text>
                        </View>
                        <View style={{width: "10%", height: 50, marginRight: "1%", backgroundColor: '#e6e6e6', alignItems: "center", justifyContent: "center"}}>
                            <Text style = {styles.weatherForcastTitle}>{hour_second}</Text>
                        </View>
                        <View style={{width: "2%", height: 50, marginRight: "1%", alignItems: "center", justifyContent: "center"}}>
                            <Text style = {styles.weatherForcastTitle}>:</Text>
                        </View>
                        <View style={{width: "10%", height: 50, marginRight: "1%", backgroundColor: '#e6e6e6', alignItems: "center", justifyContent: "center"}}>
                            <Text style = {styles.weatherForcastTitle}>{minute_first}</Text>
                        </View>
                        <View style={{width: "10%", height: 50, marginRight: "1%", backgroundColor: '#e6e6e6', alignItems: "center", justifyContent: "center"}}>
                            <Text style = {styles.weatherForcastTitle}>{minute_second}</Text>
                        </View>
                        <View style={{width: "10%", height: 50, alignItems: "center", justifyContent: "center"}}>
                            <Text style = {styles.weatherForcastTitle}>{time_of_day}</Text>
                        </View>

                    </View> 
                    : []
                }
                {(this.state.sleepBedtime !== false) ?
                    <View style = {{marginTop: "2%", flex: 1, flexDirection: "row", alignItems: "center"}}>
                        <Text style= {styles.scoreTextProjection}>Projected Sleep Subscore: </Text>
                        <Text style={styles.scoreValueProjection}>{this.state.sleepBedtime.score.toFixed(2)}</Text>
                    </View> : []
                }
                                
            </View>
        );
    }

    HomeScreen() {

        // function that renders the home screen, showing the score widget, recommended walk widget,
        // and the recommended bedtime widget.
    
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
                    <View style={styles.center}>
                        {this.todayScoreWdiget()}
                        
                        {this.recommendedWalkWidget()}

                        {this.bedtimeWidget()}
                        
                        
                    </View>
                </ScrollView>
                </SafeAreaView>
            </View>
    );
  }

  InputScreen() {
      
      // function that returns the input screen for sleep and steps.

      return (
        <GoalInput username = {this.props.username}/>
      );
  }

  RecommendationScreen() {

    // function that returns the recommendation screen for the user.

    return (
      <Recommendation places = {this.state.places}/>
    );
}



  renderItem(item) {

    // function to render an item in the calendar for the calendar screen.

    return (
      <TouchableOpacity
        testID={testIDs.agenda.ITEM}
        style={[styles.item, {height: item.height}]}
      >
        <Text
          style={{
            fontSize: 20,
            fontFamily: 'Avenir-Light',
            marginBottom: 20,
          }}
        >
          Overview
        </Text>
        <Text
          style = {{
            fontSize: 15,
            fontFamily: 'Avenir-Light',
          }}
        >
          Score
        </Text>
        <Text
          style = {{
            marginBottom: 10, 
            fontSize: 50, 
            fontFamily: 'Avenir-Light', 
            color: "#00adf5",
          }}
        >
          {item.score.toFixed(2)}
        </Text>
        <Text style = {styles.progressBarTitle}>
          Sleep
        </Text>
        <Progress.Bar style = {{width: "100%", marginBottom: 20}} progress={item.sleep/item.sleep_goal} width={null} height={20} borderRadius={10} color={"#00adf5"}>
        <Text style = {styles.progressBarTextStyle}>
            {item.sleep} / {item.sleep_goal}
          </Text>
        </Progress.Bar>
        <Text style = {styles.progressBarTitle}>
          Steps
        </Text>
        <Progress.Bar style = {{width: "100%", marginBottom: 20}} progress={item.steps/item.steps_goal} width={null} height={20} borderRadius={10} color={"#00adf5"}>
        <Text style = {styles.progressBarTextStyle}>
            {item.steps} / {item.steps_goal}
          </Text>
        </Progress.Bar>
      </TouchableOpacity>
    );
  }

  renderEmptyDate() {

    // function to render an empty date when there is no data for a specific
    // day on the calendar screen.

    return (
      <View style={styles.emptyDate}>
            <Text style={{ color: '#cccccc', }}>
                There's nothing here
            </Text>
      </View>
    );
  }


  CalendarScreen() {

    // function to render Calendar screen and its components

    return (

        <View style={{ flex: 1}}>
            <Agenda 
            items={this.state.items}
            renderEmptyData={this.renderEmptyDate.bind(this)}
            renderItem={this.renderItem.bind(this)}
            theme = {{
                selectedDayBackgroundColor: '#00adf5',
            }}      
            />
        </View>

    );
  }


  render() {

    // main render function that uses a tab navigator in order to keep screens separate.
    // screens: home, input, navigation/recommendatoin, and calendar.

    return (
        <Tab.Navigator
        screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
  
              if (route.name === 'Home') {
                iconName = "menu";
              } else if (route.name === 'Input') {
                iconName = "add-circle";
              }
              else if (route.name === "Navigate"){
                iconName = "navigate";
              }
              else if (route.name === "Calendar"){
                iconName = "calendar";
              }
  
              // You can return any component that you like here!
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
          tabBarOptions={{
            activeTintColor: 'tomato',
            inactiveTintColor: 'gray',
          }}
        
        
        >
          <Tab.Screen name="Home" component={this.HomeScreen.bind(this)} options = {{headerShown: false}}/>
          <Tab.Screen name="Input" component={this.InputScreen.bind(this)} options = {{headerShown: false}}/>
          <Tab.Screen name="Navigate" component={this.RecommendationScreen.bind(this)} options = {{headerShown: false}}/>
          <Tab.Screen name="Calendar" component={this.CalendarScreen.bind(this)} />
        </Tab.Navigator>  
      );
  }
}

const styles = StyleSheet.create({

    scoreValue: {
        fontSize: 40, 
        fontFamily: 'Avenir-Light', 
        color: "#00adf5",
    },
    weatherForecast: {
        paddingTop: "5%",
        // backgroundColor: "#c7f5ff",
    },
    weatherForcastTitle: {
        fontFamily: "Avenir-Light",
        fontSize: 20,
    },
    weatherWidgetTitle: {
        fontFamily: "Avenir-Light",
        fontSize: 30,
        // marginTop: "5%",
    },
    weatherWidgetPopupClear: {
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#c7f5ff",
    },
    weatherWidgetPopupClouds: {
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#afb6b9",
    },
    weatherTempStringText: {
        alignSelf: "flex-end",
        marginTop: 5,
        marginLeft: "5%",
        marginRight: "20%",
        color: "#001e42",
        fontFamily: "Avenir-Light",
        fontSize: 25,
    },
    weatherTempNumberText: {
        // marginTop: 5,
        // marginLeft: "15%",
        // marginRight: "5%",
        color: "#001e42",
        fontFamily: "Avenir-Light",
        fontSize: 25,
    },
    weatherHourEnd: {
        alignSelf: "flex-end",
        marginTop: 5,
        marginLeft: "5%",
        marginRight: "5%",
        color: "#001e42",
        fontFamily: "Avenir-Light",
        fontSize: 10,
    },
    weatherHourStart: {
        marginTop: 5,
        marginLeft: "0%",
        marginRight: "5%",
        color: "#001e42",
        fontFamily: "Avenir-Light",
        fontSize: 10,
    },
    weatherTempNumber: {
        width: "50%", 
        height: "100%",
        // backgroundColor: "#c7f5ff",
    },
    weatherTempString: {
        width: "50%", 
        height: "100%",
    },
    
    cardText: {
        marginTop: 5,
        marginLeft: "5%",
        marginRight: "5%",
        color: "#001e42",
        fontFamily: "Avenir-Light",
        fontSize: 18,
    },
    cardBottom: {
        paddingLeft: "3.5%", 
        flex: 1, 
        flexDirection: 'row', 
        // backgroundColor: "#c7f5ff",
    },
    cardBottomItem1: {
        width: "35%", 
        height: "100%",
        // backgroundColor: "white"
    },
    cardBottomItem2: {
        width: "65%", 
        height: "100%",
        // backgroundColor: "white"
    },
    cardCenter: {
        flex: 1,
        width: "95%",
        // paddingTop: "3%",
        paddingBottom: "3%",
        backgroundColor: "white",
        borderRadius: 10,
        marginTop: "2%",
        justifyContent: "center",
        alignItems: "center",
    },
    weatherCardCenter: {
        flex: 1,
        width: "87%",
        // marginLeft: "8%",
        paddingTop: "3%",
        paddingBottom: "3%",
        backgroundColor: "white",
        // backgroundColor: "#e6e6e6",
        borderRadius: 10,
        marginTop: "2%",
        // marginLeft: "5%",
        borderWidth: 1,
        // justifyContent: "center",
        // alignItems: "center",
    },
    center: {
        // flex: 1,
        justifyContent: "center",
        alignItems: 'center',
        height: "100%",
    },
    card: {
        flex: 1,
        width: "95%",
        // paddingTop: "3%",
        paddingBottom: "3%",
        backgroundColor: "white",
        // backgroundColor: "#fff3e6",
        borderRadius: 10,
        marginTop: "2%",

    },
    walkCard: {
        flex: 1,
        width: "100%",
        paddingTop: "3%",
        paddingBottom: "3%",
        backgroundColor: "#1a508b",
        borderRadius: 10,
        // marginTop: "5%",
    },
    goalInput: {
        height: "30%",
        width: "75%",
        borderBottomColor: "#024878",
        borderBottomWidth: 2,
        // marginBottom: "10%",
    },
    walkCardContainer: {
        flex: 1,
        width: "95%",
        // paddingTop: "3%",
        paddingBottom: "3%",
        backgroundColor: "white",
        // backgroundColor: "#B5F1F3",
        borderRadius: 10,
        marginTop: "2%",
        justifyContent: "center",
        alignItems: "center",
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
        width: "100%",
        borderRadius: 10,
        backgroundColor: "#1a508b",
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 10,
        paddingTop: 10
    },
    scoreHeader: {
        width: "100%",
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "5%",
        flex: 1,
        flexDirection: "row",
    },
    scoreText: {
        fontFamily: "Avenir-Light",
        fontSize: 20,
        // color: "white"
    },
    scoreTextProjection: {
        fontFamily: "Avenir-Light",
        fontSize: 17,
    },
    scoreValueProjection: {
        fontSize: 25, 
        fontFamily: 'Avenir-Light', 
        color: "#00adf5",
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
        backgroundColor: '#f2f2f2',
        // backgroundColor: "white"
    },
    body: {
        // backgroundColor: '#FFF',
    },
    sectionContainer: {
        marginTop: 15,
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
    progressBarTextStyle: {
      position: 'absolute',
      marginTop: 2, 
      marginLeft: 10,
    }, 
    progressBarTitle: {
      fontSize: 15, 
      fontFamily: 'Avenir-Light', 
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