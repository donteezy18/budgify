import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SubscriptionProvider } from './src/store/SubscriptionContext';
import { CalendarProvider } from './src/store/CalendarContext';
import { ThemeProvider } from './src/store/ThemeContext';
import TabNavigator from './src/navigation/TabNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <SubscriptionProvider>
        <CalendarProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            <TabNavigator />
          </NavigationContainer>
        </CalendarProvider>
      </SubscriptionProvider>
    </ThemeProvider>
  );
}
