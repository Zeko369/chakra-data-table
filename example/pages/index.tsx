import React, { useState } from 'react';
import { NextPage } from 'next';
import { Text, HStack, Button, VStack, Heading } from '@chakra-ui/react';
import { useConfirmDelete } from 'chakra-confirm';
import { LinkButton } from 'chakra-next-link';

import { DataTable } from '../../dist';

const Home: NextPage = () => {
  const [data, setData] = useState([
    { id: 1, title: 'foobar', items: ['1', '2', '3'] },
    { id: 2, title: 'something', items: [] },
    { id: 3, title: 'fooasdasd', items: ['1', '2', '3'] },
    { id: 4, title: null, items: ['1'] }
  ]);

  const confirm = useConfirmDelete({
    body: (
      <VStack>
        <Heading size="sm">Interested in this popup?</Heading>
        <LinkButton size="sm" href="https://www.npmjs.com/package/chakra-confirm">
          Check it out
        </LinkButton>
      </VStack>
    )
  });

  return (
    <DataTable
      title="Some random data"
      data={data}
      keys={['id', 'index', 'title', 'items', 'buttons'] as const}
      keyFunc={'id'}
      tableProps={{
        td: {
          color: 'blue.700'
        },
        thead: {
          fontStyle: 'italic'
        }
      }}
      showFooter
      mapper={{
        id: true,
        index: (r, index) => <Text color="red.600">{index}</Text>,
        title: (r) => <Text color="green">{r.title}</Text>,
        items: (r) => r.items.join(', '),
        buttons: (r) => (
          <HStack>
            <Button
              onClick={() => {
                confirm().then(() => setData((d) => d.filter((i) => i.id !== r.id)));
              }}
              colorScheme="red"
              size="sm"
            >
              Delete me
            </Button>
          </HStack>
        )
      }}
    />
  );
};

export default Home;
