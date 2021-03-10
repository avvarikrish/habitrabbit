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
        },

        this.showRecommendations = this.showRecommendations.bind(this);
        this.goToLocation = this.goToLocation.bind(this);
        this.showRecommendations2 = this.showRecommendations2.bind(this);
    }

    goToLocation(data) {

        axios.post("https://botsecure.mangocircle.com:8000/index/add-location", 
        {
            latitude: data.latitude,
            longitude: data.longitude,
        }).then((response) => {
            openMap({ end: data.address });
            console.log(response);
        }).catch((response) => {
            console.log(response);
        })
      }

    showRecommendations() {
        return this.props.places.map(data => {
            return(
                <TouchableOpacity key = {data.address} style = {styles.card} onPress={() => this.goToLocation(data)}>
                    <View style ={{paddingBottom: "2%"}}>
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

    showRecommendations2() {
        return this.props.places.map(data => {
            return(
                <TouchableOpacity key = {data.address} style = {styles.card2} onPress={() => this.goToLocation(data)}>
                    <View style ={{paddingBottom: "2%"}}>
                        <Text style = {styles.cardTextHeader}>{data.address}</Text>
                    </View>
                    <View style={styles.cardBottom2}>
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
                        <View style={styles.title}>
                            <Text style={styles.todayText}>Recommendations</Text>
                        </View>
                        {this.showRecommendations()}
                    </View>
                </ScrollView>
                </SafeAreaView>
            </View>
          );
    }

}

const styles = StyleSheet.create({
    title: {
        marginTop: "5%",
        marginBottom: "5%",
    },
    todayText: {
        fontFamily: "Avenir-Light",
        fontSize: 30,
    },
    card2: {
        flex: 1,
        width: "100%",
        paddingTop: "3%",
        paddingBottom: "3%",
        backgroundColor: "#d8e0ed",
        // borderRadius: 10,
        // marginTop: "5%",
        borderWidth: .5,
        
    },
    cardBottom2: {
        paddingLeft: "3.5%", 
        flex: 1, 
        flexDirection: 'row', 
        backgroundColor: "white"
    },
    cardBottom: {
        paddingLeft: "3.5%", 
        // paddingBottom: "5%",
        // borderRadius: 10,
        flex: 1, 
        flexDirection: 'row', 
        backgroundColor: "white",

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
        width: "95%",
        paddingTop: "3%",
        paddingBottom: "3%",
        backgroundColor: "#d8e0ed",
        // backgroundColor: "white",
        borderRadius: 10,
        marginTop: "2%",

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
