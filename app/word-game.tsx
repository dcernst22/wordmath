'use client';

import { useEffect, useMemo, useState } from 'react';

type Mode = 'daily' | 'practice';

type Puzzle = {
  id: number;
  date: string;
  answer: string;
  hint: string;
};

type LetterState = 'correct' | 'present' | 'absent';

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;
const KEY_ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

function getDailyPuzzle(puzzles: Puzzle[]): Puzzle {
  const start = new Date(puzzles[0].date);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const index = ((diffDays % puzzles.length) + puzzles.length) % puzzles.length;
  return puzzles[index];
}

function scoreGuess(guess: string, answer: string): LetterState[] {
  const result: LetterState[] = Array(WORD_LENGTH).fill('absent');
  const remaining = answer.split('');

  for (let i = 0; i < WORD_LENGTH; i += 1) {
    if (guess[i] === answer[i]) {
      result[i] = 'correct';
      remaining[i] = '_';
    }
  }

  for (let i = 0; i < WORD_LENGTH; i += 1) {
    if (result[i] !== 'correct') {
      const idx = remaining.indexOf(guess[i]);
      if (idx > -1) {
        result[i] = 'present';
        remaining[idx] = '_';
      }
    }
  }

  return result;
}

function randomPuzzle(puzzles: Puzzle[], currentId: number | null): Puzzle {
  if (puzzles.length < 2 || currentId === null) {
    return puzzles[Math.floor(Math.random() * puzzles.length)];
  }

  let candidate = puzzles[Math.floor(Math.random() * puzzles.length)];
  while (candidate.id === currentId) {
    candidate = puzzles[Math.floor(Math.random() * puzzles.length)];
  }
  return candidate;
}

export function GameClient({ puzzles }: { puzzles: Puzzle[] }) {
  const [mode, setMode] = useState<Mode>('daily');
  const [puzzle, setPuzzle] = useState<Puzzle>(() => getDailyPuzzle(puzzles));
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [message, setMessage] = useState('');

  const answer = puzzle.answer.toUpperCase();
  const isWon = guesses.includes(answer);
  const isLost = guesses.length >= MAX_GUESSES && !isWon;

  const evaluatedGuesses = useMemo(
    () => guesses.map((guess) => ({ guess, score: scoreGuess(guess, answer) })),
    [guesses, answer]
  );

  const keyboardMap = useMemo(() => {
    const entries = new Map<string, LetterState>();
    const rank: Record<LetterState, number> = { absent: 0, present: 1, correct: 2 };

    evaluatedGuesses.forEach(({ guess, score }) => {
      guess.split('').forEach((letter, i) => {
        const current = entries.get(letter);
        const next = score[i];
        if (!current || rank[next] > rank[current]) {
          entries.set(letter, next);
        }
      });
    });

    return entries;
  }, [evaluatedGuesses]);

  useEffect(() => {
    if (isWon) {
      setMessage('You solved it! 🎉');
    } else if (isLost) {
      setMessage(`Out of tries. Answer: ${answer}`);
    } else {
      setMessage('');
    }
  }, [answer, isLost, isWon]);

  function resetGame(nextMode: Mode) {
    const nextPuzzle = nextMode === 'daily' ? getDailyPuzzle(puzzles) : randomPuzzle(puzzles, puzzle.id);
    setMode(nextMode);
    setPuzzle(nextPuzzle);
    setGuesses([]);
    setCurrentGuess('');
    setMessage('');
  }

  function onKey(key: string) {
    if (isWon || isLost) {
      return;
    }

    if (key === 'ENTER') {
      if (currentGuess.length !== WORD_LENGTH) {
        setMessage('Guess must be 5 letters.');
        return;
      }
      setGuesses((prev) => [...prev, currentGuess]);
      setCurrentGuess('');
      return;
    }

    if (key === 'BACKSPACE') {
      setCurrentGuess((prev) => prev.slice(0, -1));
      return;
    }

    if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess((prev) => `${prev}${key}`);
    }
  }

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const raw = event.key.toUpperCase();
      if (raw === 'ENTER' || raw === 'BACKSPACE' || /^[A-Z]$/.test(raw)) {
        event.preventDefault();
        onKey(raw);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // ignore registration errors in development
      });
    }
  }, []);

  const boardRows = Array.from({ length: MAX_GUESSES }, (_, i) => {
    if (i < guesses.length) {
      return { guess: guesses[i], score: scoreGuess(guesses[i], answer) };
    }
    if (i === guesses.length) {
      return {
        guess: `${currentGuess}${' '.repeat(WORD_LENGTH - currentGuess.length)}`,
        score: Array(WORD_LENGTH).fill(null)
      };
    }
    return { guess: ' '.repeat(WORD_LENGTH), score: Array(WORD_LENGTH).fill(null) };
  });

  return (
    <main className="container">
      <header>
        <h1>Wordmath</h1>
        <p>Daily + Practice mode, optimized for mobile.</p>
      </header>

      <section className="modeRow">
        <button className={mode === 'daily' ? 'active' : ''} onClick={() => resetGame('daily')}>
          Daily
        </button>
        <button className={mode === 'practice' ? 'active' : ''} onClick={() => resetGame('practice')}>
          Practice
        </button>
      </section>

      <section className="meta">
        <span>Puzzle #{puzzle.id}</span>
        <span>Hint: {puzzle.hint}</span>
      </section>

      <section className="board" aria-label="Guess board">
        {boardRows.map((row, rIndex) => (
          <div className="row" key={`row-${rIndex}`}>
            {row.guess.split('').map((char, cIndex) => {
              const state = row.score[cIndex] as LetterState | null;
              return (
                <div key={`cell-${rIndex}-${cIndex}`} className={`cell ${state ?? ''}`.trim()}>
                  {char.trim()}
                </div>
              );
            })}
          </div>
        ))}
      </section>

      <p className="message">{message || 'Type your guess using keyboard or on-screen keys.'}</p>

      <section className="keyboard" aria-label="On-screen keyboard">
        {KEY_ROWS.map((row) => (
          <div className="keyRow" key={row}>
            {row === 'ZXCVBNM' && (
              <button className="key wide" onClick={() => onKey('ENTER')}>
                Enter
              </button>
            )}
            {row.split('').map((key) => (
              <button
                className={`key ${keyboardMap.get(key) ?? ''}`.trim()}
                key={key}
                onClick={() => onKey(key)}
              >
                {key}
              </button>
            ))}
            {row === 'ZXCVBNM' && (
              <button className="key wide" onClick={() => onKey('BACKSPACE')}>
                ⌫
              </button>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}
