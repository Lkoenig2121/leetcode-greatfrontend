import type { PublicUser } from "../lib/types";

/** The three demo accounts shown on the login screen. */
export const USERS: PublicUser[] = [
  {
    id: "alice",
    name: "Alice Chen",
    username: "alice_codes",
    title: "Frontend Engineer",
    color: "#ffa116",
  },
  {
    id: "bob",
    name: "Bob Martinez",
    username: "bobby_tables",
    title: "Backend Developer",
    color: "#00b8a3",
  },
  {
    id: "carol",
    name: "Carol Okafor",
    username: "carol_o",
    title: "CS Graduate Student",
    color: "#a78bfa",
  },
];

export function findUser(id: string | undefined): PublicUser | undefined {
  return USERS.find((u) => u.id === id);
}
