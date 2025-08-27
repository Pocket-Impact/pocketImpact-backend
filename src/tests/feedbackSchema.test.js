import { feedbackSchema } from '../schemas/feedbackSchema.js';

describe('Feedback Schema Validation', () => {
  describe('Valid feedback data', () => {
    it('should validate complete feedback data', () => {
      const validFeedback = {
        organisationId: '507f1f77bcf86cd799439011',
        message: 'This is a valid feedback message',
        category: 'product'
      };

      const { error } = feedbackSchema.validate(validFeedback);
      expect(error).toBeUndefined();
    });

    it('should validate feedback without category (uses default)', () => {
      const validFeedback = {
        organisationId: '507f1f77bcf86cd799439011',
        message: 'This is a valid feedback message'
        // category will default to "other"
      };

      const { error, value } = feedbackSchema.validate(validFeedback);
      expect(error).toBeUndefined();
      expect(value.category).toBe('other');
    });

    it('should use default category when not provided', () => {
      const validFeedback = {
        organisationId: '507f1f77bcf86cd799439011',
        message: 'This is a valid feedback message'
      };

      const { error, value } = feedbackSchema.validate(validFeedback);
      expect(error).toBeUndefined();
      expect(value.category).toBe('other');
    });
  });

  describe('Required fields validation', () => {
    it('should require organisationId', () => {
      const invalidFeedback = {
        message: 'This is a valid feedback message',
        category: 'product'
      };

      const { error } = feedbackSchema.validate(invalidFeedback);
      expect(error).toBeDefined();
      expect(error.details[0].message).toMatch(/organisationId.*required/);
    });

    it('should require message', () => {
      const invalidFeedback = {
        organisationId: '507f1f77bcf86cd799439011',
        category: 'product'
      };

      const { error } = feedbackSchema.validate(invalidFeedback);
      expect(error).toBeDefined();
      expect(error.details[0].message).toMatch(/message.*required/);
    });
  });

  describe('Field validation rules', () => {
    describe('organisationId', () => {
      it('should validate valid ObjectId format', () => {
        const validFeedback = {
          organisationId: '507f1f77bcf86cd799439011',
          message: 'This is a valid feedback message'
        };

        const { error } = feedbackSchema.validate(validFeedback);
        expect(error).toBeUndefined();
      });

      it('should accept any string (no ObjectId validation)', () => {
        const validFeedback = {
          organisationId: 'invalid-object-id',
          message: 'This is a valid feedback message'
        };

        const { error } = feedbackSchema.validate(validFeedback);
        expect(error).toBeUndefined();
      });

      it('should reject empty string', () => {
        const invalidFeedback = {
          organisationId: '',
          message: 'This is a valid feedback message'
        };

        const { error } = feedbackSchema.validate(invalidFeedback);
        expect(error).toBeDefined();
        expect(error.details[0].message).toMatch(/organisationId.*empty/);
      });
    });

    describe('message', () => {
      it('should validate non-empty string', () => {
        const validFeedback = {
          organisationId: '507f1f77bcf86cd799439011',
          message: 'This is a valid feedback message'
        };

        const { error } = feedbackSchema.validate(validFeedback);
        expect(error).toBeUndefined();
      });

      it('should reject empty string', () => {
        const invalidFeedback = {
          organisationId: '507f1f77bcf86cd799439011',
          message: ''
        };

        const { error } = feedbackSchema.validate(invalidFeedback);
        expect(error).toBeDefined();
        expect(error.details[0].message).toMatch(/message.*empty/);
      });

      it('should reject whitespace-only string', () => {
        const invalidFeedback = {
          organisationId: '507f1f77bcf86cd799439011',
          message: '   '
        };

        const { error } = feedbackSchema.validate(invalidFeedback);
        expect(error).toBeDefined();
        expect(error.details[0].message).toMatch(/message.*empty/);
      });
    });

    describe('category', () => {
      it('should validate all valid categories', () => {
        const validCategories = ['product', 'ux', 'support', 'pricing', 'features', 'performance', 'other'];
        
        validCategories.forEach(category => {
          const validFeedback = {
            organisationId: '507f1f77bcf86cd799439011',
            message: 'This is a valid feedback message',
            category
          };

          const { error } = feedbackSchema.validate(validFeedback);
          expect(error).toBeUndefined();
        });
      });

      it('should reject invalid category', () => {
        const invalidFeedback = {
          organisationId: '507f1f77bcf86cd799439011',
          message: 'This is a valid feedback message',
          category: 'invalid_category'
        };

        const { error } = feedbackSchema.validate(invalidFeedback);
        expect(error).toBeDefined();
        expect(error.details[0].message).toMatch(/category.*one of/);
      });

      it('should use default category when not provided', () => {
        const validFeedback = {
          organisationId: '507f1f77bcf86cd799439011',
          message: 'This is a valid feedback message'
        };

        const { error, value } = feedbackSchema.validate(validFeedback);
        expect(error).toBeUndefined();
        expect(value.category).toBe('other');
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle minimum valid message length', () => {
      const validFeedback = {
        organisationId: '507f1f77bcf86cd799439011',
        message: 'Hi'
      };

      const { error } = feedbackSchema.validate(validFeedback);
      expect(error).toBeUndefined();
    });

    it('should handle maximum valid message length', () => {
      const longMessage = 'a'.repeat(1000); // Very long message
      const validFeedback = {
        organisationId: '507f1f77bcf86cd799439011',
        message: longMessage
      };

      const { error } = feedbackSchema.validate(validFeedback);
      expect(error).toBeUndefined();
    });

    it('should handle special characters in message', () => {
      const validFeedback = {
        organisationId: '507f1f77bcf86cd799439011',
        message: 'Message with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?'
      };

      const { error } = feedbackSchema.validate(validFeedback);
      expect(error).toBeUndefined();
    });

    it('should handle unicode characters in message', () => {
      const validFeedback = {
        organisationId: '507f1f77bcf86cd799439011',
        message: 'Message with unicode: 🚀🌟💡🎯'
      };

      const { error } = feedbackSchema.validate(validFeedback);
      expect(error).toBeUndefined();
    });
  });

  describe('Data transformation', () => {
    it('should trim whitespace from message', () => {
      const feedbackWithWhitespace = {
        organisationId: '507f1f77bcf86cd799439011',
        message: '  This message has whitespace  '
      };

      const { error, value } = feedbackSchema.validate(feedbackWithWhitespace);
      expect(error).toBeUndefined();
      expect(value.message).toBe('This message has whitespace');
    });

    it('should convert message to lowercase if specified', () => {
      const feedbackWithUppercase = {
        organisationId: '507f1f77bcf86cd799439011',
        message: 'UPPERCASE MESSAGE'
      };

      const { error, value } = feedbackSchema.validate(feedbackWithUppercase);
      expect(error).toBeUndefined();
      expect(value.message).toBe('UPPERCASE MESSAGE'); // No automatic conversion
    });
  });

  describe('Error messages', () => {
    it('should provide clear error message for missing organisationId', () => {
      const invalidFeedback = {
        message: 'This is a valid feedback message'
      };

      const { error } = feedbackSchema.validate(invalidFeedback);
      expect(error.details[0].message).toMatch(/organisationId.*required/);
    });

    it('should provide clear error message for missing message', () => {
      const invalidFeedback = {
        organisationId: '507f1f77bcf86cd799439011'
      };

      const { error } = feedbackSchema.validate(invalidFeedback);
      expect(error.details[0].message).toMatch(/message.*required/);
    });

    it('should provide clear error message for invalid category', () => {
      const invalidFeedback = {
        organisationId: '507f1f77bcf86cd799439011',
        message: 'This is a valid feedback message',
        category: 'invalid_category'
      };

      const { error } = feedbackSchema.validate(invalidFeedback);
      expect(error.details[0].message).toMatch(/category.*one of/);
    });
  });
});
