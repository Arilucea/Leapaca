# Test Suite

This directory contains automated tests for the Leapaca project.

## Setup

### Python Tests

```bash
# Install dependencies
pip install -r tests/requirements.txt

# Run tests
python3 -m pytest tests/test_build.py -v

# Run with coverage
python3 -m pytest tests/test_build.py -v --cov=. --cov-report=html
```

### JavaScript Tests

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## Test Structure

- `test_build.py` - Unit tests for the Python build script
  - App name validation
  - File merging (CSS, JSON)
  - Build process
  - Error handling

- `extension.test.js` - Integration tests for extension functionality
  - Storage error handling
  - Speed validation
  - Utility functions (debounce, throttle)
  - i18n module
  - Selector visibility checks

## Writing Tests

### Python Tests

Follow pytest conventions:

- Test files: `test_*.py`
- Test classes: `Test*`
- Test methods: `test_*`

### JavaScript Tests

Follow Jest conventions:

- Test files: `*.test.js`
- Use `describe()` for grouping
- Use `test()` or `it()` for individual tests
- Mock Chrome APIs as needed

## Coverage Goals

- Aim for >80% code coverage
- All error handling paths should be tested
- Edge cases must be covered
