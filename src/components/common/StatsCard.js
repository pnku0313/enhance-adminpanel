import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const StatsCard = ({ stat }) => {
  return (
    <div className="flex flex-col justify-between p-4 rounded-xl shadow-md dark:bg-transparent border border-gray-200 dark:border-gray-700 min-w-[150px]">
      {/* Icon + Title Row */}
      <div className="flex aling-items-center gap-2">
        {stat.icon && <stat.icon className="text-gray-400 text-xl" />}
        <p className="text-m text-black font-medium dark:text-gray-300">
          {stat.title}
        </p>
      </div>

      {/* Value */}
      <h3 className="text-2xl font-bold text-black dark:text-white">
        {stat.value}
      </h3>

      {/* Change */}
      {/* <p className="text-xs text-muted-foreground">
        {stat.trend === "up" ? (
          <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
        ) : (
          <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
        )}
        {stat.change} from last month
      </p> */}
    </div>
  );
};

export default StatsCard;
