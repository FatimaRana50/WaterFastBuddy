// Import notifications first so the background task is defined before
// the React tree mounts — required by expo-task-manager
//import './src/utils/notifications';

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
