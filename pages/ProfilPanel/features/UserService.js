import { ProfilAPIs } from "../api/ProfilAPI.js";
import { NormalizeApiList } from "../../shared/NormalizeApiList.js";

export async function GetAllUsers() {
  const response = await ProfilAPIs.RequestAllUsers();

  if (!response.success) {
    console.error("Felhasználók lekérése sikertelen:", response);

    return null;
  }

  const users = NormalizeApiList(response.data);
  if (!users) {
    console.error("A backend nem felhasználólistát adott vissza:", response.data);
    return null;
  }
  return users;
}

async function HandleUserAction(apiCall) {
  const response = await apiCall();

  if (!response.success) {
    return {
      success: false,
      message:
        typeof response.data === "string"
          ? response.data
          : "A művelet sikertelen.",
    };
  }

  return {
    success: true,
    data: response.data,
  };
}

export async function CreateUser(requestBody) {
  return HandleUserAction(() => ProfilAPIs.SendCreateUserRequest(requestBody));
}

export async function ActivateUser(username) {
  return HandleUserAction(() => ProfilAPIs.SendUserActivationRequest(username));
}

export async function DeactivateUser(username) {
  return HandleUserAction(() =>
    ProfilAPIs.SendUserDeactivationRequest(username),
  );
}

export async function UpdateUser(requestBody) {
  return HandleUserAction(() => ProfilAPIs.SendUserUpdateRequest(requestBody));
}
