// @flow

// Screens
import HomeScreen from './HomeScreen';
import PostboxListScreen from './PostboxListScreen';

// Add new screens to the app here
export const SCREENS = {
  HomeScreen: {
    id: 'paperlesspost.HomeScreen',
    component: HomeScreen,
    title: 'Home',
  },
  PostboxListScreen: {
    id: 'paperlesspost.PostboxListScreen',
    component: PostboxListScreen,
  },
};
