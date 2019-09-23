import React, {Fragment} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Navigator from '../NativeNavigation/Navigator';
import {SCREENS} from './Screens';

type Props = {
  navigator: Navigator,
};

export default class HomeScreen extends React.Component<Props> {
  static alertButtonId = 'paperless.HomeScreen.alertButton';

  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    // props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
    // this.props.navigator.setTitle('You can change the title');
  }

  onNavigatorEvent = event => {
    if (event.type === 'NavBarButtonPress') {
      if (event.id === HomeScreen.alertButtonId) {
        Alert.alert(
          'Native Buttons',
          'The navigation bar and button come from UINavigationController',
          [{text: 'OK', onPress: () => console.log('OK Pressed')}],
          {cancelable: false},
        );
      }
    }
  };

  componentDidMount() {
    this.props.navigator.setNavigationButtons({
      rightButtons: [
        {
          title: 'Alert',
          id: HomeScreen.alertButtonId,
        },
      ],
    });
  }

  pushNewScreen = () => {
    this.props.navigator.push(SCREENS.PostboxListScreen);
  };

  changeTitle = () => {
    this.props.navigator.setTitle('🚀 Title Changed 🚀');
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View>
          <Text>This is the ReactNative HomeScreen!</Text>

          <TouchableOpacity onPress={this.pushNewScreen}>
            <Text style={{color: 'blue', marginTop: 44}}>
              Press me to push another RN screen
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={this.changeTitle}>
            <Text style={{color: 'blue', marginTop: 44}}>
              Press me to change the title
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
