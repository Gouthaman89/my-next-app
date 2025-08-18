
// src/models/PageModel.js

import apiClient from '../utils/apiclient';

export const fetchData = async (endpoint, params = {}) => {
  try {
    const response = await apiClient.post(endpoint, { params });
    return response;
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    throw error;
  }
};
export const get1Data = async (endpoint, params = {}) => {
  try {
    const response = await apiClient.get(endpoint, { params });
    return response;
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    throw error;
  }
};

export const createData = async (endpoint, payload) => {
  try {
    const response = await apiClient.post(endpoint, payload);
    return response.data;
  } catch (error) {
    console.error(`Error creating data at ${endpoint}:`, error);
    throw error;
  }
};

export const updateData = async (endpoint, id, payload) => {
  try {
    const response = await apiClient.put(`${endpoint}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating data at ${endpoint}/${id}:`, error);
    throw error;
  }
};

export const deleteData = async (endpoint, id) => {
  try {
    await apiClient.delete(`${endpoint}/${id}`);
  } catch (error) {
    console.error(`Error deleting data from ${endpoint}/${id}:`, error);
    throw error;
  }
};
// Post a raw payload and return the response data (useful for base64/image endpoints)
export const postPayload = async (endpoint, payload) => {
  try {
    const response = await apiClient.post(endpoint, payload, {
      responseType: 'blob', // ⬅️ This is key
    });
    return response;
  } catch (error) {
    console.error(`Error posting payload to ${endpoint}:`, error);
    throw error;
  }
};
 
export const apGetUnits = async () => {
  return await apiClient.get('/capcity_f300045e30_unit');
};

export const apFetchAssetsByOrg = async (orgId) => {
  return await apiClient.post('/getassetlistbyorg', { orgId });
};

export const apGetAssetImages = async (assetId) => {
  return await apiClient.get('/getAssetImages', { params: { assetId } });
};

export const apUploadAssetImage = async (file, assetId, personID) => {
  const formData = new FormData();
  formData.append('image', file, file.name); // or 'file' if your API expects that
  formData.append('assetId', assetId);
  if (personID) formData.append('personID', personID);
  return await apiClient.post('/uploadAssetImages', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const apDeleteAssetImage = async (imageUrl, assetId) => {
  return await apiClient.delete('/deleteAssetImage', {
    data: { imageUrl, assetId },
  });
};

export const apDeleteAsset = async (id) => {
  return await apiClient.delete('/deleteAsset', { data: { id } });
};

export const apSaveAsset = async (payload, isEditing) => {
  if (isEditing) {
    return await apiClient.put('/updateAsset', payload);
  }
  return await apiClient.post('/addAsset', payload);
};

export const apPublishAssetData = async (orgId, assets) => {
  return await apiClient.post('/publishAssetData', { orgId, assets });
};