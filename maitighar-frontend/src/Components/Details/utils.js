export default function getDisplayUsername(user) {
  if (!user || !user.username) {
    return "Deleted User";
  }
  return user.username;
}
