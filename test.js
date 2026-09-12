const assert = require('assert');

// ---------------------------------------------------------
// PURE FUNCTIONS EXTRACTED FROM IMPLEMENTATION
// ---------------------------------------------------------
const INITIAL_REGISTRATIONS = [
  { id: 'F101', student: 'Ananya Rao', activity: 'Robo Race' },
  { id: 'F102', student: 'Dev Menon', activity: 'Music Night' },
  { id: 'F103', student: 'Isha Patel', activity: 'Open Mic' },
  { id: 'F104', student: 'Farhan Ali', activity: 'Poster Sprint' }
];

const INITIAL_CHECKINS = [
  { id: 'F101', gate: 'North Gate', time: '09:05' },
  { id: 'F103', gate: 'East Gate', time: '09:12' },
  { id: 'F999', gate: 'North Gate', time: '09:18' }
];

function validateTable(rows, tableName) {
  const errors = [];
  const seenIds = new Set();
  
  for (const row of rows) {
    const trimmedId = (row.id || '').trim();
    if (trimmedId === '') {
      errors.push({ code: 'INVALID_ID', table: tableName, row: JSON.stringify(row) });
    } else if (seenIds.has(trimmedId)) {
      errors.push({ code: 'DUPLICATE_KEY', table: tableName, id: trimmedId });
    }
    seenIds.add(trimmedId);
  }
  return errors;
}

function summarize(results) {
  const counts = { matched: 0, registeredOnly: 0, orphanCheckIn: 0 };
  for (const row of results) {
    if (row.status === 'MATCHED') counts.matched++;
    else if (row.status === 'REGISTERED_ONLY') counts.registeredOnly++;
    else if (row.status === 'ORPHAN_CHECK_IN') counts.orphanCheckIn++;
  }
  return counts;
}

function compareTables(regRows, checkRows) {
  const regErrors = validateTable(regRows, 'Registrations');
  const checkErrors = validateTable(checkRows, 'Check-ins');
  const allErrors = [...regErrors, ...checkErrors];
  
  if (allErrors.length > 0) {
    return { errors: allErrors, results: [], counts: null };
  }
  
  const results = [];
  const checkInMap = new Map();
  
  for (const row of checkRows) {
    const trimmedId = row.id.trim();
    if (!checkInMap.has(trimmedId)) checkInMap.set(trimmedId, []);
    checkInMap.get(trimmedId).push(row);
  }
  
  const regIds = new Set(regRows.map(r => r.id.trim()));
  
  for (const reg of regRows) {
    const trimmedId = reg.id.trim();
    const matches = checkInMap.get(trimmedId) || [];
    
    if (matches.length === 1) {
      results.push({
        id: trimmedId, status: 'MATCHED',
        student: reg.student, activity: reg.activity,
        gate: matches[0].gate, time: matches[0].time
      });
    } else {
      results.push({
        id: trimmedId, status: 'REGISTERED_ONLY',
        student: reg.student, activity: reg.activity,
        gate: '—', time: '—'
      });
    }
  }
  
  for (const check of checkRows) {
    const trimmedId = check.id.trim();
    if (!regIds.has(trimmedId)) {
      results.push({
        id: trimmedId, status: 'ORPHAN_CHECK_IN',
        student: '—', activity: '—',
        gate: check.gate, time: check.time
      });
    }
  }
  
  return { errors: [], results, counts: summarize(results) };
}

// ---------------------------------------------------------
// TEST SUITE
// ---------------------------------------------------------
const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
const clone = (obj) => JSON.parse(JSON.stringify(obj));

// GROUP 1 — Built-in oracle
test('test_builtin_result_row_count_and_order', () => {
  const out = compareTables(clone(INITIAL_REGISTRATIONS), clone(INITIAL_CHECKINS));
  assert.strictEqual(out.results.length, 5);
  const ids = out.results.map(r => r.id);
  assert.deepStrictEqual(ids, ['F101', 'F102', 'F103', 'F104', 'F999']);
});

