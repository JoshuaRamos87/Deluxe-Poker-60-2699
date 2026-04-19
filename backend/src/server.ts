import fastify from 'fastify';
import cors from '@fastify/cors';
import { v4 as uuidv4 } from 'uuid';
import { Card, GameSession, HandRank, GamePhase } from './types.js';
import { createDeck, shuffle, evaluateHand } from './logic.js';

const server = fastify({ logger: true });

// Register CORS
server.register(cors, {
  origin: '*', // In production, this should be restricted
});

// In-memory session storage
const sessions = new Map<string, GameSession>();

// Initialize a new session
server.post('/api/game/new', async (request, reply) => {
  const sessionId = uuidv4();
  const session: GameSession = {
    sessionId,
    currentPlayer: 1,
    p1Score: 0,
    p2Score: 0,
    deck: [],
    currentHand: [],
    heldIndices: [false, false, false, false, false],
    phase: 'idle',
  };
  sessions.set(sessionId, session);
  return { sessionId, currentPlayer: session.currentPlayer, p1Score: session.p1Score, p2Score: session.p2Score, phase: session.phase };
});

// Get current state
server.get('/api/game/:sessionId', async (request, reply) => {
  const { sessionId } = request.params as { sessionId: string };
  const session = sessions.get(sessionId);
  if (!session) {
    return reply.status(404).send({ error: 'Session not found' });
  }
  return session;
});

// Deal Phase
server.post('/api/game/:sessionId/deal', async (request, reply) => {
  const { sessionId } = request.params as { sessionId: string };
  const session = sessions.get(sessionId);
  if (!session) return reply.status(404).send({ error: 'Session not found' });

  if (session.phase !== 'idle' && session.phase !== 'gameover') {
    return reply.status(400).send({ error: 'Invalid phase for deal' });
  }

  const deck = shuffle(createDeck());
  const hand = deck.splice(0, 5);
  
  session.deck = deck;
  session.currentHand = hand;
  session.heldIndices = [false, false, false, false, false];
  session.phase = 'dealt';

  return { 
    currentHand: session.currentHand, 
    phase: session.phase,
    currentPlayer: session.currentPlayer,
    p1Score: session.p1Score,
    p2Score: session.p2Score
  };
});

// Draw Phase
server.post('/api/game/:sessionId/draw', async (request, reply) => {
  const { sessionId } = request.params as { sessionId: string };
  const { heldIndices } = request.body as { heldIndices: boolean[] };
  const session = sessions.get(sessionId);
  if (!session) return reply.status(404).send({ error: 'Session not found' });

  if (session.phase !== 'dealt') {
    return reply.status(400).send({ error: 'Invalid phase for draw' });
  }

  const newHand = [...session.currentHand];
  for (let i = 0; i < 5; i++) {
    if (!heldIndices[i]) {
      newHand[i] = session.deck.pop()!;
    }
  }

  const { rank, points } = evaluateHand(newHand);
  
  if (session.currentPlayer === 1) {
    session.p1Score += points;
  } else {
    session.p2Score += points;
  }

  session.currentHand = newHand;
  session.heldIndices = heldIndices;
  session.phase = 'gameover';

  return {
    finalHand: session.currentHand,
    handRank: rank,
    pointsWon: points,
    p1Score: session.p1Score,
    p2Score: session.p2Score,
    phase: session.phase
  };
});

// Switch Player
server.post('/api/game/:sessionId/switch-player', async (request, reply) => {
  const { sessionId } = request.params as { sessionId: string };
  const session = sessions.get(sessionId);
  if (!session) return reply.status(404).send({ error: 'Session not found' });

  session.currentPlayer = session.currentPlayer === 1 ? 2 : 1;
  session.phase = 'idle';
  session.currentHand = [];
  session.heldIndices = [false, false, false, false, false];

  return {
    currentPlayer: session.currentPlayer,
    phase: session.phase,
    p1Score: session.p1Score,
    p2Score: session.p2Score
  };
});

const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server is running on http://localhost:3000');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
