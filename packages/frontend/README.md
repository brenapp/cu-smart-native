# CU Smart App

## Folder Structure

- /components /screens /navigation : JSX naming convention UpperCamelCase
- /assets /theme : resources
- /models: Class Definition - underscore naming convention

## App Layout

- Stack.Navigator
    - Room Selection  (Screen) (Brendan)
    - User Tab (Tab.Navigator)
        - User Feedback  (Screen) (Brendan)
        - Heat Map(Screen) (Yongjian)
        - Recommendation(Screen)  (Yongjian)

Setting navigator header from underlying screens:

1. using setOptions from underlying screen e.g useLayoutEffect in UserNavigator sets the headertitle of above stack
   navigator
2. export standalone setOptions value e.g screenOptions in HeatMapScreen.js RecommendationScreen.js
   UserFeedbackScreen.js

However, header issue occurs when there are nested navigators, screenOptions in HeatMapScreen.js RecommendationScreen.js
UserFeedbackScreen.js will not work since the header of User Tab cannot affect the Stack navigator header,

I found one solution from
https://stackoverflow.com/questions/60363195/react-navigation-header-title-in-nested-tab-navigator

The remedy is that using navigation.dangerouslyGetParent() to get the parent navigation status. This will only work when
the stack component is exactly the last parent, need to adjust it if we have another navigation hierarchy (e.g. call
dangerouslyGetParent() multiple times based on the hierarchy level
