export const loginEndPoint = {
  login: (role: string) => `login/${encodeURIComponent(role)}`,
};

export const logoutEndPoint = {
  logout: 'logout',
};