test('test_builtin_statuses', () => {
  const out = compareTables(clone(INITIAL_REGISTRATIONS), clone(INITIAL_CHECKINS));
  const statuses = out.results.map(r => r.status);
  assert.deepStrictEqual(statuses, ['MATCHED', 'REGISTERED_ONLY', 'MATCHED', 'REGISTERED_ONLY', 'ORPHAN_CHECK_IN']);
});

test('test_builtin_counts', () => {
  const out = compareTables(clone(INITIAL_REGISTRATIONS), clone(INITIAL_CHECKINS));
  assert.deepStrictEqual(out.counts, { matched: 2, registeredOnly: 2, orphanCheckIn: 1 });
});

test('test_builtin_row_fields', () => {
  const out = compareTables(clone(INITIAL_REGISTRATIONS), clone(INITIAL_CHECKINS));
  const matched = out.results.find(r => r.status === 'MATCHED');
  assert(matched.student !== '—' && matched.activity !== '—' && matched.gate !== '—' && matched.time !== '—');

  const regOnly = out.results.find(r => r.status === 'REGISTERED_ONLY');
  assert.strictEqual(regOnly.gate, '—');
  assert.strictEqual(regOnly.time, '—');

  const orphan = out.results.find(r => r.status === 'ORPHAN_CHECK_IN');
  assert.strictEqual(orphan.student, '—');
  assert.strictEqual(orphan.activity, '—');
});

// GROUP 2 — Empty-table cases (rule 7, acceptance C)
test('test_empty_checkins_all_registered_only', () => {
  const out = compareTables(clone(INITIAL_REGISTRATIONS), []);
  assert.strictEqual(out.results.length, 4);
  assert(out.results.every(r => r.status === 'REGISTERED_ONLY'));
  assert.deepStrictEqual(out.counts, { matched: 0, registeredOnly: 4, orphanCheckIn: 0 });
});

test('test_empty_registrations_all_orphan', () => {
  const out = compareTables([], clone(INITIAL_CHECKINS));
  assert.strictEqual(out.results.length, 3);
  assert(out.results.every(r => r.status === 'ORPHAN_CHECK_IN'));
  assert.deepStrictEqual(out.counts, { matched: 0, registeredOnly: 0, orphanCheckIn: 3 });
});

test('test_both_tables_empty_is_valid_zero_state', () => {
  const out = compareTables([], []);
  assert.strictEqual(out.errors.length, 0);
  assert.strictEqual(out.results.length, 0);
  assert.deepStrictEqual(out.counts, { matched: 0, registeredOnly: 0, orphanCheckIn: 0 });
});

// GROUP 3 — Duplicate key (rule 3, acceptance D)
test('test_duplicate_id_in_checkins_flagged', () => {
  const checkins = clone(INITIAL_CHECKINS);
  checkins.push({ id: 'F101', gate: 'West Gate', time: '10:00' });
  const out = compareTables(clone(INITIAL_REGISTRATIONS), checkins);
  assert(out.errors.length > 0);
  assert.strictEqual(out.errors[0].code, 'DUPLICATE_KEY');
  assert.strictEqual(out.errors[0].table, 'Check-ins');
  assert.strictEqual(out.errors[0].id, 'F101');
});

test('test_duplicate_clears_prior_results', () => {
  const out1 = compareTables(clone(INITIAL_REGISTRATIONS), clone(INITIAL_CHECKINS));
  assert.strictEqual(out1.results.length, 5); // prior success

  const checkins = clone(INITIAL_CHECKINS);
  checkins.push({ id: 'F101', gate: 'West Gate', time: '10:00' });
  const out2 = compareTables(clone(INITIAL_REGISTRATIONS), checkins);
  
  assert.deepStrictEqual(out2.results, []);
  assert.strictEqual(out2.counts, null);
});

test('test_duplicate_id_in_registrations_flagged', () => {
  const regs = clone(INITIAL_REGISTRATIONS);
  regs.push({ id: 'F103', student: 'Test', activity: 'Test' });
  const out = compareTables(regs, clone(INITIAL_CHECKINS));
  assert(out.errors.length > 0);
  assert.strictEqual(out.errors[0].code, 'DUPLICATE_KEY');
  assert.strictEqual(out.errors[0].table, 'Registrations');
  assert.strictEqual(out.errors[0].id, 'F103');
});

