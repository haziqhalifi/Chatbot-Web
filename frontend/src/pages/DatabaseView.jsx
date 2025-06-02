import React, { useState, useEffect } from 'react';
import api from '../api';

const DatabaseView = () => {
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    is_income: false,
    date: '',
  });

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions/');
      setTransactions(response.data);
      console.log('Fetched transactions:', response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleInputChange = (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData({
      ...formData,
      [event.target.name]: value,
    });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post('/transactions/', formData);
      fetchTransactions();
      setFormData({
        amount: '',
        category: '',
        description: '',
        is_income: false,
        date: '',
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4">
      <nav className="flex items-center justify-between bg-gray-900 rounded-lg shadow mb-8 px-6 py-4">
        <span className="text-white font-bold text-3xl tracking-tight">Database View</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8 justify-center">
        <div className="w-full lg:w-1/3 mb-8 lg:mb-0">
          <div className="bg-white rounded-xl shadow p-8">
            <h2 className="text-2xl font-semibold text-blue-600 mb-6">Add Transaction</h2>
            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Amount</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Category</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Description</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-400"
                  name="is_income"
                  checked={formData.is_income}
                  onChange={handleInputChange}
                />
                <label className="text-gray-700 font-medium">Is Income?</label>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Date</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded shadow transition"
              >
                Add Transaction
              </button>
            </form>
          </div>
        </div>
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-xl shadow p-8">
            <h3 className="text-xl font-semibold text-green-600 mb-4">Transactions</h3>
            {transactions.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No transactions found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {transactions.map((tx, idx) => (
                      <tr key={tx.id || idx}>
                        <td className="px-4 py-2">{idx + 1}</td>
                        <td
                          className={
                            tx.is_income
                              ? 'px-4 py-2 text-green-600 font-semibold'
                              : 'px-4 py-2 text-red-600 font-semibold'
                          }
                        >
                          {tx.is_income ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                        </td>
                        <td className="px-4 py-2">{tx.category}</td>
                        <td className="px-4 py-2">{tx.description}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded font-bold ${tx.is_income ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                          >
                            {tx.is_income ? 'Income' : 'Expense'}
                          </span>
                        </td>
                        <td className="px-4 py-2">{tx.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseView;
