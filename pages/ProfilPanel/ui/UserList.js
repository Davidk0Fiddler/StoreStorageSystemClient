import { CreateUserCard } from "./UserCard.js";

export function RenderUserList(users) {
  const usersContainer = document.getElementById("users-container");

  if (!usersContainer) {
    return;
  }

  usersContainer.innerHTML = "";

  users.forEach((user) => {
    const userCard = CreateUserCard(user);

    usersContainer.appendChild(userCard);
  });
}
