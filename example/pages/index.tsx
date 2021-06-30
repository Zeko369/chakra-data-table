import React, { useState } from 'react';
import { NextPage } from 'next';
import { Button, Heading, HStack, Text, useColorMode, VStack } from '@chakra-ui/react';
import { useConfirmDelete } from 'chakra-confirm';
import { LinkButton } from 'chakra-next-link';

import { DataTable } from '../../dist';
import { useEffect } from 'react';

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([
    { id: 1, title: 'foobar', items: ['1', '2', '3'] },
    { id: 2, title: 'something', items: [] },
    { id: 3, title: 'fooasdasd', items: ['1', '2', '3'] },
    { id: 4, title: null, items: ['1'] }
  ]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [loading]);

  const { colorMode, toggleColorMode } = useColorMode();
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
    <>
      <HStack>
        <Button onClick={() => setLoading(true)} isLoading={loading}>
          Get data (loading)
        </Button>
        <Button onClick={toggleColorMode}>{colorMode}</Button>
      </HStack>

      <DataTable
        title="Some random data"
        data={data}
        isLoading={loading}
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
          id: [true, 8],
          index: (r, index) => <Text color="red.600">{index}</Text>,
          title: [(r) => <Text color="green">{r.title}</Text>, { bg: 'gray.100' }],
          items: [
            (r) => (r.items.length === 0 ? 'Error' : r.items.join(', ')),
            (r) => ({
              bg: r.items.length === 0 ? 'red.500' : undefined,
              color: 'white'
            })
          ],
          buttons: (r) => (
            <HStack>
              <Button
                onClick={() => {
                  confirm().then((ok) => ok && setData((d) => d.filter((i) => i.id !== r.id)));
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
    </>
  );
};

export default Home;
