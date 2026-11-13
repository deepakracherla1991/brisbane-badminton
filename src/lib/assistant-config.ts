// Settings shared by the chat widget (browser) and the chat API route (server).

export const ASSISTANT_NAME = "Birdie";
/** Max questions a visitor can ask in one chat (shown as the counter in the widget). */
export const MAX_USER_MESSAGES = 20;
/** Max characters per visitor message. */
export const MAX_MESSAGE_CHARS = 800;

export const WELCOME_MESSAGE = `Hi there 🏸 I'm ${ASSISTANT_NAME}, the Brisbane Badminton assistant! I can help with court hire, opening hours, academy programs, social play, restringing and club membership. What would you like to know?`;

export const QUICK_REPLIES = [
  "How much is court hire?",
  "What are your opening hours?",
  "Tell me about the academy",
  "Where are you located?",
  "How do I join the club?",
];
