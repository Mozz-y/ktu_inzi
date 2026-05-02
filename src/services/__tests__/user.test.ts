const mockedGetCurrentUser = jest.fn();
const mockedCreateUser = jest.fn();
const mockedUpdateThemePreference = jest.fn();

jest.mock('../../repositories/userRepository', () => ({
  UserRepository: {
    getCurrentUser: mockedGetCurrentUser,
    createUser: mockedCreateUser,
    updateThemePreference: mockedUpdateThemePreference,
  },
}));

describe('UserService', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  const loadService = () => require('../user').UserService;

  it('returns the existing user when one exists', async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: 'user-1', created_at: 123, theme_preference: 'system' });

    const UserService = loadService();
    const result = await UserService.init();

    expect(result).toEqual({ id: 'user-1', created_at: 123, theme_preference: 'system' });
    expect(mockedCreateUser).not.toHaveBeenCalled();
  });

  it('creates a new user when none exists', async () => {
    mockedGetCurrentUser.mockResolvedValue(null);
    mockedCreateUser.mockResolvedValue({ id: 'new-user', created_at: 999, theme_preference: 'system' });

    const UserService = loadService();
    const result = await UserService.init();

    expect(result).toEqual({ id: 'new-user', created_at: 999, theme_preference: 'system' });
    expect(mockedCreateUser).toHaveBeenCalled();
  });

  it('returns cached user on subsequent init calls', async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: 'user-1', created_at: 123, theme_preference: 'light' });

    const UserService = loadService();
    await UserService.init();
    const secondResult = await UserService.init();

    expect(secondResult).toEqual({ id: 'user-1', created_at: 123, theme_preference: 'light' });
    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1);
  });

  it('throws if getCurrentUserId is called before init', () => {
    const UserService = loadService();

    expect(() => UserService.getCurrentUserId()).toThrow('UserService not initialized. Call init() first.');
  });

  it('throws if getCurrentUser is called before init', () => {
    const UserService = loadService();

    expect(() => UserService.getCurrentUser()).toThrow('UserService not initialized. Call init() first.');
  });

  it('throws if getThemePreference is called before init', () => {
    const UserService = loadService();

    expect(() => UserService.getThemePreference()).toThrow('UserService not initialized. Call init() first.');
  });

  it('returns current user id and object after init', async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: 'user-1', created_at: 123, theme_preference: 'system' });

    const UserService = loadService();
    await UserService.init();

    expect(UserService.getCurrentUserId()).toBe('user-1');
    expect(UserService.getCurrentUser()).toEqual({ id: 'user-1', created_at: 123, theme_preference: 'system' });
  });

  it('returns the stored theme preference after init', async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: 'user-1', created_at: 123, theme_preference: 'dark' });

    const UserService = loadService();
    await UserService.init();

    expect(UserService.getThemePreference()).toBe('dark');
  });

  it('defaults the theme preference to system when the user record has no value', async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: 'user-1', created_at: 123 });

    const UserService = loadService();
    await UserService.init();

    expect(UserService.getThemePreference()).toBe('system');
  });

  it('updates the theme preference and cached user', async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: 'user-1', created_at: 123, theme_preference: 'system' });
    mockedUpdateThemePreference.mockResolvedValue(undefined);

    const UserService = loadService();
    await UserService.init();
    await UserService.updateThemePreference('light');

    expect(mockedUpdateThemePreference).toHaveBeenCalledWith('user-1', 'light');
    expect(UserService.getThemePreference()).toBe('light');
  });

  it('throws if updateThemePreference is called before init', async () => {
    const UserService = loadService();

    await expect(UserService.updateThemePreference('dark')).rejects.toThrow(
      'UserService not initialized. Call init() first.'
    );
  });
});
