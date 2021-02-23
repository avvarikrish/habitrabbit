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

export class Recommendation extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
          location: null
        }
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
                        <Text>
                            Hello
                        </Text>
                    </View>
                </ScrollView>
                </SafeAreaView>
            </View>
          );
    }

}

export default Recommendation;
