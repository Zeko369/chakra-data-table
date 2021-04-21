import React from 'react';
import { NextPage } from 'next';
import { Text } from '@chakra-ui/react';
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
      data={data}
      keys={['id', 'title', 'items'] as const}
      mapper={{
        id: true,
        title: (r) => <Text color="red">{r.title || 'Unknonw'}</Text>,
        items: (r) => r.items.join(',')
      }}
    />
  );
};

export default Home;
