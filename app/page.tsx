import puzzles from '@/data/puzzles.json';
import { GameClient } from './word-game';

export default function Home() {
  return <GameClient puzzles={puzzles} />;
}
