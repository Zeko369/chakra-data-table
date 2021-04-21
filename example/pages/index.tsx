import React from 'react';
import { NextPage } from 'next';
import {
  Text,
  HStack,
  Button,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack
} from '@chakra-ui/react';
import { DataTable } from '../../dist';

const data = [
  { id: 1, title: 'foobar', items: ['1', '2', '3'] },
  { id: 2, title: 'something', items: [] },
  { id: 3, title: 'fooasdasd', items: ['1', '2', '3'] },
  { id: 4, title: null, items: ['1'] }
];

const Home: NextPage = () => {
  return (
    <DataTable
      title="Some random data"
      data={data}
      keys={['id', 'title', 'items', 'buttons'] as const}
      mapper={{
        id: true,
        title: (r) => <Text color="green">{r.title}</Text>,
        items: (r) => r.items.join(', '),
        buttons: () => (
          <HStack>
            <Button colorScheme="green" size="sm">
              Click me
            </Button>
          </HStack>
        )
      }}
    />
  );
};

export default Home;
