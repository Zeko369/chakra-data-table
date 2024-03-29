import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Flex,
  FlexProps,
  Heading,
  Spinner,
  Table,
  TableBodyProps,
  TableCellProps,
  TableColumnHeaderProps,
  TableFooterProps,
  TableHeadProps,
  TableProps,
  TableRowProps,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
  useColorMode,
  useToken
} from '@chakra-ui/react';

const capitalize = (str: string) => str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase();

export type ValidReactChild = React.ReactElement | string | number | null | false;

export type MapperFunc<
  K extends Record<string | number, unknown>[],
  Z = string | number | null | false | undefined | React.ReactElement
> = (data: K[number], index: number) => Z;

export type Value<K extends Record<string | number, unknown>[]> = true | MapperFunc<K>;
export type MapperValue<K extends Record<string | number, unknown>[]> =
  | Value<K>
  | [Value<K>, TableCellProps | number]
  // TODO: Add number here
  | [Value<K>, (row: K[number], index: number) => TableCellProps];

export interface DataTableTypes<
  T extends ReadonlyArray<string>,
  K extends Record<string | number, unknown>[]
> {
  title?: string;
  rawTitle?: ValidReactChild;
  labels?: Partial<Record<T[number], ValidReactChild>>;

  keys: T;
  data: K;
  mapper: Record<T[number], MapperValue<K>>;

  headerMapperProps?: Partial<Record<T[number], TableCellProps>>;
  keyFunc?: string | ((row: K[number]) => string);
  showEmpty?: boolean;
  right?: JSX.Element | false;
  showFooter?: boolean;
  showHeader?: boolean;
  headerRowProps?: FlexProps;
  emptyText?: string | JSX.Element | null;

  variant?: TableProps['variant'];
  striped?: boolean;

  /**
   * Default is upper
   */
  headerStyle?: 'upper' | 'capitalize' | 'none';

  overflow?: boolean;
  widths?: Partial<Record<T[number], TableCellProps['w']>>;
  rowProps?: (data: K[number], key: string) => TableRowProps | undefined;
  isLoading?: boolean;

  outerProps?: FlexProps;
  tableProps?: Partial<{
    table: TableProps;
    tbody: TableBodyProps;
    thead: TableHeadProps;
    tfoot: TableFooterProps;
    tr: TableRowProps;
    trHead: TableRowProps;
    trFoot: TableRowProps;
    th: TableColumnHeaderProps;
    td: TableCellProps;
  }>;
}

const TitleRow: React.FC<Pick<
  DataTableTypes<any, any>,
  'title' | 'rawTitle' | 'right' | 'headerRowProps'
>> = ({ title, rawTitle, right, headerRowProps }) => {
  if (rawTitle) {
    return (
      <Flex w="full" justify="space-between">
        {rawTitle}
        {right}
      </Flex>
    );
  }

  return (
    <Flex w="full" alignItems="center" justify="space-between" {...headerRowProps}>
      {title ? <Heading mb="2">{title}</Heading> : <div />}
      {right}
    </Flex>
  );
};

function FooterHeader<
  T extends ReadonlyArray<string>,
  K extends Record<string | number, unknown>[]
>(
  props: Pick<
    DataTableTypes<T, K>,
    'headerStyle' | 'tableProps' | 'keys' | 'labels' | 'headerMapperProps'
  > & {
    head: boolean;
  }
) {
  const { headerStyle, keys, tableProps, head, labels, headerMapperProps } = props;

  return (
    <Tr
      textTransform={
        headerStyle === 'none' ? 'initial' : headerStyle === 'upper' ? 'uppercase' : undefined
      }
      {...(head ? tableProps?.trHead : tableProps?.trFoot)}
    >
      {keys.map((key) => {
        const label = (labels as any)?.[key];
        return (
          <Th key={key} {...tableProps?.th} {...((headerMapperProps as any)?.[key as any] as any)}>
            {!label || typeof label === 'string'
              ? headerStyle === 'capitalize'
                ? capitalize(label || key)
                : label || key
              : label}
          </Th>
        );
      })}
    </Tr>
  );
}

const useColorModeBody = () => {
  const colorMode = useColorMode();
  const [theme, setTheme] = useState<'light' | 'dark'>(colorMode.colorMode || 'light');
  const observer = useRef<MutationObserver>();

  useEffect(() => {
    const body = document.querySelector('body');
    if (!body) {
      return;
    }

    const setup = () => {
      if (body.classList.contains('chakra-ui-dark')) {
        setTheme('dark');
      } else {
        setTheme('light');
      }
    };

    observer.current = new MutationObserver((mutationList) => {
      const elem = mutationList.filter((mr) => mr.attributeName === 'class')[0]?.target as
        | HTMLElement
        | undefined;
      if (elem) {
        setup();
      }
    });

    observer.current.observe(body, { attributes: true });
    setup();

    return () => observer.current?.disconnect();
  }, []);

  return theme;
};

