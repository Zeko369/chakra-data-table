import React from 'react';
import capitalize from 'lodash.capitalize';
import {
  Flex,
  Heading,
  Table,
  Tbody,
  Thead,
  Tr,
  Td,
  Th
} from '@chakra-ui/react';

export interface DataTableTypes<
  T extends ReadonlyArray<string>,
  K extends unknown[]
> {
  title?: string;
  keys: T;
  data: K;
  mapper: Record<
    T[number],
    true | ((data: K[number]) => string | number | null | React.ReactElement)
  >;
  keyFunc?: string | ((row: K[number]) => string);
  showEmpty?: boolean;
  right?: JSX.Element;
}

export function DataTable<T extends ReadonlyArray<string>, K extends unknown[]>(
  props: DataTableTypes<T, K>
) {
  const { title, keys, data, mapper, keyFunc, showEmpty, right } = props;

  return (
    <Flex flexDir="column" w="full" p="2">
      <Flex w="full" justify="space-between">
        {title ? <Heading mb="2">{title}</Heading> : right ? <div></div> : null}
        {right}
      </Flex>
      {data.length > 0 || (data.length === 0 && showEmpty) ? (
        <Table>
          <Thead>
            <Tr>
              {keys.map((key) => (
                <Th key={key}>{capitalize(key)}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {data.map((row, index) => {
              let rowKey: string = index.toString();
              if (keyFunc) {
                rowKey =
                  // @ts-ignore
                  typeof keyFunc === 'string' ? row[keyFunc] : keyFunc(row);
              }

              return (
                <Tr key={rowKey}>
                  {keys.map((key) => (
                    <Td key={`${rowKey}-${key}`}>
                      {// @ts-ignore
                      mapper[key] === true ? row[key] : mapper[key](row)}
                    </Td>
                  ))}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      ) : (
        <Heading size="sm">Empty</Heading>
      )}
    </Flex>
  );
}
