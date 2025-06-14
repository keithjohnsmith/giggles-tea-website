import { useState } from 'react';
import { Tab } from '@headlessui/react';
import UserManagement from './UserManagement';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Settings = () => {
  const [settings, setSettings] = useState({
    storeName: 'Giggles Tea',
    storeEmail: 'info@giggles-tea.com',
    storePhone: '+27 12 345 6789',
    storeAddress: '123 Tea Street, Cape Town, South Africa',
    currency: 'ZAR',
    timezone: 'Africa/Johannesburg',
    maintenanceMode: false,
    aboutUs: 'Giggles Tea is your go-to destination for premium quality teas and boba drinks. We source only the finest ingredients to bring you the best flavors.',
    openingHours: 'Mon-Fri: 9:00 AM - 10:00 PM\nSat-Sun: 10:00 AM - 11:00 PM',
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would save these settings to your backend
    alert('Settings saved successfully!');
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your store settings and user accounts.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-lg bg-gray-100 p-1">
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-md py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white shadow text-gray-900'
                    : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
                )
              }
            >
              Store Settings
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-md py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white shadow text-gray-900'
                    : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
                )
              }
            >
              User Management
            </Tab>
          </Tab.List>
          <Tab.Panels className="mt-6">
            <Tab.Panel>
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Store Information</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Update your store's basic information.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="storeName" className="block text-sm font-medium text-gray-700">
                          Store Name
                        </label>
                        <input
                          type="text"
                          name="storeName"
                          id="storeName"
                          value={settings.storeName}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="storeEmail" className="block text-sm font-medium text-gray-700">
                          Email address
                        </label>
                        <input
                          type="email"
                          name="storeEmail"
                          id="storeEmail"
                          value={settings.storeEmail}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="storePhone" className="block text-sm font-medium text-gray-700">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="storePhone"
                          id="storePhone"
                          value={settings.storePhone}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="storeAddress" className="block text-sm font-medium text-gray-700">
                          Address
                        </label>
                        <textarea
                          name="storeAddress"
                          id="storeAddress"
                          rows={2}
                          value={settings.storeAddress}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="openingHours" className="block text-sm font-medium text-gray-700">
                        Opening Hours
                      </label>
                      <textarea
                        name="openingHours"
                        id="openingHours"
                        rows={3}
                        value={settings.openingHours}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Enter each time slot on a new line
                      </p>
                    </div>

                    <div>
                      <label htmlFor="aboutUs" className="block text-sm font-medium text-gray-700">
                        About Us
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="aboutUs"
                          name="aboutUs"
                          rows={4}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                          value={settings.aboutUs}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="pt-5">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Localization</h3>
                      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                            Currency
                          </label>
                          <select
                            id="currency"
                            name="currency"
                            value={settings.currency}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                          >
                            <option value="ZAR">South African Rand (ZAR)</option>
                            <option value="USD">US Dollar (USD)</option>
                            <option value="EUR">Euro (EUR)</option>
                            <option value="GBP">British Pound (GBP)</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                            Timezone
                          </label>
                          <select
                            id="timezone"
                            name="timezone"
                            value={settings.timezone}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                          >
                            <option value="Africa/Johannesburg">(GMT+02:00) Johannesburg</option>
                            <option value="Africa/Cairo">(GMT+02:00) Cairo</option>
                            <option value="Europe/London">(GMT+01:00) London</option>
                            <option value="Europe/Paris">(GMT+02:00) Paris</option>
                            <option value="Asia/Dubai">(GMT+04:00) Dubai</option>
                            <option value="Asia/Shanghai">(GMT+08:00) Shanghai</option>
                            <option value="America/New_York">(GMT-04:00) New York</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="pt-5">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Store Status</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Control the availability of your store.
                      </p>
                      <div className="mt-4">
                        <div className="relative flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="maintenanceMode"
                              name="maintenanceMode"
                              type="checkbox"
                              checked={settings.maintenanceMode}
                              onChange={handleInputChange}
                              className="focus:ring-gray-500 h-4 w-4 text-gray-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="maintenanceMode" className="font-medium text-gray-700">
                              Enable maintenance mode
                            </label>
                            <p className="text-gray-500">
                              When enabled, only administrators will be able to access the store.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="mr-3 inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-gray-900 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <UserManagement />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default Settings;