const useGetColor = (a: 'light' | 'dark', light: string, dark: string) => {
  const tokens = useToken('colors', [light, dark]);
  const index = a === 'light' ? 0 : 1;

  return tokens[index];
};

export function DataTable<
  T extends ReadonlyArray<string>,
  K extends Record<string | number, unknown>[]
>(props: DataTableTypes<T, K>) {
  const {
    keys,
    overflow,
    headerStyle = 'upper',
    data,
    mapper,
    keyFunc,
    showEmpty,
    outerProps,
    tableProps,
    showFooter,
    showHeader = true,
    emptyText,
    striped,
    widths,
    variant,
    rawTitle,
    right,
    rowProps,
    title,
    isLoading,
    labels,
    headerMapperProps
  } = props;

  const theme = useColorModeBody();
  const strippedBgColor = useGetColor(theme, 'gray.50', 'gray.900');
  const isLoadingBg = useGetColor(theme, 'white', 'gray.800');

  const getData = (row: Record<string | number, any>, key: T[number], index: number) => {
    const map = mapper[key] as MapperValue<Array<typeof row>>;
    if (map === true) {
      let out = (row[key] || null) as any;
      if (out instanceof Date) {
        out = out.toDateString();
      }
      return [out, {}];
    }

    if (Array.isArray(map)) {
      const [m, options] = map;
      // TODO: catch numbers here for width
      if (m === true) {
        return [row[key] || null, typeof options === 'function' ? options(row, index) : options];
      }

      return [m(row, index), typeof options === 'function' ? options(row, index) : options];
    }

    if (typeof map !== 'function') {
      console.error(`Mapper[${key}] is not a function`);
      return [null, {}];
    }

    return [map(row, index) || null, {}];
  };

  return (
    <Flex flexDir="column" w={overflow ? '100vw' : 'full'} minW="full" maxW="100vw" {...outerProps}>
      <TitleRow title={title} rawTitle={rawTitle} right={right} />
      <Box pos="relative" w="full" h="full">
        {isLoading && (
          <>
            <Flex
              w="full"
              h="full"
              pos="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              zIndex="12"
              align="center"
              justify="center"
            >
              <Spinner size="xl" />
            </Flex>
            <Box
              w="full"
              h="full"
              opacity="0.7"
              bg={isLoadingBg}
              pos="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              zIndex="10"
            />
          </>
        )}

        {data.length > 0 || (data.length === 0 && showEmpty) ? (
          <Table
            className="chakra-data-table"
            overflowX={overflow ? 'scroll' : 'hidden'}
            {...(striped ? { variant: 'simple' } : { variant })}
            {...tableProps?.table}
          >
            {showHeader && (
              <Thead {...tableProps?.thead}>
                <FooterHeader
                  keys={keys}
                  tableProps={tableProps}
                  headerStyle={headerStyle}
                  headerMapperProps={headerMapperProps}
                  head={true}
                  labels={labels}
                />
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
                  <Tr
                    key={rowKey}
                    backgroundColor={striped && index % 2 === 0 ? strippedBgColor : undefined}
                    {...tableProps?.tr}
                    {...rowProps?.(row, rowKey)}
                  >
                    {keys.map((key) => {
                      let [out, p] = getData(row, key, index);
                      return (
                        <Td
                          key={`${rowKey}-${key}`}
                          {...tableProps?.td}
                          // @ts-ignore
                          minW={widths?.[key]}
                          // @ts-ignore
                          w={widths?.[key]}
                          // @ts-ignore
                          maxW={widths?.[key]}
                          {...p}
                        >
                          {/*@ts-ignore*/ out}
                        </Td>
                      );
                    })}
                  </Tr>
                );
              })}
            </Tbody>
            {showFooter && (
              <Tfoot {...tableProps?.tfoot}>
                <FooterHeader
                  keys={keys}
                  tableProps={tableProps}
                  headerStyle={headerStyle}
                  head={false}
                  labels={labels}
                />
              </Tfoot>
            )}
          </Table>
        ) : (
          <Heading size="sm">{emptyText || 'Empty'}</Heading>
        )}
      </Box>
    </Flex>
  );
}
