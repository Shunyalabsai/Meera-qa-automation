/** Sample data and validation patterns for Prompt Templates. */

export const PROMPT_TEMPLATE_SAMPLES = {
  name: "welcome-flow",
  category: "support",
  description: "Greets the customer and confirms their support request.",
  basePrompt:
    "You are a friendly assistant helping customers. Be concise and empathetic. Ask clarifying questions when needed.",
  basePromptWithVariables:
    "Hi {customer_name}, calling about your order {order_id}. How can I help you today?",
  variableGuideSnippet: /How to reference variables|single-brace|\{variable_name\}/i,
  expectedVariablesHelp:
    /Declare the CSV columns|green\/red validation badges|download a CSV/i,
} as const;

export type ExpectedVariableInput = {
  fieldName: string;
  description?: string;
  required?: boolean;
};

export const PROMPT_TEMPLATE_EDGE = {
  emptyName: "Empty name blocked on create",
  emptyBasePrompt: "Empty base prompt blocked on create",
  unicodePrompt: "Unicode and emoji accepted in base prompt",
  xssName: "XSS in name does not execute",
} as const;
