// Register the background-task handler BEFORE the React tree mounts so
// expo-task-manager can find it when the OS wakes the app.
// This file is intentionally tiny — see src/utils/backgroundTask.ts for why.
import './src/utils/backgroundTask';

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
