import { surveySchema } from '../schemas/surveySchema.js';

describe('Survey Schema Validation', () => {
  describe('Valid survey data', () => {
    it('should validate complete survey data', () => {
      const validSurvey = {
        title: 'Customer Satisfaction Survey',
        description: 'A comprehensive survey to understand customer satisfaction',
        questions: [
          {
            questionText: 'How satisfied are you with our service?',
            type: 'rating'
          }
        ]
      };

      const { error } = surveySchema.validate(validSurvey);
      expect(error).toBeUndefined();
    });

    it('should validate survey without description', () => {
      const validSurvey = {
        title: 'Quick Feedback Survey',
        questions: [
          {
            questionText: 'What do you think about our product?',
            type: 'text'
          }
        ]
      };

      const { error } = surveySchema.validate(validSurvey);
      expect(error).toBeUndefined();
    });

    it('should validate survey with multiple questions', () => {
      const validSurvey = {
        title: 'Product Feedback Survey',
        description: 'Gathering feedback on our product',
        questions: [
          {
            questionText: 'What is your overall rating?',
            type: 'rating'
          },
          {
            questionText: 'What features would you like to see?',
            type: 'text'
          },
          {
            questionText: 'Which option do you prefer?',
            type: 'choice',
            options: ['Option A', 'Option B', 'Option C']
          }
        ]
      };

      const { error } = surveySchema.validate(validSurvey);
      expect(error).toBeUndefined();
    });
  });

  describe('Required fields validation', () => {
    it('should require title', () => {
      const invalidSurvey = {
        description: 'A survey description',
        questions: [
          {
            questionText: 'What do you think?',
            type: 'text'
          }
        ]
      };

      const { error } = surveySchema.validate(invalidSurvey);
      expect(error).toBeDefined();
      expect(error.details[0].message).toMatch(/title.*required/);
    });

    it('should require questions array', () => {
      const invalidSurvey = {
        title: 'Survey Title',
        description: 'A survey description'
        // Missing questions array
      };

      const { error } = surveySchema.validate(invalidSurvey);
      expect(error).toBeDefined();
      expect(error.details[0].message).toMatch(/questions.*required/);
    });

    it('should require at least one question', () => {
      const invalidSurvey = {
        title: 'Survey Title',
        description: 'A survey description',
        questions: []
      };

      const { error } = surveySchema.validate(invalidSurvey);
      expect(error).toBeDefined();
      expect(error.details[0].message).toMatch(/questions.*at least 1/);
    });
  });

  describe('Field validation rules', () => {
    describe('title', () => {
      it('should validate non-empty string', () => {
        const validSurvey = {
          title: 'Valid Survey Title',
          questions: [
            {
              questionText: 'What do you think?',
              type: 'text'
            }
          ]
        };

        const { error } = surveySchema.validate(validSurvey);
        expect(error).toBeUndefined();
      });

      it('should reject empty string', () => {
        const invalidSurvey = {
          title: '',
          questions: [
            {
              questionText: 'What do you think?',
              type: 'text'
            }
          ]
        };

        const { error } = surveySchema.validate(invalidSurvey);
        expect(error).toBeDefined();
        expect(error.details[0].message).toMatch(/title.*empty/);
      });

      it('should accept whitespace-only string (no validation in schema)', () => {
        const validSurvey = {
          title: '   ',
          questions: [
            {
              questionText: 'What do you think?',
              type: 'text'
            }
          ]
        };

        const { error } = surveySchema.validate(validSurvey);
        expect(error).toBeUndefined();
      });

      it('should reject very long titles', () => {
        const longTitle = 'a'.repeat(101); // Exceeds max length of 100
        const invalidSurvey = {
          title: longTitle,
          questions: [
            {
              questionText: 'What do you think?',
              type: 'text'
            }
          ]
        };

        const { error } = surveySchema.validate(invalidSurvey);
        expect(error).toBeDefined();
        expect(error.details[0].message).toMatch(/title.*length/);
      });
    });

    describe('description', () => {
      it('should validate optional description', () => {
        const validSurvey = {
          title: 'Survey Title',
          questions: [
            {
              questionText: 'What do you think?',
              type: 'text'
            }
          ]
        };

        const { error } = surveySchema.validate(validSurvey);
        expect(error).toBeUndefined();
      });

      it('should validate description with content', () => {
        const validSurvey = {
          title: 'Survey Title',
          description: 'A detailed description of the survey',
          questions: [
            {
              questionText: 'What do you think?',
              type: 'text'
            }
          ]
        };

        const { error } = surveySchema.validate(validSurvey);
        expect(error).toBeUndefined();
      });

      it('should reject very long descriptions', () => {
        const longDescription = 'a'.repeat(501); // Exceeds max length of 500
        const invalidSurvey = {
          title: 'Survey Title',
          description: longDescription,
          questions: [
            {
              questionText: 'What do you think?',
              type: 'text'
            }
          ]
        };

        const { error } = surveySchema.validate(invalidSurvey);
        expect(error).toBeDefined();
        expect(error.details[0].message).toMatch(/description.*length/);
      });
    });

    describe('questions array', () => {
      it('should validate array of question objects', () => {
        const validSurvey = {
          title: 'Survey Title',
          questions: [
            {
              questionText: 'What do you think?',
              type: 'text'
            }
          ]
        };

        const { error } = surveySchema.validate(validSurvey);
        expect(error).toBeUndefined();
      });

      it('should reject non-array questions', () => {
        const invalidSurvey = {
          title: 'Survey Title',
          questions: 'not an array'
        };

        const { error } = surveySchema.validate(invalidSurvey);
        expect(error).toBeDefined();
        expect(error.details[0].message).toMatch(/questions.*array/);
      });

      it('should reject empty questions array', () => {
        const invalidSurvey = {
          title: 'Survey Title',
          questions: []
        };

        const { error } = surveySchema.validate(invalidSurvey);
        expect(error).toBeDefined();
        expect(error.details[0].message).toMatch(/questions.*at least 1/);
      });
    });

    describe('individual question objects', () => {
      it('should require questionText in each question', () => {
        const invalidSurvey = {
          title: 'Survey Title',
          questions: [
            {
              type: 'text'
              // Missing questionText
            }
          ]
        };

        const { error } = surveySchema.validate(invalidSurvey);
        expect(error).toBeDefined();
        expect(error.details[0].message).toMatch(/questionText.*required/);
      });

      it('should require type in each question', () => {
        const invalidSurvey = {
          title: 'Survey Title',
          questions: [
            {
              questionText: 'What do you think?'
              // Missing type
            }
          ]
        };

        const { error } = surveySchema.validate(invalidSurvey);
        expect(error).toBeDefined();
        expect(error.details[0].message).toMatch(/type.*required/);
      });

      it('should validate questionText format', () => {
        const validSurvey = {
          title: 'Survey Title',
          questions: [
            {
              questionText: 'What do you think about our service?',
              type: 'text'
            }
          ]
        };

        const { error } = surveySchema.validate(validSurvey);
        expect(error).toBeUndefined();
      });

      it('should reject empty questionText', () => {
        const invalidSurvey = {
          title: 'Survey Title',
          questions: [
            {
              questionText: '',
              type: 'text'
            }
          ]
        };

        const { error } = surveySchema.validate(invalidSurvey);
        expect(error).toBeDefined();
        expect(error.details[0].message).toMatch(/questionText.*empty/);
      });

      it('should accept whitespace-only questionText (no validation in schema)', () => {
        const validSurvey = {
          title: 'Survey Title',
          questions: [
            {
              questionText: '   ',
              type: 'text'
            }
          ]
        };

        const { error } = surveySchema.validate(validSurvey);
        expect(error).toBeUndefined();
      });

      it('should accept very long questionText (no length validation in schema)', () => {
        const longQuestionText = 'a'.repeat(1001); // Very long question text
        const validSurvey = {
          title: 'Survey Title',
          questions: [
            {
              questionText: longQuestionText,
              type: 'text'
            }
          ]
        };

        const { error } = surveySchema.validate(validSurvey);
        expect(error).toBeUndefined();
      });
    });

    describe('question type', () => {
      it('should validate all valid question types', () => {
        const validTypes = ['text', 'choice', 'rating'];
        
        validTypes.forEach(type => {
          const validSurvey = {
            title: 'Survey Title',
            questions: [
              {
                questionText: 'What do you think?',
                type
              }
            ]
          };

          const { error } = surveySchema.validate(validSurvey);
          expect(error).toBeUndefined();
        });
      });

      it('should reject invalid question type', () => {
        const invalidSurvey = {
          title: 'Survey Title',
          questions: [
            {
              questionText: 'What do you think?',
              type: 'invalid_type'
            }
          ]
        };

        const { error } = surveySchema.validate(invalidSurvey);
        expect(error).toBeDefined();
        expect(error.details[0].message).toMatch(/type.*one of/);
      });

      it('should reject case variations of valid types', () => {
        const invalidSurvey = {
          title: 'Survey Title',
          questions: [
            {
              questionText: 'What do you think?',
              type: 'TEXT' // Uppercase
            }
          ]
        };

        const { error } = surveySchema.validate(invalidSurvey);
        expect(error).toBeDefined();
        expect(error.details[0].message).toMatch(/type.*one of/);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle minimum valid title length', () => {
      const validSurvey = {
        title: 'Hi!', // Minimum 3 characters
        questions: [
          {
            questionText: 'What do you think?',
            type: 'text'
          }
        ]
      };

      const { error } = surveySchema.validate(validSurvey);
      expect(error).toBeUndefined();
    });

    it('should handle maximum valid title length', () => {
      const maxTitle = 'a'.repeat(100); // Maximum 100 characters
      const validSurvey = {
        title: maxTitle,
        questions: [
          {
            questionText: 'What do you think?',
            type: 'text'
          }
        ]
      };

      const { error } = surveySchema.validate(validSurvey);
      expect(error).toBeUndefined();
    });

    it('should handle minimum valid questionText length', () => {
      const validSurvey = {
        title: 'Survey Title',
        questions: [
          {
            questionText: 'Hi', // Minimum length
            type: 'text'
          }
        ]
      };

      const { error } = surveySchema.validate(validSurvey);
      expect(error).toBeUndefined();
    });

    it('should handle maximum valid questionText length', () => {
      const maxQuestionText = 'a'.repeat(1000); // Maximum 1000 characters
      const validSurvey = {
        title: 'Survey Title',
        questions: [
          {
            questionText: maxQuestionText,
            type: 'text'
          }
        ]
      };

      const { error } = surveySchema.validate(validSurvey);
      expect(error).toBeUndefined();
    });

    it('should handle special characters in title and questionText', () => {
      const validSurvey = {
        title: 'Survey with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
        questions: [
          {
            questionText: 'Question with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
            type: 'text'
          }
        ]
      };

      const { error } = surveySchema.validate(validSurvey);
      expect(error).toBeUndefined();
    });

    it('should handle unicode characters in title and questionText', () => {
      const validSurvey = {
        title: 'Survey with unicode: 🚀🌟💡🎯',
        questions: [
          {
            questionText: 'Question with unicode: 🚀🌟💡🎯',
            type: 'text'
          }
        ]
      };

      const { error } = surveySchema.validate(validSurvey);
      expect(error).toBeUndefined();
    });

    it('should handle single question survey', () => {
      const validSurvey = {
        title: 'Single Question Survey',
        questions: [
          {
            questionText: 'What do you think?',
            type: 'text'
          }
        ]
      };

      const { error } = surveySchema.validate(validSurvey);
      expect(error).toBeUndefined();
    });

    it('should handle many questions survey', () => {
      const questions = Array.from({ length: 50 }, (_, i) => ({
        questionText: `Question ${i + 1}?`,
        type: 'text'
      }));

      const validSurvey = {
        title: 'Many Questions Survey',
        questions
      };

      const { error } = surveySchema.validate(validSurvey);
      expect(error).toBeUndefined();
    });
  });

  describe('Data transformation', () => {
    it('should not trim whitespace from title (no trim in schema)', () => {
      const surveyWithWhitespace = {
        title: '  Survey Title with Whitespace  ',
        questions: [
          {
            questionText: 'What do you think?',
            type: 'text'
          }
        ]
      };

      const { error, value } = surveySchema.validate(surveyWithWhitespace);
      expect(error).toBeUndefined();
      expect(value.title).toBe('  Survey Title with Whitespace  ');
    });

    it('should not trim whitespace from description (no trim in schema)', () => {
      const surveyWithWhitespace = {
        title: 'Survey Title',
        description: '  Description with whitespace  ',
        questions: [
          {
            questionText: 'What do you think?',
            type: 'text'
          }
        ]
      };

      const { error, value } = surveySchema.validate(surveyWithWhitespace);
      expect(error).toBeUndefined();
      expect(value.description).toBe('  Description with whitespace  ');
    });

    it('should not trim whitespace from questionText (no trim in schema)', () => {
      const surveyWithWhitespace = {
        title: 'Survey Title',
        questions: [
          {
            questionText: '  Question with whitespace?  ',
            type: 'text'
          }
        ]
      };

      const { error, value } = surveySchema.validate(surveyWithWhitespace);
      expect(error).toBeUndefined();
      expect(value.questions[0].questionText).toBe('  Question with whitespace?  ');
    });
  });

  describe('Error messages', () => {
    it('should provide clear error message for missing title', () => {
      const invalidSurvey = {
        questions: [
          {
            questionText: 'What do you think?',
            type: 'text'
          }
        ]
      };

      const { error } = surveySchema.validate(invalidSurvey);
      expect(error.details[0].message).toMatch(/title.*required/);
    });

    it('should provide clear error message for missing questions', () => {
      const invalidSurvey = {
        title: 'Survey Title'
        // Missing questions array
      };

      const { error } = surveySchema.validate(invalidSurvey);
      expect(error.details[0].message).toMatch(/questions.*required/);
    });

    it('should provide clear error message for empty questions array', () => {
      const invalidSurvey = {
        title: 'Survey Title',
        questions: []
      };

      const { error } = surveySchema.validate(invalidSurvey);
      expect(error.details[0].message).toMatch(/questions.*at least 1/);
    });

    it('should provide clear error message for missing questionText', () => {
      const invalidSurvey = {
        title: 'Survey Title',
        questions: [
          {
            type: 'text'
            // Missing questionText
          }
        ]
      };

      const { error } = surveySchema.validate(invalidSurvey);
      expect(error.details[0].message).toMatch(/questionText.*required/);
    });

    it('should provide clear error message for missing question type', () => {
      const invalidSurvey = {
        title: 'Survey Title',
        questions: [
          {
            questionText: 'What do you think?'
            // Missing type
          }
        ]
      };

      const { error } = surveySchema.validate(invalidSurvey);
      expect(error.details[0].message).toMatch(/type.*required/);
    });

    it('should provide clear error message for invalid question type', () => {
      const invalidSurvey = {
        title: 'Survey Title',
        questions: [
          {
            questionText: 'What do you think?',
            type: 'invalid_type'
          }
        ]
      };

      const { error } = surveySchema.validate(invalidSurvey);
      expect(error.details[0].message).toMatch(/type.*one of/);
    });
  });
});
