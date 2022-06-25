import { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Input,
  Text,
  FormLabel,
  Td,
  Heading,
  Button,
  Spinner,
  VStack,
  Flex,
  FormControl,
  Select,
  useDisclosure,
} from '@chakra-ui/react';
import { Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { Modal, ModalOverlay, ModalBody, ModalContent } from '@chakra-ui/react';
import { saveAs } from 'file-saver';

import { DownloadIcon } from '@chakra-ui/icons';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
// files
import Pagination from './pagination';
const SalesReturn = () => {
  const [file, setFile] = useState();
  const fileReader = new FileReader();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const LastProductIndex = currentPage * productsPerPage;
  const FirstProductIndex = LastProductIndex - productsPerPage;

  const [status, setStatus] = useState('');
  const [enteredAWB, setEnteredAWB] = useState('');

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [receivedCount, setReceivedCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [partialCount, setPartialCount] = useState(0);

  const [receivedArray, setIsReceivedArray] = useState([]);
  const [wrongArray, setIsWrongArray] = useState([]);
  const [partialArray, setIsPartialArray] = useState([]);
  const [filterArray, setFilterArray] = useState([]);

  const [isScan, setIsScan] = useState(false);
  const [isReceived, setIsReceived] = useState(true);
  const [isPartial, setIsPartial] = useState(true);
  const [isWrong, setIsWrong] = useState(true);

  const onChangeHandler = e => {
    setFile(e.target.files[0]);
  };
  const switchScanHandler = () => {
    if (isScan === true) setIsScan(false);
    if (isReceived === false) setIsReceived(true);
    if (isWrong === false) setIsWrong(true);
    if (isPartial === false) setIsPartial(true);
  };
  const switchReceivedHandler = () => {
    if (isScan === false) setIsScan(true);
    if (isReceived === true) setIsReceived(false);
    if (isWrong === false) setIsWrong(true);
    if (isPartial === false) setIsPartial(true);
  };
  const switchPartialHandler = () => {
    if (isScan === false) setIsScan(true);
    if (isPartial === true) setIsPartial(false);
    if (isReceived === false) setIsReceived(true);
    if (isWrong === false) setIsWrong(true);
  };
  const switchWrongHandler = () => {
    if (isScan === false) setIsScan(true);
    if (isReceived === false) setIsReceived(true);
    if (isPartial === false) setIsPartial(true);
    if (isWrong === true) setIsWrong(false);
  };

  const handleSelect = ranges => {
    setEndDate(ranges.selection.endDate);
    setStartDate(ranges.selection.startDate);
  };
  // convert csv to array
  const csvFileToArray = string => {
    const csvHeader = string.slice(0, string.indexOf('\n')).split(',');
    const csvRows = string.slice(string.indexOf('\n') + 1).split('\n');

    const array = csvRows.map(i => {
      const values = i.split(',');
      const obj = csvHeader.reduce((object, header, index) => {
        object[header] = values[index];
        return object;
      }, {});
      return obj;
    });
    fetch('https://cryptic-bayou-61420.herokuapp.com/api/salesReturn/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(array),
    });
  };
  // submit csv file
  const onSubmitHandler = e => {
    setIsLoading(true);
    if (file) {
      fileReader.onload = function (e) {
        const csvOutput = e.target.result;
        csvFileToArray(csvOutput);
      };
      fileReader.readAsText(file);
    }
  };
  // update the status
  useEffect(() => {
    const updateHandler = async () => {
      await fetch(
        'https://cryptic-bayou-61420.herokuapp.com/api/salesReturn/update',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            awb: enteredAWB,
            status,
            date: new Date().toLocaleDateString().replace(/\//g, '-'),
          }),
        }
      );
    };
    updateHandler();
  }, [status, enteredAWB]);
  // filter the product according to AWB
  useEffect(() => {
    const filterHandler = async () => {
      const receivedList = await fetch(
        'https://cryptic-bayou-61420.herokuapp.com/api/salesReturn/awbfilter',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            awb: enteredAWB,
            date: new Date().toLocaleDateString().replace(/\//g, '-'),
          }),
        }
      );
      const result = await receivedList.json();
      setFilterArray(result);
    };
    filterHandler();
  }, [enteredAWB]);
  // universal filter

  // received data filter
  useEffect(() => {
    const receivedData = async () => {
      const response = await fetch(
        'https://cryptic-bayou-61420.herokuapp.com/api/salesReturn/received'
      );
      const result = await response.json();
      setIsReceivedArray(result);
    };
    receivedData();
  }, []);
  // Filter Count

  useEffect(() => {
    const filter = async filter => {
      const response = await fetch(
        'https://cryptic-bayou-61420.herokuapp.com/api/salesReturn/filter',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filter: filter,
            sd: startDate.toLocaleDateString().replace(/\//g, '-'),
            ed: endDate.toLocaleDateString().replace(/\//g, '-'),
          }),
        }
      );
      const result = await response.json();
      if (filter === 'received')
        setIsReceivedArray(prev => [...prev, ...result]);
    };
    const filterCount = async status => {
      const response = await fetch(
        'https://cryptic-bayou-61420.herokuapp.com/api/salesReturn/filterCount',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: status,
            sd: startDate.toLocaleDateString().replace(/\//g, '-'),
            ed: endDate.toLocaleDateString().replace(/\//g, '-'),
          }),
        }
      );
      const count = await response.json();
      if (status === 'received') setReceivedCount(count);
    };
    filterCount('received');
    filter('received');
  }, [isReceived, startDate, endDate]);
  useEffect(() => {
    const filter = async filter => {
      const response = await fetch(
        'https://cryptic-bayou-61420.herokuapp.com/api/salesReturn/filter',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filter: filter,
            sd: startDate.toLocaleDateString().replace(/\//g, '-'),
            ed: endDate.toLocaleDateString().replace(/\//g, '-'),
          }),
        }
      );
      const result = await response.json();
      if (filter === 'wrong') setIsWrongArray(result);
    };
    const filterCount = async status => {
      const response = await fetch(
        'https://cryptic-bayou-61420.herokuapp.com/api/salesReturn/filterCount',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: status,
            sd: startDate.toLocaleDateString().replace(/\//g, '-'),
            ed: endDate.toLocaleDateString().replace(/\//g, '-'),
          }),
        }
      );
      const count = await response.json();
      if (status === 'wrong') setWrongCount(count);
    };
    filterCount('wrong');
    filter('wrong');
  }, [isWrong, endDate, startDate]);
  useEffect(() => {
    const filter = async filter => {
      const response = await fetch(
        'https://cryptic-bayou-61420.herokuapp.com/api/salesReturn/filter',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filter: filter,
            sd: startDate.toLocaleDateString().replace(/\//g, '-'),
            ed: endDate.toLocaleDateString().replace(/\//g, '-'),
          }),
        }
      );
      const result = await response.json();
      if (filter === 'partial') setIsPartialArray(result);
    };
    const filterCount = async status => {
      const response = await fetch(
        'https://cryptic-bayou-61420.herokuapp.com/api/salesReturn/filterCount',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: status,
            sd: startDate.toLocaleDateString().replace(/\//g, '-'),
            ed: endDate.toLocaleDateString().replace(/\//g, '-'),
          }),
        }
      );
      const count = await response.json();
      if (status === 'partial') setPartialCount(count);
    };
    filterCount('partial');
    filter('partial');
  }, [isPartial, endDate, startDate]);

  const currentRecords = receivedArray.slice(
    FirstProductIndex,
    LastProductIndex
  );
  const pages = Math.ceil(receivedArray.length / productsPerPage);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const SelectionRange = {
    startDate,
    endDate,
    key: 'selection',
  };
  const downloadFile = (array, status) => {
    const csv = array
      .map(item => {
        return JSON.stringify(item);
      })
      .join('\n')
      .replace(/(^\[)|(\]$)/gm, '');
    const blob = new Blob([csv], {
      type: 'text/plain;charset=utf-8',
    });
    if (status === 'received') saveAs(blob, 'received.csv');
    if (status === 'partial') saveAs(blob, 'partial.csv');
    if (status === 'wrong') saveAs(blob, 'wrong.csv');
  };

  return (
    <VStack p={4} pb={20}>
      <Heading size={'md'} pb={10}>
        Sales Return Section
      </Heading>
      <Box textAlign={'center'}>
        <FormControl>
          <FormLabel
            w={'100%'}
            htmlFor={'csvInput'}
            padding={'7px 0px'}
            border={'1px solid grey'}
            _hover={{ cursor: 'pointer' }}
            borderRadius={'5px'}
          >
            <Text textAlign={'center'}>
              Select csv <DownloadIcon />
            </Text>
          </FormLabel>
          <Input
            size={'sm'}
            borderRadius={6}
            display={'none'}
            type={'file'}
            id={'csvInput'}
            accept={'.csv'}
            onChange={onChangeHandler}
          />
          <Button
            size={'sm'}
            type={'button'}
            w={'100%'}
            onClick={onSubmitHandler}
            variant={'outline'}
          >
            Import
          </Button>
        </FormControl>
        <Button size={'sm'} mt={4} width={'100%'} onClick={onOpen}>
          Date Filter
        </Button>
        <Modal size={'sm'} isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalBody>
              <DateRange ranges={[SelectionRange]} onChange={handleSelect} />
            </ModalBody>
          </ModalContent>
        </Modal>
        <Flex py={2}>
          <Button size={'sm'} onClick={switchScanHandler}>
            Scan Products
          </Button>
          <Menu>
            <MenuButton size={'sm'} as={Button}>
              List Products
            </MenuButton>
            <MenuList>
              <MenuItem onClick={switchReceivedHandler}>Received List</MenuItem>
              <MenuItem onClick={switchPartialHandler}>Partial List</MenuItem>
              <MenuItem onClick={switchWrongHandler}>Wrong List</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
        <Input
          size={'sm'}
          type={'text'}
          mt={5}
          textAlign={'center'}
          onChange={e => {
            setEnteredAWB(e.target.value);
            setStatus('received');
            e.target.select();
          }}
          value={enteredAWB}
          placeholder="Enter AWB"
          autoFocus
          autoCapitalize="true"
        />
      </Box>

      {/* Scan Section */}
      {!isScan && (
        <Box>
          {enteredAWB.trim().length !== 0 && (
            <TableContainer
              pt={10}
              rounded={'lg'}
              boxShadow={'lg'}
              h={260}
              w={1200}
              overflowY={'auto'}
              overflowX={'scroll'}
            >
              <Table variant={'simple'} size={'sm'}>
                <Thead>
                  <Tr key={'header'}>
                    <Th textAlign={'center'}>Suborder ID</Th>
                    <Th textAlign={'center'}>Order ID</Th>
                    <Th textAlign={'center'}>AWB</Th>
                    <Th textAlign={'center'}>SKU</Th>
                    <Th textAlign={'center'}>QTY</Th>
                    <Th textAlign={'center'}>Status</Th>
                    <Th textAlign={'center'}>Return Received Date</Th>
                    <Th textAlign={'center'}>WRONG RETURN</Th>
                    <Th textAlign={'center'}>Return Request Date</Th>
                    <Th textAlign={'center'}>
                      Return Delivered Date As Per Website
                    </Th>
                    <Th textAlign={'center'}>Portal</Th>
                    <Th textAlign={'center'}>Return Type Web</Th>
                    <Th textAlign={'center'}>Company</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filterArray.map(item => (
                    <Tr key={item._id}>
                      <Td textAlign={'center'}>{item['Suborder ID']}</Td>
                      <Td textAlign={'center'}>{item['Order ID']}</Td>
                      <Td textAlign={'center'}>{item['AWB NO']}</Td>
                      <Td textAlign={'center'}>{item.SKU}</Td>
                      <Td textAlign={'center'}>{item.QTY}</Td>
                      <Td mr={10}>
                        <Select
                          mx={8}
                          onChange={e => {
                            setStatus(e.target.value);
                          }}
                          value={status}
                        >
                          <option value={'received'}>received</option>
                          <option value={'partial'}>partial</option>
                          <option value={'wrong'}>wrong</option>
                        </Select>
                      </Td>
                      <Td textAlign={'center'}>
                        {item['Return Received Date']}
                      </Td>
                      <Td textAlign={'center'}>{item['WRONG RETURN']}</Td>
                      <Td textAlign={'center'}>
                        {item['Return Request Date']}
                      </Td>
                      <Td textAlign={'center'}>
                        {item['Return Delivered Date As Per Website']}
                      </Td>
                      <Td textAlign={'center'}>{item.Portal}</Td>
                      <Td textAlign={'center'}>{item['RETURN TYPE WEB']}</Td>
                      <Td textAlign={'center'}>{item['COMPANY\r']}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Filters Section */}
      {isScan && (
        <Box>
          <Flex py={8} justifyContent={'space-between'}>
            <Heading mt={2} size={'sm'}>
              {!isReceived
                ? 'Received Table'
                : !isPartial
                ? 'Partial Table'
                : !isWrong
                ? 'Wrong Table'
                : ''}
            </Heading>
            <Button size={'sm'}>
              {!isReceived
                ? `${receivedCount}`
                : !isPartial
                ? `${partialCount}`
                : !isWrong
                ? `${wrongCount}`
                : 'null'}
            </Button>
          </Flex>
          {isLoading && <Spinner size={'xl'} />}
          {!isLoading && (
            <VStack>
              <TableContainer
                rounded={'lg'}
                boxShadow={'lg'}
                overflowY={'auto'}
                overflowX={'auto'}
                h={260}
                w={1200}
                mb={20}
              >
                <Table variant="simple" size={'sm'}>
                  <Thead
                    position={'sticky'}
                    top={0}
                    backgroundColor={'lightblue'}
                  >
                    <Tr key={'header'}>
                      <Th textAlign={'center'}>Suborder ID</Th>
                      <Th textAlign={'center'}>Order ID</Th>
                      <Th textAlign={'center'}>AWB</Th>
                      <Th textAlign={'center'}>SKU</Th>
                      <Th textAlign={'center'}>QTY</Th>
                      <Th textAlign={'center'}>Return Received Date</Th>
                      <Th textAlign={'center'}>WRONG RETURN</Th>
                      <Th textAlign={'center'}>Return Request Date</Th>
                      <Th textAlign={'center'}>
                        Return Delivered Date As Per Website
                      </Th>
                      <Th textAlign={'center'}>Portal</Th>
                      <Th textAlign={'center'}>Return Type Web</Th>
                      <Th textAlign={'center'}>Company</Th>
                    </Tr>
                  </Thead>

                  <Tbody>
                    {!isReceived ? (
                      currentRecords.map(item => (
                        <Tr key={item._id}>
                          <Td textAlign={'center'}>{item['Suborder ID']}</Td>
                          <Td textAlign={'center'}>{item['Order ID']}</Td>
                          <Td textAlign={'center'}>{item['AWB NO']}</Td>
                          <Td textAlign={'center'}>{item.SKU}</Td>
                          <Td textAlign={'center'}>{item.QTY}</Td>
                          <Td textAlign={'center'}>
                            {item['Return Received Date']}
                          </Td>
                          <Td textAlign={'center'}>{item['WRONG RETURN']}</Td>
                          <Td textAlign={'center'}>
                            {item['Return Request Date']}
                          </Td>
                          <Td textAlign={'center'}>
                            {item['Return Delivered Date As Per Website']}
                          </Td>
                          <Td textAlign={'center'}>{item.Portal}</Td>
                          <Td textAlign={'center'}>
                            {item['RETURN TYPE WEB']}
                          </Td>
                          <Td textAlign={'center'}>{item['COMPANY\r']}</Td>
                        </Tr>
                      ))
                    ) : !isPartial ? (
                      partialArray.map(item => (
                        <Tr key={item._id}>
                          <Td textAlign={'center'}>{item['Suborder ID']}</Td>
                          <Td textAlign={'center'}>{item['Order ID']}</Td>
                          <Td textAlign={'center'}>{item['AWB NO']}</Td>
                          <Td textAlign={'center'}>{item.SKU}</Td>
                          <Td textAlign={'center'}>{item.QTY}</Td>
                          <Td textAlign={'center'}>{item.status}</Td>
                          <Td textAlign={'center'}>
                            {item['Return Received Date']}
                          </Td>
                          <Td textAlign={'center'}>{item['WRONG RETURN']}</Td>
                          <Td textAlign={'center'}>
                            {item['Return Request Date']}
                          </Td>
                          <Td textAlign={'center'}>
                            {item['Return Delivered Date As Per Website']}
                          </Td>
                          <Td textAlign={'center'}>{item.Portal}</Td>
                          <Td textAlign={'center'}>
                            {item['RETURN TYPE WEB']}
                          </Td>
                          <Td textAlign={'center'}>{item['COMPANY\r']}</Td>
                        </Tr>
                      ))
                    ) : !isWrong ? (
                      wrongArray.map(item => (
                        <Tr key={item._id}>
                          <Td textAlign={'center'}>{item['Suborder ID']}</Td>
                          <Td textAlign={'center'}>{item['Order ID']}</Td>
                          <Td textAlign={'center'}>{item['AWB NO']}</Td>
                          <Td textAlign={'center'}>{item.SKU}</Td>
                          <Td textAlign={'center'}>{item.QTY}</Td>
                          <Td textAlign={'center'}>{item.status}</Td>
                          <Td textAlign={'center'}>
                            {item['Return Received Date']}
                          </Td>
                          <Td textAlign={'center'}>{item['WRONG RETURN']}</Td>
                          <Td textAlign={'center'}>
                            {item['Return Request Date']}
                          </Td>
                          <Td textAlign={'center'}>
                            {item['Return Delivered Date As Per Website']}
                          </Td>
                          <Td textAlign={'center'}>{item.Portal}</Td>
                          <Td textAlign={'center'}>
                            {item['RETURN TYPE WEB']}
                          </Td>
                          <Td textAlign={'center'}>{item['COMPANY\r']}</Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td>Error</Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
              <Button
                size={'sm'}
                onClick={() => {
                  if (!isReceived) downloadFile(receivedArray, 'received');
                  if (!isPartial) downloadFile(partialArray, 'partial');
                  if (!isWrong) downloadFile(wrongArray, 'wrong');
                }}
              >
                Download file
              </Button>
            </VStack>
          )}
          <Pagination
            totalPages={pages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </Box>
      )}
    </VStack>
  );
};

export default SalesReturn;
