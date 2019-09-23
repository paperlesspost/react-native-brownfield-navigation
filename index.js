import {setupNativeNavigation} from './src/NativeNavigation/config';

console.disableYellowBox = true;

// If you are using Redux, pass in the instance of your store
// And a reference to the Provider
const reduxStore = null;
const Provider = null;

setupNativeNavigation(reduxStore, Provider);
