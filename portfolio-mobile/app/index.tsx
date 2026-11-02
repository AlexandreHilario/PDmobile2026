import { router } from 'expo-router';
import { Alert, Share, Text, View } from 'react-native';
import { usePortfolio } from '../src/store';
import { Button, colors, openUrl, Page, s, Tags } from '../src/ui';
export default function Home() {
  const {data:{profile,projects,education},favorites} = usePortfolio();
  return <Page label="OLÁ, EU SOU" title={profile.name}>
    <View style={[s.card,{backgroundColor:'#202F26',borderColor:'#3B5233',padding:26}]}>
      <View style={{width:72,height:72,borderRadius:24,backgroundColor:colors.accent,justifyContent:'center',alignItems:'center'}}><Text style={{fontSize:26,fontWeight:'900',color:colors.bg}}>{profile.name.split(' ').filter(Boolean).slice(0,2).map(n=>n[0]).join('')}</Text></View>
      <Text style={[s.title,{fontSize:30}]}>{profile.role}</Text><Text style={s.body}>{profile.bio}</Text>{profile.location ? <Text style={s.small}>↗ {profile.location}</Text> : null}
      <Button title="Explorar meus projetos  ↗" onPress={()=>router.push('/projetos')} />
    </View>
    <View style={s.row}>{[[projects.length,'Projetos'],[education.length,'Formações'],[projects.filter(p=>favorites.includes(p.objectId)).length,'Favoritos']].map(([value,label])=><View key={label} style={[s.card,{flex:1,padding:10,alignItems:'center',gap:4}]}><Text style={[s.subtitle,{color:colors.accent}]}>{value}</Text><Text style={s.small}>{label}</Text></View>)}</View>
    <Text style={s.subtitle}>Minha caixa de ferramentas</Text><Tags items={profile.skills} />
    <View style={s.card}><Text style={s.subtitle}>Vamos construir algo?</Text><Text style={s.body}>Conheça minha trajetória e as ideias que saíram do papel.</Text>
      {profile.email && <Button title="Entrar em contato" onPress={()=>void openUrl(`mailto:${profile.email}`)} />}
      {profile.github && <Button title="Conhecer meu GitHub ↗" secondary onPress={()=>void openUrl(profile.github!)} />}
      <Button title="Compartilhar currículo" secondary onPress={()=>void Share.share({message:`${profile.name} — ${profile.role}\n${profile.bio}${profile.github ? `\n${profile.github}` : ''}`}).catch(()=>Alert.alert('Compartilhamento indisponível','Tente novamente no celular.'))} />
    </View>
  </Page>;
}
