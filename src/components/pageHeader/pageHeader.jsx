import {Button} from "../ui/button";
import {Plus} from "lucide-react";
import {useNavigate} from "react-router-dom";
import React from "react";

const PageHeader = ({title, link}) => {
  const navigate = useNavigate();
  return (
    <div className="flex justify-between items-center mb-6 ">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <Button
      className={"bg-white shadow-lg"}
        type="button"
        onClick={() => navigate(link.pathname, {state: link.state})}
        variant="outline"
      >
        <Plus size={16} /> Add item
      </Button>
    </div>
  );
};

export default PageHeader;
