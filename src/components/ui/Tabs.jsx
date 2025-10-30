import React, { createContext, useState, useContext } from "react";

const TabsContext = createContext();

export function Tabs({ children, value, onValueChange, className = "" }) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = "" }) {
  return (
    <div
      className={`flex border-b border-gray-200 bg-white rounded-t-lg ${className}`}
      role="tablist"
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ children, value, className = "" }) {
  const { value: activeValue, onValueChange } = useContext(TabsContext);
  const isActive = activeValue === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => onValueChange(value)}
      className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
        isActive
          ? "border-accent text-accent"
          : "border-transparent text-gray-600 hover:text-gray-800"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children, value, className = "" }) {
  const { value: activeValue } = useContext(TabsContext);

  if (activeValue !== value) return null;

  return (
    <div className={`bg-white rounded-b-lg border-x border-b border-gray-200 p-6 ${className}`}>
      {children}
    </div>
  );
}
