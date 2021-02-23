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

// import Geolocation from 'react-native-geolocation-service';
const axios = require('axios');
navigator.geolocation = require('@react-native-community/geolocation');

export class Recommendation extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
          location: null
        }

        this.getLocation = this.getLocation.bind(this);
    }

    getLocation() {
        navigator.geolocation.requestAuthorization();
        navigator.geolocation.getCurrentPosition(
            position => {
              const location = JSON.stringify(position);
          
              this.setState({ location });
              console.log(this.state.location);
              var coords = JSON.parse(this.state.location).coords;
              axios.post("https://botsecure.mangocircle.com:8000/index/add-location", 
              {
                latitude: coords.latitude,
                longitude: coords.longitude,
            }).then((response) => {
                console.log(response);
            }).catch((response) => {
                console.log(response);
            })
            },
            error => Alert.alert(error.message),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
          );
    }

    render() {
        return (
            <View style = {{height: '100%'}}>
                <StatusBar barStyle="dark-content" />
                <SafeAreaView>
                <ScrollView
                    contentInsetAdjustmentBehavior="automatic"
                >
                    <View>
                        <TouchableOpacity
                            onPress = {this.getLocation}
                        >
                            <Text>
                                Hello
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                </SafeAreaView>
            </View>
          );
    }

}

export default Recommendation;
