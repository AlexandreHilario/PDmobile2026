import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth-context';

type AuthMode = 'login' | 'signup';

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase() ?? '')
    .join('');
}

function formatDate(value?: string) {
  if (!value) return 'Não informado';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Não informado';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(date);
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'words';
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        selectionColor={colors.green}
      />
    </View>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.profileRow}>
      <Text style={styles.profileLabel}>{label}</Text>
      <Text style={styles.profileValue} selectable>
        {value}
      </Text>
    </View>
  );
}

const colors = {
  background: '#F5F3EC',
  paper: '#FFFFFF',
  ink: '#202B25',
  muted: '#7B837D',
  green: '#1E5748',
  paleGreen: '#E6EFE9',
  lime: '#D7EF83',
  coral: '#D96950',
  line: '#E4E5DC',
  error: '#A83E31',
};

export default function HomeScreen() {
  const { user, loading, configured, signUp, logIn, logOut } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);

  async function submit() {
    setMessage('');
    if (!configured) {
      setMessage('Adicione as credenciais do Back4App ao arquivo .env e reinicie o Expo.');
      return;
    }
    if (mode === 'signup' && (!name.trim() || !username.trim() || !email.trim())) {
      setMessage('Preencha seu nome, usuário e e-mail.');
      return;
    }
    if (mode === 'signup' && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setMessage('Informe um e-mail válido.');
      return;
    }
    if (!username.trim() || password.length < 6) {
      setMessage('Informe seu usuário e uma senha com pelo menos 6 caracteres.');
      return;
    }

    setPending(true);
    try {
      if (mode === 'signup') {
        await signUp({
          name: name.trim(),
          username: username.trim(),
          email: email.trim(),
          password,
        });
      } else {
        await logIn(username.trim(), password);
      }
      setPassword('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível entrar. Tente novamente.');
    } finally {
      setPending(false);
    }
  }

  async function signOut() {
    setMessage('');
    setPending(true);
    try {
      await logOut();
    } catch {
      setMessage('A sessão foi encerrada neste aparelho, mas o servidor não confirmou a saída.');
    } finally {
      setPending(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingState}>
          <ActivityIndicator color={colors.green} size="large" />
          <Text style={styles.loadingText}>Conectando sua conta...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayName = user?.name?.trim() || user?.username || 'Pessoa usuária';

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>P</Text>
            </View>
            <Text style={styles.brandName}>PARSE / USER</Text>
            <View style={styles.topBarSpacer} />
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveLabel}>MOBILE</Text>
            </View>
          </View>

          {user ? (
            <View style={styles.profileScreen}>
              <View style={styles.profileHeading}>
                <Text style={styles.eyebrow}>ÁREA DA CONTA</Text>
                <Text style={styles.title}>Tudo certo por aqui.</Text>
                <Text style={styles.subtitle}>Seu perfil está conectado ao Back4App.</Text>
              </View>

              <View style={styles.identityBlock}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials(displayName) || 'P'}</Text>
                </View>
                <View style={styles.identityText}>
                  <Text style={styles.identityName}>{displayName}</Text>
                  <Text style={styles.identityHandle}>@{user.username}</Text>
                </View>
                <View style={styles.activeBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.activeLabel}>ATIVA</Text>
                </View>
              </View>

              <View style={styles.detailsSection}>
                <View style={styles.sectionHeading}>
                  <Text style={styles.sectionTitle}>Dados do usuário</Text>
                  <Text style={styles.sectionCount}>01 / USER</Text>
                </View>
                <View style={styles.detailsList}>
                  <ProfileRow label="Nome" value={user.name || 'Não informado'} />
                  <ProfileRow label="Usuário" value={user.username} />
                  <ProfileRow label="E-mail" value={user.email || 'Não informado'} />
                  <ProfileRow label="Criado em" value={formatDate(user.createdAt)} />
                  <ProfileRow label="ID Parse" value={user.objectId} />
                </View>
              </View>

              {message ? <Text style={styles.feedback}>{message}</Text> : null}

              <Pressable
                accessibilityRole="button"
                disabled={pending}
                onPress={signOut}
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed, pending && styles.disabled]}
              >
                {pending ? <ActivityIndicator color={colors.green} /> : <Text style={styles.secondaryButtonText}>Sair da conta</Text>}
              </Pressable>
            </View>
          ) : (
            <View style={styles.authScreen}>
              <View style={styles.authHeading}>
                <View style={styles.headingAccent} />
                <Text style={styles.eyebrow}>SUA CONTA, SEU ESPAÇO</Text>
                <Text style={styles.title}>
                  {mode === 'login' ? 'Que bom ter você de volta.' : 'Vamos começar por você.'}
                </Text>
                <Text style={styles.subtitle}>
                  {mode === 'login'
                    ? 'Entre para acessar seu perfil.'
                    : 'Crie seu acesso em poucos passos.'}
                </Text>
              </View>

              <View style={styles.formPanel}>
                <View style={styles.segment}>
                  {(['login', 'signup'] as const).map((tab) => (
                    <Pressable
                      key={tab}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: mode === tab }}
                      onPress={() => {
                        setMode(tab);
                        setMessage('');
                      }}
                      style={[styles.segmentButton, mode === tab && styles.segmentButtonSelected]}
                    >
                      <Text style={[styles.segmentText, mode === tab && styles.segmentTextSelected]}>
                        {tab === 'login' ? 'Entrar' : 'Criar conta'}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {mode === 'signup' ? (
                  <>
                    <Field label="NOME" value={name} onChangeText={setName} placeholder="Como podemos chamar você?" autoCapitalize="words" />
                    <Field label="E-MAIL" value={email} onChangeText={setEmail} placeholder="voce@exemplo.com" keyboardType="email-address" />
                  </>
                ) : null}

                <Field label="USUÁRIO" value={username} onChangeText={setUsername} placeholder="Seu nome de usuário" />
                <Field label="SENHA" value={password} onChangeText={setPassword} placeholder="Mínimo de 6 caracteres" secureTextEntry />

                {message ? (
                  <View style={styles.messageBox}>
                    <Text style={styles.messageText}>{message}</Text>
                  </View>
                ) : null}

                {!configured ? (
                  <View style={styles.setupNote}>
                    <Text style={styles.setupNoteTitle}>Conexão pendente</Text>
                    <Text style={styles.setupNoteText}>Configure as credenciais do Parse no arquivo .env.</Text>
                  </View>
                ) : null}

                <Pressable
                  accessibilityRole="button"
                  disabled={pending}
                  onPress={submit}
                  style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, pending && styles.disabled]}
                >
                  {pending ? (
                    <ActivityIndicator color={colors.paper} />
                  ) : (
                    <Text style={styles.primaryButtonText}>{mode === 'login' ? 'Entrar na conta' : 'Criar minha conta'}</Text>
                  )}
                </Pressable>
                <Text style={styles.formFootnote}>AUTENTICAÇÃO SEGURA · PARSE SERVER</Text>
              </View>

              <Text style={styles.screenFooter}>BACK4APP  ·  PARSE USER API</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  topBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  brandMark: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.green,
  },
  brandMarkText: {
    color: colors.lime,
    fontSize: 17,
    fontWeight: '800',
  },
  brandName: {
    marginLeft: 10,
    color: colors.ink,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  topBarSpacer: {
    flex: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.paleGreen,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.green,
  },
  liveLabel: {
    color: colors.green,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  authScreen: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingTop: 42,
  },
  authHeading: {
    marginBottom: 28,
  },
  headingAccent: {
    width: 38,
    height: 5,
    marginBottom: 22,
    borderRadius: 3,
    backgroundColor: colors.coral,
  },
  eyebrow: {
    marginBottom: 10,
    color: colors.green,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  title: {
    maxWidth: 380,
    color: colors.ink,
    fontSize: 35,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: 0,
  },
  subtitle: {
    marginTop: 10,
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  formPanel: {
    padding: 18,
    borderRadius: 8,
    backgroundColor: colors.paper,
  },
  segment: {
    flexDirection: 'row',
    padding: 4,
    marginBottom: 24,
    borderRadius: 7,
    backgroundColor: colors.background,
  },
  segmentButton: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  segmentButtonSelected: {
    backgroundColor: colors.green,
  },
  segmentText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  segmentTextSelected: {
    color: colors.paper,
  },
  fieldGroup: {
    marginBottom: 17,
  },
  fieldLabel: {
    marginBottom: 8,
    color: colors.ink,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  input: {
    height: 48,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 6,
    color: colors.ink,
    fontSize: 14,
    backgroundColor: colors.paper,
  },
  messageBox: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: colors.coral,
    borderRadius: 4,
    backgroundColor: '#FBEEEA',
  },
  messageText: {
    color: colors.error,
    fontSize: 12,
    lineHeight: 18,
  },
  setupNote: {
    padding: 12,
    marginBottom: 14,
    borderRadius: 5,
    backgroundColor: '#F6F1D9',
  },
  setupNoteTitle: {
    marginBottom: 3,
    color: colors.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  setupNoteText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  primaryButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: colors.green,
  },
  primaryButtonText: {
    color: colors.paper,
    fontSize: 14,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.6,
  },
  formFootnote: {
    marginTop: 16,
    color: colors.muted,
    textAlign: 'center',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  screenFooter: {
    marginTop: 32,
    color: colors.muted,
    textAlign: 'center',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  profileScreen: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingTop: 42,
  },
  profileHeading: {
    marginBottom: 28,
  },
  identityBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  avatar: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: colors.lime,
  },
  avatarText: {
    color: colors.green,
    fontSize: 18,
    fontWeight: '800',
  },
  identityText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 13,
  },
  identityName: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '800',
  },
  identityHandle: {
    marginTop: 3,
    color: colors.muted,
    fontSize: 13,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.paleGreen,
  },
  activeLabel: {
    color: colors.green,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  detailsSection: {
    marginTop: 28,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '800',
  },
  sectionCount: {
    color: colors.coral,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  detailsList: {
    borderTopWidth: 1,
    borderColor: colors.line,
  },
  profileRow: {
    minHeight: 53,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  profileLabel: {
    color: colors.muted,
    fontSize: 12,
  },
  profileValue: {
    flex: 1,
    color: colors.ink,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '700',
  },
  feedback: {
    marginTop: 14,
    color: colors.error,
    fontSize: 12,
    lineHeight: 18,
  },
  secondaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.green,
    borderRadius: 6,
  },
  secondaryButtonText: {
    color: colors.green,
    fontSize: 14,
    fontWeight: '800',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 14,
  },
});