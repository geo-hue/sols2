import axios from 'axios';
import { PAYSTACK_SECRET_KEY } from '../config/config.js';

export const fetchTotalCashInflow = async (req, res) => {
  try {
    // Set the start date to September 30, 2024
    const startDate = '2024-09-30';
    
    // Get the current date as the end date
    const endDate = new Date().toISOString().split('T')[0];

    const response = await axios.get('https://api.paystack.co/transaction/totals', {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
      params: {
        from: startDate,
        to: endDate
      }
    });

    if (response.status === 200 && response.data.status === true) {
      const nairaTotalAmount = response.data.data.total_volume_by_currency.find(
        currency => currency.currency === 'NGN'
      )?.amount || 0;

      res.status(200).json({
        transactionVolume: nairaTotalAmount,
        totalTransactions: response.data.data.total_transactions,
        startDate: startDate,
        endDate: endDate
      });
    } else {
      res.status(response.status).json({
        error: 'Failed to fetch transaction volume'
      });
    }
  } catch (error) {
    console.error('Error fetching transaction volume:', error);
    res.status(500).json({
      error: 'An error occurred while fetching transaction volume'
    });
  }
};