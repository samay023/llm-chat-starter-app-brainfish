export interface Message {
  role: "user" | "assistant";
  content: string;
  /**
   * File associated with the message in base64 format (if any)
   */
  file?: string;
}
