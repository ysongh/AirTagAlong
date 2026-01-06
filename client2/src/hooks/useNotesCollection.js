// Schema for notes collection with encrypted content field
// - title: plaintext (can be searched/filtered)
// - content: encrypted with %share (secret shared across nodes)
// Note: Schema uses "%share", client sends "%allot" which SDK transforms
const NOTES_COLLECTION_SCHEMA = {
  type: "standard",
  name: "encrypted-notes",
  schema: {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "array",
    uniqueItems: true,
    items: {
      type: "object",
      properties: {
        _id: { type: "string", format: "uuid" },
        walletAddress: { type: "string" },           // Plaintext - for filtering
        title: { type: "string" },                   // Plaintext - for display
        content: {                                   // ENCRYPTED - secret shared
          type: "object",
          properties: { "%share": { type: "string" } },
          required: ["%share"],
        },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
      required: ["_id", "walletAddress", "title", "content", "createdAt", "updatedAt"],
    },
  },
};

const NOTES_COLLECTION_ID_KEY = "notes_collection_id";