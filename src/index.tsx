import React from 'react';
import {
  Flex,
  Heading,
  Table,
  Tbody,
  Thead,
  Tr,
  Td,
  Th,
  FlexProps,
  TableProps,
  TableHeadProps,
  TableRowProps,
  TableBodyProps,
  TableColumnHeaderProps,
  TableFooterProps,
  Tfoot,
  TableCellProps
} from '@chakra-ui/react';

const capitalize = (str: string) => str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase();

type MapperFunc<K extends Record<string | number, unknown>[]> = (
  data: K[number],
  index?: number
) => string | number | null | React.ReactElement;

export interface DataTableTypes<
  T extends ReadonlyArray<string>,
  K extends Record<string | number, unknown>[]
> {
  title?: string;
  rawTitle?: JSX.Element | string | null;
  keys: T;
  data: K;
  mapper: Record<T[number], true | MapperFunc<K>>;
  keyFunc?: string | ((row: K[number]) => string);
  showEmpty?: boolean;
  right?: JSX.Element;
  showFooter?: boolean;
  showHeader?: boolean;
  emptyText?: string;
  outerProps?: FlexProps;
  tableProps?: Partial<{
    table: TableProps;
    tbody: TableBodyProps;
    thead: TableHeadProps;
    tfoot: TableFooterProps;
    tr: TableRowProps;
    trHead: TableRowProps;
    th: TableColumnHeaderProps;
    td: TableCellProps;
  }>;
}

const TitleRow: React.FC<Pick<DataTableTypes<any, any>, 'title' | 'rawTitle' | 'right'>> = ({
  title,
  rawTitle,
  right
}) => {
  if (rawTitle) {
    return (
      <Flex w="full" justify="space-between">
        {rawTitle}
        {right}
      </Flex>
    );
  }

  return (
    <Flex w="full" justify="space-between">
      {title ? <Heading mb="2">{title}</Heading> : <div></div>}
      {right}
    </Flex>
  );
};

export function DataTable<
  T extends ReadonlyArray<string>,
  K extends Record<string | number, unknown>[]
>(props: DataTableTypes<T, K>) {
  const {
    keys,
    data,
    mapper,
    keyFunc,
    showEmpty,
    outerProps,
    tableProps,
    showFooter,
    showHeader = true,
    emptyText
  } = props;

  const getData = (row: Record<string | number, any>, key: T[number], index?: number) => {
    const map = mapper[key] as true | MapperFunc<Array<typeof row>>;
    if (map === true) {
      return row[key] || null;
    }

    if (typeof map !== 'function') {
      console.error(`Mapper[${key}] is not a function`);
      return null;
    }

    return map(row, index) || null;
  };

  return (
    <Flex flexDir="column" w="full" p="2" {...outerProps}>
      <TitleRow title={props.title} rawTitle={props.rawTitle} right={props.right} />
      {data.length > 0 || (data.length === 0 && showEmpty) ? (
        <Table {...tableProps?.table}>
          {showHeader && (
            <Thead {...tableProps?.thead}>
              <Tr {...tableProps?.trHead}>
                {keys.map((key) => (
                  <Th key={key} {...tableProps?.th}>
                    {capitalize(key)}
                  </Th>
                ))}
              </Tr>
            </Thead>
          )}
          <Tbody {...tableProps?.tbody}>
            {data.map((row, index) => {
              let rowKey: string = index.toString();
              if (keyFunc) {
                // @ts-ignore
                rowKey = typeof keyFunc === 'string' ? row[keyFunc] : keyFunc(row, index);
              }

              return (
                <Tr key={rowKey} {...tableProps?.tr}>
                  {keys.map((key) => (
                    <Td key={`${rowKey}-${key}`} {...tableProps?.td}>
                      {//@ts-ignore
                      getData(row, key, index)}
                    </Td>
                  ))}
                </Tr>
              );
            })}
          </Tbody>
          {showFooter && (
            <Tfoot {...tableProps?.tfoot}>
              <Tr {...tableProps?.trHead}>
                {keys.map((key) => (
                  <Th key={key} {...tableProps?.th}>
                    {capitalize(key)}
                  </Th>
                ))}
              </Tr>
            </Tfoot>
          )}
        </Table>
      ) : (
        <Heading size="sm">{emptyText || 'Empty'}</Heading>
      )}
    </Flex>
  );
}
