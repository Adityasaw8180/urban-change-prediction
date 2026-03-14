import axios from 'axios';

export const predictUrban = async (data) => {
  return await axios.post('http://localhost:5000/predict', data);
};