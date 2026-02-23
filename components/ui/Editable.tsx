import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';

// --- 1. TEXTE MODIFIABLE ---
interface EditableTextProps {
  value: string;
  onChange?: (val: string) => void;
  tag?: React.ElementType;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  readOnly?: boolean;
}

interface EditableTextProps {
  value: string;
  onChange?: (val: string) => void;
  tag?: React.ElementType;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  readOnly?: boolean;
  leadingIcon?: React.ReactNode;
}

export const EditableText: React.FC<EditableTextProps> = ({ 
  value, 
  onChange, 
  tag: Tag = "div", 
  className = "", 
  placeholder = "Cliquez pour écrire...",
  multiline = false,
  readOnly = false,
  leadingIcon = null
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (tempValue !== value && onChange) onChange(tempValue);
  };

  // MODE LECTURE SEULE (PUBLIC / ARÈNE)
  if (readOnly) {
    return <Tag className={className}>{leadingIcon}{value}</Tag>;
  }

  const canEdit = !!onChange;

  if (isEditing && canEdit) {
    if (multiline) {
         return (
             <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={handleBlur}
                className={`${className} bg-transparent border-b-2 border-gold-400 outline-none w-full min-h-[100px] resize-none z-50 relative`}
                placeholder={placeholder}
             />
         )
    }
    return (
      <Tag className={`${className} relative z-50`}>
        <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
            className="bg-transparent border-b-2 border-gold-400 outline-none w-full min-w-[50px] placeholder-gray-500 text-inherit font-inherit"
            placeholder={placeholder}
            autoFocus
        />
      </Tag>
    );
  }

  return (
    <Tag 
        onClick={(e: React.MouseEvent) => {
            if (canEdit) {
                e.stopPropagation();
                setIsEditing(true);
            }
        }}
        className={`${className} ${canEdit ? 'cursor-text hover:bg-white/10 hover:outline hover:outline-1 hover:outline-dashed hover:outline-gold-400/50 rounded transition relative group' : ''}`}
    >
      {leadingIcon}{value || <span className="opacity-50 italic">{placeholder}</span>}
      {canEdit && (
        <span className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 bg-gold-500 text-black p-1 rounded-full text-[10px] pointer-events-none transition z-50">
          <Edit2 size={10} />
        </span>
      )}
    </Tag>
  );
};

// --- 2. IMAGE MODIFIABLE ---
interface EditableImageProps {
  src: string;
  onChange?: (url: string) => void;
  className?: string;
  alt?: string;
  readOnly?: boolean;
}

export const EditableImage: React.FC<EditableImageProps> = ({ src, onChange, className = "", alt="Image", readOnly = false }) => {
    
  const handleClick = (e: React.MouseEvent) => {
    if (readOnly || !onChange) return;
    e.stopPropagation();
    const newUrl = prompt("Entrez l'URL de la nouvelle image :", src);
    if (newUrl) onChange(newUrl);
  };

  return (
    <div onClick={handleClick} className={`relative group ${!readOnly && onChange ? 'cursor-pointer' : ''} ${className}`}>
        <img src={src} className="w-full h-full object-cover" alt={alt} />
        
        {!readOnly && onChange && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center border-2 border-gold-400 border-dashed z-10">
                <div className="bg-black/80 text-gold-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                    <ImageIcon size={14} /> Changer Photo
                </div>
            </div>
        )}
    </div>
  );
};

// --- 3. LISTE REPETABLE ---
interface EditableListProps {
    items: any[];
    onItemAdd?: () => void;
    onItemRemove?: (index: number) => void;
    renderItem: (item: any, index: number) => React.ReactNode;
    className?: string;
    readOnly?: boolean;
}

export const EditableList: React.FC<EditableListProps> = ({ items, onItemAdd, onItemRemove, renderItem, className="", readOnly = false }) => {
    return (
        <div className={className}>
            {(items || []).map((item, index) => (
                <div key={index} className="relative group/item">
                    {renderItem(item, index)}

                    {!readOnly && onItemRemove && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onItemRemove(index); }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover/item:opacity-100 transition shadow-lg z-20 hover:scale-110"
                            title="Supprimer cet élément"
                        >
                            <Trash2 size={12}/>
                        </button>
                    )}
                </div>
            ))}
            
            {!readOnly && onItemAdd && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onItemAdd(); }}
                    className="mx-auto mt-6 flex items-center gap-2 px-6 py-2 bg-white/5 border border-dashed border-white/20 hover:border-gold-400 hover:text-gold-400 text-gray-400 rounded-full text-sm transition"
                >
                    <Plus size={16}/> Ajouter un élément
                </button>
            )}
        </div>
    );
};