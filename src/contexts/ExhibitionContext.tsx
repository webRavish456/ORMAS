import React, { createContext, useContext, useState, ReactNode } from "react";

interface ExhibitionContextType {
  selectedExhibition: string;
  setSelectedExhibition: (exhibition: string) => void;
}

const ExhibitionContext = createContext<ExhibitionContextType | undefined>(undefined);

export const ExhibitionProvider = ({ children }: { children: ReactNode }) => {
  // Don't set a default exhibition - let it be empty initially
  const [selectedExhibition, setSelectedExhibition] = useState<string>("");
  return (
    <ExhibitionContext.Provider value={{ selectedExhibition, setSelectedExhibition }}>
      {children}
    </ExhibitionContext.Provider>
  );
};

export const useExhibition = () => {
  const context = useContext(ExhibitionContext);
  if (!context) {
    throw new Error("useExhibition must be used within an ExhibitionProvider");
  }
  return context;
}; 