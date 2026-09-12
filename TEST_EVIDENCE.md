# Test Evidence

## Test Mapping to Contract Rules & Acceptance Criteria

| Test Name | Covered Rule / Criterion | Description |
|---|---|---|
| `test_builtin_result_row_count_and_order` | Acc. A, Acc. B, Rule 5 | Proves 5 rows are generated in the exact frozen order. |
| `test_builtin_statuses` | Acc. B | Proves MATCHED, REGISTERED_ONLY, and ORPHAN_CHECK_IN statuses are correctly assigned. |
| `test_builtin_counts` | Acc. B | Proves summary counts strictly equal 2 / 2 / 1. |
| `test_builtin_row_fields` | Rule 6 | Proves missing fields correctly receive "—" instead of undefined/blank. |
| `test_empty_checkins_all_registered_only` | Rule 7, Acc. C | Proves 0 check-ins yields 4 REGISTERED_ONLY rows and zeroes other counts. |
| `test_empty_registrations_all_orphan` | Rule 7 | Proves 0 registrations yields pure ORPHAN_CHECK_IN rows. |
| `test_both_tables_empty_is_valid_zero_state` | Rule 7 | Proves zero inputs yield zero results and valid zeroed counts without error. |
| `test_duplicate_id_in_checkins_flagged` | Rule 3, Acc. D | Proves the DUPLICATE_KEY validation correctly identifies Check-in duplicates. |
| `test_duplicate_clears_prior_results` | Rule 8, Acc. D | Proves validation failure stops the join and returns empty results. |
| `test_duplicate_id_in_registrations_flagged` | Rule 3 | Proves DUPLICATE_KEY also works symmetrically on Registrations. |
| `test_blank_id_in_registrations_flagged` | Rule 2 | Proves INVALID_ID correctly catches empty IDs. |
| `test_blank_id_in_checkins_flagged` | Rule 2 | Proves INVALID_ID catches empty IDs on the right-side table. |
| `test_invalid_id_clears_prior_results` | Rule 8 | Proves INVALID_ID halts execution and forces result clearing. |
| `test_ids_are_trimmed_before_comparison` | Rule 1 | Proves leading/trailing whitespace doesn't break comparisons. |
| `test_ids_are_case_sensitive` | Rule 1 | Proves `f101` and `F101` are treated independently without throwing validation errors. |
| `test_orphans_follow_checkin_table_order_not_id_order`| Rule 5 | Proves the anti-join iterates the array, avoiding ID-based sorting re-arrangements. |
| `test_registered_rows_follow_registration_table_order`| Rule 5 | Proves the left-join respects the native input iteration order. |
| `test_validation_runs_before_join_on_every_compare` | Rule 8 | Proves the join logic never executes if errors are present. |
| `test_reset_restores_builtin_state_and_clears_derived_data`| Rule 9, Acc. E | Proves the initial frozen state constants are left untouched for deterministic resets. |

## Execution Output

```text
PASS: test_builtin_result_row_count_and_order
PASS: test_builtin_statuses
PASS: test_builtin_counts
PASS: test_builtin_row_fields
PASS: test_empty_checkins_all_registered_only
PASS: test_empty_registrations_all_orphan
PASS: test_both_tables_empty_is_valid_zero_state
PASS: test_duplicate_id_in_checkins_flagged
PASS: test_duplicate_clears_prior_results
PASS: test_duplicate_id_in_registrations_flagged
PASS: test_blank_id_in_registrations_flagged
PASS: test_blank_id_in_checkins_flagged
PASS: test_invalid_id_clears_prior_results
PASS: test_ids_are_trimmed_before_comparison
PASS: test_ids_are_case_sensitive
PASS: test_orphans_follow_checkin_table_order_not_id_order
PASS: test_registered_rows_follow_registration_table_order
PASS: test_validation_runs_before_join_on_every_compare
PASS: test_reset_restores_builtin_state_and_clears_derived_data

Results: 19 passed, 0 failed.
```
