export const loginEndPoint = {
  login: (role: string) => `login/${encodeURIComponent(role)}`,
};