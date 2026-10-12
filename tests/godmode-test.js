import { GodMode } from '../js/godmode.js';
import { Leaderboard } from '../js/leaderboard.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

console.log('--- Civciv Runner God Mode Tests ---');

// 1. Initial State
GodMode.active = false;
GodMode.usedInRun = false;
assert(GodMode.active === false, 'Initial state: GodMode.active is false');
assert(GodMode.usedInRun === false, 'Initial state: GodMode.usedInRun is false');

// 2. Toggle on
GodMode.toggle();
assert(GodMode.active === true, 'GodMode.toggle() activates god mode');
assert(GodMode.usedInRun === true, 'Activating God Mode marks usedInRun = true');
assert(GodMode.toastTimer > 0, 'God Mode toggle sets notification timer');

// 3. Toggle off during run
GodMode.toggle();
assert(GodMode.active === false, 'GodMode.toggle() turns off active state');
assert(GodMode.usedInRun === true, 'usedInRun remains true even after turning active off during run');

// 4. Reset Run when starting a fresh game with GodMode OFF
GodMode.active = false;
GodMode.resetRun();
assert(GodMode.usedInRun === false, 'Fresh run with GodMode OFF resets usedInRun to false');

// 5. Reset Run when starting a fresh game with GodMode ON
GodMode.active = true;
GodMode.resetRun();
assert(GodMode.usedInRun === true, 'Fresh run with GodMode ON preserves usedInRun = true');

// Clean up
GodMode.active = false;
GodMode.usedInRun = false;

console.log(`\nResult: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
