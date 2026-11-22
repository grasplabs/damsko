import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@grasp-os/ui/components/table";

const files = [
  { name: "Floor plan.pdf", size: "2.4 MB", chosen: true },
  { name: "Budget draft.xlsx", size: "184 KB", chosen: false },
  { name: "Welcome letter.docx", size: "56 KB", chosen: true },
  { name: "Team photo.jpg", size: "3.1 MB", chosen: false },
];

export default function TableChosen() {
  return (
    <Table caption="Two of four files chosen to send.">
      <TableHeader>
        <TableRow>
          <TableHead>File</TableHead>
          <TableHead>Status</TableHead>
          <TableHead align="end">Size</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {files.map((file) => (
          <TableRow key={file.name} selected={file.chosen}>
            <TableCell rowHeader>{file.name}</TableCell>
            <TableCell>{file.chosen ? "Chosen" : "Not chosen"}</TableCell>
            <TableCell align="end">{file.size}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
