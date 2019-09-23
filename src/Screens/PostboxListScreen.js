import React, {Fragment} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
} from 'react-native';

type Props = {
  navigator: Navigator,
};

export default class PostboxListScreen extends React.Component<Props> {
  popBack = () => {
    this.props.navigator.pop();
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View>
          <Text>This is the ReactNative PostboxListScreen!</Text>

          <TouchableOpacity onPress={this.popBack}>
            <Text style={{color: 'blue', marginTop: 44}}>
              Press me to pop back!
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
