export function GetUserCreationModal() {
  return document.getElementById("user-creation-modal");
}

export function GetUserUpdateModal() {
  return document.getElementById("user-update-modal");
}

export function GetUserCreationUsernameInput() {
  return document.getElementById("user-creator-username-input");
}

export function GetUserCreationPasswordInput() {
  return document.getElementById("user-creator-password-input");
}

export function GetUserCreationRoleSelect() {
  return document.getElementById("role-selecter");
}

export function GetUserCreationSaveButton() {
  return document.getElementById("user-creator-save-button");
}

export function GetPasswordToggleButton() {
  return document.getElementById("toggle-password-button");
}

export function GetUserUpdateOriginalUsername() {
  return document.getElementById("update-original-username");
}

export function GetUserUpdateUsernameInput() {
  return document.getElementById("update-username-input");
}

export function GetUserUpdateRoleSelect() {
  return document.getElementById("update-role-select");
}

export function GetUserUpdateSaveButton() {
  return document.getElementById("user-update-save-button");
}

export function OpenUserCreationModal() {
  const modalElement = GetUserCreationModal();

  if (!modalElement) {
    return null;
  }

  return bootstrap.Modal.getOrCreateInstance(modalElement);
}

export function OpenUserUpdateModal() {
  const modalElement = GetUserUpdateModal();

  if (!modalElement) {
    return null;
  }

  return bootstrap.Modal.getOrCreateInstance(modalElement);
}

export function CloseUserCreationModal() {
  const modal = OpenUserCreationModal();

  modal?.hide();
}

export function CloseUserUpdateModal() {
  const modal = OpenUserUpdateModal();

  modal?.hide();
}

export function SetUserUpdateData(user) {
  const originalUsername = GetUserUpdateOriginalUsername();

  const usernameInput = GetUserUpdateUsernameInput();

  const roleSelect = GetUserUpdateRoleSelect();

  if (!user) {
    return;
  }

  if (originalUsername) {
    originalUsername.value = user.userName;
  }

  if (usernameInput) {
    usernameInput.value = user.userName;
  }

  if (roleSelect) {
    switch (user.roleName) {
      case "Admin":
        roleSelect.value = "1";
        break;

      case "Counter":
        roleSelect.value = "2";
        break;

      case "Storage":
        roleSelect.value = "3";
        break;
    }
  }
}

export function GetUserCreationData() {
  const usernameInput = GetUserCreationUsernameInput();

  const passwordInput = GetUserCreationPasswordInput();

  const roleSelect = GetUserCreationRoleSelect();

  return {
    userName: usernameInput?.value.trim() ?? "",

    password: passwordInput?.value.trim() ?? "",

    roleId: Number(roleSelect?.value),
  };
}

export function GetUserUpdateData() {
  const usernameInput = GetUserUpdateUsernameInput();

  const roleSelect = GetUserUpdateRoleSelect();

  return {
    userName: usernameInput?.value.trim() ?? "",

    roleId: Number(roleSelect?.value),
  };
}

export function InitializePasswordToggle() {
  const passwordField = GetUserCreationPasswordInput();

  const toggleButton = GetPasswordToggleButton();

  if (!passwordField || !toggleButton) {
    return;
  }

  toggleButton.addEventListener("click", () => {
    const icon = toggleButton.querySelector("i");

    const isPassword = passwordField.type === "password";

    passwordField.type = isPassword ? "text" : "password";

    icon?.classList.toggle("bi-eye", !isPassword);

    icon?.classList.toggle("bi-eye-slash", isPassword);
  });
}
