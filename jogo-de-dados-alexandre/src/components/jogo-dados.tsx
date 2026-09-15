import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Dado, type ValorDado } from '@/components/dado';

const TOTAL_RODADAS = 5;
type Jogador = 'A' | 'B';
type Resultado = 'ganhou' | 'perdeu' | 'empatou' | 'aguardando';
type PlacarRodada = { rodada: number; vencedor: Jogador | 'Empate' };

type EstadoJogador = {
  dados: [ValorDado, ValorDado];
  resultado: Resultado;
};

const estadoInicialJogador: EstadoJogador = {
  dados: [1, 1],
  resultado: 'aguardando',
};

function sortearDado(): ValorDado {
  return (Math.floor(Math.random() * 6) + 1) as ValorDado;
}

function resultadoDoJogador(
  jogador: Jogador,
  somaA: number,
  somaB: number,
): Resultado {
  if (somaA === somaB) return 'empatou';
  const jogadorAvenceu = somaA > somaB;
  const venceu = jogador === 'A' ? jogadorAvenceu : !jogadorAvenceu;
  return venceu ? 'ganhou' : 'perdeu';
}

const textoResultado: Record<Resultado, string> = {
  ganhou: 'Ganhou',
  perdeu: 'Perdeu',
  empatou: 'Empatou',
  aguardando: 'Aguardando',
};

