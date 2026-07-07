"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

// Desktop sidebar slot: the (tabs) layout renders <SidebarSlotTarget /> inside
// its lg+ ink sidebar; a page can teleport its own controls there with
// <SidebarSlot> (Home: amount chips / hero / CTA / savings ring — see
// docs/modules/home.md). Pages that render nothing leave the target empty
// (it hides itself via `empty:hidden`).

type SlotContext = {
  el: HTMLElement | null;
  setEl: (el: HTMLElement | null) => void;
};

const Ctx = createContext<SlotContext | null>(null);

export function SidebarSlotProvider({ children }: { children: ReactNode }) {
  const [el, setEl] = useState<HTMLElement | null>(null);
  return <Ctx.Provider value={{ el, setEl }}>{children}</Ctx.Provider>;
}

export function SidebarSlotTarget({ className }: { className?: string }) {
  const ctx = useContext(Ctx);
  return <div ref={(node) => ctx?.setEl(node)} className={className} />;
}

export function SidebarSlot({ children }: { children: ReactNode }) {
  const ctx = useContext(Ctx);
  if (!ctx?.el) return null;
  return createPortal(children, ctx.el);
}
