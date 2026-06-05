import React from 'react';
import { DataGrid } from '@mui/x-data-grid';

export default function DataTable({
  rows = [],
  columns = [],
  getRowId = (r) => r._id,
  autoHeight = true,
  columnHeaderHeight = 64,
  rowHeight = 56,
  ...rest
}) {
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      getRowId={getRowId}
      autoHeight={autoHeight}
      columnHeaderHeight={columnHeaderHeight}
      rowHeight={rowHeight}
      disableRowSelectionOnClick
      // v8 pagination API — paginationModel + pageSizeOptions.
      initialState={{
        pagination: { paginationModel: { pageSize: 8, page: 0 } },
      }}
      pageSizeOptions={[8, 16, 32]}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        bgcolor: 'background.paper',
        // Soften default grid borders.
        '& .MuiDataGrid-columnHeaders': {
          bgcolor: 'background.default',
        },
        // Breathing room at the left/right edges of the grid.
        '& .MuiDataGrid-columnHeader:first-of-type, & .MuiDataGrid-cell:first-of-type':
          {
            pl: 2.5,
          },
        '& .MuiDataGrid-columnHeader:last-of-type, & .MuiDataGrid-cell:last-of-type':
          {
            pr: 2.5,
          },
        '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within':
          {
            outline: 'none',
          },
        '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
          outline: 'none',
        },
        '& .MuiDataGrid-cell': {
          borderColor: 'divider',
        },
        '& .MuiDataGrid-columnSeparator': {
          display: 'none',
        },
        '& .MuiDataGrid-row:hover': {
          bgcolor: 'background.default',
        },
        '& .MuiDataGrid-footerContainer': {
          borderColor: 'divider',
        },
      }}
      {...rest}
    />
  );
}
