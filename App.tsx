import React from 'react';
import { DEFAULT_GAME_DEFINITION } from './src/game/defaultGame';
import { useGameUniverse } from './src/ui/hooks/useGameUniverse';
import { HeadquartersScreen } from './src/ui/HeadquartersScreen';

export default function App() {
  const session = useGameUniverse(DEFAULT_GAME_DEFINITION);
  return <HeadquartersScreen state={session.universe.headquarters} restartDay={session.restartHeadquarters} />;
}
