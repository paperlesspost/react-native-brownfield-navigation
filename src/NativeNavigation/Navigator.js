// @flow

import * as React from 'react';
import {
  findNodeHandle,
  NativeModules,
  NativeEventEmitter,
  View,
} from 'react-native';
import {AppRegistry} from 'react-native';

const nativeNavigator = NativeModules.Navigator;

export type Route = {
  id: string,
  component: React.ComponentType<*>,
  title?: ?string,
  titleView?: ?TitleView,
  hidesBottomBarWhenPushed?: boolean,
  navigationBar?: {hidden: boolean, animated: boolean},
  leftButtons?: Array<NavigatorButton>,
  rightButtons?: Array<NavigatorButton>,
  useTransparentBackground?: ?boolean,
  passProps?: Object,
  rootTag?: number, //Supplied via the initial props from ReactNative.
};

export type TitleView = {
  id: string,
  component?: React.ComponentType<*>,
};

export type NavigatorButton = {
  id: string,
  title?: ?string,
  component?: React.ComponentType<*>,
  image?: ?any, // An image provided via require(...)
  disabled?: boolean,
};

export type NavigationBarButtonEvent = {
  type: 'NavBarButtonPress',
  id: string,
};

// Note that ScreenChangeEvent does not fire on the very first initial load of a new ReactViewController
// for the willAppear and didAppear notifications. Instead, use componentWillMount/componentDidMount.
export type NavigationScreenChangeEvent = {
  type: 'ScreenChangedEvent',
  id: 'willAppear' | 'didAppear' | 'willDisappear' | 'didDisappear',
  _reactTag: number, //Used to identify which screen/VC the event belongs too (since events are global)
};

export type NavigationEvent =
  | NavigationBarButtonEvent
  | NavigationScreenChangeEvent;

type Props = {
  initialRoute: Route,
};

/**
 * Navigator has a 1-1 relationship with a Screen.
 * Every screen that is registered/pushed has it's own Navigator instance in JS.
 * On the native side, there is a single NavigatorModule.
 * This JS Navigator manages the single screen and is passed as a prop to the specific screen.
 * Navigator is a Component, but is not actually rendered. Similar to <Provider>.
 * "Screens" are matched with their corresponding ViewControllers via the rootScreen's reactTag.
 * The rootScreen's reactTag will usually be a high number in the 1000's. Using this number, Native
 * traverses the view hierarchy until it finds the "root" RCTView. That view's reactTag is used to store
 * a reference to the ViewController. That number does not equal the reactTag found here, but is simply used to reconcile
 * which react component/screen belongs to the VC.
 * Use `nativeNavigator.rootTagForReactTag(this.reactTag)` to get the native reactTag for the ViewController
 */
export default class Navigator extends React.Component<Props> {
  rootScreen: ?React.Component<*>; //A ref to the root screen once it has been rendered.
  reactTag: ?number; // The tag of the rootScreen once found. Note that this will not match the tag stored in Native, which corresponds to the ViewController
  currentRoute: Route; // The latest state of the route as it has been updated over time
  onNavigationEvent: ?(event: NavigationEvent) => void;
  navigationEventEmitter: NativeEventEmitter;
  navEmitterSubscription: any;

  static registerComponent: (
    route: Route,
    store: Store<*, *>,
    Provider: any,
  ) => void;

  constructor(props: Props) {
    super();
    this.currentRoute = {...props.initialRoute};
    this.navigationEventEmitter = new NativeEventEmitter(
      NativeModules.NavigationEventEmitter,
    );
    // Listen to the native global emitter for navigation events. Forward them to the callback
    this.navEmitterSubscription = this.navigationEventEmitter.addListener(
      'NAVIGATION_EVENT',
      (event: NavigationEvent) => {
        if (this.onNavigationEvent) {
          // If this is a ScreenChangeEvent, only send it if the _reactTag matches the rootScreen's tag.
          // We only want to send these types of events to the ViewController to which they belong
          if (event.type === 'ScreenChangedEvent') {
            if (
              this.props.initialRoute.rootTag &&
              event._reactTag === this.props.initialRoute.rootTag
            ) {
              this.onNavigationEvent(event);
            }
          } else {
            //Otherwise fire the callback
            this.onNavigationEvent(event);
          }
        }
      },
    );
  }

  componentDidMount() {
    this._registerScreen();
    //Once the native View (UIView) enter's the hierarchy we re-register so that
    //the route props can be applied to the ViewController
    nativeNavigator.onRootViewEnteredHierarchy(() => {
      this._registerScreen();
    });
  }

  componentWillUnmount() {
    if (this.reactTag) {
      nativeNavigator.unregisterRootView(this.reactTag);
    }
    //Stop listening to the navigation event emitter
    this.navEmitterSubscription.remove();
  }

  // APIs used by screens (eg this.props.navigator.doSomething())
  push(route: Route) {
    this._registerScreen();
    nativeNavigator.push(route, this.reactTag);
  }

  pop(animated: boolean = true) {
    this._registerScreen();
    nativeNavigator.pop(true, this.reactTag);
  }

