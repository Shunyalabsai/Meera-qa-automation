/** Playground sample data for phone and browser modes. */

export const PLAYGROUND_SAMPLES = {
  validIndianNumber: "9876543210",
  validContextJson: '{"customer_name": "Rahul", "order_id": "ORD-123"}',
  validContextKeyValue: "customer_name=Rahul\norder_id=ORD-123",
  invalidContextJson: "{ customer_name: Rahul }",
  malformedPhone: "abc-not-a-number",
  shortInvalidNumber: "123",
} as const;
