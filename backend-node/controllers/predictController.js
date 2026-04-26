const axios = require('axios');

const predictUrban = async (req, res) => {
  try {
    const { lat, lng, pastYear, currentYear, predictYears } = req.body;

    // Validate inputs
    if (!lat || !lng || !pastYear || !currentYear) {
      return res.status(400).json({ error: 'lat, lng, pastYear, currentYear are required' });
    }

    const response = await axios.post(
      'http://127.0.0.1:8000/predict',
      {
        lat:           parseFloat(lat),
        lng:           parseFloat(lng),
        past_year:     parseInt(pastYear),
        current_year:  parseInt(currentYear),
        predict_years: parseInt(predictYears) || 5,
      },
      { timeout: 60000 }  // 60s — tile fetching + model inference can be slow
    );

    res.json(response.data);  // { heatmap: base64string, stats: {...} }

  } catch (error) {
    console.error('Predict error:', error.message);
    const status = error.response?.status || 500;
    const msg    = error.response?.data?.detail || error.message;
    res.status(status).json({ error: msg });
  }
};

module.exports = { predictUrban };