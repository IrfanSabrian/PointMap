"use client";

import { useState, useRef, useEffect } from "react";
import { Campus, CAMPUSES } from "@/config/campusConfig";
import {
  FaChevronDown,
  FaCheck,
  FaBuilding,
  FaUniversity,
} from "react-icons/fa";

interface SidebarCampusSwitcherProps {
  selectedCampus: Campus;
  onCampusChange: (campus: Campus) => void;
  isDark?: boolean;
}

export default function SidebarCampusSwitcher({
  selectedCampus,
  onCampusChange,
  isDark = false,
}: SidebarCampusSwitcherProps) {
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
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          w-full flex items-center justify-between px-3 py-2.5 
          bg-white dark:bg-gray-800 
          border border-gray-200 dark:border-gray-700 
          hover:border-primary/50 dark:hover:border-primary-dark/50
          rounded-lg transition-all duration-200 group
          text-left
        "
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <FaUniversity className="text-sm" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider leading-none mb-1">
              Pilih Kampus
            </span>
            <span className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate group-hover:text-primary dark:group-hover:text-primary-dark transition-colors">
              {selectedCampus.shortName}
            </span>
          </div>
        </div>
        <FaChevronDown
          className={`text-gray-400 text-xs transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-scale-in origin-top">
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
                <div
                  className={`
                    w-8 h-8 rounded-md flex items-center justify-center text-xs shrink-0
                    ${
                      selectedCampus.id === campus.id
                        ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }
                  `}
                >
                  <FaBuilding />
                </div>
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
          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700 text-[10px] text-center text-gray-400">
            Pilih kampus untuk dikelola
          </div>
        </div>
      )}
    </div>
  );
}
