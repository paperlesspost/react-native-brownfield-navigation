// @flow

import * as React from 'react';
import Navigator from './Navigator';
import {SCREENS} from '../Screens/Screens';
import type {Route} from './Navigator';

function registerScreen(screen: Route, store: Store<*, *>, Provider: any) {
  Navigator.registerComponent(screen, store, Provider);
}

export function setupNativeNavigation(store: Store<*, *>, Provider: any) {
  const allScenes = {...SCREENS};

  Object.keys(allScenes).forEach((key: string) => {
    const screen: Route = allScenes[key];
    registerScreen(screen, store, Provider);
  });
}
