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

import openMap from 'react-native-open-maps';
// import Geolocation from 'react-native-geolocation-service';

const axios = require('axios');
navigator.geolocation = require('@react-native-community/geolocation');

export class Recommendation extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
            location: null,
            // places: [{
            //     "latitude": 37.680181, 
            //     "longitude": -121.921498, 
            //     "frequency": 18, 
            //     "steps": 48368.7534, 
            //     "address": "7700 Highland Oaks Dr, Pleasanton, CA 94588, USA", 
            //     "time": 28080, 
            //     "time_str": "7 hours 48 mins"
            // }, 
            // {
            //     "latitude": 37.527237, 
            //     "longitude": -121.9679, 
            //     "frequency": 1, 
            //     "steps": 5724.2526, 
            //     "address": "4551 Carol Ave, Fremont, CA 94538, USA", 
            //     "time": 3254,
            //     "time_str": "54 mins"
            // },
            // {
            //     "latitude": 37.515014, 
            //     "longitude": -121.92916, 
            //     "frequency": 1, 
            //     "steps": 7253.0821000000005,
            //     "address": "44152 Glendora Dr, Fremont, CA 94539, USA", 
            //     "time": 4169, 
            //     "time_str": "1 hour 9 mins"
            // }],
            // places: [],
        },

        this.showRecommendations = this.showRecommendations.bind(this);
        this.goToLocation = this.goToLocation.bind(this);
    }

    componentDidMount() {
        //get current location first, then do the API call
        console.log(this.props);


        // // if (this.props)
        // const url = "https://botsecure.mangocircle.com:8000/index/get-locations";
        // axios.get(url, {
        // params: {
        //     longitude: this.props.longitude,
        //     latitude: this.props.latitude,
        //     steps: 1000,
        
        // },
        // headers: {
        //     Accept: 'application/json',
        //     'Content-Type': 'application/json'
        // }
        // })
        // .then((response) => {
        //     this.setState({ places: response.data });
        //     console.log(response);
        // })
        // .catch((error) => {
        //     console.log(error);
        // })
    }

    goToLocation(data) {
        // console.log(lat, long);
        // openMap({ latitude: 37.865101, longitude: -119.538330 });
        // openMap({ latitude: lat, longitude: long });

        // var coords = JSON.parse(this.state.location).coords;
        axios.post("https://botsecure.mangocircle.com:8000/index/add-location", 
        {
            latitude: data.latitude,
            longitude: data.longitude,
        }).then((response) => {
            console.log(response);
        }).catch((response) => {
            console.log(response);
        })
        openMap({ end: data.address });
      }

    showRecommendations() {
        return this.props.places.map(data => {
            return(
                <TouchableOpacity key = {data.address} style = {styles.card} onPress={() => this.goToLocation(data)}>
                    <View style ={{paddingBottom: "2%"}}>
                        {/* <Text style = {styles.cardTextHeader}>Address: </Text> */}
                        <Text style = {styles.cardTextHeader}>{data.address}</Text>
                    </View>
                    <View style={styles.cardBottom}>
                        <View style={styles.cardBottomItem1}>
                            <Text style = {styles.cardText}>Steps: {Math.round(data.steps)}</Text>
                        </View>
                        <View style={styles.cardBottomItem2}>
                            <Text style = {styles.cardText}>Time: {data.time_str}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            )
        });
    }

    render() {
        return (
            <View style = {{height: '100%'}}>
                <StatusBar barStyle="dark-content" />
                <SafeAreaView>
                <ScrollView
                    contentInsetAdjustmentBehavior="automatic"
                >
                    <View style = {styles.center}>
                        {/* <TouchableOpacity
                            onPress = {this.getLocation}
                        >
                            <Text>
                                Hello
                            </Text>
                        </TouchableOpacity> */}
                        {this.showRecommendations()}
                    </View>
                </ScrollView>
                </SafeAreaView>
            </View>
          );
    }

}

const styles = StyleSheet.create({
    cardBottom: {
        paddingLeft: "3.5%", 
        flex: 1, 
        flexDirection: 'row', 
        backgroundColor: "white"
    },
    cardBottomItem1: {
        width: "35%", 
        height: "100%",
        backgroundColor: "white"
    },
    cardBottomItem2: {
        width: "65%", 
        height: "100%",
        backgroundColor: "white"
    },
    card: {
        flex: 1,
        width: "85%",
        paddingTop: "3%",
        paddingBottom: "3%",
        backgroundColor: "#d8e0ed",
        borderRadius: 10,
        marginTop: "5%",

    },
    center: {
        // flex: 1,
        justifyContent: "center",
        alignItems: 'center',
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
    cardTextHeader: {
        marginTop: 5,
        marginLeft: "5%",
        marginRight: "5%",
        color: "#001e42",
        fontFamily: "Avenir-Light",
        fontSize: 20,
    },
});
export default Recommendation;
