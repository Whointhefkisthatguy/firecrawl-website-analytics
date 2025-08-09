import { config, validateConfig } from '@/lib/config';

describe('Config', () => {
  it('should have all required configuration properties', () => {
    expect(config.clerk).toBeDefined();
    expect(config.stripe).toBeDefined();
    expect(config.supabase).toBeDefined();
    expect(config.app).toBeDefined();
    expect(config.credits).toBeDefined();
    expect(config.features).toBeDefined();
  });

  it('should have correct credit costs', () => {
    expect(config.credits.freeUserAllocation).toBe(5);
    expect(config.credits.editCost).toBe(1);
    expect(config.credits.regenerationCost).toBe(2.5);
  });

  it('should validate config without throwing in test environment', () => {
    expect(() => validateConfig()).not.toThrow();
  });
});