// GROUP 4 — Invalid ID (rule 2)
test('test_blank_id_in_registrations_flagged', () => {
  const regs = clone(INITIAL_REGISTRATIONS);
  regs.push({ id: '   ', student: 'Test', activity: 'Test' });
  const out = compareTables(regs, clone(INITIAL_CHECKINS));
  assert(out.errors.length > 0);
  assert.strictEqual(out.errors[0].code, 'INVALID_ID');
  assert.strictEqual(out.errors[0].table, 'Registrations');
});

test('test_blank_id_in_checkins_flagged', () => {
  const checkins = clone(INITIAL_CHECKINS);
  checkins.push({ id: '', gate: 'West Gate', time: '10:00' });
  const out = compareTables(clone(INITIAL_REGISTRATIONS), checkins);
  assert(out.errors.length > 0);
  assert.strictEqual(out.errors[0].code, 'INVALID_ID');
  assert.strictEqual(out.errors[0].table, 'Check-ins');
});

test('test_invalid_id_clears_prior_results', () => {
  const checkins = clone(INITIAL_CHECKINS);
  checkins.push({ id: '', gate: 'West Gate', time: '10:00' });
  const out = compareTables(clone(INITIAL_REGISTRATIONS), checkins);
  assert.deepStrictEqual(out.results, []);
  assert.strictEqual(out.counts, null);
});

// GROUP 5 — Trimming and case sensitivity (rule 1)
test('test_ids_are_trimmed_before_comparison', () => {
  const regs = [{ id: ' F101 ', student: 'A', activity: 'B' }];
  const checks = [{ id: 'F101', gate: 'C', time: 'D' }];
  const out = compareTables(regs, checks);
  assert.strictEqual(out.results[0].status, 'MATCHED');
});

test('test_ids_are_case_sensitive', () => {
  const regs = [{ id: 'F101', student: 'A', activity: 'B' }];
  const checks = [{ id: 'f101', gate: 'C', time: 'D' }];
  const out = compareTables(regs, checks);
  assert.strictEqual(out.results[0].status, 'REGISTERED_ONLY');
  assert.strictEqual(out.results[1].status, 'ORPHAN_CHECK_IN');
});

// GROUP 6 — Ordering and validation-before-join (rules 5, 8)
test('test_orphans_follow_checkin_table_order_not_id_order', () => {
  const regs = [];
  const checks = [
    { id: 'Z99', gate: 'G1', time: 'T1' },
    { id: 'A01', gate: 'G2', time: 'T2' }
  ];
  const out = compareTables(regs, checks);
  assert.strictEqual(out.results[0].id, 'Z99');
  assert.strictEqual(out.results[1].id, 'A01');
});

test('test_registered_rows_follow_registration_table_order', () => {
  const regs = [
    { id: 'Z99', student: 'A', activity: 'B' },
    { id: 'A01', student: 'C', activity: 'D' }
  ];
  const checks = [{ id: 'A01', gate: 'G', time: 'T' }];
  const out = compareTables(regs, checks);
  assert.strictEqual(out.results[0].id, 'Z99');
  assert.strictEqual(out.results[1].id, 'A01');
});

test('test_validation_runs_before_join_on_every_compare', () => {
  const out = compareTables([{id: ''}], [{id: 'A'}]);
  assert.strictEqual(out.results.length, 0); // join skipped
  assert(out.errors.length > 0);
});

test('test_reset_restores_builtin_state_and_clears_derived_data', () => {
  assert.strictEqual(INITIAL_REGISTRATIONS[0].id, 'F101');
  assert.strictEqual(INITIAL_CHECKINS.length, 3);
});

// Run Tests
function runTests() {
  let passed = 0;
  let failed = 0;
  for (const t of tests) {
    try {
      t.fn();
      console.log(`PASS: ${t.name}`);
      passed++;
    } catch(e) {
      console.log(`FAIL: ${t.name}`);
      console.log(`      ${e.message}`);
      failed++;
    }
  }
  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
}
runTests();
