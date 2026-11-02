import { Text, View } from 'react-native';
import { Page, s, Tags } from '../src/ui';
export default function Sobre() { return <Page label="POR TRÁS DAS TELAS" title="Design, código e propósito.">
  <Text style={s.body}>Um currículo que você pode explorar. Desenvolvido para a disciplina de Programação para Dispositivos Móveis.</Text>
  <View style={s.card}><Text style={s.eyebrow}>FUNCIONALIDADE EXTRA</Text><Text style={s.subtitle}>Sua seleção, sempre à mão ★</Text><Text style={s.body}>Marque projetos como favoritos, filtre sua seleção e feche o aplicativo. Ao voltar, seus favoritos continuam salvos no dispositivo com AsyncStorage. Você também pode buscar projetos por nome ou tecnologia e compartilhar o currículo pelo menu nativo do celular.</Text></View>
  <Text style={s.subtitle}>Tecnologias e módulos</Text>
  {[
    ['React Native + React','Componentes nativos, hooks e Context para compartilhar dados entre as telas.'],
    ['Expo + TypeScript','Ferramentas de desenvolvimento mobile e tipagem estática.'],
    ['Expo Router','Navegação por arquivos com cinco abas: Home, Formação, Carreira, Projetos e Sobre.'],
    ['Back4App + API REST','Consulta das classes Profile, Education, Experience e Project por fetch, com tempo limite e tratamento de erros.'],
    ['AsyncStorage','Persistência local dos IDs de projetos favoritos.'],
    ['React Native APIs','Share para compartilhar o currículo; Linking para abrir links e contato; RefreshControl para atualizar os dados.'],
    ['Safe Area Context + Screens','Respeito às áreas seguras do celular e suporte à navegação nativa.'],
    ['Expo Status Bar, Constants e Linking','Barra de status e módulos de suporte do Expo Router.'],
    ['React DOM + React Native Web','Suporte opcional à versão web para desenvolvimento; a demonstração da entrega deve ser no celular ou emulador.']
  ].map(([title,description])=><View key={title} style={s.card}><Text style={s.subtitle}>{title}</Text><Text style={s.body}>{description}</Text></View>)}
  <Tags items={['Android','iOS','Expo Go','Back4App']} />
</Page>; }