  present(route: Route) {
    this._registerScreen();
    nativeNavigator.present(route, this.reactTag);
  }

  dismiss() {
    nativeNavigator.dismissFromReactTag(this.reactTag);
  }

  getBottomEdgeInset(callback: (bottomInset: number) => void) {
    if (this.reactTag) {
      nativeNavigator.getBottomEdgeInsetFromReactTag(
        this.reactTag,
        response => {
          callback(response.bottomInset);
        },
      );
    }
  }

  setOnNavigatorEvent(callback: (event: NavigationEvent) => void) {
    this.onNavigationEvent = callback;
  }

  setTitle(title: ?string) {
    this.currentRoute = {
      ...this.currentRoute,
      title: title,
    };
    this._registerScreen();
  }

  setTitleView(id: string, component: React.ComponentType<*>) {
    this.currentRoute = {
      ...this.currentRoute,
      titleView: {id, component},
    };
    this._registerScreen();
  }

  setNavigationButtons(buttons: {
    leftButtons?: Array<NavigatorButton>,
    rightButtons?: Array<NavigatorButton>,
  }) {
    this.currentRoute = {
      ...this.currentRoute,
      leftButtons: buttons.leftButtons || [],
      rightButtons: buttons.rightButtons || [],
    };
    this._registerScreen();
  }

  toggleNavBar(hidden: boolean, animated: boolean) {
    this.currentRoute = {
      ...this.currentRoute,
      navigationBar: {hidden: hidden, animated: animated},
    };
    this._registerScreen();
  }

  // Internal
  _registerScreen() {
    if (!this.rootScreen) {
      console.warn('A root screen is required for Navigator');
      return;
    }
    if (!this.reactTag) {
      try {
        this.reactTag = findNodeHandle(this.rootScreen);
      } catch (err) {
        console.error(
          `Unable to find tag in presentNavigationViewController: ${err.message}`,
        );
        return;
      }
    }

    // Custom Title View
    let titleView = null;
    if (this.currentRoute.titleView) {
      const id = this.currentRoute.titleView.id;
      AppRegistry.registerComponent(
        id,
        //$FlowFixMe - Ignore types not being recognized
        () => this.currentRoute.titleView.component,
      );
      titleView = id;
    }

    // Setup Navigator buttons
    const left = this.registerCustomButtons(this.currentRoute.leftButtons);
    const right = this.registerCustomButtons(this.currentRoute.rightButtons);
    const newRoute = {
      ...this.currentRoute,
      leftButtons: left,
      rightButtons: right,
      titleView: titleView,
    };
    nativeNavigator.registerRootView(this.reactTag, newRoute);
  }

  registerCustomButtons(buttons: ?Array<NavigatorButton>): ?Array<any> {
    if (!buttons) {
      return;
    }
    // Iterate through currentRoute's navigator buttons to register any custom nav button components
    return buttons.map((button: NavigatorButton) => {
      if (button.component) {
        //$FlowFixMe - Ignore the button.component not matching type
        AppRegistry.registerComponent(button.id, () => button.component);
        return {
          ...button,
          // Replace the component with an id so native can use it to fetch the RN view
          component: button.id,
        };
      }
      // Handle images
      if (button.image) {
        const resolveAssetSource = require('react-native/Libraries/Image/resolveAssetSource');
        const resolvedImage = resolveAssetSource(button.image);
        return {
          ...button,
          image: resolvedImage,
        };
      }
      return button;
    });
  }

  render() {
    const InitialComponent = this.props.initialRoute.component;
    // Pass any props specified in passProps to the component
    const passProps = this.props.initialRoute.passProps || {};
    return (
      <View
        style={{flex: 1}}
        ref={screen => {
          this.rootScreen = screen;
        }}>
        <>
          {/* Place HOC components like Apollo here */}
          {/* <ApolloProvider client={ApolloClient}> */}
          {/* $FlowIgnore We don't care which props get passed to the Screen component*/}
          <InitialComponent {...passProps} navigator={this} />
          {/* </ApolloProvider> */}
        </>
      </View>
    );
  }
}

// Static Functions
function registerComponent(route: Route, store: Store<*, *>, Provider) {
  AppRegistry.registerComponent(
    route.id,
    () =>
      class extends React.Component<*> {
        // For initialRoute, spread this.props and route together.
        // route represents the original route used to register the screen
        // this.props reflects the route as it was passed into navigator while in use.
        // eg. when use this.props.navigator.present() it is likely you will add additional
        // props to the screen, such as navButtons or passProps.
        // Same applies for `navigatorButtons` which may be a static prop on the screen/component
        render() {
          let staticNavButtons = {};
          //$FlowFixMe - Not sure how to declare `static navigatorButtons` on component in flow
          if (route.component.navigatorButtons) {
            staticNavButtons = route.component.navigatorButtons;
          }
          return (
            <>
              {/* Place HOC components like Redux Provider here */}
              {/* <Provider store={store}> */}
              <Navigator
                initialRoute={{...staticNavButtons, ...this.props, ...route}}
              />
              {/* </Provider> */}
            </>
          );
        }
      },
  );
}

Navigator.registerComponent = registerComponent;
