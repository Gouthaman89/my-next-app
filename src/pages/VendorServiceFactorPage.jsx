import React, { useState } from 'react';
import { Container, Paper, Typography } from '@mui/material';
import VendorSelector from '../components/VendorSelector';
import ScopeSelector from '../components/ScopeSelector';
import ServiceSelector from '../components/ServiceSelector';
import ServiceFactorEditor from '../components/ServiceFactorEditor';
import Loader from "../components/Loader/loader";

const VendorServiceFactorPage = () => {
  const [vendorId, setVendorId] = useState(null);
  const [scopeId, setScopeId] = useState(null);
  const [serviceId, setServiceId] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [readOnly, setReadOnly] = useState(false);

  // Helper function to trigger loader
  const triggerLoader = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {isLoading && <Loader />}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          供應商服務係數管理
        </Typography>

        {/* Section 1: Vendor Selector */}
        <VendorSelector
          onModeChange={setReadOnly}
          onSelect={(vendor) => {
            // vendor could be object or id depending on VendorSelector; keep backward compatible
            const id = vendor?.uuid || vendor;
            triggerLoader();
            setVendorId(id);
            setScopeId(null);
            setServiceId(null);
          }}
        />

        {/* Section 2: Scope Selector */}
        {vendorId && (
          <ScopeSelector
            vendorId={vendorId}
            readOnly={readOnly}
            onSelectScope={(sid) => {
              triggerLoader();
              setScopeId(sid);
              setServiceId(null);
            }}
          />
        )}

        {/* Section 3: Service Selector */}
        {vendorId && scopeId && (
          <ServiceSelector
            vendorId={vendorId}
            scopeId={scopeId}
            readOnly={readOnly}
            onSelectService={(service) => {
              triggerLoader();
              setSelectedService(service);
              setServiceId(service.serviceid);
            }}
          />
        )}

        {/* Section 4: Service Factor Editor */}
        {vendorId && scopeId && serviceId && (
          <ServiceFactorEditor
            vendorId={vendorId}
            scopeId={scopeId}
            serviceId={serviceId}
            selectedServiceData={selectedService}
            readOnly={readOnly}
          />
        )}
      </Paper>
    </Container>
  );
};

export default VendorServiceFactorPage;