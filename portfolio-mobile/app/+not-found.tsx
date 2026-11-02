import { router } from 'expo-router';
import { Button, Page } from '../src/ui';
export default function NotFound(){return <Page label="404" title="Tela não encontrada"><Button title="Voltar ao início" onPress={()=>router.replace('/')} /></Page>;}
