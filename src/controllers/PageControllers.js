// src/controllers/PageController.js

import * as PageModel from '../models/pagemodel';

export const loadData = async (endpoint, setData) => {
  try {
    const data = await PageModel.fetchData(endpoint);
    setData(data);
  } catch (error) {
    console.error('Error loading data:', error);
  }
};
export const getData = async (endpoint, setData) => {
  try {
    const data = await PageModel.get1Data(endpoint);
    setData(data);
  } catch (error) {
    console.error('Error loading data:', error);
  }
};

export const saveData = async (endpoint, data, resetForm, refreshData) => {
  try {
    await PageModel.createData(endpoint, data);
    resetForm();
    refreshData();
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const updateRecord = async (endpoint, id, data, refreshData) => {
  try {
    await PageModel.updateData(endpoint, id, data);
    refreshData();
  } catch (error) {
    console.error('Error updating record:', error);
  }
};

export const deleteRecord = async (endpoint, id, refreshData) => {
  try {
    await PageModel.deleteData(endpoint, id);
    refreshData();
  } catch (error) {
    console.error('Error deleting record:', error);
  }
};


export const postData = async (endpoint, payload) => {
  try {
    const data = await PageModel.postPayload(endpoint, payload);
    return data;
  } catch (error) {
    console.error(`Error posting data to ${endpoint}:`, error);
    return null;
  }
};

 