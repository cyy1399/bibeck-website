export type NavigationMenuEvent = "toggle" | "close";

export function navigationMenuReducer(isOpen: boolean, event: NavigationMenuEvent): boolean {
  return event === "toggle" ? !isOpen : false;
}
