const AdminTable = ({ columns = [], rows = [], emptyText = "No data found." }) => {
  if (!rows || rows.length === 0) {
    return <p className="py-4 text-slate-600">{emptyText}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-100 text-left">
            {columns.map((col) => (
              <th key={col.key} className="border p-3 font-semibold text-slate-700">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={row._id || rowIndex}
              className="border-t transition hover:bg-slate-50"
            >
              {columns.map((col) => (
                <td key={col.key} className="border p-3 text-sm text-slate-700">
                  {col.render ? col.render(row, rowIndex) : row[col.key] ?? "N/A"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;