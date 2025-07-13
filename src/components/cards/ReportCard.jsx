import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const ReportCard = ({tilte, value}) => {
  return (
    <Card className={"shadow-lg"}>
      <CardHeader>
        <CardTitle> {tilte} </CardTitle>
      </CardHeader>
      <CardContent className={"w-xs"}>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

export default ReportCard
