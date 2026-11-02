import React from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePortfolio } from './store';
export const colors = { bg: '#0B1114', card: '#141E23', line: '#29373D', text: '#F0F5F1', muted: '#A6B8BA', accent: '#C5F36B' };
export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg }, content: { padding: 24, paddingBottom: 40, gap: 20, maxWidth: 760, width: '100%', alignSelf: 'center' },
  row: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', gap:12 }, eyebrow: { color:colors.accent, fontSize:11, fontWeight:'800', letterSpacing:3 },
  title: { color:colors.text, fontSize:34, fontWeight:'800', letterSpacing:-1 }, subtitle: { color:colors.text, fontSize:21, fontWeight:'700' }, body: { color:colors.muted, fontSize:15, lineHeight:24 },
  card: { backgroundColor:colors.card, borderWidth:1, borderColor:colors.line, borderRadius:24, padding:22, gap:14 }, tags: { flexDirection:'row', flexWrap:'wrap', gap:8 }, tag: { color:colors.accent, backgroundColor:'#24322A', paddingHorizontal:12,paddingVertical:6,borderRadius:10,fontSize:12 },
  button: { backgroundColor:colors.accent, padding:16, borderRadius:14, alignItems:'center', minHeight:48 }, buttonText: { color:colors.bg, fontWeight:'800' }, ghost: { borderWidth:1,borderColor:colors.line,padding:14,borderRadius:14,minHeight:48,alignItems:'center' },
  input: { color:colors.text, backgroundColor:colors.card, borderWidth:1,borderColor:colors.line,borderRadius:14,padding:16,fontSize:15 }, small: { color:colors.muted,fontSize:12,lineHeight:19 }
});
export function Button({ title, onPress, secondary=false }: { title: string; onPress: () => void; secondary?: boolean }) { return <Pressable accessibilityRole="button" onPress={onPress} style={({pressed}) => [secondary ? s.ghost : s.button,{opacity:pressed ? .65 : 1}]}><Text style={secondary ? {color:colors.text,fontWeight:'700'} : s.buttonText}>{title}</Text></Pressable>; }
export function Tags({ items }: { items: string[] }) { return <View style={s.tags}>{items.map((t,i) => <Text key={`${t}-${i}`} style={s.tag}>{t}</Text>)}</View>; }
export function Page({ label, title, children }: React.PropsWithChildren<{label: string; title: string}>) {
  const { loading,error,source,refresh } = usePortfolio();
  return <SafeAreaView edges={['top','left','right']} style={s.screen}><ScrollView contentContainerStyle={s.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.accent} />}>
    <View style={s.row}><Text style={s.eyebrow}>AV / PORTFOLIO</Text><Text style={s.small}>● {source}</Text></View>
    <View style={{gap:10,marginVertical:8}}><Text style={s.eyebrow}>{label}</Text><Text style={s.title}>{title}</Text></View>
    {loading && <ActivityIndicator color={colors.accent} accessibilityLabel="Carregando portfólio" />}
    {error ? <View style={s.card}><Text accessibilityRole="alert" style={s.body}>{error}</Text><Text style={s.small}>Os dados exibidos permanecem da última carga ou demonstração.</Text><Button title="Tentar novamente" onPress={() => void refresh()} /></View> : null}
    {source === 'Demonstração' && <Text style={s.small}>Dados de exemplo. Configure o .env e cadastre seu currículo no Back4App.</Text>}
    {children}<Text style={[s.small,{textAlign:'center',marginTop:12}]}>FEITO COM CURIOSIDADE E CÓDIGO ↗</Text>
  </ScrollView></SafeAreaView>;
}
export async function openUrl(url: string) {
  if (!/^https?:\/\//i.test(url) && !/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(url)) { Alert.alert('Link inválido','Cadastre um link https ou e-mail válido.'); return; }
  try { await Linking.openURL(url); } catch { Alert.alert('Não foi possível abrir','Verifique se há um aplicativo disponível para este link.'); }
}
