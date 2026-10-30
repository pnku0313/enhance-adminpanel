// import React from "react";

// const StatsCard = ({ title, value, icon, currency }) => {
//   return (
//     <div className="flex flex-col justify-between p-4 rounded-xl shadow-md  dark:bg-transparent border border-gray-200 dark:border-gray-700 min-w-[150px] ">
//       {/* Icon + Title Row */}
//       <div className="flex aling-items-center gap-2">
//         {icon && <span className="text-gray-400 text-xsm">{icon}</span>}
//         <p className="text-m text-black font-medium  dark:text-gray-300 ">
//           {title}
//         </p>
//       </div>

//       {/* Value */}
//       <h3 className="text-2xl font-bold text-black dark:text-white">
//         {currency ? `${currency}${value}` : value}
//       </h3>
//     </div>
//   );
// };

// export default StatsCard;

import React from "react";

const StatsCard = ({ title, value, icon, currency, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col justify-between p-4 rounded-xl shadow-md dark:bg-transparent border border-gray-200 dark:border-gray-700 min-w-[150px] 
        ${
          onClick ? "cursor-pointer transition transform hover:scale-105" : ""
        }`}
    >
      {/* Icon + Title Row */}
      <div className="flex items-center gap-1">
        {icon && <span className="text-gray-400 text-xsm mb-3">{icon}</span>}
        <p className="text-m text-black font-medium dark:text-gray-300">
          {title}
        </p>
      </div>

      {/* Value */}
      <h3 className="text-2xl font-bold text-black dark:text-white">
        {currency ? `${currency}${value}` : value}
      </h3>
    </div>
  );
};

export default StatsCard;
