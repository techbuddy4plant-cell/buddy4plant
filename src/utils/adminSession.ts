/**
 * Remembers (in memory only) whether the signed-in person is an admin, so background code such as the
 * catalogue sync only tries to write to the database when it is allowed to.
 * This is NOT what protects the data - the database rules (firestore.rules) do that.
 */
let admin = false;
export const setAdminSession = (v: boolean) => {
  admin = v;
};
export const isAdminSession = () => admin;
