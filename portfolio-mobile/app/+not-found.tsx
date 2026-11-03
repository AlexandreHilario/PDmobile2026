import { useRouter } from 'expo-router';
import { Button, Page } from '../src/ui';
export default function NotFound(){const router = useRouter(); return <Page label="404" title="Tela não encontrada"><Button title="Voltar ao início" onPress={()=>router.replace('/')} /></Page>;}
