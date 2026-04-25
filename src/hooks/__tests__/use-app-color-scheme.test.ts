import { resolveAppColorScheme } from '@/hooks/app-color-scheme';

describe('resolveAppColorScheme', () => {
  it.each([
    { preference: 'light', device: 'dark', expected: 'light' },
    { preference: 'dark', device: 'light', expected: 'dark' },
    { preference: 'system', device: 'light', expected: 'light' },
    { preference: 'system', device: 'dark', expected: 'dark' },
    { preference: 'system', device: null, expected: 'light' },
  ])('returns $expected for preference=$preference and device=$device', ({ preference, device, expected }) => {
    expect(resolveAppColorScheme(preference as never, device as never)).toBe(expected);
  });
});
