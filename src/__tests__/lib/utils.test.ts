const { cn } = require('@/lib/utils');

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    // Test with simple strings
    expect(cn('class1', 'class2')).toBe('class1 class2');
    
    // Test with conditional classes
    expect(cn('base', true && 'included', false && 'excluded')).toBe('base included');
    
    // Test with object notation
    expect(cn('base', { 'active': true, 'disabled': false })).toBe('base active');
    
    // Test with array notation
    expect(cn('base', ['array-class', 'another-class'])).toBe('base array-class another-class');
    
    // Test with mixed inputs
    expect(cn(
      'base-class',
      { 'conditional': true },
      ['array-class'],
      false && 'not-included',
      undefined,
      null
    )).toBe('base-class conditional array-class');
  });
  
  it('should handle tailwind class conflicts correctly', () => {
    // Test tailwind class merging (tailwind-merge functionality)
    expect(cn('p-4', 'p-6')).toBe('p-6');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    expect(cn('bg-red-500', 'bg-opacity-50')).toBe('bg-red-500 bg-opacity-50');
    expect(cn('px-2 py-1', 'p-3')).toBe('p-3');
  });
});