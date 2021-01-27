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
  AsyncStorage,
} from 'react-native';

import { Login } from './Login.js';

import { NavigationContainer, } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';
import AppleHealthKit from 'rn-apple-healthkit';

const Stack = createStackNavigator();
const testIDs = require('./testIDs');
const PERMS = AppleHealthKit.Constants.Permissions;
const Tab = createBottomTabNavigator();
const StepGoal = 10000;
export class Home extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      Weight: false,
      Height: false,
      DateOfBirth: false,
      Steps: false,
      items: {'2021-01-20': [{name: 'test'}]},
      StepProgressBar: "",


    };
  }

  componentDidMount() {
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

      // Date of Birth Example
      AppleHealthKit.getDateOfBirth(null, (err, results) => {
        console.log("asdfasdf");
        this.setState({
          DateOfBirth: results
        })
        
      });

      // Get Latest Weight
      AppleHealthKit.getLatestWeight(null, (err, results) => {
        console.log(this.state.Weight);
        this.setState({
          Weight: results
        })
        console.log(this.state.Weight.value);
      });

      // AppleHealthKit.getLatestHeight(null, (err, result))
      AppleHealthKit.getStepCount(null, (err, results) => {
        this.setState({
          Steps: results
        })
        console.log((this.state.Steps.value/StepGoal * 100).toString())
      })

    });
  }

  
  HomeScreen() {
    
    return (
      <View>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={styles.scrollView}>
            <View style = {styles.container}>
                
                <View style={styles.body}>
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Weight</Text>
                    {(this.state.Weight) &&
                    <View style = {{width: "100%"}}>
                        <View style = {styles.progressBarFilling}>
                            <Animated.View
                                style = {[StyleSheet.absoluteFill],  {borderRadius: 20, backgroundColor: "#024878", width: "20%"}}
                            />
                        </View>
                    </View>
                    // <Text style={styles.sectionDescription}>
                    // {this.state.Weight.value}
                    // </Text>
                    }
                    {(!this.state.Weight) &&
                    <Text style={styles.sectionDescriptionError}>
                    Add your Weight to Health App!
                    </Text>
                    }
                </View>
                {/* <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Age</Text>
                    {(this.state.DateOfBirth) &&
                    <Text style={styles.sectionDescription}>
                    {this.state.DateOfBirth.age}
                    </Text>
                    }
                    {(!this.state.DateOfBirth) &&
                    <Text style={styles.sectionDescriptionError}>
                    Add your Birthday to Health App!
                    </Text>
                    }
                </View> */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Steps</Text>
                    {(this.state.Steps) &&
                    <View style = {{width: "100%"}}>
                        <View style = {styles.progressBarFilling}>
                            <Animated.View
                                style = {[StyleSheet.absoluteFill],  {borderRadius: 20, backgroundColor: "#024878", width: (this.state.Steps.value/StepGoal * 100).toString() + "%"}}
                            />
                        </View>
                    </View>
                    // <Text style={styles.sectionDescription}>
                    // {this.state.Steps.value}
                    // </Text>
                    }
                    {(!this.state.Steps) &&
                    <Text style={styles.sectionDescriptionError}>
                    Add your steps to Health App!
                    </Text>
                    }
                </View>
                </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
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
        <Text>This is empty date!</Text>
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



  CalendarScreen() {
    return (
      <View style={{ flex: 1}}>
        {/* <Agenda
        // testID={testIDs.agenda.CONTAINER}
        items={this.state.items}
        loadItemsForMonth={this.loadItems.bind(this)}
        selected={'2020-11-29'}
        renderItem={this.renderItem.bind(this)}
        // renderEmptyDate={this.renderEmptyDate.bind(this)}
        // rowHasChanged={this.rowHasChanged.bind(this)} 
        /> */}

        <Agenda 
        testID={testIDs.agenda.CONTAINER}
        items={this.state.items}
        renderEmptyData={this.renderEmptyDate.bind(this)}
        renderItem={this.renderItem.bind(this)}
        // loadItemsForMonth={this.loadItems.bind(this)}
        rowHasChanged={this.rowHasChanged.bind(this)}
        renderItem={this.renderItem.bind(this)}
        />
      </View>
    );
  }

//   MainPage() {
//     return (
//       // <NavigationContainer>
//       <Tab.Navigator>
//         <Tab.Screen name="Home" component={this.HomeScreen.bind(this)} />
//         <Tab.Screen name="Settings" component={this.CalendarScreen.bind(this)} />
//       </Tab.Navigator>
//       // </NavigationContainer>

//     );
//   }



  render() {
    return (
        <Tab.Navigator>
          <Tab.Screen name="Home" component={this.HomeScreen.bind(this)} />
          <Tab.Screen name="Settings" component={this.CalendarScreen.bind(this)} />
        </Tab.Navigator>  
      );
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        // backgroundColor: "white",

    },
    progressBarFilling: {
        flexDirection: "row",
        height: 30,
        width: "100%",
        borderWidth: 2,
        borderRadius: 20,
        borderColor: "black",

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
        flex: 1,
        paddingTop: 30
    }
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