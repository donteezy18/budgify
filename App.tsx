import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SubscriptionProvider } from './src/store/SubscriptionContext';
import TabNavigator from './src/navigation/TabNavigator';

export default function App() {
  return (
    <SubscriptionProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <TabNavigator />
      </NavigationContainer>
    </SubscriptionProvider>
  );
}
