import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { Provider } from '../src/store';
import { colors } from '../src/ui';
export default function Layout() { return <Provider><StatusBar style="light" /><Tabs screenOptions={{ headerShown:false, tabBarActiveTintColor:colors.accent, tabBarInactiveTintColor:colors.muted, tabBarStyle:{backgroundColor:colors.bg,borderTopColor:colors.line}, tabBarLabelStyle:{fontSize:10} }}>
  {([['index','Home','⌂'],['academica','Formação','◇'],['profissional','Carreira','▤'],['projetos','Projetos','⊞'],['sobre','Sobre','◎']] as const).map(([name,title,icon]) => <Tabs.Screen key={name} name={name} options={{ title, tabBarIcon:({color}) => <Text style={{color,fontSize:24}}>{icon}</Text> }} />)}
  <Tabs.Screen name="+not-found" options={{ href:null }} />
  </Tabs></Provider>; }
