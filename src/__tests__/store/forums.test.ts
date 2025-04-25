const { createForumsSlice } = require('@/store/forums');
const { AppState } = require('@/store/types');

// Mock uuid to return predictable values
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mocked-uuid')
}));

describe('Forums Slice', () => {
  // Test setup
  let forumSlice;
  let mockSet;
  let mockGetState;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock state and set function
    mockSet = jest.fn();
    mockGetState = jest.fn().mockReturnValue({
      forums: {
        '1': {
          id: '1',
          name: 'Project Ideas',
          description: 'Share and discuss project ideas',
          rules: 'Be constructive with criticism. No personal attacks.',
          systemPrompt: 'This is a forum for discussing project ideas.'
        },
        '2': {
          id: '2',
          name: 'Tech Debate',
          description: 'Debate technology choices and trends',
          rules: 'Back up claims with examples. Stay on topic.',
          systemPrompt: 'This is a forum for debating technology choices.'
        }
      },
      selectedForumId: null
    });
    
    // Create the slice
    forumSlice = createForumsSlice(
      (fn) => {
        if (typeof fn === 'function') {
          mockSet(fn(mockGetState()));
        } else {
          mockSet(fn);
        }
      },
      mockGetState,
      () => ({})
    );
  });

  describe('Initial State', () => {
    it('should have default forums', () => {
      // Assert
      expect(Object.keys(forumSlice.forums).length).toBe(2);
      expect(forumSlice.forums['1'].name).toBe('Project Ideas');
      expect(forumSlice.forums['2'].name).toBe('Tech Debate');
    });

    it('should have null as the initial selected forum', () => {
      // Assert
      expect(forumSlice.selectedForumId).toBeNull();
    });
  });

  describe('addForum', () => {
    it('should add a new forum with the provided details', () => {
      // Arrange
      const name = 'New Forum';
      const description = 'A new forum for testing';
      const rules = 'Test rules';
      const systemPrompt = 'Test system prompt';

      // Act
      const newForumId = forumSlice.addForum(name, description, rules, systemPrompt);

      // Assert
      expect(newForumId).toBe('mocked-uuid');
      expect(mockSet).toHaveBeenCalledTimes(1);
      
      // Check the structure of the set call
      const setArg = mockSet.mock.calls[0][0];
      expect(setArg.forums['mocked-uuid']).toEqual({
        id: 'mocked-uuid',
        name,
        description,
        rules,
        systemPrompt
      });
    });

    it('should preserve existing forums when adding a new one', () => {
      // Arrange
      const name = 'New Forum';
      const description = 'A new forum for testing';
      const rules = 'Test rules';
      const systemPrompt = 'Test system prompt';

      // Act
      forumSlice.addForum(name, description, rules, systemPrompt);

      // Assert
      const setArg = mockSet.mock.calls[0][0];
      expect(Object.keys(setArg.forums).length).toBe(3);
      expect(setArg.forums['1']).toBeDefined();
      expect(setArg.forums['2']).toBeDefined();
      expect(setArg.forums['mocked-uuid']).toBeDefined();
    });
  });

  describe('setSelectedForum', () => {
    it('should update the selected forum ID', () => {
      // Act
      forumSlice.setSelectedForum('2');

      // Assert
      expect(mockSet).toHaveBeenCalledWith({ selectedForumId: '2' });
    });

    it('should allow setting the selected forum to null', () => {
      // Act
      forumSlice.setSelectedForum(null);

      // Assert
      expect(mockSet).toHaveBeenCalledWith({ selectedForumId: null });
    });
  });
});