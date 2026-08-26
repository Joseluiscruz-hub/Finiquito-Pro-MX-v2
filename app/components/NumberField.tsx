"use client";

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  step?: string;
  hint?: string;
  /** ID único para conectar el label al input con aria-describedby si hay hint. */
  id?: string;
};

export function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step = "0.01",
  hint,
  id,
}: NumberFieldProps) {
  const hintId = hint && id ? `${id}-hint` : undefined;

  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <span className="input-shell">
        {prefix && <span className="input-affix" aria-hidden="true">{prefix}</span>}
        <input
          id={id}
          type="number"
          min="0"
          step={step}
          inputMode="decimal"
          value={value}
          aria-describedby={hintId}
          onChange={(e) => {
            const nextValue = Number(e.target.value);
            onChange(Number.isFinite(nextValue) ? Math.max(0, nextValue) : 0);
          }}
        />
        {suffix && <span className="input-affix suffix" aria-hidden="true">{suffix}</span>}
      </span>
      {hint && (
        <small id={hintId}>{hint}</small>
      )}
    </label>
  );
}