export function JogoDados() {
  const insets = useSafeAreaInsets();
  const [rodada, setRodada] = useState(1);
  const [jogadorAtivo, setJogadorAtivo] = useState<Jogador>('A');
  const [jogadores, setJogadores] = useState({
    A: estadoInicialJogador,
    B: estadoInicialJogador,
  });
  const [placar, setPlacar] = useState({ A: 0, B: 0 });
  const [historico, setHistorico] = useState<PlacarRodada[]>([]);
  const [rodadaConcluida, setRodadaConcluida] = useState(false);
  const [partidaConcluida, setPartidaConcluida] = useState(false);

  const jogar = (jogador: Jogador) => {
    if (partidaConcluida || jogador !== jogadorAtivo) return;

    const novoJogador: EstadoJogador = {
      dados: [sortearDado(), sortearDado()],
      resultado: 'aguardando',
    };
    const novosJogadores = { ...jogadores, [jogador]: novoJogador };
    setJogadores(novosJogadores);

    if (jogador === 'A') {
      setJogadorAtivo('B');
      return;
    }

    const somaA = novosJogadores.A.dados[0] + novosJogadores.A.dados[1];
    const somaB = novosJogadores.B.dados[0] + novosJogadores.B.dados[1];
    const vencedor: Jogador | 'Empate' = somaA === somaB ? 'Empate' : somaA > somaB ? 'A' : 'B';
    const novosResultados = {
      A: { ...novosJogadores.A, resultado: resultadoDoJogador('A', somaA, somaB) },
      B: { ...novosJogadores.B, resultado: resultadoDoJogador('B', somaA, somaB) },
    };
    const novoPlacar = {
      ...placar,
      ...(vencedor === 'A' ? { A: placar.A + 1 } : {}),
      ...(vencedor === 'B' ? { B: placar.B + 1 } : {}),
    };

    setJogadores(novosResultados);
    setPlacar(novoPlacar);
    setHistorico([...historico, { rodada, vencedor }]);
    setRodadaConcluida(true);

    if (rodada === TOTAL_RODADAS) {
      setPartidaConcluida(true);
    } else {
      setJogadorAtivo('A');
    }
  };

  const iniciarProximaRodada = () => {
    if (!rodadaConcluida || partidaConcluida) return;
    setRodada(rodada + 1);
    setJogadores({ A: estadoInicialJogador, B: estadoInicialJogador });
    setRodadaConcluida(false);
  };

  const reiniciar = () => {
    setRodada(1);
    setJogadorAtivo('A');
    setJogadores({ A: estadoInicialJogador, B: estadoInicialJogador });
    setPlacar({ A: 0, B: 0 });
    setHistorico([]);
    setRodadaConcluida(false);
    setPartidaConcluida(false);
  };

  const vencedorDaPartida = placar.A === placar.B ? 'Empate geral' : `Jogador ${placar.A > placar.B ? 'A' : 'B'} venceu`;

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 28 }]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.kicker}>JOGO DE DADOS</Text>
        <Text style={styles.title}>{partidaConcluida ? 'Partida encerrada' : `Rodada ${rodada}`}</Text>
        <Text style={styles.subtitle}>
          {partidaConcluida ? vencedorDaPartida : 'A maior soma vence a rodada'}
        </Text>
      </View>

      <View style={styles.scoreboard}>
        <View><Text style={styles.scoreLabel}>JOGADOR A</Text><Text style={styles.score}>{placar.A}</Text></View>
        <View style={styles.scoreDivider}><Text style={styles.roundCount}>{rodada}/{TOTAL_RODADAS}</Text><Text style={styles.roundLabel}>RODADAS</Text></View>
        <View style={styles.scoreRight}><Text style={styles.scoreLabel}>JOGADOR B</Text><Text style={styles.score}>{placar.B}</Text></View>
      </View>

      <View style={styles.players}>
        <PlayerCard jogador="A" estado={jogadores.A} onPress={() => jogar('A')} enabled={jogadorAtivo === 'A' && !rodadaConcluida && !partidaConcluida} />
        <PlayerCard jogador="B" estado={jogadores.B} onPress={() => jogar('B')} enabled={jogadorAtivo === 'B' && !rodadaConcluida && !partidaConcluida} />
      </View>

      {rodadaConcluida && !partidaConcluida && (
        <Pressable style={styles.nextButton} onPress={iniciarProximaRodada}>
          <Text style={styles.nextButtonText}>Próxima rodada</Text>
        </Pressable>
      )}

      {partidaConcluida && (
        <View style={styles.finalPanel}>
          <Text style={styles.finalTitle}>{vencedorDaPartida}</Text>
          <Text style={styles.finalText}>Placar final: {placar.A} x {placar.B}</Text>
          <Pressable style={styles.restartButton} onPress={reiniciar}>
            <Text style={styles.restartText}>Jogar Novamente</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.history}>
        <Text style={styles.historyTitle}>Histórico da partida</Text>
        {historico.length === 0 ? <Text style={styles.emptyHistory}>As rodadas concluídas aparecerão aqui.</Text> : historico.map((item) => (
          <View key={item.rodada} style={styles.historyRow}>
            <Text style={styles.historyRound}>Rodada {item.rodada}</Text>
            <Text style={styles.historyWinner}>{item.vencedor === 'Empate' ? 'Empate' : `Jogador ${item.vencedor}`}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

type PlayerCardProps = {
  jogador: Jogador;
  estado: EstadoJogador;
  onPress: () => void;
  enabled: boolean;
};

function PlayerCard({ jogador, estado, onPress, enabled }: PlayerCardProps) {
  const soma = estado.dados[0] + estado.dados[1];
  const resultado = textoResultado[estado.resultado];
  return (
    <View style={[styles.playerCard, jogador === 'B' && styles.playerCardB]}>
      <View style={styles.playerHeading}>
        <Text style={styles.playerName}>Jogador {jogador}</Text>
        <Text style={[styles.status, estado.resultado === 'ganhou' && styles.statusWinner, estado.resultado === 'perdeu' && styles.statusLoser]}>{resultado}</Text>
      </View>
      <View style={styles.diceRow}><Dado valor={estado.dados[0]} /><Dado valor={estado.dados[1]} /></View>
      <View style={styles.sumRow}><Text style={styles.sumLabel}>SOMA</Text><Text style={styles.sum}>{estado.resultado === 'aguardando' ? '--' : soma}</Text></View>
      <Pressable disabled={!enabled} onPress={onPress} style={({ pressed }) => [styles.playButton, !enabled && styles.playButtonDisabled, pressed && styles.playButtonPressed]}>
        <Text style={[styles.playText, !enabled && styles.playTextDisabled]}>{enabled ? 'Jogar Dado' : estado.resultado === 'aguardando' ? 'Aguardando' : 'Concluído'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingHorizontal: 20, backgroundColor: '#F7F5F0' },
  header: { alignItems: 'center', marginBottom: 22 },
  kicker: { color: '#C45132', fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  title: { color: '#17202A', fontSize: 38, fontWeight: '900', marginTop: 5 },
  subtitle: { color: '#6C706F', fontSize: 15, marginTop: 3 },
  scoreboard: { backgroundColor: '#17202A', borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, marginBottom: 18 },
  scoreLabel: { color: '#AEB5B5', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  score: { color: '#F7F5F0', fontSize: 30, fontWeight: '900', marginTop: 2 },
  scoreRight: { alignItems: 'flex-end' },
  scoreDivider: { alignItems: 'center', borderLeftColor: '#455057', borderLeftWidth: 1, borderRightColor: '#455057', borderRightWidth: 1, paddingHorizontal: 22 },
  roundCount: { color: '#F4A261', fontSize: 17, fontWeight: '900' },
  roundLabel: { color: '#AEB5B5', fontSize: 9, fontWeight: '800', letterSpacing: 1, marginTop: 2 },
  players: { gap: 14 },
  playerCard: { backgroundColor: '#FFFFFF', borderColor: '#E6DDD2', borderRadius: 20, borderWidth: 1, padding: 18, shadowColor: '#1B262C', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  playerCardB: { borderColor: '#BCD8D0' },
  playerHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  playerName: { color: '#17202A', fontSize: 22, fontWeight: '900' },
  status: { backgroundColor: '#F1EEE8', borderRadius: 12, color: '#77756F', fontSize: 11, fontWeight: '800', overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 5 },
  statusWinner: { backgroundColor: '#D7EDE5', color: '#18745B' },
  statusLoser: { backgroundColor: '#F8DED5', color: '#A6412B' },
  diceRow: { flexDirection: 'row', gap: 14, justifyContent: 'center', marginVertical: 15 },
  sumRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sumLabel: { color: '#898C89', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  sum: { color: '#17202A', fontSize: 22, fontWeight: '900' },
  playButton: { alignItems: 'center', backgroundColor: '#C45132', borderRadius: 13, paddingVertical: 13 },
  playButtonDisabled: { backgroundColor: '#E8E4DE' },
  playButtonPressed: { opacity: 0.75 },
  playText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  playTextDisabled: { color: '#9D9B95' },
  nextButton: { alignItems: 'center', backgroundColor: '#17202A', borderRadius: 14, marginTop: 18, paddingVertical: 15 },
  nextButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  finalPanel: { alignItems: 'center', backgroundColor: '#F4A261', borderRadius: 20, marginTop: 18, padding: 20 },
  finalTitle: { color: '#17202A', fontSize: 25, fontWeight: '900' },
  finalText: { color: '#4C3B2F', fontSize: 15, marginTop: 4 },
  restartButton: { backgroundColor: '#17202A', borderRadius: 13, marginTop: 15, paddingHorizontal: 24, paddingVertical: 13 },
  restartText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  history: { marginTop: 24 },
  historyTitle: { color: '#17202A', fontSize: 16, fontWeight: '900', marginBottom: 9 },
  emptyHistory: { color: '#898C89', fontSize: 13, paddingBottom: 8 },
  historyRow: { borderBottomColor: '#E6DDD2', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9 },
  historyRound: { color: '#6C706F', fontSize: 13 },
  historyWinner: { color: '#17202A', fontSize: 13, fontWeight: '800' },
});
