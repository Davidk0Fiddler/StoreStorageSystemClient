let currentUserFilter = " ";
let selectedUserName = null;

export function GetCurrentUserFilter() {
  return currentUserFilter;
}

export function SetCurrentUserFilter(filter) {
  currentUserFilter = filter;
}

export function GetSelectedUserName() {
  return selectedUserName;
}

export function SetSelectedUserName(userName) {
  selectedUserName = userName;
}

export function ClearSelectedUserName() {
  selectedUserName = null;
}
