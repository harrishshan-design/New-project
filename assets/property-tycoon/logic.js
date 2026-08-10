export const meta = {
  game: "realitygenius-property-tycoon",
  version: 1,
  minPlayers: 1,
  maxPlayers: 1,
  deterministic: true
};

export function setup() {
  return { turn: 1, maxTurns: 12, cash: 1000000, points: 100, properties: [], actionUsed: false, complete: false };
}

export function validateAction(state, action) {
  if (!state || !action?.type) return { ok: false, error: "Invalid action" };
  if (state.complete) return { ok: false, error: "Campaign complete" };
  if (["buy", "upgrade"].includes(action.type) && state.actionUsed) return { ok: false, error: "Turn action already used" };
  if (action.type === "buy" && (!Number.isFinite(action.price) || action.price <= 0 || action.price > state.cash)) return { ok: false, error: "Invalid or unaffordable price" };
  if (! ["buy", "upgrade", "endTurn"].includes(action.type)) return { ok: false, error: "Unknown action" };
  return { ok: true };
}

export function applyAction(state, action) {
  const check = validateAction(state, action);
  if (!check.ok) return state;
  if (action.type === "buy") return { ...state, cash: state.cash - action.price, properties: [...state.properties, action.locationId], points: state.points + 25, actionUsed: true };
  if (action.type === "upgrade") return { ...state, cash: state.cash - Math.max(0, action.cost || 0), points: state.points + 15, actionUsed: true };
  const nextTurn = state.turn + 1;
  return { ...state, turn: Math.min(nextTurn, state.maxTurns), actionUsed: false, complete: nextTurn > state.maxTurns };
}

export function isGameOver(state) {
  return { over: Boolean(state?.complete), reason: state?.complete ? "turn_limit" : null };
}

export function viewFor(state) {
  return JSON.parse(JSON.stringify(state));
}
