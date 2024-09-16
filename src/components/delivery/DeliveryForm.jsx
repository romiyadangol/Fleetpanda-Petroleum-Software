import React, { useState, useEffect } from 'react';
import { Box, Button, Checkbox, Input, Select, Switch, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import ModalWrapper from '../core/ModalWrapper';
import { InputField, SelectField } from '../core/FormFields';
import { useQuery } from '@apollo/client';
import { GET_CUSTOMERS } from '../../graphql/queries/customers/getCustomers';
import { GET_CUSTOMER_BRANCH } from '../../graphql/queries/customerBranch/getCustomerBranch';
import { FIND_PRODUCTS } from '../../graphql/queries/products/findProducts';
import { GET_DRIVERS } from '../../graphql/queries/driver/getDrivers';

export default function DeliveryForm({ order, onChange, onSave, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedLineItems, setSelectedLineItems] = useState([]);
  const [recurring, setRecurring] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductUnit, setNewProductUnit] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const { data: customersData } = useQuery(GET_CUSTOMERS);
  const customers = customersData?.getCustomers.customers || [];

  const { data: branchesData, refetch: refetchBranches } = useQuery(GET_CUSTOMER_BRANCH, {
    variables: { id: selectedCustomer?.id },
    skip: !selectedCustomer,
  });
  const branches = branchesData?.getCustomerBranch.customerBranches || [];

  const { data: productData } = useQuery(FIND_PRODUCTS);
  const products = productData?.findProducts.products || [];

  const { data: driverData } = useQuery(GET_DRIVERS);
  const drivers = driverData?.getDrivers.drivers || [];

  const handleAddLineItem = (product) => {
    const newLineItem = {
      id: product.id,
      name: product.name,
      units: product.productUnit,
      quantity: "",
      deliveryOrderId: order.id, 
      checked: false 
    };
    setSelectedLineItems([...selectedLineItems, newLineItem]);
  };

  const handleQuantityChange = (itemId, quantity) => {
    setSelectedLineItems((prevItems) =>
      prevItems.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const handleCheckboxChange = (itemId, isChecked) => {
    setSelectedLineItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, checked: isChecked } : item
      )
    );
  };

  useEffect(() => {
    if (selectedCustomer) {
      refetchBranches().catch(err => {
        console.error('Error refetching branches:', err);
      });
    }
  }, [selectedCustomer, refetchBranches]);


  useEffect(() => {
    if (branches.length > 0 && !selectedBranch) {
      const defaultBranch = branches[0];
      setSelectedBranch(defaultBranch);
  
      // Ensure `order` and `orderGroupInfo` are not null before updating
      const updatedOrder = {
        orderGroupInfo: {
          status: "pending",
          startedAt: new Date().toISOString(),
          customerId: selectedCustomer?.id || null,
          deliveryOrderAttributes: {
            name: defaultBranch.name,
            location: defaultBranch.location,
            plannedAt: order?.plannedAt || new Date().toISOString(),
            customerBranchId: defaultBranch.id,
            assetId: 2,
            driverId: selectedDriver?.id || null,
            lineItemsAttributes: selectedLineItems.map(item => ({
              name: item.name,
              quantity: parseFloat(item.quantity) || 0,
              units: item.units
            }))
          }
        }
      };
      onChange({ target: { name: 'order', value: updatedOrder } });
    }
  }, [branches, selectedBranch, onChange, order, selectedDriver, selectedLineItems]);

  const handleNextStep = () => {
    if (step === 1 && selectedCustomer) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      const updatedOrder = {
        // ...order,
        orderGroupInfo: {
          status: "pending",
          startedAt: new Date().toISOString(),
          customerId: selectedCustomer?.id || null,
          deliveryOrderAttributes: {
            plannedAt: order.plannedAt || new Date().toISOString(),
            customerBranchId: selectedBranch?.id || null,
            assetId: 2,
            driverId: selectedDriver?.id || null,
            lineItemsAttributes: selectedLineItems.map(item => ({
              name: item.name,
              quantity: parseFloat(item.quantity) || 0,
              units: item.units
            }))
          }
        }
      };
      onSave({ orderGroupInfo: updatedOrder.orderGroupInfo });
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSaveNewProduct = () => {
    if (newProductName && newProductUnit) {
      const newProduct = {
        id: Date.now(), 
        name: newProductName,
        productUnit: newProductUnit,
        checked: false
      };
      setSelectedLineItems([...selectedLineItems, newProduct]); 
      setIsProductModalOpen(false);
    }
  };

  const handleCustomerChange = (customer) => {
    setSelectedCustomer(customer);
    setSelectedBranch(null);

    console.log('Selected Driver:', selectedDriver);
    console.log('Selected Line Items:', selectedLineItems);
  
    const updatedOrder = {
      orderGroupInfo: {
        status: "pending",
        startedAt: new Date().toISOString(),
        customerId: customer.id || null,
        deliveryOrderAttributes: {
          // Ensure other required attributes are set as needed
          name: selectedBranch?.name || "",
          location: selectedBranch?.location || "",
          plannedAt: order?.plannedAt || new Date().toISOString(),
          customerBranchId: selectedBranch?.id || null,
          assetId: 2,
          driverId: selectedDriver?.id || null,
          lineItemsAttributes: selectedLineItems.map(item => ({
            name: item.name,
            quantity: parseFloat(item.quantity) || 0,
            units: item.units
          }))
        }
      }
    };
  
    onChange({ target: { name: 'order', value: updatedOrder } });
  };
  
  
  const handleBranchChange = (branch) => {
    setSelectedBranch(branch);

    console.log('Selected Driver:', selectedDriver);
    console.log('Selected Line Items:', selectedLineItems);
  
    const updatedOrder = {
      orderGroupInfo: {
        status: "pending",
        startedAt: new Date().toISOString(),
        customerId: selectedCustomer?.id || null,
        deliveryOrderAttributes: {
          name: branch.name,
          location: branch.location,
          plannedAt: order?.plannedAt || new Date().toISOString(),
          customerBranchId: branch.id || null,
          assetId: 2,
          driverId: selectedDriver?.id || null,
          lineItemsAttributes: selectedLineItems.map(item => ({
            name: item.name,
            quantity: parseFloat(item.quantity) || 0,
            units: item.units
          }))
        }
      }
    };
  
    onChange({ target: { name: 'order', value: updatedOrder } });
  };
  
  
  return (
    <>
      <ModalWrapper 
        isOpen={isProductModalOpen} 
        onClose={() => setIsProductModalOpen(false)} 
        title="Add New Product" 
        onSave={handleSaveNewProduct}
        maxWidth="500px"
        showSaveButton={true}
      >
        <InputField
          label="Product Name"
          name="productName"
          value={newProductName}
          onChange={(e) => setNewProductName(e.target.value)}
        />
        <InputField
          label="Unit"
          name="productUnit"
          value={newProductUnit}
          onChange={(e) => setNewProductUnit(e.target.value)}
        />
      </ModalWrapper>

      <ModalWrapper 
        isOpen={true} 
        onClose={onClose} 
        title="Create Delivery Order" 
        onSave={onSave}
        maxWidth={1600}
        showSaveButton={false}
      >
        <Box display="flex" height="100%">
          <Box flex="1" padding="20px">
            <Tabs index={step - 1} onChange={(index) => setStep(index + 1)} isFitted variant="enclosed">
              <TabList mb={4}>
                <Tab isDisabled={step === 1}>Step 1: Select Customer</Tab>
                <Tab isDisabled={step === 2}>Step 2: Select Branch</Tab>
                <Tab isDisabled={step === 3}>Step 3: Delivery Details</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  {step === 1 && (
                    <>
                      <SelectField
                        label="Customer"
                        name="customer"
                        value={selectedCustomer ? selectedCustomer.name : ""}
                        onChange={(e) => {
                          const customer = customers.find((cust) => cust.name === e.target.value);
                          setSelectedCustomer(customer);
                          handleCustomerChange(customer);
                        }}
                        options={customers.map((cust) => cust.name)}
                      />
                      <Button onClick={handleNextStep} mr={4}>Next</Button>
                    </>
                  )}
                </TabPanel>

                <TabPanel>
                  {step === 2 && selectedCustomer && (
                    <>
                      <h2>Customer Branch: </h2>
                      <SelectField
                        label="Branch"
                        name="branch"
                        value={selectedBranch ? selectedBranch.name : ""}
                        onChange={(e) => {
                          const branch = branches.find((b) => b.name === e.target.value);
                          handleBranchChange(branch);
                        }}
                        options={branches.map((branch) => branch.name)}
                      />
                      <SelectField
                        label="Location"
                        name="location"
                        value={selectedBranch ? selectedBranch.location : ""}
                        onChange={(e) => {
                          const branch = branches.find((b) => b.location === e.target.value);
                          handleBranchChange(branch);
                        }}
                        options={branches.map((branch) => branch.location)}
                      />
                      <Button onClick={handlePreviousStep} mr={4} mt={5}>Back</Button>
                      <Button onClick={handleNextStep} mr={4} mt={5}>Next</Button>
                    </>
                  )}
                </TabPanel>

                <TabPanel>
                  {step === 3 && selectedCustomer && (
                    <>
                      <Box>
                          <h2>Customer Details</h2>
                          <p>Name: {selectedCustomer.name}</p>
                          <p>Customer Branch: {selectedBranch.name}</p>
                          <p>Location: {selectedBranch.location}</p>
                          <p>Zip: {selectedCustomer.zipcode}</p>
                      </Box>
                      <Box display="flex" justifyContent="space-between" bg="gray.800" p={4} borderRadius="md" color="white">
                        <Box flex="1">
                          <h2>Bulk Delivery</h2>
                          <Select
                            placeholder="Select Product"
                            onChange={(e) => {
                              const selectedProduct = products.find(product => product.id === e.target.value);
                              if (selectedProduct) {
                                handleAddLineItem(selectedProduct);
                              }
                            }}
                          >
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} - {product.productUnit}
                              </option>
                            ))}
                          </Select>

                          {selectedLineItems.map((item) => (
                            <Box
                              key={item.id}
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                              mb={2}
                              p={2}
                              mt={3}
                              borderWidth={1}
                              borderRadius="md"
                              bg="gray.700"
                            >
                              <Checkbox
                                isChecked={item.checked}
                                onChange={(e) => handleCheckboxChange(item.id, e.target.checked)}
                              >
                                {item.name} - {item.units}
                              </Checkbox>
                              <Input
                                type="number"
                                placeholder="Quantity"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                width="100px"
                                ml={4}
                                isDisabled={!item.checked}
                              />
                            </Box>
                          ))}
                        </Box>

                        <Box width="35%" bg="gray.700" p={4} borderRadius="md" ml={4}>
                          <h2>Recurring Delivery</h2>
                          <Switch
                            isChecked={recurring}
                            onChange={() => setRecurring(!recurring)}
                            mb={2}
                          />
                          {recurring && (
                            <>
                              <InputField
                                label="Recurrence Start Date"
                                name="recurrenceStartDate"
                                type="date"
                                value={order.recurrenceStartDate || ""}
                                onChange={onChange}
                              />
                              <SelectField
                                label="Frequency"
                                name="recurrenceFrequency"
                                value={order.recurrenceFrequency || ""}
                                onChange={onChange}
                                options={["Daily", "Weekly", "Monthly"]}
                              />
                            </>
                          )}
                        </Box>
                      </Box>

                      <Box display="flex" justifyContent="space-between" bg="gray.800" p={4} borderRadius="md" color="white" mt={4}>
                        <Box>
                        <h2>Assign Driver</h2>
                          <SelectField
                            label="Driver"
                            name="driver"
                            value={selectedDriver ? selectedDriver.name : ""}
                            onChange={(e) => {
                              const driver = drivers.find((driver) => driver.name === e.target.value);
                              setSelectedDriver(driver);
                              onChange({ target: { name: "driverInfo.id", value: driver.id } });
                            }}
                            options={drivers.map((driver) => driver.name)}
                            width="100%"
                          />
                        </Box>
                        <Box>
                          <InputField
                            label="Planned_At"
                            name="plannedAt"
                            type="datetime-local"
                            value={order.plannedAt || ""}
                            onChange={onChange}
                          />
                        </Box>
                      </Box>
                      <Button onClick={handlePreviousStep} mr={4} mt={4}>Back</Button>
                      <Button onClick={onSave} colorScheme="blue" mt={4}>Create Order</Button>
                    </>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </Box>
      </ModalWrapper>
    </>
  );
}


