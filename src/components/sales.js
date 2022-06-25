import { useState, useEffect } from 'react';
import {
  Input,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  FormLabel,
  Button,
  Spinner,
  HStack,
  VStack,
  Box,
  InputGroup,
  Select,
  useDisclosure,
  InputRightAddon,
  FormControl,
} from '@chakra-ui/react';
import { Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { Modal, ModalOverlay, ModalBody, ModalContent } from '@chakra-ui/react';

import { DownloadIcon } from '@chakra-ui/icons';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { saveAs } from 'file-saver';
// files
import Pagination from './pagination';

const Sales = () => {
  // states
  const [file, setFile] = useState();
  const fileReader = new FileReader();
  const [isLoading, setIsLoading] = useState(false);
  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const LastProductIndex = currentPage * productsPerPage;
  const FirstProductIndex = LastProductIndex - productsPerPage;
  // scanning states
  const [status, setStatus] = useState('dispatch');
  const [enteredAWB, setEnteredAWB] = useState('');
  // date filter states
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  // filter states
  const [dispatchcount, setDispatchCount] = useState(0);
  const [pendingcount, setPendingCount] = useState(0);
  const [cancelcount, setCancelCount] = useState(0);
  // arrays to store filter data
  const [dispatchArray, setDispatchArray] = useState([]);
  const [pendingArray, setPendingArray] = useState([]);
  const [cancelArray, setCancelArray] = useState([]);
  const [filterArray, setFilterArray] = useState([]);
  // condition states
  const [isScan, setIsScan] = useState(false);
  const [isPending, setIsPending] = useState(true);
  const [isCancel, setIsCancel] = useState(true);
  const [isDispatch, setIsDispatch] = useState(true);
  // Event Handlers
  const onChangeHandler = e => {
    setFile(e.target.files[0]);
  };
  const switchScanHandler = () => {
    if (isScan === true) setIsScan(false);
    if (isDispatch === false) setIsDispatch(true);
    if (isCancel === false) setIsCancel(true);
    if (isPending === false) setIsPending(true);
  };
  const switchDispatchHandler = () => {
    if (isScan === false) setIsScan(true);
    if (isDispatch === true) setIsDispatch(false);
    if (isCancel === false) setIsCancel(true);
    if (isPending === false) setIsPending(true);
  };
  const switchPendingHandler = () => {
    if (isScan === false) setIsScan(true);
    if (isPending === true) setIsPending(false);
    if (isDispatch === false) setIsDispatch(true);
    if (isCancel === false) setIsCancel(true);
  };
  const switchCancelHandler = () => {
    if (isScan === false) setIsScan(true);
    if (isDispatch === false) setIsDispatch(true);
    if (isPending === false) setIsPending(true);
    if (isCancel === true) setIsCancel(false);
  };
  // csv to array conversion
  const csvFileToArray = async string => {
    const csvHeader = string.slice(0, string.indexOf('\n')).split(',');
    const csvRows = string.slice(string.indexOf('\n') + 1).split('\n');

    const array = csvRows.map(i => {
      const values = i.split(',') || i.split(' ');
      const obj = csvHeader.reduce((object, header, index) => {
        object[header] = values[index];
        return object;
      }, {});
      return obj;
    });
    await fetch('https://cryptic-bayou-61420.herokuapp.com/api/sales/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(array),
    });
    console.log(array);
  };
  // submit csv file to function
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
  const submitBulkHandler = async () => {
    const response = await fetch('http://localhost:3001/api/sales/bulkupdate', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(),
    });
    const result = await response.json();
    console.log(result);
  };
  // update the product with dispatch
  useEffect(() => {
    const updateHandler = async () => {
      await fetch(
        'https://cryptic-bayou-61420.herokuapp.com/api/sales/update',
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
        'https://cryptic-bayou-61420.herokuapp.com/api/sales/awbfilter',
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
  useEffect(() => {
    const filter = async filter => {
      const response = await fetch(
        'https://cryptic-bayou-61420.herokuapp.com/api/sales/filter',
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
      setDispatchArray(result);
    };
    const filterCount = async status => {
      const response = await fetch(
        'https://cryptic-bayou-61420.herokuapp.com/api/sales/filterCount',
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
      setDispatchCount(count);
    };
    filter('dispatch');
    filterCount('dispatch');
  }, [startDate, endDate]);
  useEffect(() => {
    const filter = async filter => {
      const response = await fetch(
        'https://cryptic-bayou-61420.herokuapp.com/api/sales/filter',
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
      console.log(result.length);
      setPendingArray(result);
    };
    const filterCount = async status => {
      const response = await fetch(
        'https://cryptic-bayou-61420.herokuapp.com/api/sales/filterCount',
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
      setPendingCount(count);
    };
    filter('pending');
    filterCount('pending');
  }, [startDate, endDate]);
  useEffect(() => {
    const filter = async filter => {
      const response = await fetch(
        'https://cryptic-bayou-61420.herokuapp.com/api/sales/filter',
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
      setCancelArray(result);
    };
    const filterCount = async status => {
      const response = await fetch(
        'https://cryptic-bayou-61420.herokuapp.com/api/sales/filterCount',
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
      setCancelCount(count);
    };
    filter('cancel');
    filterCount('cancel');
  }, [startDate, endDate]);
  // Date filter
  const SelectionRange = {
    startDate: startDate,
    endDate: endDate,
    key: 'selection',
  };
  const handleSelect = ranges => {
    setEndDate(ranges.selection.endDate);
    setStartDate(ranges.selection.startDate);
  };
  // testing
  const removeDups = async () => {
    const response = await fetch('http://localhost:3001/api/sales/grouped');
    const result = await response.json();
    console.log(result);
  };
  // pagination
  const { isOpen, onOpen, onClose } = useDisclosure();
  const dispatchRecords = dispatchArray.slice(
    FirstProductIndex,
    LastProductIndex
  );
  const dispatchpages = Math.ceil(dispatchArray.length / productsPerPage);
  const pendingRecords = pendingArray.slice(
    FirstProductIndex,
    LastProductIndex
  );
  const pendingpages = Math.ceil(pendingArray.length / productsPerPage);
  const cancelRecords = cancelArray.slice(FirstProductIndex, LastProductIndex);
  const cancelpages = Math.ceil(cancelArray.length / productsPerPage);
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
    if (status === 'dispatch') saveAs(blob, 'dispatch.csv');
    if (status === 'pending') saveAs(blob, 'pending.csv');
    if (status === 'cancel') saveAs(blob, 'cancel.csv');
  };
  return (
    <VStack>
      <Heading as={'h2'} size={'md'} mt={4}>
        Sales Section
      </Heading>
      {!isScan && (
        <HStack spacing={80}>
          {/* VStack 2 */}
          <VStack>
            <HStack spacing={2}>
              <Button size={'sm'} onClick={switchScanHandler}>
                Scan Products
              </Button>
              <Menu size={'sm'}>
                <MenuButton size={'sm'} as={Button}>
                  List Products
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={switchDispatchHandler}>
                    Dispatch List
                  </MenuItem>
                  <MenuItem onClick={switchPendingHandler}>
                    Pending List
                  </MenuItem>
                  <MenuItem onClick={switchCancelHandler}>Cancel List</MenuItem>
                </MenuList>
              </Menu>
            </HStack>
            <Input
              size={'sm'}
              borderRadius={6}
              type={'text'}
              mt={5}
              textAlign={'center'}
              onChange={e => {
                setEnteredAWB(e.target.value);
                setStatus('dispatch');
                e.target.select();
              }}
              value={enteredAWB}
              placeholder="Enter AWB"
              autoFocus
              autoCapitalize="true"
            />
          </VStack>
          {/* VStack 1 */}
          <VStack>
            <InputGroup size={'sm'}>
              <FormLabel
                width={'100%'}
                htmlFor={'csvInput'}
                _hover={{ cursor: 'pointer' }}
                textAlign={'center'}
              >
                Upload File
              </FormLabel>
              <Input
                display={'none'}
                type={'file'}
                id={'csvInput'}
                accept={'.csv'}
                onChange={onChangeHandler}
              />
              <InputRightAddon
                type={'button'}
                variant={'outline'}
                children={'Select csv'}
                _hover={{ cursor: 'pointer' }}
                onClick={onSubmitHandler}
              >
                Import
                <DownloadIcon ml={1} mt={1} />
              </InputRightAddon>
            </InputGroup>
            <InputGroup size={'sm'}>
              <FormControl>
                <FormLabel
                  htmlFor="bulk"
                  width={'100%'}
                  _hover={{ cursor: 'pointer' }}
                  textAlign="center"
                  borderRadius={'5px'}
                >
                  Upload for Bulk Scan
                </FormLabel>
                <Input
                  borderRadius={6}
                  id={'bulk'}
                  accept={'. csv'}
                  display="none"
                  type={'file'}
                />
              </FormControl>
              <InputRightAddon
                type={'button'}
                _hover={{ cursor: 'pointer' }}
                variant={'outline'}
                children={'Select csv'}
                onClick={submitBulkHandler}
              >
                Import <DownloadIcon ml={1} mt={1} />
              </InputRightAddon>
            </InputGroup>
          </VStack>
        </HStack>
      )}
      {isScan && (
        <HStack spacing={40}>
          {/* VStack 2 */}
          <VStack>
            <HStack spacing={2}>
              <Button size={'sm'} onClick={switchScanHandler}>
                Scan Products
              </Button>
              <Menu size={'sm'}>
                <MenuButton size={'sm'} as={Button}>
                  List Products
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={switchDispatchHandler}>
                    Dispatch List
                  </MenuItem>
                  <MenuItem onClick={switchPendingHandler}>
                    Pending List
                  </MenuItem>
                  <MenuItem onClick={switchCancelHandler}>Cancel List</MenuItem>
                </MenuList>
              </Menu>
            </HStack>
            {isScan && (
              <Button
                width={'100%'}
                size={'sm'}
                onClick={() => {
                  if (!isDispatch) downloadFile(dispatchArray, 'dispatch');
                  if (!isPending) downloadFile(pendingArray, 'pending');
                  if (!isCancel) downloadFile(cancelArray, 'cancel');
                }}
              >
                Download file
              </Button>
            )}
          </VStack>
          {/* VStack 3 */}
          <VStack>
            <Button width={'100%'} size={'sm'} onClick={onOpen}>
              Date Filter
            </Button>
            <Button width={'100%'} size={'sm'} onClick={removeDups}>
              Remove
            </Button>
            <Modal size={'sm'} isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalBody>
                  <DateRange
                    ranges={[SelectionRange]}
                    onChange={handleSelect}
                    moveRangeOnFirstSelection
                    retainEndDateOnFirstSelection
                    maxDate={new Date()}
                  />
                </ModalBody>
              </ModalContent>
            </Modal>
          </VStack>
          {/* VStack 4 */}
          <VStack>
            <Input
              borderRadius={6}
              size={'sm'}
              type={'text'}
              textAlign={'center'}
              placeholder={'Enter sku'}
            />
            <Button size={'sm'} width={'100%'} px={20} variant={'outline'}>
              {!isDispatch
                ? `${dispatchcount}`
                : !isPending
                ? `${pendingcount}`
                : !isCancel
                ? `${cancelcount}`
                : '0'}
            </Button>
          </VStack>
        </HStack>
      )}
      {/* Scan Section */}
      {!isScan && (
        <Box width={'auto'}>
          <TableContainer
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
                  <Th textAlign={'center'}>AWB</Th>
                  <Th textAlign={'center'}>order id</Th>
                  <Th textAlign={'center'}>SKU</Th>
                  <Th textAlign={'center'}>Master SKU</Th>
                  <Th textAlign={'center'}>QTY</Th>
                  <Th textAlign={'center'}>Status</Th>
                  <Th textAlign={'center'}>courier</Th>
                  <Th textAlign={'center'}>date</Th>
                  <Th textAlign={'center'}>firm</Th>
                  <Th textAlign={'center'}>Portal</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filterArray.map(item => (
                  <Tr key={item._id}>
                    <Td>{item.AWB}</Td>
                    <Td>{item['ORDER ID']}</Td>
                    <Td>{item.SKU}</Td>
                    <Td>{item.mastersku}</Td>
                    <Td>{item.QTY}</Td>
                    <Td>
                      <Select
                        onChange={e => {
                          setStatus(e.target.value);
                        }}
                        value={status}
                        mx={8}
                      >
                        <option value={'dispatch'}>dispatch</option>
                        <option value={'pending'}>pending</option>
                        <option value={'cancel'}>cancel</option>
                      </Select>
                    </Td>
                    <Td>{item.courier}</Td>
                    <Td>{item.date}</Td>
                    <Td>{item.firm}</Td>
                    <Td>{item['PORTAL\r']}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      )}
      {/* Filters Section */}
      {isScan && (
        <Box>
          <Heading size={'sm'} py={2}>
            {!isDispatch
              ? 'Dispatch Table'
              : !isPending
              ? 'Pending Table'
              : !isCancel
              ? 'Cancel Table'
              : ''}
          </Heading>

          {isLoading && <Spinner size={'xl'} />}
          {!isLoading && (
            <VStack mb={2}>
              <TableContainer
                rounded={'lg'}
                boxShadow={'lg'}
                overflowY={'auto'}
                overflowX={'auto'}
                h={260}
                w={1200}
              >
                <Table variant="simple" size={'sm'}>
                  <Thead
                    position={'sticky'}
                    top={0}
                    backgroundColor={'lightblue'}
                  >
                    <Tr key={'header'}>
                      <Th textAlign={'center'}>AWB</Th>
                      <Th textAlign={'center'}>order id</Th>
                      <Th textAlign={'center'}>SKU</Th>
                      <Th textAlign={'center'}>Master SKU</Th>
                      <Th textAlign={'center'}>QTY</Th>
                      <Th textAlign={'center'}>STATUS</Th>
                      <Th textAlign={'center'}>courier</Th>
                      <Th textAlign={'center'}>date</Th>
                      <Th textAlign={'center'}>firm</Th>
                      <Th textAlign={'center'}>Portal</Th>
                    </Tr>
                  </Thead>

                  <Tbody>
                    {!isDispatch ? (
                      dispatchRecords.map(item => (
                        <Tr key={item._id}>
                          <Td>{item.AWB}</Td>
                          <Td>{item['ORDER ID']}</Td>
                          <Td>{item.SKU}</Td>
                          <Td>{item.mastersku}</Td>
                          <Td>{item.QTY}</Td>
                          <Td>{item.status}</Td>
                          <Td>{item.courier}</Td>
                          <Td>{item.date}</Td>
                          <Td>{item.firm}</Td>
                          <Td>{item['PORTAL\r']}</Td>
                        </Tr>
                      ))
                    ) : !isPending ? (
                      pendingRecords.map(item => (
                        <Tr key={item._id}>
                          <Td>{item.AWB}</Td>
                          <Td>{item['ORDER ID']}</Td>
                          <Td>{item.SKU}</Td>
                          <Td>{item.mastersku}</Td>
                          <Td>{item.QTY}</Td>
                          <Td>{item.status}</Td>
                          <Td>{item.courier}</Td>
                          <Td>{item.date}</Td>
                          <Td>{item.firm}</Td>
                          <Td>{item['PORTAL\r']}</Td>
                        </Tr>
                      ))
                    ) : !isCancel ? (
                      cancelRecords.map(item => (
                        <Tr key={item._id}>
                          <Td>{item.AWB}</Td>
                          <Td>{item['ORDER ID']}</Td>
                          <Td>{item.SKU}</Td>
                          <Td>{item.mastersku}</Td>
                          <Td>{item.QTY}</Td>
                          <Td>{item.status}</Td>
                          <Td>{item.courier}</Td>
                          <Td>{item.date}</Td>
                          <Td>{item.firm}</Td>
                          <Td>{item['PORTAL\r']}</Td>
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
            </VStack>
          )}
          {!isDispatch ? (
            <Pagination
              totalPages={dispatchpages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          ) : !isPending ? (
            <Pagination
              totalPages={pendingpages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          ) : !isCancel ? (
            <Pagination
              totalPages={cancelpages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          ) : (
            <Box>Error</Box>
          )}
        </Box>
      )}
    </VStack>
  );
};
export default Sales;
