"use client";

import { forwardRef } from "react";

/**
 * Form control primitives — thin styled wrappers over native inputs using the
 * `.field` design-system class. Keep them presentational: no validation, no
 * state. Pair with <Field> for labels/hints/errors.
 */

export const TextInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function TextInput({ className = "", ...rest }, ref) {
  return <input ref={ref} className={`field ${className}`} {...rest} />;
});

export const NumberInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function NumberInput({ className = "", ...rest }, ref) {
  return <input ref={ref} type="number" className={`field ${className}`} {...rest} />;
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className = "", rows = 4, ...rest }, ref) {
  return <textarea ref={ref} rows={rows} className={`field resize-y ${className}`} {...rest} />;
});

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className = "", children, ...rest }, ref) {
  return (
    <select ref={ref} className={`field ${className}`} {...rest}>
      {children}
    </select>
  );
});
