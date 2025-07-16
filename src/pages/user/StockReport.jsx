import React, {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {stockService} from "@/services/stockService";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverTrigger, PopoverContent} from "@/components/ui/popover";
import {format} from "date-fns";
import StockReportTable from "@/components/table/StockReportTable";
import ReportCard from "@/components/cards/ReportCard";
// import StockReportTable from "./StockReportTable";

const StockReportDashboard = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState("");
  const [changeType, setChangeType] = useState("");

  const {data = [], isLoading} = useQuery({
    queryKey: ["stockReports", startDate, endDate, changeType],
    queryFn: () =>
      stockService.getStockReport({
        timestamp__gte: startDate
          ? startDate.toLocaleDateString("en-CA")
          : undefined,
        timestamp__lte: endDate
          ? endDate.toLocaleDateString("en-CA")
          : undefined,
        change_type: changeType === "all" ? undefined : changeType,
      }),
  });

  // Calculations
  const purchaseCount = data
    .filter((d) => d.change_type === "purchase")
    .reduce((sum, d) => sum + d.change_amount, 0);
  const saleCount = data
    .filter((d) => d.change_type === "sale")
    .reduce((sum, d) => sum + d.change_amount, 0);
  const totalSalesAmount = data
    .filter((d) => d.change_type === "sale")
    .reduce((sum, d) => sum + parseFloat(d.price || 0), 0)
    .toFixed(2);
  const salesData = data.filter((d) => d.change_type === "sale");
  console.log("salesData", salesData);

   

  return (
    <div className="p-6 space-y-6">
      {/* Cards */}
      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 ">
          <ReportCard tilte="Total Purchases" value={purchaseCount} />
          <ReportCard tilte="Total Sales" value={saleCount} />
          <ReportCard
            tilte="Total Sale Price"
            value={`₹ ${totalSalesAmount}`}
          />
        </div>
      </div>

      {/* Date */}
      <div className="flex flex-wrap justify-center gap-4">
        {/* Start Date */}
        <div className="space-y-1">
          <label className="block text-sm font-medium">Start Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[200px] justify-start text-left font-normal"
              >
                {startDate ? format(startDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                disabled={(date) => date > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* End Date */}
        <div className="space-y-1">
          <label className="block text-sm font-medium">End Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[200px] justify-start text-left font-normal"
              >
                {endDate ? format(endDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                disabled={(date) =>
                  !startDate
                    ? date > new Date()
                    : date > new Date() || date < startDate
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Change Type Filter */}
        <div className="space-y-1">
          <label className="block text-sm font-medium">Change Type</label>
          <Select value={changeType} onValueChange={setChangeType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="purchase">Purchase</SelectItem>
              <SelectItem value="sale">Sale</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => {
            setStartDate(null);
            setEndDate(null);
            setChangeType("all");
          }}
        >
          Clear Filters
        </Button>
      </div>

      {/* Table */}
      <StockReportTable reports={data} loading={isLoading} />
    </div>
  );
};

export default StockReportDashboard;
