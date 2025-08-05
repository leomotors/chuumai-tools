# Test Fixtures for diffInMusicData

This directory contains JSON fixtures for testing the `diffInMusicData` function. Each fixture file represents a specific test scenario.

## Fixture Files

### `new-records.json`

Tests the identification of new records that don't exist in the existing data.

- **Scenario**: Adding new music records
- **Tests**: New record detection

### `removed-records.json`

Tests the identification of records that exist in existing data but not in new data.

- **Scenario**: Removing music records
- **Tests**: Removed record detection

### `updated-records-all-fields.json`

Tests updates where all comparable fields (category, title, artist, image) have changed.

- **Scenario**: Complete record updates
- **Tests**: Full field update detection with all fields changed

### `partial-updates.json`

Tests updates where only some fields have changed.

- **Scenario**: Partial record updates
- **Tests**: Selective field update detection (only changed fields included)

### `no-changes.json`

Tests scenarios where data is identical between existing and new datasets.

- **Scenario**: No changes detected
- **Tests**: Empty update detection

### `multiple-changes.json`

Tests complex scenarios with new, updated, and removed records in a single operation.

- **Scenario**: Mixed operations
- **Tests**: Multiple change types simultaneously

### `real-world-data.json`

Tests with actual data samples from the real JSON files.

- **Scenario**: Real production data
- **Tests**: Real-world data handling

### `unicode-data.json`

Tests handling of special characters and Unicode content.

- **Scenario**: International characters and symbols
- **Tests**: Unicode and special character support

## Fixture Structure

Each fixture file follows this structure:

```json
{
  "existingData": [...],  // Array of existing music data
  "newData": [...],       // Array of new music data
  "expected": {           // Expected test results
    "newRecords": 0,
    "updatedRecords": 0,
    "removedRecords": 0,
    "newRecordIds": [],
    "updatedRecordIds": [],
    "removedRecordIds": [],
    "expectedUpdate": {},     // For single update tests
    "expectedUpdates": []     // For multiple update tests
  }
}
```

## Usage

Fixtures are loaded in the test file using:

```typescript
function loadFixture(filename: string) {
  const fixturePath = path.join(__dirname, "__fixtures__", filename);
  const data = fs.readFileSync(fixturePath, "utf-8");
  return JSON.parse(data);
}
```

## Benefits

1. **Separation of Concerns**: Test data is separated from test logic
2. **Maintainability**: Easy to update test data without touching test code
3. **Readability**: Tests are cleaner and more focused on logic
4. **Reusability**: Fixtures can be reused across different test files
5. **Size Management**: Large test data doesn't clutter test files
