import { responseSchema } from '../schemas/responseSchema.js';

describe('Response Schema Validation', () => {
  describe('Valid response data', () => {
    it('should validate complete response data', () => {
      const validResponse = {
        surveyId: '507f1f77bcf86cd799439011',
        responses: [
          {
            questionId: '507f1f77bcf86cd799439012',
            answer: 'This is a valid answer'
          }
        ]
      };

      const { error } = responseSchema.validate(validResponse);
      expect(error).toBeUndefined();
    });

    it('should validate response with multiple answers', () => {
      const validResponse = {
        surveyId: '507f1f77bcf86cd799439011',
        responses: [
          {
            questionId: '507f1f77bcf86cd799439012',
            answer: 'First answer'
          },
          {
            questionId: '507f1f77bcf86cd799439013',
            answer: 'Second answer'
          }
        ]
      };

      const { error } = responseSchema.validate(validResponse);
      expect(error).toBeUndefined();
    });

    it('should validate response without sentiment (not in schema)', () => {
      const validResponse = {
        surveyId: '507f1f77bcf86cd799439011',
        responses: [
          {
            questionId: '507f1f77bcf86cd799439012',
            answer: 'This is a valid answer'
            // sentiment not in schema
          }
        ]
      };

      const { error } = responseSchema.validate(validResponse);
      expect(error).toBeUndefined();
    });
  });

  describe('Required fields validation', () => {
    it('should require surveyId', () => {
      const invalidResponse = {
        responses: [
          {
            questionId: '507f1f77bcf86cd799439012',
            answer: 'This is a valid answer'
          }
        ]
      };

      const { error } = responseSchema.validate(invalidResponse);
      expect(error).toBeDefined();
      expect(error.details[0].message).toMatch(/surveyId.*required/);
    });

    it('should require responses array', () => {
      const invalidResponse = {
        surveyId: '507f1f77bcf86cd799439011'
        // Missing responses array
      };

      const { error } = responseSchema.validate(invalidResponse);
      expect(error).toBeDefined();
      expect(error.details[0].message).toMatch(/responses.*required/);
    });

    it('should require at least one response', () => {
      const invalidResponse = {
        surveyId: '507f1f77bcf86cd799439011',
        responses: []
      };

      const { error } = responseSchema.validate(invalidResponse);
      expect(error).toBeDefined();
      expect(error.details[0].message).toMatch(/responses.*at least 1/);
    });
  });

  describe('Field validation rules', () => {
    describe('surveyId', () => {
      it('should validate valid ObjectId format', () => {
        const validResponse = {
          surveyId: '507f1f77bcf86cd799439011',
          responses: [
            {
              questionId: '507f1f77bcf86cd799439012',
              answer: 'This is a valid answer'
            }
          ]
        };

        const { error } = responseSchema.validate(validResponse);
        expect(error).toBeUndefined();
      });

      it('should accept any string (no ObjectId validation)', () => {
        const validResponse = {
          surveyId: 'invalid-object-id',
          responses: [
            {
              questionId: '507f1f77bcf86cd799439012',
              answer: 'This is a valid answer'
            }
          ]
        };

        const { error } = responseSchema.validate(validResponse);
        expect(error).toBeUndefined();
      });

      it('should reject empty string', () => {
        const invalidResponse = {
          surveyId: '',
          responses: [
            {
              questionId: '507f1f77bcf86cd799439012',
              answer: 'This is a valid answer'
            }
          ]
        };

        const { error } = responseSchema.validate(invalidResponse);
        expect(error).toBeDefined();
        expect(error.details[0].message).toMatch(/surveyId.*empty/);
      });
    });

    describe('responses array', () => {
      it('should validate array of response objects', () => {
        const validResponse = {
          surveyId: '507f1f77bcf86cd799439011',
          responses: [
            {
              questionId: '507f1f77bcf86cd799439012',
              answer: 'This is a valid answer'
            }
          ]
        };

        const { error } = responseSchema.validate(validResponse);
        expect(error).toBeUndefined();
      });

      it('should reject non-array responses', () => {
        const invalidResponse = {
          surveyId: '507f1f77bcf86cd799439011',
          responses: 'not an array'
        };

        const { error } = responseSchema.validate(invalidResponse);
        expect(error).toBeDefined();
        expect(error.details[0].message).toMatch(/responses.*array/);
      });

      it('should reject empty responses array', () => {
        const invalidResponse = {
          surveyId: '507f1f77bcf86cd799439011',
          responses: []
        };

        const { error } = responseSchema.validate(invalidResponse);
        expect(error).toBeDefined();
        expect(error.details[0].message).toMatch(/responses.*at least 1/);
      });
    });

    describe('individual response objects', () => {
      it('should require questionId in each response', () => {
        const invalidResponse = {
          surveyId: '507f1f77bcf86cd799439011',
          responses: [
            {
              answer: 'This is a valid answer'
              // Missing questionId
            }
          ]
        };

        const { error } = responseSchema.validate(invalidResponse);
        expect(error).toBeDefined();
        expect(error.details[0].message).toMatch(/questionId.*required/);
      });

      it('should require answer in each response', () => {
        const invalidResponse = {
          surveyId: '507f1f77bcf86cd799439011',
          responses: [
            {
              questionId: '507f1f77bcf86cd799439012'
              // Missing answer
            }
          ]
        };

        const { error } = responseSchema.validate(invalidResponse);
        expect(error).toBeDefined();
        expect(error.details[0].message).toMatch(/answer.*required/);
      });

      it('should validate questionId format', () => {
        const validResponse = {
          surveyId: '507f1f77bcf86cd799439011',
          responses: [
            {
              questionId: '507f1f77bcf86cd799439012',
              answer: 'This is a valid answer'
            }
          ]
        };

        const { error } = responseSchema.validate(validResponse);
        expect(error).toBeUndefined();
      });

      it('should validate answer format', () => {
        const validResponse = {
          surveyId: '507f1f77bcf86cd799439011',
          responses: [
            {
              questionId: '507f1f77bcf86cd799439012',
              answer: 'This is a valid answer'
            }
          ]
        };

        const { error } = responseSchema.validate(validResponse);
        expect(error).toBeUndefined();
      });

      it('should reject empty answer', () => {
        const invalidResponse = {
          surveyId: '507f1f77bcf86cd799439011',
          responses: [
            {
              questionId: '507f1f77bcf86cd799439012',
              answer: ''
            }
          ]
        };

        const { error } = responseSchema.validate(invalidResponse);
        expect(error).toBeDefined();
        expect(error.details[0].message).toMatch(/answer.*empty/);
      });

      it('should accept whitespace-only answer (no validation in schema)', () => {
        const validResponse = {
          surveyId: '507f1f77bcf86cd799439011',
          responses: [
            {
              questionId: '507f1f77bcf86cd799439012',
              answer: '   '
            }
          ]
        };

        const { error } = responseSchema.validate(validResponse);
        expect(error).toBeUndefined();
      });
    });

    describe('sentiment field', () => {
      it('should not have sentiment field (not in schema)', () => {
        const validResponse = {
          surveyId: '507f1f77bcf86cd799439011',
          responses: [
            {
              questionId: '507f1f77bcf86cd799439012',
              answer: 'This is a valid answer'
              // sentiment not in schema
            }
          ]
        };

        const { error } = responseSchema.validate(validResponse);
        expect(error).toBeUndefined();
      });

      it('should reject sentiment if provided (not in schema)', () => {
        const responseWithSentiment = {
          surveyId: '507f1f77bcf86cd799439011',
          responses: [
            {
              questionId: '507f1f77bcf86cd799439012',
              answer: 'This is a valid answer',
              sentiment: 'positive' // This will be rejected
            }
          ]
        };

        const { error } = responseSchema.validate(responseWithSentiment);
        expect(error).toBeDefined();
        expect(error.details[0].message).toMatch(/sentiment.*not allowed/);
      });

      it('should reject null sentiment (not in schema)', () => {
        const responseWithNullSentiment = {
          surveyId: '507f1f77bcf86cd799439011',
          responses: [
            {
              questionId: '507f1f77bcf86cd799439012',
              answer: 'This is a valid answer',
              sentiment: null
            }
          ]
        };

        const { error } = responseSchema.validate(responseWithNullSentiment);
        expect(error).toBeDefined();
        expect(error.details[0].message).toMatch(/sentiment.*not allowed/);
      });

      it('should allow undefined sentiment (not in schema)', () => {
        const responseWithoutSentiment = {
          surveyId: '507f1f77bcf86cd799439011',
          responses: [
            {
              questionId: '507f1f77bcf86cd799439012',
              answer: 'This is a valid answer'
              // sentiment not provided
            }
          ]
        };

        const { error } = responseSchema.validate(responseWithoutSentiment);
        expect(error).toBeUndefined();
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle minimum valid answer length', () => {
      const validResponse = {
        surveyId: '507f1f77bcf86cd799439011',
        responses: [
          {
            questionId: '507f1f77bcf86cd799439012',
            answer: 'Hi'
          }
        ]
      };

      const { error } = responseSchema.validate(validResponse);
      expect(error).toBeUndefined();
    });

    it('should handle maximum valid answer length', () => {
      const longAnswer = 'a'.repeat(1000); // Very long answer
      const validResponse = {
        surveyId: '507f1f77bcf86cd799439011',
        responses: [
          {
            questionId: '507f1f77bcf86cd799439012',
            answer: longAnswer
          }
        ]
      };

      const { error } = responseSchema.validate(validResponse);
      expect(error).toBeUndefined();
    });

    it('should handle special characters in answer', () => {
      const validResponse = {
        surveyId: '507f1f77bcf86cd799439011',
        responses: [
          {
            questionId: '507f1f77bcf86cd799439012',
            answer: 'Answer with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?'
          }
        ]
      };

      const { error } = responseSchema.validate(validResponse);
      expect(error).toBeUndefined();
    });

    it('should handle unicode characters in answer', () => {
      const validResponse = {
        surveyId: '507f1f77bcf86cd799439011',
        responses: [
          {
            questionId: '507f1f77bcf86cd799439012',
            answer: 'Answer with unicode: 🚀🌟💡🎯'
          }
        ]
      };

      const { error } = responseSchema.validate(validResponse);
      expect(error).toBeUndefined();
    });

    it('should handle string questionId (no ObjectId validation)', () => {
      const validResponse = {
        surveyId: '507f1f77bcf86cd799439011',
        responses: [
          {
            questionId: 'question-123',
            answer: 'This is a valid answer'
          }
        ]
      };

      const { error } = responseSchema.validate(validResponse);
      expect(error).toBeUndefined();
    });
  });

  describe('Data transformation', () => {
    it('should not trim whitespace from answer (no trim in schema)', () => {
      const responseWithWhitespace = {
        surveyId: '507f1f77bcf86cd799439011',
        responses: [
          {
            questionId: '507f1f77bcf86cd799439012',
            answer: '  This answer has whitespace  '
          }
        ]
      };

      const { error, value } = responseSchema.validate(responseWithWhitespace);
      expect(error).toBeUndefined();
      expect(value.responses[0].answer).toBe('  This answer has whitespace  ');
    });

    it('should not set default sentiment (not in schema)', () => {
      const responseWithoutSentiment = {
        surveyId: '507f1f77bcf86cd799439011',
        responses: [
          {
            questionId: '507f1f77bcf86cd799439012',
            answer: 'This is a valid answer'
            // sentiment not provided
          }
        ]
      };

      const { error, value } = responseSchema.validate(responseWithoutSentiment);
      expect(error).toBeUndefined();
      expect(value.responses[0].sentiment).toBeUndefined();
    });
  });

  describe('Error messages', () => {
    it('should provide clear error message for missing surveyId', () => {
      const invalidResponse = {
        responses: [
          {
            questionId: '507f1f77bcf86cd799439012',
            answer: 'This is a valid answer'
          }
        ]
      };

      const { error } = responseSchema.validate(invalidResponse);
      expect(error.details[0].message).toMatch(/surveyId.*required/);
    });

    it('should provide clear error message for missing responses', () => {
      const invalidResponse = {
        surveyId: '507f1f77bcf86cd799439011'
        // Missing responses array
      };

      const { error } = responseSchema.validate(invalidResponse);
      expect(error.details[0].message).toMatch(/responses.*required/);
    });

    it('should provide clear error message for empty responses array', () => {
      const invalidResponse = {
        surveyId: '507f1f77bcf86cd799439011',
        responses: []
      };

      const { error } = responseSchema.validate(invalidResponse);
      expect(error.details[0].message).toMatch(/responses.*at least 1/);
    });

    it('should provide clear error message for missing questionId in response', () => {
      const invalidResponse = {
        surveyId: '507f1f77bcf86cd799439011',
        responses: [
          {
            answer: 'This is a valid answer'
            // Missing questionId
          }
        ]
      };

      const { error } = responseSchema.validate(invalidResponse);
      expect(error.details[0].message).toMatch(/questionId.*required/);
    });

    it('should provide clear error message for missing answer in response', () => {
      const invalidResponse = {
        surveyId: '507f1f77bcf86cd799439011',
        responses: [
          {
            questionId: '507f1f77bcf86cd799439012'
            // Missing answer
          }
        ]
      };

      const { error } = responseSchema.validate(invalidResponse);
      expect(error.details[0].message).toMatch(/answer.*required/);
    });
  });
});
