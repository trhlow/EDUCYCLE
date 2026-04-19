export const fieldErrorId = (fieldName: string) => `${fieldName}-error`;

export const invalidFieldProps = (fieldName: string, message?: string | null) =>
  message
    ? {
        'aria-invalid': true,
        'aria-describedby': fieldErrorId(fieldName),
      }
    : {};
