/*
 * Shared field-level validation for the site's three forms.
 *
 * Guideline: errors belong inline next to the field they describe, and the
 * first invalid field takes focus on submit — a single summary line at the
 * bottom of a form makes the visitor hunt for what is wrong.
 */

export function collectErrors(values, rules) {
  const errors = {};
  rules.forEach(({ field, message, test }) => {
    const value = (values[field] || '').trim();
    const failed = test ? !test(value) : !value;
    if (failed && !errors[field]) errors[field] = message;
  });
  return errors;
}

export function focusFirstError(errors, rules, formElement) {
  const firstField = rules.map((rule) => rule.field).find((field) => errors[field]);
  if (!firstField || !formElement) return;
  const control = formElement.querySelector(`[name="${firstField}"]`);
  if (control) control.focus();
}

export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const isUrl = (value) => /^https?:\/\/\S+$/i.test(value);
