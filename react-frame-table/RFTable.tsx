import * as React from 'react';
import { AppStoreProvider, AppStore, getAppStoreActions } from './store';
import Table from './components/Table';
import { RFTableColumnGroup, RFTableProps, RFTableSortParam } from './types';
import create from 'zustand';
import { getFrozenColumnsWidth, useForceUpdate } from './utils';

export function RFTable<T = Record<string, any>>({
  width,
  height,
  headerHeight = 30,
  data,
  columns,
  columnsGroup = [],
  onChangeColumns,
  frozenColumnIndex = 0,
  itemHeight = 15,
  itemPadding = 7,
  scrollTop = 0,
  scrollLeft = 0,
  className,
  rowSelection,
  sort,
}: RFTableProps<T>) {
  const containerBorderWidth = 1;
  const contentBodyHeight = height - headerHeight - containerBorderWidth * 2;
  const displayItemCount = Math.ceil(contentBodyHeight / (itemHeight + itemPadding * 2));

  const selectedIdsMap: Map<number, any> = React.useMemo(
    () => new Map(rowSelection?.selectedIds.map(id => [id, true])),
    [rowSelection?.selectedIds],
  );

  const columnGroups = React.useMemo(() => {
    const leftGroups: RFTableColumnGroup[] = [];
    const rightGroups: RFTableColumnGroup[] = [];
    const cgs = columnsGroup
      ?.map(({ label, align, colspan }, groupIndex) => {
        return Array.from({ length: colspan }).map((_, i) => ({
          groupIndex,
          label,
          align,
        }));
      })
      .flat();

    cgs.splice(0, frozenColumnIndex).forEach(cg => {
      if (leftGroups[cg.groupIndex]) {
        leftGroups[cg.groupIndex].colspan += 1;
      } else {
        leftGroups[cg.groupIndex] = {
          label: cg.label,
          align: cg.align,
          colspan: 1,
        };
      }
    });

    cgs.forEach(cg => {
      if (rightGroups[cg.groupIndex]) {
        rightGroups[cg.groupIndex].colspan += 1;
      } else {
        rightGroups[cg.groupIndex] = {
          label: cg.label,
          align: cg.align,
          colspan: 1,
        };
      }
    });

    return {
      leftGroups,
      rightGroups: rightGroups.filter(Boolean),
    };
  }, [columnsGroup, frozenColumnIndex]);

  const frozenColumnsWidth = React.useMemo(
    () =>
      getFrozenColumnsWidth({
        rowSelection,
        itemHeight,
        itemPadding,
        frozenColumnIndex,
        columns,
      }),
    [columns, frozenColumnIndex, itemHeight, itemPadding, rowSelection],
  );

  const sortParams = React.useMemo(() => {
    if (sort) {
      return sort.sortParams.reduce((acc, cur, currentIndex) => {
        cur.index = currentIndex;
        if (cur.key) acc[cur.key] = cur;
        return acc;
      }, {} as Record<string, RFTableSortParam>);
    }

    return {};
  }, [sort]);

  return (
    <AppStoreProvider
      createStore={() =>
        create<AppStore<T>>((set, get) => ({
          containerBorderWidth: 1,
          width,
          height,
          headerHeight,
          data,
          columns,
          onChangeColumns,
          frozenColumnsGroup: columnGroups.leftGroups,
          columnsGroup: columnGroups.rightGroups,
          columnResizing: false,
          frozenColumnIndex,
          itemHeight,
          itemPadding,
          scrollTop,
          scrollLeft,
          contentBodyHeight,
          displayItemCount,
          className,
          rowSelection,
          selectedIdsMap,
          selectedAll: false,
          frozenColumnsWidth,
          sort,
          sortParams,
          ...getAppStoreActions(set, get),
        }))
      }
    >
      <Table />
    </AppStoreProvider>
  );
}
