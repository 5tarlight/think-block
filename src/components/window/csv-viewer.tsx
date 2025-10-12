import type CSV from "../../lib/data/csv";

export default function CSVViewer({
  csv,
  maxRows,
  maxColumns,
}: {
  csv: CSV;
  maxRows?: number;
  maxColumns?: number;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="mb-2 text-sm text-gray-400 flex flex-col">
        <div>
          {csv.rows.length} rows, {csv.headers.length} columns
        </div>
        <div className="flex">
          {maxRows && csv.rows.length > maxRows && (
            <div className="text-xs italic text-yellow-400">
              (Showing first {maxRows} rows)
            </div>
          )}
          {maxColumns && csv.headers.length > maxColumns && (
            <div className="text-xs italic text-yellow-400 ml-2">
              (Showing first {maxColumns} columns)
            </div>
          )}
        </div>
      </div>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {csv.headers.slice(0, maxColumns).map((header, index) => (
              <th
                key={index}
                className="border border-gray-600 bg-gray-700 p-1 text-left"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {csv.rows.slice(0, maxRows).map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={rowIndex % 2 === 0 ? "bg-gray-800" : "bg-gray-900"}
            >
              {row.slice(0, maxColumns).map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="border border-gray-700 p-1 max-w-[150px] truncate"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
