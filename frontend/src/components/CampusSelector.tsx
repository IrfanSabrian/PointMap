/**
 * CampusSelector Component
 * Dropdown selector for choosing between Polnep campuses
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { Campus, CAMPUSES } from "@/config/campusConfig";
import {
  FaChevronDown,
  FaCheck,
  FaBuilding,
  FaUniversity,
} from "react-icons/fa";

interface CampusSelectorProps {
  selectedCampus: Campus;
  onCampusChange: (campus: Campus) => void;
  className?: string;
  isDark?: boolean;
}

export default function CampusSelector({
  selectedCampus,
  onCampusChange,
  className = "",
  isDark = false,
}: CampusSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`relative w-auto min-w-[220px] ${className}`}
      ref={dropdownRef}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          w-full flex items-center justify-between px-3 py-2
          bg-white/10 backdrop-blur-sm
          border border-white/20
          hover:bg-white/20 hover:border-white/30
          rounded-xl transition-all duration-200 group
          text-left
        "
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-white truncate group-hover:text-blue-200 transition-colors">
              {selectedCampus.shortName}
            </span>
          </div>
        </div>
        <FaChevronDown
          className={`text-white/70 text-xs transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 z-50 w-full min-w-[260px] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-scale-in origin-top-right">
          <div className="p-1">
            {CAMPUSES.map((campus) => (
              <button
                key={campus.id}
                onClick={() => {
                  onCampusChange(campus);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors
                  ${
                    selectedCampus.id === campus.id
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }
                `}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate leading-tight">
                    {campus.shortName}
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate opacity-80">
                    {campus.name}
                  </div>
                </div>
                {selectedCampus.id === campus.id && (
                  <FaCheck className="text-blue-500 text-xs" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
