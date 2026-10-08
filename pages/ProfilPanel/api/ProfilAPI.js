import { API_CALL } from "../../shared/ApiCaller.js";

export const ProfilAPIs = {
  RequestAllUsers: () => API_CALL("Users", "GET"),

  SendCreateUserRequest: (requestBody) =>
    API_CALL("Users", "POST", requestBody),

  SendUserActivationRequest: (username) =>
    API_CALL("Users/Activate", "GET", null, username),

  SendUserDeactivationRequest: (username) =>
    API_CALL("Users/Deactivate", "GET", null, username),

  SendUserUpdateRequest: (requestBody) => API_CALL("Users", "PUT", requestBody),
};
