import React from 'react';

export const EditableText: React.FC<any> = ({ tag: Tag, value, ...props }) => {
  return <Tag {...props}>{value}</Tag>;
};

export const EditableImage: React.FC<any> = ({ src, ...props }) => {
  return <img src={src} {...props} />;
};

export const EditableList: React.FC<any> = ({ items, renderItem, ...props }) => {
  // Add a check to ensure items is an array before mapping
  if (!Array.isArray(items)) {
    return null; // Or some fallback UI
  }
  return <div {...props}>{items.map(renderItem)}</div>;
};
