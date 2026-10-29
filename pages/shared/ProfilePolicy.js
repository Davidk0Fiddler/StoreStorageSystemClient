export function IsProtectedAdministratorProfile(profileOrUserName) {
  const userName =
    typeof profileOrUserName === "string"
      ? profileOrUserName
      : profileOrUserName?.userName ?? profileOrUserName?.UserName;

  return String(userName ?? "").trim().toLowerCase() === "administrator";
}
