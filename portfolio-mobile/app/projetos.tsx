import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { usePortfolio } from '../src/store';
import { Button, colors, openUrl, Page, s, Tags } from '../src/ui';
export default function Projetos() {
  const {data:{projects},favorites,toggle}=usePortfolio(); const [search,setSearch]=useState(''); const [only,setOnly]=useState(false);
  const normalize=(v:string)=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const rows=projects.filter(p=>(!only || favorites.includes(p.objectId)) && normalize(`${p.title} ${p.description} ${p.technologies.join(' ')}`).includes(normalize(search)));
  return <Page label="SELEÇÃO DE TRABALHOS" title="Código que ganha vida.">
    <Text style={s.body}>Explore, encontre uma tecnologia e salve seus projetos preferidos.</Text>
    <TextInput accessibilityLabel="Buscar projetos ou tecnologias" placeholder="Buscar projeto ou tecnologia…" placeholderTextColor={colors.muted} value={search} onChangeText={setSearch} style={s.input}/>
    <View style={s.row}><Button title={only ? '★ Favoritos' : '☆ Apenas favoritos'} secondary={!only} onPress={()=>setOnly(v=>!v)}/><Text style={s.small}>{rows.length} resultado(s)</Text></View>
    {rows.map((p,i)=><View key={p.objectId} style={s.card}><View style={s.row}><Text style={s.eyebrow}>PROJETO / {String(i+1).padStart(2,'0')}</Text><Pressable accessibilityRole="button" accessibilityLabel={`${favorites.includes(p.objectId)?'Remover dos':'Adicionar aos'} favoritos: ${p.title}`} accessibilityState={{selected:favorites.includes(p.objectId)}} onPress={()=>toggle(p.objectId)} style={{minWidth:48,minHeight:48,alignItems:'center',justifyContent:'center'}}><Text style={{color:colors.accent,fontSize:30}}>{favorites.includes(p.objectId)?'★':'☆'}</Text></Pressable></View><Text style={s.subtitle}>{p.title}</Text><Text style={s.body}>{p.description}</Text><Tags items={p.technologies}/>{p.url && <Button secondary title="Ver repositório ↗" onPress={()=>void openUrl(p.url!)} />}</View>)}
    {!rows.length && <View style={s.card}><Text style={s.subtitle}>Nada por aqui ainda</Text><Text style={s.body}>Experimente outra busca ou marque um projeto com a estrela para vê-lo nos favoritos.</Text><Button title="Ver todos os projetos" onPress={()=>{setSearch('');setOnly(false);}} /></View>}
  </Page>;
}
