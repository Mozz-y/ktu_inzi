import { getDB } from '../../database/database';
import { UserRepository } from '../userRepository';

jest.mock('../../database/database', () => ({
  getDB: jest.fn(),
}));

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => 'mocked-uuid'),
}));

type FakeDb = {
  runAsync: jest.Mock;
  getFirstAsync: jest.Mock;
};

const fakeDb: FakeDb = {
  runAsync: jest.fn(),
  getFirstAsync: jest.fn(),
};

const mockedGetDB = getDB as jest.MockedFunction<typeof getDB>;

beforeEach(() => {
  mockedGetDB.mockReturnValue(fakeDb as any);
  fakeDb.runAsync.mockReset();
  fakeDb.getFirstAsync.mockReset();
});

describe('UserRepository', () => {
  it('returns current user when found', async () => {
    const existingUser = { id: 'user-1', created_at: 1000, theme_preference: 'dark' as const };
    fakeDb.getFirstAsync.mockResolvedValue(existingUser);

    const result = await UserRepository.getCurrentUser();

    expect(result).toEqual(existingUser);
    expect(fakeDb.getFirstAsync).toHaveBeenCalledWith('SELECT * FROM users LIMIT 1;');
  });

  it.each([
    {
      user: { id: 'user-1', created_at: 1000, theme_preference: 'light' as const },
      expected: { id: 'user-1', created_at: 1000, theme_preference: 'light' as const },
    },
    {
      user: { id: 'user-2', created_at: 2000, theme_preference: 'system' as const },
      expected: { id: 'user-2', created_at: 2000, theme_preference: 'system' as const },
    },
    { user: null, expected: null },
  ])('returns user $expected when getFirstAsync returns $user', async ({ user, expected }) => {
    fakeDb.getFirstAsync.mockResolvedValue(user);

    const result = await UserRepository.getCurrentUser();

    expect(result).toEqual(expected);
    expect(fakeDb.getFirstAsync).toHaveBeenCalledWith('SELECT * FROM users LIMIT 1;');
  });

  it('returns null when no user exists', async () => {
    fakeDb.getFirstAsync.mockResolvedValue(undefined);

    const result = await UserRepository.getCurrentUser();

    expect(result).toBeNull();
  });

  it('creates a new user and returns it', async () => {
    fakeDb.runAsync.mockResolvedValue({ changes: 1 });

    const result = await UserRepository.createUser();

    expect(result).toEqual({ id: 'mocked-uuid', created_at: expect.any(Number), theme_preference: 'system' });
    expect(fakeDb.runAsync).toHaveBeenCalledWith('INSERT INTO users (id) VALUES (?);', ['mocked-uuid']);
  });

  it('updates the theme preference for the current user', async () => {
    fakeDb.runAsync.mockResolvedValue({ changes: 1 });

    await UserRepository.updateThemePreference('user-1', 'dark');

    expect(fakeDb.runAsync).toHaveBeenCalledWith('UPDATE users SET theme_preference = ? WHERE id = ?;', ['dark', 'user-1']);
  });
});
