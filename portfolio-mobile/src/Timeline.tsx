import { Text, View } from 'react-native';
import { usePortfolio } from './store';
import { colors, Page, s, Tags } from './ui';
export function Timeline({kind}: {kind:'education'|'experience'}) {
  const {data} = usePortfolio(); const rows = data[kind];
  return <Page label={kind==='education' ? 'APRENDIZADO CONTÍNUO' : 'DA IDEIA À ENTREGA'} title={kind==='education' ? 'Experiência acadêmica' : 'Experiência profissional'}>
    <Text style={s.body}>{kind==='education' ? 'Conhecimento que vira prática, um projeto de cada vez.' : 'Minha trajetória, desafios e contribuições.'}</Text>
    {!rows.length && <View style={s.card}><Text style={s.body}>Nenhuma experiência cadastrada ainda.</Text></View>}
    {rows.map((item,i)=><View key={item.objectId} style={s.card}><View style={s.row}><Text style={s.eyebrow}>0{i+1} / TRAJETÓRIA</Text><Text style={{color:colors.accent}}>●</Text></View><Text style={s.subtitle}>{item.title}</Text>{item.organization && <Text style={{color:colors.accent}}>{item.organization}</Text>}{item.period && <Text style={s.small}>{item.period}</Text>}<Text style={s.body}>{item.description}</Text><Tags items={item.technologies}/></View>)}
  </Page>;
}
