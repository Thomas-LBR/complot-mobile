import React, { createContext, useContext } from "react";
import { useGameEngine } from "./engine";

type Engine = ReturnType<typeof useGameEngine>;

const EngineContext = createContext<Engine | null>(null);

export function EngineProvider({ children }: { children: React.ReactNode }) {
  const engine = useGameEngine();
  return <EngineContext.Provider value={engine}>{children}</EngineContext.Provider>;
}

export function useEngine(): Engine {
  const ctx = useContext(EngineContext);
  if (!ctx) throw new Error("useEngine must be used inside EngineProvider");
  return ctx;
}