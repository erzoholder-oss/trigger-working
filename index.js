require("dotenv").config();
const { Client } = require("djs-selfbot-v13");

// Load and Validate Config
const {
  TOKEN,
  CHANNEL_ID,
  TRIGGER_MESSAGE,
  RESPONSE_MESSAGE,
  CASE_SENSITIVE,
  EXACT_MATCH,
} = process.env;

if (!TOKEN) {
  console.error("[ERROR] TOKEN is missing in your .env file.");
  process.exit(1);
}
if (!CHANNEL_ID) {
  console.error("[ERROR] CHANNEL_ID is missing in your .env file.");
  process.exit(1);
}
if (!TRIGGER_MESSAGE) {
  console.error("[ERROR] TRIGGER_MESSAGE is missing in your .env file.");
  process.exit(1);
}
if (!RESPONSE_MESSAGE) {
  console.error("[ERROR] RESPONSE_MESSAGE is missing in your .env file.");
  process.exit(1);
}

const isCaseSensitive = CASE_SENSITIVE === "true";
const isExactMatch    = EXACT_MATCH    === "true";

// Discord Client
const client = new Client({ checkUpdate: false });

client.on("ready", () => {
  console.log(`[OK] Logged in as: ${client.user.tag}`);
  console.log(`[OK] Watching channel ID : ${CHANNEL_ID}`);
  console.log(`[OK] Trigger message     : "${TRIGGER_MESSAGE}"`);
  console.log(`[OK] Response message    : "${RESPONSE_MESSAGE}"`);
  console.log(`[OK] Case sensitive      : ${isCaseSensitive}`);
  console.log(`[OK] Exact match only    : ${isExactMatch}`);
  console.log("------------------------------------------");
  console.log("[INFO] Listening for trigger messages...");
});

client.on("messageCreate", async (message) => {
  // Only watch the configured channel
  if (message.channel.id !== CHANNEL_ID) return;

  // Ignore messages sent by this account to avoid infinite self-loops
  if (message.author.id === client.user.id) return;

  const incoming = isCaseSensitive ? message.content : message.content.toLowerCase();
  const trigger  = isCaseSensitive ? TRIGGER_MESSAGE  : TRIGGER_MESSAGE.toLowerCase();

  // Check if the trigger condition is met
  const triggered = isExactMatch
    ? incoming === trigger
    : incoming.includes(trigger);

  if (triggered) {
    console.log(`[TRIGGER DETECTED] "${message.content}" from ${message.author.tag} (${message.author.id})`);

    try {
      await message.channel.send(RESPONSE_MESSAGE);
      console.log(`[RESPONSE SENT] "${RESPONSE_MESSAGE}"`);
    } catch (err) {
      console.error(`[ERROR] Failed to send response: ${err.message}`);
    }
  }
});

// Error Handling
client.on("error", (err) => {
  console.error(`[CLIENT ERROR] ${err.message}`);
});

process.on("unhandledRejection", (reason) => {
  console.error("[UNHANDLED REJECTION]", reason);
});

// Login
client.login(TOKEN);
