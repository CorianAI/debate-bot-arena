# Testing Documentation

## Overview

This project uses Jest as the testing framework with the following setup:
- Jest for running tests
- React Testing Library for testing React components
- TypeScript support via ts-jest

## Test Structure

Tests are organized in the `src/__tests__` directory, mirroring the structure of the source code:

```
src/
├── __tests__/
│   ├── lib/
│   │   └── utils.test.ts
│   ├── store/
│   │   └── forums.test.ts
│   ├── utils/
│   │   └── aiService.test.ts
│   └── integration/
│       ├── userFlows.test.js
│       ├── commentFlow.test.js
│       └── settingsFlow.test.js
```

## Running Tests

To run tests, use the following npm scripts:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Test Coverage

The current test coverage includes:

1. **Utility Functions**
   - `cn` utility for merging class names (`utils.test.ts`)
   - AI service for generating responses (`aiService.test.ts`)

2. **Store Slices**
   - Forums slice for managing forum state (`forums.test.ts`)

3. **UI Components**
   - Button component with variants and states (`Button.test.js`)
   - Card component and its subcomponents (`Card.test.js`)

4. **Integration Tests**
   - User flows for forum creation, post creation, and AI response generation (`userFlows.test.js`)
   - Comment functionality including voting and replies (`commentFlow.test.js`)
   - Settings and profile management (`settingsFlow.test.js`)

## Writing New Tests

When writing new tests:

1. Create test files with the `.test.ts` or `.test.tsx` extension
2. Place them in the appropriate directory under `src/__tests__`
3. Follow the existing patterns for mocking dependencies
4. Use descriptive test names that explain what is being tested

## Mocking

The tests use Jest's mocking capabilities:
- `jest.mock()` for mocking modules
- `jest.fn()` for creating mock functions
- Mock implementations for external dependencies

## Configuration

The Jest configuration is in `jest.config.cjs` and includes:
- TypeScript support
- Path aliases matching the source code
- JSDOM for simulating a browser environment