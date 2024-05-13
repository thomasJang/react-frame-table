import * as React from 'react';
import { AXFDGColumn, AXFDGDataItem, AXFDGDataItemStatus } from '../@axframe-datagrid';
import { v4 as uuidv4 } from 'uuid';
import { DateEditor, InputEditor, SelectEditor } from './editors';

export interface Item {
  uuid: string;
  code?: string;
  useYn?: string;
  selectDate?: string;
  startDate?: string;
  endDate?: string;
  d?: {
    selectDate?: string;
  };
}

export default function useEditorGrid() {
  const [list, setList] = React.useState<AXFDGDataItem<Item>[]>([
    {
      values: {
        uuid: uuidv4(),
        code: 'S0001',
        useYn: 'Y',
        selectDate: '',
        startDate: '',
        endDate: '',
        d: {
          selectDate: '',
        },
      },
    },
    {
      values: {
        uuid: uuidv4(),
        code: 'S0002',
        useYn: 'Y',
        selectDate: '',
        startDate: '',
        endDate: '',
        d: {
          selectDate: '',
        },
      },
    },
  ]);
  const [colWidths, setColWidths] = React.useState<number[]>([]);
  const [checkedKeys, setCheckedKeys] = React.useState<React.Key[]>([]);
  const [selectedRowKey, setSelectedRowKey] = React.useState('');

  const handleColumnsChange = React.useCallback((columnIndex: number, width: number, columns: AXFDGColumn<Item>[]) => {
    setColWidths(columns.map(column => column.width));
  }, []);

  const handleAddList = React.useCallback(() => {
    setList([
      ...list,
      {
        status: AXFDGDataItemStatus.new,
        values: {
          uuid: uuidv4(),
          code: 'S0001',
          useYn: 'Y',
          selectDate: '',
          startDate: '',
          endDate: '',
        },
      },
    ]);
  }, [list]);

  const handleRemoveList = React.useCallback(() => {
    setList(
      list
        .map(item => {
          if (checkedKeys.includes(item.values['uuid'])) {
            if (item.status === AXFDGDataItemStatus.new) {
              return false;
            }
            return {
              status: AXFDGDataItemStatus.remove,
              values: item.values,
            };
          }

          return item;
        })
        .filter(Boolean) as AXFDGDataItem<Item>[],
    );
    setCheckedKeys([]);
  }, [list, checkedKeys]);

  const columns = React.useMemo(
    () =>
      (
        [
          {
            key: '_',
            label: 'Checked',
            width: 80,
            itemRender: ({ item }) => <>{`${item.checked ?? false}`}</>,
          },
          {
            key: '_',
            label: 'Status',
            width: 60,
            align: 'center',
            itemRender: ({ item }) => {
              return item.status !== undefined ? AXFDGDataItemStatus[item.status] : '';
            },
            getClassName: item => {
              return item.checked ? 'editable' : '';
            },
          },
          { key: 'uuid', label: 'UUID', width: 150, itemRender: InputEditor },
          {
            key: 'code',
            label: 'Code',
            width: 150,
            itemRender: InputEditor,
            className: 'editable',
          },
          {
            key: 'useYn',
            label: 'USE_YN',
            width: 100,
            itemRender: SelectEditor,
            className: 'editable',
          },
          {
            key: ['d', 'selectDate'],
            label: 'DatePicker',
            width: 150,
            itemRender: DateEditor,
            className: 'editable',
          },
          // {
          //   key: 'dateRange',
          //   label: 'RangePicker',
          //   width: 250,
          //   itemRender: getDateRangeEditor(['startDate', 'endDate']),
          // },
          {
            key: 'computed',
            label: 'ComputedValue',
            width: 200,
            itemRender: ({ editable, item, column, values, handleSave, handleCancel }) => {
              return values.code + '/' + values.useYn;
            },
          },
        ] as AXFDGColumn<Item>[]
      ).map((column, colIndex) => {
        if (colWidths.length > 0) {
          column.width = colWidths[colIndex];
        }
        return column;
      }),
    [colWidths],
  );

  return {
    handleColumnsChange,
    columns,
    list,
    handleAddList,
    checkedKeys,
    setCheckedKeys,
    selectedRowKey,
    setSelectedRowKey,
    handleRemoveList,
  };
}
