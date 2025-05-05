import React from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export function Pagination() {
  const [active, setActive] = React.useState(1);
  const totalPages = 5;

  const next = () => {
    if (active === totalPages) return;
    setActive(active + 1);
  };

  const prev = () => {
    if (active === 1) return;
    setActive(active - 1);
  };

  return (
    <div className="flex items-center justify-end gap-4 px-4 py-3">
      {/* Previous Button */}
      <button
        className="flex items-center gap-2 px-3 py-1 text-sm rounded-full border border-[#A294F9] text-[#A294F9] hover:bg-[#A294F9] hover:text-white disabled:opacity-50"
        onClick={prev}
        disabled={active === 1}
      >
        <FaArrowLeft className="h-3 w-3" /> Previous
      </button>

      {/* Page Buttons */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((page) => (
          <button
            key={page}
            className={`px-3 py-1 text-sm rounded-full transition-all duration-200 
              ${
                active === page
                  ? "bg-[#A294F9] text-white"
                  : "border border-[#A294F9] text-[#A294F9] hover:bg-[#A294F9] hover:text-white"
              }`}
            onClick={() => setActive(page)}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next Button */}
      <button
        className="flex items-center gap-2 px-3 py-1 text-sm rounded-full border border-[#A294F9] text-[#A294F9] hover:bg-[#A294F9] hover:text-white disabled:opacity-50"
        onClick={next}
        disabled={active === totalPages}
      >
        Next <FaArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}
