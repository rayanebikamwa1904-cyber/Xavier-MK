import React, { useState, useRef, useEffect, FC, ChangeEvent, KeyboardEvent } from 'react';

interface EditableTextProps {
  tag: keyof React.JSX.IntrinsicElements;
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
}

const EditableText: FC<EditableTextProps> = ({ tag, value, onSave, className }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (text.trim() !== value) {
      onSave(text.trim());
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  const Tag = tag as any;

  if (isEditing) {
    if (tag === 'textarea') {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={text}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={className}
        />
      );
    }
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={text}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={className}
      />
    );
  }

  return (
    <Tag className={className} onClick={() => setIsEditing(true)}>
      {text || 'Cliquez pour éditer'}
    </Tag>
  );
};

export default EditableText;
