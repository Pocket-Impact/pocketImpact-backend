import { surveySchema, updateSurveyByIdSchema, sendSurveyByUniqueLinkSchema } from "../schemas/surveySchema.js";

describe("surveySchema validation", () => {
  it("should validate a correct survey object", () => {
    const validSurvey = {
      title: "Customer Feedback",
      description: "Monthly survey",
      questions: [
        { questionText: "How was your experience?", type: "text" }
      ]
    };
    const { error } = surveySchema.validate(validSurvey);
    expect(error).toBeUndefined();
  });

  it("should fail if title is missing", () => {
    const invalidSurvey = {
      description: "Monthly survey",
      questions: [
        { questionText: "How was your experience?", type: "text" }
      ]
    };
    const { error } = surveySchema.validate(invalidSurvey);
    expect(error).toBeDefined();
    expect(error.details[0].message).toMatch(/title/);
  });

  it("should fail if questions is empty", () => {
    const invalidSurvey = {
      title: "Customer Feedback",
      description: "Monthly survey",
      questions: []
    };
    const { error } = surveySchema.validate(invalidSurvey);
    expect(error).toBeDefined();
    expect(error.details[0].message).toMatch(/questions/);
  });
});

describe("updateSurveyByIdSchema validation", () => {
  it("should validate partial update", () => {
    const update = {
      title: "Updated Title"
    };
    const { error } = updateSurveyByIdSchema.validate(update);
    expect(error).toBeUndefined();
  });

  it("should fail if no fields provided", () => {
    const update = {};
    const { error } = updateSurveyByIdSchema.validate(update);
    expect(error).toBeDefined();
  });
});

describe("sendSurveyByUniqueLinkSchema validation", () => {
  it("should validate correct input", () => {
    const input = {
      surveyId: "abc123",
      emails: ["test@example.com"]
    };
    const { error } = sendSurveyByUniqueLinkSchema.validate(input);
    expect(error).toBeUndefined();
  });

  it("should fail if emails is empty", () => {
    const input = {
      surveyId: "abc123",
      emails: []
    };
    const { error } = sendSurveyByUniqueLinkSchema.validate(input);
    expect(error).toBeDefined();
  });
});
