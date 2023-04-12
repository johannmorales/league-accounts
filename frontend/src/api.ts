import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001",
});

async function createAccount(summoner: string, region: string) {
  await api.post("/accounts", { summoner, region });
}

async function getAccounts() {
  return await api.get("/accounts");
}

async function sync(id: number) {
  return await api.post(`/accounts/${id}/sync`);
}

export { createAccount, getAccounts, sync };
