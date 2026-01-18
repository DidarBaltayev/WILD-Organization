"use client";

import React, { memo } from "react";

type FooterProps = {
  startYear?: number; // ставим 2025
  company?: string;   // Rexior LLC
};

const Footer = memo(function Footer({
  startYear = 2025,
  company = "Rexior LLC",
}: FooterProps) {
  const current = new Date().getFullYear();
  const years = startYear >= current ? String(current) : `${startYear}–${current}`;

  return (
    <footer className="relative border-t border-white/10">
      <div className="py-6">
        <div className="text-center text-[12.5px] text-white/55">
          © {years} {company}. Все права защищены.
        </div>
      </div>
    </footer>
  );
});

export default Footer;
