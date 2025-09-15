export const makeSelectUserTyping = (email) => (state) =>
  state.typing.typingByEmail[email] || false;
