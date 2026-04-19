type FormMessageProps = {
  id?: string;
  message?: string | null;
  className?: string;
};

export default function FormMessage({ id, message, className = '' }: FormMessageProps) {
  if (!message) return null;

  return (
    <p id={id} className={`edu-form-message ${className}`.trim()} role="alert">
      {message}
    </p>
  );
}
