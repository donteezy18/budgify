import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SubscriptionProvider } from './src/store/SubscriptionContext';
import { CalendarProvider } from './src/store/CalendarContext';
import TabNavigator from './src/navigation/TabNavigator';

export default function App() {
  return (
    <SubscriptionProvider>
      <CalendarProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <TabNavigator />
        </NavigationContainer>
      </CalendarProvider>
    </SubscriptionProvider>
  );
}
