import { ProfilAPIs } from "../api/ProfilAPI.js";

export async function GetAllUsers() {
  return await ProfilAPIs.RequestAllUsers();
}

export async function CreateUser(requestBody) {
  return await ProfilAPIs.SendCreateUserRequest(requestBody);
}

export async function ActivateUser(username) {
  return await ProfilAPIs.SendUserActivationRequest(username);
}

export async function DeactivateUser(username) {
  return await ProfilAPIs.SendUserDeactivationRequest(username);
}

export async function UpdateUser(requestBody) {
  return await ProfilAPIs.SendUserUpdateRequest(requestBody);
}
