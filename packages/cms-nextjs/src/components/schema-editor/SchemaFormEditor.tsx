'use client';

import React, { useCallback } from 'react';
import type { MonoSchemaProperty } from '@voidhaus/monoschema';

export interface SchemaFormEditorProps {
  /** MonoSchema definition for the form */
  schema?: MonoSchemaProperty;
  /** Current values */
  values: Record<string, any>;
  /** Called when values change */
  onChange: (values: Record<string, any>) => void;
  /** Whether the form is disabled */
  disabled?: boolean;
}

/**
 * Component that renders a form based on a MonoSchema structure
 */
export function SchemaFormEditor({
  schema,
  values,
  onChange,
  disabled = false
}: SchemaFormEditorProps) {
  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    const newValues = {
      ...values,
      [fieldName]: value
    };
    onChange(newValues);
  }, [values, onChange]);

  if (!schema) {
    return (
      <div className="schema-form-editor">
        <p>No schema available for this block type.</p>
        <pre>{JSON.stringify(values, null, 2)}</pre>
      </div>
    );
  }

  // Handle different schema types from MonoSchema
  const fields = (schema as any).fields || (schema.type === 'object' ? (schema as any).properties : {});

  return (
    <div className="schema-form-editor">
      {Object.entries(fields).map(([fieldName, fieldSchema]) => (
        <SchemaField
          key={fieldName}
          name={fieldName}
          schema={fieldSchema}
          value={values[fieldName]}
          onChange={(value) => handleFieldChange(fieldName, value)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

interface SchemaFieldProps {
  name: string;
  schema: any; // MonoSchema field definition
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}

function SchemaField({ name, schema, value, onChange, disabled }: SchemaFieldProps) {
  const fieldType = schema.type || 'string';
  const label = schema.label || name;
  const description = schema.description;
  const required = schema.required || false;
  const options = schema.enum || schema.options;

  const renderField = () => {
    switch (fieldType) {
      case 'string':
        if (options) {
          // Enum/Select field
          return (
            <select
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              required={required}
            >
              <option value="">Select...</option>
              {options.map((option: string) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        }
        
        if (schema.multiline || name.includes('content') || name.includes('description')) {
          // Textarea for multiline strings
          return (
            <textarea
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={schema.placeholder || `Enter ${label.toLowerCase()}...`}
              disabled={disabled}
              required={required}
              rows={4}
            />
          );
        }
        
        // Regular text input
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={schema.placeholder || `Enter ${label.toLowerCase()}...`}
            disabled={disabled}
            required={required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
            placeholder={schema.placeholder}
            disabled={disabled}
            required={required}
            min={schema.min}
            max={schema.max}
            step={schema.step}
          />
        );

      case 'boolean':
        return (
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
            />
            <span className="checkbox-text">{label}</span>
          </label>
        );

      case 'array':
        return (
          <ArrayField
            value={value || []}
            onChange={onChange}
            itemSchema={schema.items}
            disabled={disabled}
            name={name}
          />
        );

      case 'object':
        return (
          <ObjectField
            value={value || {}}
            onChange={onChange}
            schema={schema}
            disabled={disabled}
          />
        );

      default:
        // Fallback to text input
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${label.toLowerCase()}...`}
            disabled={disabled}
            required={required}
          />
        );
    }
  };

  return (
    <div className="schema-field">
      {fieldType !== 'boolean' && (
        <label htmlFor={`field-${name}`} className="field-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      
      <div className="field-input">
        {renderField()}
      </div>
      
      {description && (
        <small className="field-description">{description}</small>
      )}
    </div>
  );
}

function ArrayField({ 
  value, 
  onChange, 
  itemSchema, 
  disabled, 
  name 
}: { 
  value: any[]; 
  onChange: (value: any[]) => void; 
  itemSchema?: any; 
  disabled?: boolean;
  name: string;
}) {
  const addItem = () => {
    const newItem = itemSchema?.type === 'string' ? '' : 
                   itemSchema?.type === 'number' ? 0 : 
                   itemSchema?.type === 'object' ? {} : '';
    onChange([...value, newItem]);
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, newValue: any) => {
    const newArray = [...value];
    newArray[index] = newValue;
    onChange(newArray);
  };

  return (
    <div className="array-field">
      {value.map((item, index) => (
        <div key={index} className="array-item">
          <div className="array-item-content">
            {itemSchema?.type === 'string' ? (
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                disabled={disabled}
              />
            ) : (
              <SchemaField
                name={`${name}[${index}]`}
                schema={itemSchema || { type: 'string' }}
                value={item}
                onChange={(newValue) => updateItem(index, newValue)}
                disabled={disabled}
              />
            )}
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="remove-item-button"
            >
              ×
            </button>
          )}
        </div>
      ))}
      
      {!disabled && (
        <button
          type="button"
          onClick={addItem}
          className="add-item-button"
        >
          + Add Item
        </button>
      )}
    </div>
  );
}

function ObjectField({ 
  value, 
  onChange, 
  schema, 
  disabled 
}: { 
  value: Record<string, any>; 
  onChange: (value: Record<string, any>) => void; 
  schema: any; 
  disabled?: boolean;
}) {
  const fields = schema.fields || {};

  const handleFieldChange = (fieldName: string, fieldValue: any) => {
    onChange({
      ...value,
      [fieldName]: fieldValue
    });
  };

  return (
    <div className="object-field">
      {Object.entries(fields).map(([fieldName, fieldSchema]) => (
        <SchemaField
          key={fieldName}
          name={fieldName}
          schema={fieldSchema}
          value={value[fieldName]}
          onChange={(fieldValue) => handleFieldChange(fieldName, fieldValue)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
