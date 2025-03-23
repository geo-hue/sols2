export interface ValidationError {
    field: string;
    message: string;
  }
  
  export class ValidationResult {
    private errors: ValidationError[] = [];
  
    addError(field: string, message: string): void {
      this.errors.push({ field, message });
    }
  
    hasErrors(): boolean {
      return this.errors.length > 0;
    }
  
    getErrors(): ValidationError[] {
      return this.errors;
    }
  
    static success(): ValidationResult {
      return new ValidationResult();
    }
  }
  
  export const validateEmail = (email: string): boolean => {
    const re = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return re.test(email);
  };
  
  export const validatePhoneNumber = (phone: string): boolean => {
    const re = /^\d{10,15}$/;
    return re.test(phone);
  };
  
  export const validatePassword = (password: string): boolean => {
    // At least 8 characters, at least one uppercase, one lowercase, one number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return re.test(password);
  };
  
  export const validateRequired = (value: any): boolean => {
    if (value === undefined || value === null) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    return true;
  };