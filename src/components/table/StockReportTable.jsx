import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {format} from "date-fns";

const StockReportTable = ({reports = [], loading}) => {

    if (reports.length > 0) {
      console.log(
        reports.map((report) => {
          return format(new Date(report.timestamp), "dd MMM yyyy, hh:mm a");
        })
      );
    }
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
        </div>
      );
    }

    if (!reports.length) {
      return (
        <div className="text-center text-muted-foreground mt-4">
          No stock reports found for the selected filters.
        </div>
      );
    }
  return (
    <div className="overflow-x-auto">
       
      <Table>
        <TableCaption>list of stock transactions.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Old</TableHead>
            <TableHead>New</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>{report.product_name}</TableCell>
              <TableCell>{report.sku}</TableCell>
              <TableCell className="capitalize">{report.change_type}</TableCell>
              <TableCell>{report.change_amount}</TableCell>
              <TableCell>{report.old_stock}</TableCell>
              <TableCell>{report.new_stock}</TableCell>
              <TableCell>₹{report.price}</TableCell>
              <TableCell>
                {format(new Date(report.timestamp), "dd MMM yyyy, hh:mm a")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StockReportTable;
