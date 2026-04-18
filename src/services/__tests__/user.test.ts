const mockedGetCurrentUser = jest.fn();
const mockedCreateUser = jest.fn();

jest.mock('../../repositories/userRepository', () => ({
  UserRepository: {
    getCurrentUser: mockedGetCurrentUser,
    createUser: mockedCreateUser,
  },
}));

describe('UserService', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  const loadService = () => require('../user').UserService;

  it('returns the existing user when one exists', async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: 'user-1', created_at: 123 });

    const UserService = loadService();
    const result = await UserService.init();

    expect(result).toEqual({ id: 'user-1', created_at: 123 });
    expect(mockedCreateUser).not.toHaveBeenCalled();
  });

  it('creates a new user when none exists', async () => {
    mockedGetCurrentUser.mockResolvedValue(null);
    mockedCreateUser.mockResolvedValue({ id: 'new-user', created_at: 999 });

    const UserService = loadService();
    const result = await UserService.init();

    expect(result).toEqual({ id: 'new-user', created_at: 999 });
    expect(mockedCreateUser).toHaveBeenCalled();
  });

  it('returns cached user on subsequent init calls', async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: 'user-1', created_at: 123 });

    const UserService = loadService();
    await UserService.init();
    const secondResult = await UserService.init();

    expect(secondResult).toEqual({ id: 'user-1', created_at: 123 });
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

  it('returns current user id and object after init', async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: 'user-1', created_at: 123 });

    const UserService = loadService();
    await UserService.init();

    expect(UserService.getCurrentUserId()).toBe('user-1');
    expect(UserService.getCurrentUser()).toEqual({ id: 'user-1', created_at: 123 });
  });
});
